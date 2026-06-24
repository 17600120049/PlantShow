const { initStatusBarHeight, setTabBarSelected } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');
const navigation = require('../../utils/navigation');
const auth = require('../../utils/auth');

const HOME_STATIONS_LIMIT = 3;

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
    Promise.allSettled([plantStore.getStations(), plantStore.getNewPlants()])
      .then(function (results) {
        const stationsResult = results[0];
        const plantsResult = results[1];
        const errors = [];

        if (stationsResult.status === 'fulfilled') {
          const previewStations = stationsResult.value.slice(0, HOME_STATIONS_LIMIT);
          that.setData({ stations: previewStations, loadError: '' });
          media.hydrateStations(previewStations).then(function (stations) {
            that.setData({ stations: stations });
          });
        } else {
          errors.push((stationsResult.reason && stationsResult.reason.message) || '中转站加载失败');
        }

        if (plantsResult.status === 'fulfilled') {
          that.setData({ newPlants: plantsResult.value });
          media.hydratePlants(plantsResult.value).then(function (plants) {
            that.setData({ newPlants: plants });
          });
        } else {
          errors.push((plantsResult.reason && plantsResult.reason.message) || '植物列表加载失败');
        }

        if (errors.length) {
          that.setData({ loadError: errors.join('；') });
          wx.showToast({
            title: errors.length > 1 ? '部分数据加载失败' : '无法连接后台数据',
            icon: 'none'
          });
        } else {
          that.setData({ loadError: '' });
        }
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
    auth.navigateWithLogin('/pages/station-detail/index?id=' + id);
  },

  openStationNavigation: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const station = this.data.stations.find(function (item) {
      return Number(item.id) === id;
    });
    navigation.openStationLocation(station);
  },

  goToScanDonate: function () {
    auth.navigateWithLogin('/pages/scan-donate/index');
  },

  goToScanAdopt: function () {
    auth.navigateWithLogin('/pages/scan-adopt/index');
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    auth.navigateWithLogin('/pages/plant-detail/index?id=' + id);
  },

  viewAllStations: function () {
    auth.navigateWithLogin('/pages/stations-list/index');
  },

  viewAllPlants: function () {
    auth.navigateWithLogin('/pages/plants-list/index');
  }
});
