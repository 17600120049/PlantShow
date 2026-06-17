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
    loadAppFonts();
    const auth = require('./utils/auth');
    auth.ensureLogin().catch(function (err) {
      console.warn('[auth] 自动登录失败，将使用本地模式', err);
    });
  },

  globalData: {
    userInfo: null,
    token: '',
    apiBaseUrl: 'http://localhost:3000/api'
  }
});
