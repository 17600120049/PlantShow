/**
 * 小程序 API 配置
 *
 * 模拟器：可用 127.0.0.1
 * 真机预览/调试：必须填开发电脑的局域网 IP（手机和电脑需同一 WiFi）
 *
 * 查看本机 IP：Windows 运行 ipconfig，macOS 运行 ifconfig
 */
const DEV_LAN_IP = '10.254.32.188';
const API_PORT = 3000;

/** 微信登录未配置时，是否允许使用开发登录（真机调试可开启，上线前请改为 false） */
const ALLOW_DEV_LOGIN = true;

function isDevtools() {
  try {
    const sys = wx.getSystemInfoSync();
    return sys.platform === 'devtools';
  } catch (e) {
    return false;
  }
}

function getApiBaseUrl() {
  const host = isDevtools() ? '127.0.0.1' : DEV_LAN_IP;
  return 'http://' + host + ':' + API_PORT + '/api';
}

module.exports = {
  DEV_LAN_IP: DEV_LAN_IP,
  API_PORT: API_PORT,
  ALLOW_DEV_LOGIN: ALLOW_DEV_LOGIN,
  getApiBaseUrl: getApiBaseUrl,
  isDevtools: isDevtools
};
