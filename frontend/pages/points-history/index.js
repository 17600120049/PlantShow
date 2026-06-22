const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    totalPoints: 0,
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
      .getPointsHistory()
      .then(function (result) {
        that.setData({
          totalPoints: result.totalPoints || 0,
          records: result.records || [],
          loading: false,
          loadError: ''
        });
      })
      .catch(function (err) {
        that.setData({
          totalPoints: 0,
          records: [],
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
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
