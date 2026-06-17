const { initDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    statusBarHeight: 44,
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    plant: null,
    loading: true,
    loadError: '',
    currentPhoto: '',
    favorited: false,
    favoriteLoading: false
  },

  onLoad: function (options) {
    initDetailNav(this);
    if (options && options.id) {
      this.plantId = options.id;
      this.loadPlant(options.id);
    }
  },

  loadPlant: function (plantId) {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    Promise.all([
      plantStore.getPlantById(plantId),
      plantStore.checkPlantFavorite(plantId)
    ])
      .then(function (results) {
        const plant = results[0];
        const favorited = results[1];
        that.setData({
          plant: plant,
          loading: false,
          loadError: '',
          currentPhoto: plant.photoUrl || '',
          favorited: favorited
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

  toggleFavorite: function () {
    const that = this;
    const plant = this.data.plant;
    if (!plant || that.data.favoriteLoading) {
      return;
    }
    that.setData({ favoriteLoading: true });
    plantStore
      .togglePlantFavorite(plant.id, that.data.favorited)
      .then(function () {
        const nextFavorited = !that.data.favorited;
        that.setData({
          favorited: nextFavorited,
          favoriteLoading: false
        });
        wx.showToast({
          title: nextFavorited ? '已收藏' : '已取消收藏',
          icon: 'none'
        });
      })
      .catch(function (err) {
        that.setData({ favoriteLoading: false });
        wx.showToast({
          title: (err && err.message) || '操作失败',
          icon: 'none'
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
