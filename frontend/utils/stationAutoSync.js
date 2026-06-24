const auth = require('./auth');
const plantStore = require('./plantStore');
const stationDetect = require('./stationDetect');

let syncPromise = null;
let lastSyncAt = 0;
const MIN_INTERVAL_MS = 60000;

function runOnAppActive() {
  const now = Date.now();
  if (syncPromise) {
    return syncPromise;
  }
  if (now - lastSyncAt < MIN_INTERVAL_MS) {
    return Promise.resolve();
  }

  syncPromise = auth
    .requireSession()
    .then(function () {
      return plantStore.getManagedStations();
    })
    .then(function (stations) {
      const shouldSync = (stations || []).some(function (station) {
        return station.canToggleStatus && station.autoStatusEnabled !== false;
      });
      if (!shouldSync) {
        return null;
      }
      return stationDetect.collectDetectionSignals();
    })
    .then(function (signals) {
      if (!signals) {
        return null;
      }
      return plantStore.syncManagedOpenStatus(signals);
    })
    .then(function (result) {
      if (!result || !result.stations) {
        return;
      }
      const changed = result.stations.filter(function (item) {
        return item.sync && item.sync.changed;
      });
      if (changed.length && changed[0].sync && changed[0].sync.message) {
        wx.showToast({
          title: changed[0].sync.message,
          icon: 'none',
          duration: 2500
        });
      }
      lastSyncAt = Date.now();
    })
    .catch(function (err) {
      console.warn('[auto-status] 启动同步跳过', (err && err.message) || err);
    })
    .finally(function () {
      syncPromise = null;
    });

  return syncPromise;
}

module.exports = {
  runOnAppActive: runOnAppActive
};
