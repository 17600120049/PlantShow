const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const auth = require('../../utils/auth');
const request = require('../../utils/request');

function buildFormFromStation(station) {
  if (!station) {
    return {
      name: '',
      address: '',
      hoursMode: 'FIXED',
      hours: '',
      contactType: 'PHONE',
      phone: '',
      logoUrl: ''
    };
  }
  return {
    name: station.name || '',
    address: station.address || '',
    hoursMode: station.hoursMode || 'FIXED',
    hours: station.hoursMode === 'FLEXIBLE' ? '' : (station.hours || ''),
    contactType: station.contactType || 'PHONE',
    phone: station.phone || '',
    logoUrl: station.logoUrl || ''
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
    form: buildFormFromStation(null),
    managedStations: [],
    plants: [],
    activeTab: 'info',
    loading: true,
    savingStation: false,
    loadError: ''
  },

  onLoad: function (options) {
    setupDetailNav(this);
    const stationId = Number(options.id || options.stationId || 0);
    if (stationId) {
      this.setData({ view: 'detail', stationId: stationId });
      this.loadDetail(stationId);
      return;
    }
    this.loadStationList();
  },

  onShow: function () {
    if (this.data.view === 'detail' && this.data.stationId && !this.data.loading) {
      this.loadPlants(this.data.stationId);
    }
  },

  loadStationList: function () {
    const that = this;
    that.setData({ loading: true, loadError: '', view: 'list' });
    auth
      .ensureLogin()
      .then(function () {
        return plantStore.getManagedStations();
      })
      .then(function (stations) {
        that.setData({
          managedStations: stations || [],
          loading: false,
          loadError: stations && stations.length ? '' : '您暂无管理的中转站'
        });
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  loadDetail: function (stationId) {
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
        that.setData({
          station: station,
          stationId: station.id,
          form: buildFormFromStation(station),
          loading: false,
          loadError: ''
        });
        return that.loadPlants(station.id);
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          loadError: (err && err.message) || '无法加载中转站信息'
        });
      });
  },

  loadPlants: function (stationId) {
    const that = this;
    return plantStore
      .getManagedPlants(stationId)
      .then(function (plants) {
        that.setData({ plants: plants || [] });
      })
      .catch(function () {
        // 植物列表加载失败时不阻断页面
      });
  },

  openStation: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    if (!id) {
      return;
    }
    wx.navigateTo({
      url: '/pages/station-manage/index?id=' + id
    });
  },

  switchTab: function (e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onFormInput: function (e) {
    const field = e.currentTarget.dataset.field;
    if (!field) {
      return;
    }
    const patch = {};
    patch['form.' + field] = e.detail.value;
    this.setData(patch);
  },

  onHoursModeChange: function (e) {
    const hoursMode = e.detail.value;
    this.setData({
      'form.hoursMode': hoursMode,
      'form.hours': hoursMode === 'FLEXIBLE' ? '' : this.data.form.hours
    });
  },

  onContactTypeChange: function (e) {
    this.setData({ 'form.contactType': e.detail.value });
  },

  chooseLogo: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const file = res.tempFiles && res.tempFiles[0];
        if (file && file.tempFilePath) {
          that.setData({ 'form.logoUrl': file.tempFilePath });
        }
      }
    });
  },

  saveStation: function () {
    const that = this;
    const form = this.data.form;
    const name = (form.name || '').trim();
    const address = (form.address || '').trim();

    if (!name) {
      wx.showToast({ title: '请填写中转站名称', icon: 'none' });
      return;
    }
    if (!address) {
      wx.showToast({ title: '请填写地址', icon: 'none' });
      return;
    }
    if (form.hoursMode === 'FIXED' && !(form.hours || '').trim()) {
      wx.showToast({ title: '请填写营业时间', icon: 'none' });
      return;
    }
    if (that.data.savingStation) {
      return;
    }

    that.setData({ savingStation: true });

    const logoPromise =
      form.logoUrl && form.logoUrl.indexOf('http') !== 0 && form.logoUrl.indexOf('/api/') !== 0
        ? request.uploadFile(form.logoUrl)
        : Promise.resolve(form.logoUrl || null);

    logoPromise
      .then(function (logoUrl) {
        return plantStore.updateManagedStation(that.data.stationId, {
          name: name,
          address: address,
          hoursMode: form.hoursMode,
          hours: form.hoursMode === 'FLEXIBLE' ? undefined : (form.hours || '').trim(),
          contactType: form.contactType,
          phone: (form.phone || '').trim() || null,
          logoUrl: logoUrl
        });
      })
      .then(function (station) {
        that.setData({
          station: station,
          form: buildFormFromStation(station)
        });
        wx.showToast({ title: '已保存', icon: 'success' });
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
      })
      .finally(function () {
        that.setData({ savingStation: false });
      });
  },

  editPlant: function (e) {
    const plantId = e.currentTarget.dataset.id;
    if (!plantId) {
      return;
    }
    wx.navigateTo({
      url:
        '/pages/station-manage-plant/index?stationId=' +
        this.data.stationId +
        '&plantId=' +
        plantId
    });
  },

  goBack: function () {
    if (this.data.view === 'detail' && !this.data.stationId) {
      this.loadStationList();
      return;
    }
    wx.navigateBack({ delta: 1 });
  }
});
