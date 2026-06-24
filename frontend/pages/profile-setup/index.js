const auth = require('../../utils/auth');
const request = require('../../utils/request');

function isDefaultNickname(nickname) {
  const value = (nickname || '').trim();
  return !value || value === '微信用户';
}

function canSubmitProfile(nickname, avatarPath, existingAvatar) {
  return !isDefaultNickname(nickname) && !!(avatarPath || existingAvatar);
}

Page({
  data: {
    nickname: '',
    avatarDisplay: '',
    avatarPath: '',
    existingAvatar: '',
    saving: false,
    canSubmit: false
  },

  onLoad: function () {
    const app = getApp();
    const user = (app.globalData && app.globalData.userInfo) || {};
    const existingAvatar = user.avatar || '';
    const nickname = isDefaultNickname(user.nickname) ? '' : (user.nickname || '');

    this.setData({
      nickname: nickname,
      existingAvatar: existingAvatar,
      avatarDisplay: existingAvatar ? request.resolveMediaUrl(existingAvatar) : '',
      canSubmit: canSubmitProfile(nickname, '', existingAvatar)
    });
  },

  preventMove: function () {},

  syncCanSubmit: function () {
    this.setData({
      canSubmit: canSubmitProfile(
        this.data.nickname,
        this.data.avatarPath,
        this.data.existingAvatar
      )
    });
  },

  onChooseAvatar: function (e) {
    const avatarPath = e.detail && e.detail.avatarUrl;
    if (!avatarPath || this.data.saving) {
      return;
    }

    this.setData({
      avatarPath: avatarPath,
      avatarDisplay: avatarPath
    });
    this.syncCanSubmit();
  },

  onNicknameInput: function (e) {
    this.setData({
      nickname: (e.detail && e.detail.value) || ''
    });
    this.syncCanSubmit();
  },

  onNicknameBlur: function (e) {
    this.setData({
      nickname: ((e.detail && e.detail.value) || '').trim()
    });
    this.syncCanSubmit();
  },

  onSave: function () {
    if (this.data.saving) {
      return;
    }

    const nickname = (this.data.nickname || '').trim();
    if (isDefaultNickname(nickname)) {
      wx.showToast({ title: '请填写昵称', icon: 'none' });
      return;
    }

    if (!this.data.avatarPath && !this.data.existingAvatar) {
      wx.showToast({ title: '请选择头像', icon: 'none' });
      return;
    }

    const that = this;
    this.setData({ saving: true });

    const uploadPromise = this.data.avatarPath
      ? request.uploadFile(this.data.avatarPath)
      : Promise.resolve(this.data.existingAvatar);

    uploadPromise
      .then(function (avatarUrl) {
        return auth.updateProfile({
          nickname: nickname,
          avatar: avatarUrl
        });
      })
      .then(function () {
        wx.showToast({ title: '设置成功', icon: 'success' });
        that.closePage();
      })
      .catch(function () {
        wx.showToast({ title: '保存失败，请重试', icon: 'none' });
      })
      .finally(function () {
        that.setData({ saving: false });
      });
  },

  onSkip: function () {
    const app = getApp();
    const user = (app.globalData && app.globalData.userInfo) || {};
    if (user.id) {
      auth.markProfileSetupSkipped(user.id);
    }
    this.closePage();
  },

  closePage: function () {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
      return;
    }
    wx.switchTab({ url: '/pages/home/index' });
  }
});
