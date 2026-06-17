const { initStatusBarHeight } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    statusBarHeight: 44,
    plant: null,
    loading: true,
    loadError: '',
    currentPhoto: ''
  },

  onLoad: function (options) {
    initStatusBarHeight(this);
    if (options && options.id) {
      this.loadPlant(options.id);
    }
  },

  loadPlant: function (plantId) {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    plantStore
      .getPlantById(plantId)
      .then(function (plant) {
        that.setData({
          plant: plant,
          loading: false,
          loadError: '',
          currentPhoto: plant.photoUrl || ''
        });
        media.hydratePlantMedia(plant).then(function (hydrated) {
          that.setData({
            plant: hydrated,
            currentPhoto: hydrated.photoUrl || ''
          });
        });
      })
      .catch(function (err) {
        that.setData({
          plant: null,
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  goToStation: function () {
    const plant = this.data.plant;
    if (!plant || !plant.stationId) {
      return;
    }
    wx.navigateTo({
      url: '/pages/station-detail/index?id=' + plant.stationId
    });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  setCurrentPhoto: function (e) {
    const url = e.currentTarget.dataset.url;
    this.setData({
      currentPhoto: url,
      'plant.photoUrl': url
    });
  }
});
