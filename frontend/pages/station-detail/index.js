const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');
const navigation = require('../../utils/navigation');

Page({
  data: {
    statusBarHeight: 44,
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    station: null,
    plants: [],

    loading: true,
    loadError: '',
    favorited: false,
    favoriteLoading: false
  },

  onLoad: function (options) {
    setupDetailNav(this);
    if (options && options.id) {
      this.stationId = options.id;
      this.loadStation(options.id);
    }
  },

  loadStation: function (stationId) {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    Promise.all([
      plantStore.getStationById(stationId),
      plantStore.getAvailablePlantsByStation(stationId),
      plantStore.checkStationFavorite(stationId)
    ])
      .then(function (results) {
        const station = results[0];
        const plants = results[1];
        const favorited = results[2];
        that.setData({
          station: station,
          plants: plants,
          loading: false,
          loadError: '',
          favorited: favorited
        });
        media.hydrateStationMedia(station).then(function (hydrated) {
          that.setData({ station: hydrated });
        });
        media.hydratePlants(plants).then(function (hydratedPlants) {
          that.setData({ plants: hydratedPlants });
        });
      })
      .catch(function (err) {
        that.setData({
          station: null,
          plants: [],
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  toggleFavorite: function () {
    const that = this;
    const station = this.data.station;
    if (!station || that.data.favoriteLoading) {
      return;
    }
    that.setData({ favoriteLoading: true });
    plantStore
      .toggleStationFavorite(station.id, that.data.favorited)
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

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/plant-detail/index?id=' + id
    });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  openStationNavigation: function () {
    navigation.openStationLocation(this.data.station);
  },

  copyContact: function () {
    const station = this.data.station;
    if (!station || !station.phone) {
      return;
    }
    wx.setClipboardData({
      data: station.phone,
      success: function () {
        wx.showToast({ title: '已复制', icon: 'success' });
      },
      fail: function () {
        wx.showToast({ title: '复制失败', icon: 'none' });
      }
    });
  },

  onPullDownRefresh: function () {
    const station = this.data.station;
    if (station) {
      this.loadStation(station.id);
    }
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  }
});
