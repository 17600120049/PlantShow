/**
 * 小程序 API 配置
 *
 * 正式版（release）：使用 https://plshow.cn/api
 * 开发/体验版：模拟器用 127.0.0.1，真机用局域网 IP
 */
const PROD_API_BASE = 'https://plshow.cn/api';
const DEV_LAN_IP = '10.254.32.188';
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
  if (getEnvVersion() === 'release') {
    return PROD_API_BASE;
  }
  const host = isDevtools() ? '127.0.0.1' : DEV_LAN_IP;
  return 'http://' + host + ':' + API_PORT + '/api';
}

/** 正式版禁用开发登录 */
const ALLOW_DEV_LOGIN = getEnvVersion() !== 'release';

module.exports = {
  PROD_API_BASE: PROD_API_BASE,
  DEV_LAN_IP: DEV_LAN_IP,
  API_PORT: API_PORT,
  ALLOW_DEV_LOGIN: ALLOW_DEV_LOGIN,
  getApiBaseUrl: getApiBaseUrl,
  isDevtools: isDevtools,
  getEnvVersion: getEnvVersion
};
