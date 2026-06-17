const { initStatusBarHeight, setTabBarSelected } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    statusBarHeight: 20,
    stations: [],
    newPlants: [],
    loadError: ''
  },

  onLoad: function () {
    initStatusBarHeight(this);
  },

  onShow: function () {
    setTabBarSelected(this, 0);
    this.refreshData();
  },

  refreshData: function () {
    const that = this;
    Promise.all([plantStore.getStations(), plantStore.getNewPlants()])
      .then(function (results) {
        that.setData({
          stations: results[0],
          newPlants: results[1],
          loadError: ''
        });
        media.hydrateStations(results[0]).then(function (stations) {
          that.setData({ stations: stations });
        });
        media.hydratePlants(results[1]).then(function (plants) {
          that.setData({ newPlants: plants });
        });
      })
      .catch(function (err) {
        that.setData({
          stations: [],
          newPlants: [],
          loadError: (err && err.message) || '无法加载数据'
        });
        wx.showToast({
          title: '无法连接后台数据',
          icon: 'none'
        });
      });
  },

  onPullDownRefresh: function () {
    const that = this;
    this.refreshData();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  },

  goToStationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/station-detail/index?id=${id}`
    });
  },

  goToScanDonate: function () {
    wx.navigateTo({
      url: '/pages/scan-donate/index'
    });
  },

  goToScanAdopt: function () {
    wx.navigateTo({
      url: '/pages/scan-adopt/index'
    });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plant-detail/index?id=${id}`
    });
  },

  viewAllStations: function () {
    wx.showToast({
      title: '更多中转站即将上线',
      icon: 'none'
    });
  },

  viewAllPlants: function () {
    wx.switchTab({
      url: '/pages/favorites/index'
    });
  }
});
