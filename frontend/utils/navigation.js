const request = require('./request');

function hasNavigation(station) {
  return !!(station && (station.id != null || station.address));
}

function openWithCoords(target) {
  const latitude = Number(target.latitude);
  const longitude = Number(target.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    wx.showToast({
      title: '无法获取导航坐标',
      icon: 'none'
    });
    return;
  }

  wx.openLocation({
    latitude: latitude,
    longitude: longitude,
    name: target.address || '目的地',
    address: target.address || '',
    scale: 16
  });
}

function openStationLocation(station) {
  if (!station || !station.address) {
    wx.showToast({
      title: '中转站地址无效',
      icon: 'none'
    });
    return;
  }

  if (station.id == null) {
    wx.showToast({
      title: '请连接后端后使用导航',
      icon: 'none'
    });
    return;
  }

  wx.showLoading({ title: '搜索地址...', mask: true });
  request
    .get('/stations/' + station.id + '/navigation')
    .then(function (target) {
      wx.hideLoading();
      openWithCoords(target);
    })
    .catch(function (err) {
      wx.hideLoading();
      wx.showToast({
        title: (err && err.message) || '无法搜索导航地址',
        icon: 'none',
        duration: 3000
      });
    });
}

module.exports = {
  hasNavigation: hasNavigation,
  openStationLocation: openStationLocation
};
