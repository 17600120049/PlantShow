const { setupDetailNav } = require('../../utils/system');
const { parseQrResult } = require('../../utils/qr');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    statusBarHeight: 44,
    navBarBottom: 88,
    navContentTop: 44,
    navContentHeight: 32,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    step: 'intro',
    scanning: false,
    submitting: false,
    station: null,
    stationQrUrl: '',
    plants: [],
    selectedPlantId: null,
    selectedPlant: null,
    result: null
  },

  onLoad: function () {
    setupDetailNav(this);
  },

  goBack: function () {
    if (this.data.step === 'plants' || this.data.step === 'confirm') {
      this.setData({ step: 'intro', station: null, stationQrUrl: '', plants: [], selectedPlantId: null, selectedPlant: null });
      return;
    }
    if (this.data.step === 'success') {
      wx.switchTab({ url: '/pages/home/index' });
      return;
    }
    wx.navigateBack({ delta: 1 });
  },

  startScan: function () {
    const that = this;
    if (that.data.scanning) {
      return;
    }
    that.setData({ scanning: true });
    plantStore
      .scanCode()
      .then(function (result) {
        that.handleScanResult(result);
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

  handleScanResult: function (raw) {
    const that = this;
    const parsed = parseQrResult(raw);
    if (parsed.type !== 'station') {
      wx.showToast({ title: '请扫描中转站二维码', icon: 'none' });
      return;
    }

    const stationId = parsed.id;
    Promise.all([
      plantStore.getStationById(stationId),
      plantStore.getAvailablePlantsByStation(stationId)
    ]).then(function (results) {
      const station = results[0];
      const plants = results[1];

      if (!station) {
        wx.showToast({ title: '中转站不存在', icon: 'none' });
        return;
      }
      if (!station.isActive) {
        const content = station.isFlexibleHours
          ? '「' + station.name + '」当前为休息中，请稍后再来。'
          : '「' + station.name + '」当前不在营业时间内（' + station.hours + '），请稍后再来。';
        wx.showModal({
          title: '中转站休息中',
          content: content,
          showCancel: false
        });
        return;
      }

      const qrRemote = plantStore.getQrImageUrl('station', station.id);
      return media.downloadToLocal(qrRemote).then(function (qrLocal) {
        that.setData({
          step: 'plants',
          station: station,
          stationQrUrl: qrLocal || qrRemote,
          plants: plants,
          selectedPlantId: plants.length === 1 ? plants[0].id : null,
          selectedPlant: plants.length === 1 ? plants[0] : null
        });
      });
    }).catch(function (err) {
      wx.showToast({ title: (err && err.message) || '无法加载中转站数据', icon: 'none' });
    });
  },

  selectPlant: function (e) {
    const plantId = e.currentTarget.dataset.id;
    const plant = this.data.plants.find(function (item) {
      return String(item.id) === String(plantId);
    });
    this.setData({
      selectedPlantId: plantId,
      selectedPlant: plant || null
    });
  },

  goToConfirm: function () {
    if (!this.data.selectedPlant) {
      wx.showToast({ title: '请选择要领养的植物', icon: 'none' });
      return;
    }
    this.setData({ step: 'confirm' });
  },

  submitAdopt: function () {
    const that = this;
    if (that.data.submitting || !that.data.selectedPlant) {
      return;
    }

    that.setData({ submitting: true });
    wx.showLoading({ title: '领养中...' });

    plantStore
      .adoptPlant(that.data.selectedPlant.id)
      .then(function (result) {
        wx.hideLoading();
        that.setData({ submitting: false });

        if (!result.success) {
          wx.showToast({ title: result.message || '领养失败', icon: 'none' });
          return;
        }

        that.setData({
          step: 'success',
          result: result
        });
      })
      .catch(function (err) {
        wx.hideLoading();
        that.setData({ submitting: false });
        wx.showToast({ title: (err && err.message) || '领养失败', icon: 'none' });
      });
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/home/index' });
  },

  adoptAgain: function () {
    this.setData({
      step: 'intro',
      station: null,
      stationQrUrl: '',
      plants: [],
      selectedPlantId: null,
      selectedPlant: null,
      result: null
    });
  }
});
