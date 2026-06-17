Page({
  data: {
    statusBarHeight: 44,
    userInfo: {
      avatar: '👤',
      nickname: '叶子先生',
      points: 186
    },
    stats: {
      donatedCount: 23,
      adoptedCount: 15,
      currentReservation: 2
    }
  },

  onLoad: function () {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      });
    }
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
  }
});