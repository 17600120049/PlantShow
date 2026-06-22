const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    records: [],
    loading: true,
    loadError: ''
  },

  onLoad: function () {
    setupDetailNav(this);
    this.loadData();
  },

  loadData: function () {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    plantStore
      .getMyDonations()
      .then(function (records) {
        that.setData({ records: records, loading: false, loadError: '' });
        return media.hydratePlants(records.map(function (item) {
          return item.plant;
        }));
      })
      .then(function (plants) {
        if (!plants || !plants.length) {
          return;
        }
        const records = that.data.records.map(function (item, index) {
          return Object.assign({}, item, { plant: plants[index] || item.plant });
        });
        that.setData({ records: records });
      })
      .catch(function (err) {
        that.setData({
          records: [],
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/plant-detail/index?id=' + id
    });
  },

  goToScanDonate: function () {
    wx.navigateTo({
      url: '/pages/scan-donate/index'
    });
  },

  onPullDownRefresh: function () {
    this.loadData();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  }
});
