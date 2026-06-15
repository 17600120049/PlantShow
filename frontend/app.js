App({
  onLaunch: function () {
    console.log('流浪植物小程序启动');
  },
  
  onShow: function () {
    console.log('小程序显示');
  },
  
  onHide: function () {
    console.log('小程序隐藏');
  },
  
  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: 'http://localhost:3000/api'
  }
});