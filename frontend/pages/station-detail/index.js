const { initStatusBarHeight } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    statusBarHeight: 44,
    station: null,
    plants: [],
    stationQrUrl: '',
    loading: true,
    loadError: ''
  },

  onLoad: function (options) {
    initStatusBarHeight(this);
    if (options && options.id) {
      this.loadStation(options.id);
    }
  },

  loadStation: function (stationId) {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    Promise.all([
      plantStore.getStationById(stationId),
      plantStore.getAvailablePlantsByStation(stationId)
    ])
      .then(function (results) {
        const station = results[0];
        const plants = results[1];
        const qrRemote = plantStore.getQrImageUrl('station', station.id);
        that.setData({
          station: station,
          plants: plants,
          stationQrUrl: '',
          loading: false,
          loadError: ''
        });
        media.hydrateStationMedia(station).then(function (hydrated) {
          that.setData({ station: hydrated });
        });
        media.hydratePlants(plants).then(function (hydratedPlants) {
          that.setData({ plants: hydratedPlants });
        });
        media.downloadToLocal(qrRemote).then(function (qrLocal) {
          that.setData({ stationQrUrl: qrLocal || qrRemote });
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

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/plant-detail/index?id=' + id
    });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
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
