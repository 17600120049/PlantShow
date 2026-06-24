const auth = require('../../utils/auth');

Page({
  data: {
    agreed: false,
    loggingIn: false,
    referralCode: ''
  },

  onLoad: function () {
    if (auth.hasAgreedPrivacy()) {
      this.setData({ agreed: true });
    }
    const pending = auth.getPendingReferralCode();
    if (pending) {
      this.setData({ referralCode: pending });
    }
  },

  onUnload: function () {
    if (!this._loginCompleted) {
      auth.rejectLoginPage({ cancelled: true });
    }
  },

  preventMove: function () {},

  toggleAgreement: function () {
    const agreed = !this.data.agreed;
    this.setData({ agreed: agreed });
    if (agreed) {
      auth.markPrivacyAgreed();
    }
  },

  openUserAgreement: function () {
    wx.navigateTo({ url: '/pages/user-agreement/index' });
  },

  openPrivacyPolicy: function () {
    wx.navigateTo({ url: '/pages/privacy-policy/index' });
  },

  onReferralInput: function (e) {
    const value = ((e.detail && e.detail.value) || '').trim().toUpperCase();
    this.setData({ referralCode: value });
    auth.setPendingReferralCode(value);
  },

  onWechatLogin: function () {
    if (this.data.loggingIn || !this.data.agreed) {
      if (!this.data.agreed) {
        wx.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' });
      }
      return;
    }

    auth.markPrivacyAgreed();
    auth.setPendingReferralCode(this.data.referralCode);
    const that = this;
    this.setData({ loggingIn: true });

    auth.performLogin()
      .then(function (user) {
        that._loginCompleted = true;
        auth.resolveLoginPage(user);
        wx.navigateBack();
      })
      .catch(function (err) {
        wx.showToast({
          title: (err && err.message) || '登录失败，请重试',
          icon: 'none'
        });
      })
      .finally(function () {
        that.setData({ loggingIn: false });
      });
  },

  onCancel: function () {
    this._loginCompleted = true;
    auth.rejectLoginPage({ cancelled: true });
    wx.navigateBack();
  }
});
