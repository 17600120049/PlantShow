const { initStatusBarHeight } = require('../../utils/system');
const { parseQrResult } = require('../../utils/qr');
const plantStore = require('../../utils/plantStore');

Page({
  data: {
    statusBarHeight: 44,
    step: 'intro',
    scanning: false,
    submitting: false,
    plantCode: '',
    manualCode: '',
    showManualInput: false,
    plantName: '',
    plantCategory: '',
    plantDescription: '',
    plantImage: '🌿',
    images: [],
    stationIndex: 0,
    stations: [],
    selectedStation: null,
    existingPlant: null,
    result: null
  },

  onLoad: function () {
    initStatusBarHeight(this);
    this.loadStations();
  },

  loadStations: function () {
    const that = this;
    plantStore.getStations(true).then(function (stations) {
      that.setData({
        stations: stations,
        selectedStation: stations[0] || null,
        stationIndex: 0
      });
    });
  },

  goBack: function () {
    if (this.data.step !== 'intro') {
      this.setData({ step: 'intro', existingPlant: null, result: null });
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

  toggleManualInput: function () {
    this.setData({ showManualInput: !this.data.showManualInput });
  },

  onManualCodeInput: function (e) {
    this.setData({ manualCode: e.detail.value });
  },

  confirmManualCode: function () {
    const code = (this.data.manualCode || '').trim();
    if (!code) {
      wx.showToast({ title: '请输入植物编号', icon: 'none' });
      return;
    }
    this.handleScanResult(code);
  },

  simulatePlantScan: function (e) {
    const code = e.currentTarget.dataset.code;
    this.handleScanResult(code);
  },

  handleScanResult: function (raw) {
    const that = this;
    const parsed = parseQrResult(raw);
    if (parsed.type !== 'plant') {
      wx.showToast({ title: '请扫描植物二维码', icon: 'none' });
      return;
    }

    const plantCode = parsed.id.toUpperCase();
    plantStore.getPlantByCode(plantCode).then(function (existingPlant) {
      if (existingPlant && existingPlant.status === '待领养') {
        wx.showModal({
          title: '植物已在驿站',
          content: '「' + existingPlant.name + '」已在「' + existingPlant.station + '」待领养，无需重复送养。',
          showCancel: false
        });
        return;
      }

      if (existingPlant && existingPlant.status === '已领养') {
        that.setData({
          step: 'form',
          plantCode: plantCode,
          existingPlant: existingPlant,
          plantName: existingPlant.name,
          plantCategory: existingPlant.category,
          plantDescription: existingPlant.description || '',
          plantImage: existingPlant.image || '🌿',
          showManualInput: false
        });
        return;
      }

      that.setData({
        step: 'form',
        plantCode: plantCode,
        existingPlant: null,
        plantName: '',
        plantCategory: '',
        plantDescription: '',
        plantImage: '🌿',
        images: [],
        showManualInput: false
      });
    }).catch(function () {
      that.setData({
        step: 'form',
        plantCode: plantCode,
        existingPlant: null,
        plantName: '',
        plantCategory: '',
        plantDescription: '',
        plantImage: '🌿',
        images: [],
        showManualInput: false
      });
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

  onStationChange: function (e) {
    const index = Number(e.detail.value);
    const station = this.data.stations[index];
    this.setData({
      stationIndex: index,
      selectedStation: station
    });
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
    const { plantName, plantCategory, selectedStation } = this.data;
    if (!plantName.trim()) {
      wx.showToast({ title: '请输入植物名称', icon: 'none' });
      return;
    }
    if (!plantCategory.trim()) {
      wx.showToast({ title: '请输入植物品种', icon: 'none' });
      return;
    }
    if (!selectedStation) {
      wx.showToast({ title: '请选择送养驿站', icon: 'none' });
      return;
    }
    this.setData({ step: 'confirm' });
  },

  submitDonate: function () {
    const that = this;
    if (that.data.submitting) {
      return;
    }

    const { plantCode, plantName, plantCategory, plantDescription, plantImage, selectedStation, images } = that.data;
    that.setData({ submitting: true });
    wx.showLoading({ title: '提交中...' });

    plantStore
      .donatePlant({
        plantCode: plantCode,
        name: plantName.trim(),
        category: plantCategory.trim(),
        description: plantDescription.trim(),
        image: plantImage,
        photoPath: images[0] || '',
        stationId: selectedStation.id
      })
      .then(function (result) {
        wx.hideLoading();
        that.setData({ submitting: false });

        if (!result.success) {
          wx.showToast({ title: result.message || '送养失败', icon: 'none' });
          return;
        }

        const qrImageUrl = result.qrImageUrl || plantStore.getQrImageUrl('plant', result.plant.plantCode);
        that.setData({
          step: 'success',
          result: Object.assign({}, result, { qrImageUrl: qrImageUrl })
        });
      })
      .catch(function (err) {
        wx.hideLoading();
        that.setData({ submitting: false });
        wx.showToast({ title: (err && err.message) || '送养失败', icon: 'none' });
      });
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/home/index' });
  },

  donateAgain: function () {
    this.setData({
      step: 'intro',
      plantCode: '',
      manualCode: '',
      plantName: '',
      plantCategory: '',
      plantDescription: '',
      images: [],
      existingPlant: null,
      result: null
    });
    this.loadStations();
  }
});
