const { initStatusBarHeight, setTabBarSelected } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const auth = require('../../utils/auth');

Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'plants',
    plants: [],
    stations: [],
    loading: false,
    loadError: '',
    loggedIn: false
  },

  onLoad: function () {
    initStatusBarHeight(this);
  },

  onShow: function () {
    setTabBarSelected(this, 1);
    if (!auth.isLoggedIn()) {
      this.setData({
        loggedIn: false,
        plants: [],
        stations: [],
        loading: false,
        loadError: ''
      });
      return;
    }
    this.setData({ loggedIn: true });
    this.loadData();
  },

  onLoginTap: function () {
    const that = this;
    auth.requireLogin().then(function () {
      that.setData({ loggedIn: true });
      that.loadData();
    });
  },

  loadData: function () {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    plantStore
      .getFavorites()
      .then(function (result) {
        that.setData({
          plants: result.plants,
          stations: result.stations,
          loading: false,
          loadError: ''
        });
        const media = require('../../utils/media');
        media.hydratePlants(result.plants).then(function (plants) {
          that.setData({ plants: plants });
        });
        media.hydrateStations(result.stations).then(function (stations) {
          that.setData({ stations: stations });
        });
      })
      .catch(function (err) {
        that.setData({
          plants: [],
          stations: [],
          loading: false,
          loadError: (err && err.message) || '无法加载收藏'
        });
      });
  },

  setTab: function (e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab
    });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    auth.navigateWithLogin('/pages/plant-detail/index?id=' + id);
  },

  goToStationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    auth.navigateWithLogin('/pages/station-detail/index?id=' + id);
  },

  onPullDownRefresh: function () {
    if (!this.data.loggedIn) {
      wx.stopPullDownRefresh();
      return;
    }
    this.loadData();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  }
});
