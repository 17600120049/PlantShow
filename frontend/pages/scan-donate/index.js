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
    plantName: '',
    plantCategory: '',
    plantDescription: '',
    plantImage: '🌿',
    images: [],
    result: null
  },

  onLoad: function () {
    setupDetailNav(this);
  },

  goBack: function () {
    if (this.data.step === 'confirm') {
      this.setData({ step: 'form' });
      return;
    }
    if (this.data.step === 'form') {
      this.setData({
        step: 'intro',
        station: null,
        stationQrUrl: '',
        plantName: '',
        plantCategory: '',
        plantDescription: '',
        images: [],
        result: null
      });
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
    plantStore.getStationById(stationId).then(function (station) {
      if (!station) {
        wx.showToast({ title: '中转站不存在', icon: 'none' });
        return;
      }
      if (!station.isActive) {
        wx.showModal({
          title: '中转站休息中',
          content: '「' + station.name + '」当前不在营业时间内（' + station.hours + '），请稍后再来。',
          showCancel: false
        });
        return;
      }

      const qrRemote = plantStore.getQrImageUrl('station', station.id);
      media.downloadToLocal(qrRemote).then(function (qrLocal) {
        that.setData({
          step: 'form',
          station: station,
          stationQrUrl: qrLocal || qrRemote,
          plantName: '',
          plantCategory: '',
          plantDescription: '',
          plantImage: '🌿',
          images: []
        });
      });
    }).catch(function (err) {
      wx.showToast({ title: (err && err.message) || '无法加载中转站数据', icon: 'none' });
    });
  },

  onPlantNameInput: function (e) {
    this.setData({ plantName: e.detail.value });
  },

  onPlantCategoryInput: function (e) {
    this.setData({ plantCategory: e.detail.value });
  },

  onPlantDescriptionInput: function (e) {
    this.setData({ plantDescription: e.detail.value });
  },

  chooseImage: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        if (res.tempFiles && res.tempFiles[0]) {
          that.setData({
            images: [res.tempFiles[0].tempFilePath]
          });
        }
      }
    });
  },

  deleteImage: function () {
    this.setData({ images: [] });
  },

  goToConfirm: function () {
    const { plantName, plantCategory, station, images } = this.data;
    if (!plantName.trim()) {
      wx.showToast({ title: '请输入植物名称', icon: 'none' });
      return;
    }
    if (!plantCategory.trim()) {
      wx.showToast({ title: '请输入植物品种', icon: 'none' });
      return;
    }
    if (!images.length) {
      wx.showToast({ title: '请添加植物照片', icon: 'none' });
      return;
    }
    if (!station) {
      wx.showToast({ title: '请先扫描中转站二维码', icon: 'none' });
      return;
    }
    this.setData({ step: 'confirm' });
  },

  submitDonate: function () {
    const that = this;
    if (that.data.submitting) {
      return;
    }

    const { plantName, plantCategory, plantDescription, plantImage, station, images } = that.data;
    that.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    plantStore
      .donatePlant({
        name: plantName.trim(),
        category: plantCategory.trim(),
        description: plantDescription.trim(),
        image: plantImage,
        photoPath: images[0] || '',
        stationId: station.id
      })
      .then(function (result) {
        wx.hideLoading();
        that.setData({ submitting: false });

        if (!result.success) {
          wx.showToast({ title: result.message || '送养失败', icon: 'none' });
          return;
        }

        const qrRemote = result.qrImageUrl || plantStore.getQrImageUrl('plant', result.plant.plantCode);
        media.downloadToLocal(qrRemote).then(function (qrLocal) {
          that.setData({
            step: 'success',
            result: Object.assign({}, result, { qrImageUrl: qrLocal || qrRemote })
          });
        });
      })
      .catch(function (err) {
        wx.hideLoading();
        that.setData({ submitting: false });
        const msg = (err && err.message) || '送养失败';
        wx.showModal({
          title: '送养失败',
          content: msg + '。请确认后端服务已启动，并在开发者工具中勾选「不校验合法域名」。',
          showCancel: false
        });
      });
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/home/index' });
  },

  donateAgain: function () {
    this.setData({
      step: 'intro',
      station: null,
      stationQrUrl: '',
      plantName: '',
      plantCategory: '',
      plantDescription: '',
      images: [],
      result: null
    });
  }
});
