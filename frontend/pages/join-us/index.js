const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    applicantName: '',
    phone: '',
    stationName: '',
    address: '',
    hours: '',
    intro: '',
    submitting: false,
    submitted: false
  },

  onLoad: function () {
    setupDetailNav(this);
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  onApplicantNameInput: function (e) {
    this.setData({ applicantName: e.detail.value });
  },

  onPhoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  onStationNameInput: function (e) {
    this.setData({ stationName: e.detail.value });
  },

  onAddressInput: function (e) {
    this.setData({ address: e.detail.value });
  },

  onHoursInput: function (e) {
    this.setData({ hours: e.detail.value });
  },

  onIntroInput: function (e) {
    this.setData({ intro: e.detail.value });
  },

  submitApplication: function () {
    const that = this;
    const data = this.data;

    if (!data.applicantName.trim()) {
      wx.showToast({ title: '请填写联系人', icon: 'none' });
      return;
    }
    if (!data.phone.trim()) {
      wx.showToast({ title: '请填写联系电话', icon: 'none' });
      return;
    }
    if (!data.stationName.trim()) {
      wx.showToast({ title: '请填写中转站名称', icon: 'none' });
      return;
    }
    if (!data.address.trim()) {
      wx.showToast({ title: '请填写详细地址', icon: 'none' });
      return;
    }

    that.setData({ submitting: true });
    plantStore
      .submitStationApplication({
        applicantName: data.applicantName.trim(),
        phone: data.phone.trim(),
        stationName: data.stationName.trim(),
        address: data.address.trim(),
        hours: data.hours.trim() || undefined,
        intro: data.intro.trim() || undefined
      })
      .then(function () {
        that.setData({ submitting: false, submitted: true });
        wx.showToast({ title: '申请已提交', icon: 'success' });
      })
      .catch(function (err) {
        that.setData({ submitting: false });
        wx.showToast({
          title: (err && err.message) || '提交失败',
          icon: 'none'
        });
      });
  },

  goHome: function () {
    wx.switchTab({ url: '/pages/home/index' });
  }
});
