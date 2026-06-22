const config = require('../config');

function getAppInstance() {
  try {
    const app = getApp({ allowDefault: true });
    if (app && app.globalData) {
      return app;
    }
  } catch (e) {
    // App may not be registered yet during onLaunch
  }
  return null;
}

const DEFAULT_API_BASE_URL = config.getApiBaseUrl();

function getBaseUrl() {
  const app = getAppInstance();
  if (app && app.globalData && app.globalData.apiBaseUrl) {
    return app.globalData.apiBaseUrl;
  }
  return DEFAULT_API_BASE_URL;
}

function getToken() {
  const app = getAppInstance();
  if (app && app.globalData) {
    return app.globalData.token || '';
  }
  return '';
}

function request(options) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: getBaseUrl() + options.url,
      method: options.method || 'GET',
      data: options.data,
      timeout: options.timeout || 15000,
      header: Object.assign(
        {
          'Content-Type': 'application/json',
          Authorization: getToken() ? 'Bearer ' + getToken() : ''
        },
        options.header || {}
      ),
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
          return;
        }
        reject(res.data || { message: '请求失败', statusCode: res.statusCode });
      },
      fail: function (err) {
        reject(err || { message: '网络错误' });
      }
    });
  });
}

function get(url, data) {
  return request({ url: url, method: 'GET', data: data });
}

function post(url, data) {
  return request({ url: url, method: 'POST', data: data });
}

function patch(url, data) {
  return request({ url: url, method: 'PATCH', data: data });
}

function del(url, data) {
  return request({ url: url, method: 'DELETE', data: data });
}

function send(options) {
  return request(options);
}

function getQrImageUrl(type, id, size) {
  const qrSize = size || 280;
  if (type === 'plant') {
    return getBaseUrl() + '/qr/plant/' + encodeURIComponent(id) + '?size=' + qrSize;
  }
  return getBaseUrl() + '/qr/station/' + id + '?size=' + qrSize;
}

function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }
  if (/^https?:\/\//.test(url) || /^wxfile:/.test(url)) {
    return url;
  }
  const origin = getBaseUrl().replace(/\/api\/?$/, '');
  return origin + (url.indexOf('/') === 0 ? url : '/' + url);
}

function uploadFile(filePath) {
  return new Promise(function (resolve, reject) {
    wx.uploadFile({
      url: getBaseUrl() + '/upload',
      filePath: filePath,
      name: 'file',
      header: {
        Authorization: getToken() ? 'Bearer ' + getToken() : ''
      },
      success: function (res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data);
            resolve(data.url || '');
            return;
          } catch (e) {
            reject({ message: '上传响应解析失败' });
            return;
          }
        }
        reject({ message: '上传失败 (' + res.statusCode + ')' });
      },
      fail: function (err) {
        reject(err || { message: '上传失败' });
      }
    });
  });
}

module.exports = {
  send: send,
  request: send,
  getBaseUrl: getBaseUrl,
  get: get,
  post: post,
  patch: patch,
  del: del,
  getQrImageUrl: getQrImageUrl,
  resolveMediaUrl: resolveMediaUrl,
  uploadFile: uploadFile
};
