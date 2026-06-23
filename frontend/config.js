/**
 * 小程序 API 配置
 *
 * 正式版 / 体验版 / 真机预览：https://plshow.cn/api
 * 开发者工具（模拟器）：http://127.0.0.1:3000/api（需本机跑 backend）
 */
const PROD_API_BASE = 'https://plshow.cn/api';
const API_PORT = 3000;

function getEnvVersion() {
  try {
    return wx.getAccountInfoSync().miniProgram.envVersion;
  } catch (e) {
    return 'develop';
  }
}

function isDevtools() {
  try {
    const sys = wx.getSystemInfoSync();
    return sys.platform === 'devtools';
  } catch (e) {
    return false;
  }
}

function getApiBaseUrl() {
  const env = getEnvVersion();
  if (env === 'release' || env === 'trial') {
    return PROD_API_BASE;
  }
  if (isDevtools()) {
    return 'http://127.0.0.1:' + API_PORT + '/api';
  }
  return PROD_API_BASE;
}

/** 正式版禁用开发登录 */
const ALLOW_DEV_LOGIN = getEnvVersion() !== 'release';

module.exports = {
  PROD_API_BASE: PROD_API_BASE,
  API_PORT: API_PORT,
  ALLOW_DEV_LOGIN: ALLOW_DEV_LOGIN,
  getApiBaseUrl: getApiBaseUrl,
  isDevtools: isDevtools,
  getEnvVersion: getEnvVersion
};
