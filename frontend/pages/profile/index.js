Page({
  data: {
    statusBarHeight: 20,
    userInfo: {
      avatar: '👤',
      nickname: '植物爱好者',
      plantCode: 'PW-2024-001',
      bio: '🌱 热爱植物，传播绿色',
      plantCount: 12,
      following: 128,
      followers: 89,
      likes: 1234
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
        selected: 4
      });
    }
  },

  goToSettings: function () {
    wx.navigateTo({
      url: '/pages/settings/index'
    });
  },

  goToPage: function (e) {
    const page = e.currentTarget.dataset.page;
    wx.navigateTo({
      url: `/pages/${page}/index`
    });
  }
});