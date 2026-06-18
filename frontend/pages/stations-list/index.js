const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');
const navigation = require('../../utils/navigation');

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    stations: [],
    loading: true,
    loadError: ''
  },

  onLoad: function () {
    setupDetailNav(this);
    this.loadStations();
  },

  loadStations: function () {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    plantStore
      .getStations(false)
      .then(function (stations) {
        that.setData({ stations: stations, loading: false, loadError: '' });
        return media.hydrateStations(stations);
      })
      .then(function (stations) {
        if (stations) {
          that.setData({ stations: stations });
        }
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          loadError: (err && err.message) || '中转站加载失败'
        });
      });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  goToJoinUs: function () {
    wx.navigateTo({
      url: '/pages/join-us/index'
    });
  },

  goToStationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/station-detail/index?id=' + id
    });
  },

  openStationNavigation: function (e) {
    const id = Number(e.currentTarget.dataset.id);
    const station = this.data.stations.find(function (item) {
      return Number(item.id) === id;
    });
    navigation.openStationLocation(station);
  },

  onPullDownRefresh: function () {
    const that = this;
    this.loadStations();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  }
});
