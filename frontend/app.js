const FONT_FILES = [
  { weight: 400, file: 'chinese-simplified-400-normal.woff2' },
  { weight: 500, file: 'chinese-simplified-500-normal.woff2' },
  { weight: 600, file: 'chinese-simplified-600-normal.woff2' },
  { weight: 700, file: 'chinese-simplified-700-normal.woff2' }
];

function loadAppFonts() {
  FONT_FILES.forEach(({ weight, file }) => {
    wx.loadFontFace({
      global: true,
      family: 'Noto Sans SC',
      source: `url("https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-sc@5.2.5/${file}")`,
      desc: { weight: String(weight), style: 'normal' },
      fail: function (err) {
        console.warn('[font] Noto Sans SC ' + weight + ' 加载失败，将使用系统字体', err);
      }
    });
  });
}

App({
  onLaunch: function () {
    const config = require('./config');
    this.globalData.apiBaseUrl = config.getApiBaseUrl();
    console.log('[api] baseUrl =', this.globalData.apiBaseUrl);

    const auth = require('./utils/auth');
    const plantStore = require('./utils/plantStore');
    const stationAutoSync = require('./utils/stationAutoSync');
    auth.ensureLogin(this).then(function () {
      stationAutoSync.runOnAppActive();
    }).catch(function (err) {
      console.warn('[auth] 自动登录失败', err);
    });
    plantStore.probeApi().then(function (online) {
      if (!online) {
        console.warn('[api] 无法连接后端，请确认 apiBaseUrl 配置正确且后端已启动');
      }
    });
    setTimeout(loadAppFonts, 0);
  },

  onShow: function () {
    const stationAutoSync = require('./utils/stationAutoSync');
    stationAutoSync.runOnAppActive();
  },

  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: ''
  }
});
