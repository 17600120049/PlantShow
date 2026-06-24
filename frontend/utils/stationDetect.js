function requestLocationPermission() {
  return new Promise(function (resolve) {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting && res.authSetting['scope.userLocation']) {
          resolve(true);
          return;
        }
        wx.authorize({
          scope: 'scope.userLocation',
          success: function () {
            resolve(true);
          },
          fail: function () {
            resolve(false);
          }
        });
      },
      fail: function () {
        resolve(false);
      }
    });
  });
}

function getLocation() {
  return requestLocationPermission().then(function (granted) {
    if (!granted) {
      return null;
    }
    return new Promise(function (resolve) {
      wx.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: function (res) {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude
          });
        },
        fail: function () {
          resolve(null);
        }
      });
    });
  });
}

function getConnectedWifiSsid() {
  return new Promise(function (resolve) {
    if (!wx.startWifi || !wx.getConnectedWifi) {
      resolve('');
      return;
    }
    wx.startWifi({
      success: function () {
        wx.getConnectedWifi({
          success: function (res) {
            resolve((res.wifi && res.wifi.SSID) || '');
          },
          fail: function () {
            resolve('');
          },
          complete: function () {
            if (wx.stopWifi) {
              wx.stopWifi({});
            }
          }
        });
      },
      fail: function () {
        resolve('');
      }
    });
  });
}

function collectDetectionSignals() {
  return Promise.all([
    getConnectedWifiSsid(),
    getLocation()
  ]).then(function (results) {
    const wifiSsid = results[0] || '';
    const location = results[1];
    const payload = {};
    if (wifiSsid) {
      payload.wifiSsid = wifiSsid;
    }
    if (location) {
      payload.latitude = location.latitude;
      payload.longitude = location.longitude;
    }
    return payload;
  });
}

let locationWatchTimer = null;
let locationWatchHandler = null;
const LOCATION_POLL_INTERVAL_MS = 30000;

function startForegroundLocationWatch(onChange) {
  if (typeof onChange !== 'function') {
    return Promise.resolve(false);
  }
  return requestLocationPermission().then(function (granted) {
    if (!granted) {
      return false;
    }
    locationWatchHandler = onChange;
    if (locationWatchTimer) {
      return true;
    }
    const poll = function () {
      if (locationWatchHandler) {
        locationWatchHandler();
      }
    };
    poll();
    locationWatchTimer = setInterval(poll, LOCATION_POLL_INTERVAL_MS);
    return true;
  });
}

function stopForegroundLocationWatch(handler) {
  if (handler && locationWatchHandler === handler) {
    locationWatchHandler = null;
  }
  if (!locationWatchHandler && locationWatchTimer) {
    clearInterval(locationWatchTimer);
    locationWatchTimer = null;
  }
}

module.exports = {
  collectDetectionSignals: collectDetectionSignals,
  startForegroundLocationWatch: startForegroundLocationWatch,
  stopForegroundLocationWatch: stopForegroundLocationWatch
};
