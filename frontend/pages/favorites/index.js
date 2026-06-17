const { initStatusBarHeight, setTabBarSelected } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'plants',
    plants: [],
    stations: [],
    loading: false,
    loadError: ''
  },

  onLoad: function () {
    initStatusBarHeight(this);
  },

  onShow: function () {
    setTabBarSelected(this, 1);
    this.loadData();
  },

  loadData: function () {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    Promise.all([plantStore.getNewPlants(), plantStore.getStations()])
      .then(function (results) {
        that.setData({
          plants: results[0],
          stations: results[1],
          loading: false,
          loadError: ''
        });
        media.hydratePlants(results[0]).then(function (plants) {
          that.setData({ plants: plants });
        });
        media.hydrateStations(results[1]).then(function (stations) {
          that.setData({ stations: stations });
        });
      })
      .catch(function (err) {
        that.setData({
          plants: [],
          stations: [],
          loading: false,
          loadError: (err && err.message) || '无法加载数据'
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
    wx.navigateTo({
      url: '/pages/plant-detail/index?id=' + id
    });
  },

  goToStationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/station-detail/index?id=' + id
    });
  },

  onPullDownRefresh: function () {
    this.loadData();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  }
});
