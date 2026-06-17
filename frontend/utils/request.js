function getAppInstance() {
  return getApp();
}

function getBaseUrl() {
  return getAppInstance().globalData.apiBaseUrl;
}

function getToken() {
  return getAppInstance().globalData.token || '';
}

function request(options) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: getBaseUrl() + options.url,
      method: options.method || 'GET',
      data: options.data,
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

function getQrImageUrl(type, id, size) {
  const qrSize = size || 280;
  if (type === 'plant') {
    return getBaseUrl() + '/qr/plant/' + encodeURIComponent(id) + '?size=' + qrSize;
  }
  return getBaseUrl() + '/qr/station/' + id + '?size=' + qrSize;
}

module.exports = {
  getBaseUrl: getBaseUrl,
  get: get,
  post: post,
  getQrImageUrl: getQrImageUrl
};
