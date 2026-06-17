const { initStatusBarHeight, setTabBarSelected, showComingSoon } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');

Page({
  data: {
    statusBarHeight: 44,
    userInfo: {
      avatar: '👤',
      nickname: '叶子先生',
      points: 0
    },
    stats: {
      donatedCount: 0,
      adoptedCount: 0,
      currentReservation: 0
    }
  },

  onLoad: function () {
    initStatusBarHeight(this);
  },

  onShow: function () {
    setTabBarSelected(this, 2);
    this.refreshStats();
  },

  refreshStats: function () {
    const that = this;
    const app = getApp();
    plantStore.getUserStats().then(function (stats) {
      const userInfo = app.globalData.userInfo || {};
      that.setData({
        stats: stats,
        userInfo: {
          avatar: userInfo.avatar || '👤',
          nickname: userInfo.nickname || '叶子先生',
          points: stats.points
        }
      });
    }).catch(function () {
      // 积分加载失败时保留当前展示
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

  goToSettings: function () {
    showComingSoon('设置功能开发中');
  },

  goToDonations: function () {
    showComingSoon('送养记录开发中');
  },

  goToAdoptions: function () {
    showComingSoon('领养记录开发中');
  },

  goToReservations: function () {
    showComingSoon('预约记录开发中');
  },

  goToPoints: function () {
    showComingSoon('积分记录开发中');
  }
});
