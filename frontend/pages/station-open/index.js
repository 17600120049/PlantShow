const { setupDetailNav } = require('../../utils/system');
const { parseQrResult } = require('../../utils/qr');
const plantStore = require('../../utils/plantStore');
const auth = require('../../utils/auth');
const stationDetect = require('../../utils/stationDetect');

const LOCATION_SYNC_DEBOUNCE_MS = 45000;

function buildAutoFormFromStation(station) {
  if (!station) {
    return {
      wifiSsid: '',
      autoOpenRadiusM: '150',
      autoCloseHours: '6',
      autoStatusEnabled: true
    };
  }
  return {
    wifiSsid: station.wifiSsid || '',
    autoOpenRadiusM: String(station.autoOpenRadiusM || 150),
    autoCloseHours: String(station.autoCloseHours || 6),
    autoStatusEnabled: station.autoStatusEnabled !== false
  };
}

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    view: 'list',
    stationId: 0,
    station: null,
    autoForm: buildAutoFormFromStation(null),
    flexibleStations: [],
    loading: true,
    saving: false,
    savingAuto: false,
    scanning: false,
    syncing: false,
    syncMessage: '',
    loadError: ''
  },

  onLoad: function (options) {
    setupDetailNav(this);
    this._locationHandler = null;
    this._lastSyncAt = 0;
    const stationId = Number(options.id || options.stationId || 0);
    if (stationId) {
      this.setData({ view: 'detail', stationId: stationId });
      this.loadStation(stationId, true);
      return;
    }
    this.loadStationList(true);
  },

  onShow: function () {
    if (this.data.view === 'detail' && this.data.stationId && this.data.station) {
      this.runAutoSync(false);
      this.startLocationWatch();
    }
  },

  onHide: function () {
    this.stopLocationWatch();
  },

  onUnload: function () {
    this.stopLocationWatch();
  },

  loadStationList: function (autoSync) {
    const that = this;
    that.setData({ loading: true, loadError: '', view: 'list' });
    auth
      .ensureLogin()
      .then(function () {
        return plantStore.getManagedStations();
      })
      .then(function (stations) {
        const flexibleStations = (stations || []).filter(function (item) {
          return item.canToggleStatus;
        });
        that.setData({
          flexibleStations: flexibleStations,
          loading: false,
          loadError: flexibleStations.length ? '' : '您暂无无固定营业时间的中转站'
        });
        if (autoSync && flexibleStations.length) {
          return that.runBatchAutoSync();
        }
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  loadStation: function (stationId, autoSync) {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    auth
      .ensureLogin()
      .then(function () {
        return plantStore.getStationManagerAccess(stationId);
      })
      .then(function (station) {
        if (!station.isManager) {
          that.setData({
            loading: false,
            station: null,
            loadError: '您不是该中转站的管理员'
          });
          return;
        }
        if (!station.canToggleStatus) {
          that.setData({
            loading: false,
            station: station,
            loadError: '该中转站为固定营业时间，状态将根据时间自动更新'
          });
          return;
        }
        that.setData({
          station: station,
          stationId: station.id,
          autoForm: buildAutoFormFromStation(station),
          loading: false,
          loadError: ''
        });
        if (autoSync) {
          return that.runAutoSync(false);
        }
      })
      .catch(function (err) {
        const message = (err && err.message) || '无法加载中转站信息';
        that.setData({
          loading: false,
          loadError: /未配置/.test(message)
            ? '微信登录未配置，请在后台 .env 填写 WECHAT_APPID 和 WECHAT_SECRET 后重启后端'
            : message
        });
      });
  },

  runBatchAutoSync: function () {
    const that = this;
    if (that.data.syncing) {
      return Promise.resolve();
    }
    that.setData({ syncing: true });
    return stationDetect
      .collectDetectionSignals()
      .then(function (signals) {
        return plantStore.syncManagedOpenStatus(signals);
      })
      .then(function (result) {
        const changed = (result.stations || []).filter(function (item) {
          return item.sync && item.sync.changed;
        });
        if (changed.length) {
          that.setData({
            flexibleStations: result.stations,
            syncMessage: changed[0].sync.message
          });
          wx.showToast({ title: changed[0].sync.message, icon: 'none' });
          return;
        }
        const firstMessage =
          (result.stations[0] && result.stations[0].sync && result.stations[0].sync.message) || '';
        that.setData({
          flexibleStations: result.stations,
          syncMessage: firstMessage
        });
      })
      .catch(function () {
        // 自动同步失败时不阻断页面
      })
      .finally(function () {
        that.setData({ syncing: false });
      });
  },

  runAutoSync: function (silent) {
    const that = this;
    if (!that.data.stationId || that.data.syncing) {
      return Promise.resolve();
    }
    that.setData({ syncing: true });
    return stationDetect
      .collectDetectionSignals()
      .then(function (signals) {
        return plantStore.syncStationOpenStatus(that.data.stationId, signals);
      })
      .then(function (station) {
        const sync = station.sync || {};
        that.setData({
          station: station,
          syncMessage: sync.message || ''
        });
        if (!silent && sync.changed && sync.message) {
          wx.showToast({ title: sync.message, icon: 'none' });
        }
      })
      .catch(function () {
        // 自动同步失败时不阻断页面
      })
      .finally(function () {
        that.setData({ syncing: false });
        that._lastSyncAt = Date.now();
      });
  },

  startLocationWatch: function () {
    const that = this;
    this.stopLocationWatch();
    if (!this.data.station || !this.data.station.autoStatusEnabled) {
      return;
    }
    this._locationHandler = function () {
      const now = Date.now();
      if (now - that._lastSyncAt < LOCATION_SYNC_DEBOUNCE_MS) {
        return;
      }
      that.runAutoSync(true);
    };
    stationDetect.startForegroundLocationWatch(this._locationHandler);
  },

  stopLocationWatch: function () {
    if (this._locationHandler) {
      stationDetect.stopForegroundLocationWatch(this._locationHandler);
      this._locationHandler = null;
    }
  },

  openStation: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    if (!id) {
      return;
    }
    wx.navigateTo({
      url: '/pages/station-open/index?id=' + id
    });
  },

  startScan: function () {
    const that = this;
    if (that.data.scanning) {
      return;
    }
    that.setData({ scanning: true, view: 'detail' });
    plantStore
      .scanCode()
      .then(function (result) {
        const parsed = parseQrResult(result);
        if (parsed.type !== 'station') {
          wx.showToast({ title: '请扫描中转站二维码', icon: 'none' });
          return;
        }
        that.setData({ stationId: parsed.id });
        that.loadStation(parsed.id, true);
      })
      .catch(function (err) {
        if (!err || !err.cancelled) {
          wx.showToast({ title: '扫码失败，请重试', icon: 'none' });
        }
      })
      .finally(function () {
        that.setData({ scanning: false });
      });
  },

  setOpenStatus: function (e) {
    const that = this;
    const isActive = e.currentTarget.dataset.active === 'true' || e.currentTarget.dataset.active === true;
    if (that.data.saving || !that.data.stationId) {
      return;
    }
    that.setData({ saving: true });
    plantStore
      .setStationOpenStatus(that.data.stationId, isActive)
      .then(function (station) {
        that.setData({
          station: station,
          syncMessage: isActive ? '已手动设为营业中' : '已手动设为休息中'
        });
        wx.showToast({
          title: station.isActive ? '已设为营业中' : '已设为休息中',
          icon: 'success'
        });
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '更新失败', icon: 'none' });
      })
      .finally(function () {
        that.setData({ saving: false });
      });
  },

  refreshAutoSync: function () {
    this.runAutoSync(false);
  },

  onAutoFormInput: function (e) {
    const field = e.currentTarget.dataset.field;
    if (!field) {
      return;
    }
    const patch = {};
    patch['autoForm.' + field] = e.detail.value;
    this.setData(patch);
  },

  onAutoStatusEnabledChange: function (e) {
    this.setData({ 'autoForm.autoStatusEnabled': !!e.detail.value });
  },

  saveAutoSettings: function () {
    const that = this;
    const form = this.data.autoForm;
    if (that.data.savingAuto || !that.data.stationId) {
      return;
    }

    that.setData({ savingAuto: true });
    plantStore
      .updateManagedStation(that.data.stationId, {
        wifiSsid: (form.wifiSsid || '').trim() || null,
        autoOpenRadiusM: Number(form.autoOpenRadiusM) || 150,
        autoCloseHours: Number(form.autoCloseHours) || 6,
        autoStatusEnabled: form.autoStatusEnabled !== false
      })
      .then(function (station) {
        that.setData({
          station: station,
          autoForm: buildAutoFormFromStation(station)
        });
        wx.showToast({ title: '自动设置已保存', icon: 'success' });
        if (station.autoStatusEnabled) {
          that.startLocationWatch();
          return that.runAutoSync(false);
        }
        that.stopLocationWatch();
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
      })
      .finally(function () {
        that.setData({ savingAuto: false });
      });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  }
});
