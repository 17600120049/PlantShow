const { initStatusBarHeight, setTabBarSelected } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const auth = require('../../utils/auth');
const request = require('../../utils/request');

function mapUserInfo(user, stats) {
  const points = stats && typeof stats.points === 'number'
    ? stats.points
    : (typeof user.points === 'number' ? user.points : 0);
  const lockedPoints = stats && typeof stats.lockedPoints === 'number'
    ? stats.lockedPoints
    : (typeof user.lockedPoints === 'number' ? user.lockedPoints : 0);
  return {
    avatar: user.avatar || '',
    avatarUrl: user.avatar ? request.resolveMediaUrl(user.avatar) : '',
    nickname: user.nickname || '微信用户',
    points: points,
    lockedPoints: lockedPoints,
    inviteUnlocked: !!(user.inviteUnlocked || (stats && stats.inviteUnlocked)),
    referralCode: user.referralCode || ''
  };
}

Page({
  data: {
    statusBarHeight: 44,
    loggedIn: false,
    userInfo: {
      avatar: '',
      avatarUrl: '',
      nickname: '微信用户',
      points: 0
    },
    stats: {
      donatedCount: 0,
      adoptedCount: 0
    },
    savingProfile: false,
    managedStations: [],
    flexibleManagedStations: []
  },

  onLoad: function () {
    initStatusBarHeight(this);
  },

  onShow: function () {
    setTabBarSelected(this, 2);
    if (!auth.isLoggedIn()) {
      this.setData({ loggedIn: false });
      return;
    }
    this.setData({ loggedIn: true });
    this.refreshStats();
  },

  onLoginTap: function () {
    const that = this;
    auth.requireLogin().then(function () {
      that.setData({ loggedIn: true });
      that.refreshStats();
    });
  },

  refreshStats: function () {
    const that = this;
    const app = getApp();
    Promise.all([
      plantStore.getUserStats(),
      auth.refreshProfile().catch(function () {
        return app.globalData.userInfo || {};
      }),
      plantStore.getManagedStations().catch(function () {
        return [];
      })
    ]).then(function (results) {
      const stats = results[0];
      const user = results[1];
      const managedStations = results[2] || [];
      const flexibleManagedStations = managedStations.filter(function (item) {
        return item.canToggleStatus;
      });
      that.setData({
        stats: stats,
        userInfo: mapUserInfo(user, stats),
        managedStations: managedStations,
        flexibleManagedStations: flexibleManagedStations
      });
    }).catch(function () {
      // 积分加载失败时保留当前展示
    });
  },

  copyReferralCode: function () {
    const code = (this.data.userInfo && this.data.userInfo.referralCode) || '';
    if (!code) {
      return;
    }
    wx.setClipboardData({
      data: code,
      success: function () {
        wx.showToast({ title: '邀请码已复制', icon: 'success' });
      }
    });
  },

  onChooseAvatar: function (e) {
    const avatarPath = e.detail && e.detail.avatarUrl;
    if (!avatarPath || this.data.savingProfile) {
      return;
    }

    const that = this;
    this.setData({ savingProfile: true });

    request.uploadFile(avatarPath)
      .then(function (url) {
        return auth.updateProfile({ avatar: url });
      })
      .then(function (user) {
        that.setData({
          userInfo: mapUserInfo(user, that.data.stats)
        });
        wx.showToast({ title: '头像已更新', icon: 'success' });
      })
      .catch(function () {
        wx.showToast({ title: '头像更新失败', icon: 'none' });
      })
      .finally(function () {
        that.setData({ savingProfile: false });
      });
  },

  onNicknameBlur: function (e) {
    const nickname = ((e.detail && e.detail.value) || '').trim();
    const current = (this.data.userInfo.nickname || '').trim();
    if (!nickname || nickname === current || this.data.savingProfile) {
      return;
    }

    const that = this;
    this.setData({ savingProfile: true });

    auth.updateProfile({ nickname: nickname })
      .then(function (user) {
        that.setData({
          userInfo: mapUserInfo(user, that.data.stats)
        });
        wx.showToast({ title: '昵称已更新', icon: 'success' });
      })
      .catch(function () {
        wx.showToast({ title: '昵称更新失败', icon: 'none' });
      })
      .finally(function () {
        that.setData({ savingProfile: false });
      });
  },

  goToScanDonate: function () {
    auth.navigateWithLogin('/pages/scan-donate/index');
  },

  goToScanAdopt: function () {
    auth.navigateWithLogin('/pages/scan-adopt/index');
  },

  goToDonations: function () {
    auth.requireLogin().then(function () {
      wx.navigateTo({ url: '/pages/my-donations/index' });
    });
  },

  goToAdoptions: function () {
    auth.requireLogin().then(function () {
      wx.navigateTo({ url: '/pages/my-adoptions/index' });
    });
  },

  goToPoints: function () {
    auth.requireLogin().then(function () {
      wx.navigateTo({ url: '/pages/points-history/index' });
    });
  },

  goToStationManage: function () {
    auth.requireLogin().then(function () {
      const stations = this.data.managedStations || [];
      if (stations.length === 1) {
        wx.navigateTo({
          url: '/pages/station-manage/index?id=' + stations[0].id
        });
        return;
      }
      wx.navigateTo({
        url: '/pages/station-manage/index'
      });
    }.bind(this));
  },

  goToStationOpen: function () {
    auth.requireLogin().then(function () {
      const stations = this.data.flexibleManagedStations || [];
      if (stations.length === 1) {
        wx.navigateTo({
          url: '/pages/station-open/index?id=' + stations[0].id
        });
        return;
      }
      wx.navigateTo({
        url: '/pages/station-open/index'
      });
    }.bind(this));
  }
});
