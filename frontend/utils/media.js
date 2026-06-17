const request = require('./request');

const cache = {};
const MAX_CONCURRENT = 4;
const DOWNLOAD_TIMEOUT = 8000;
let activeCount = 0;
const pendingQueue = [];

function drainQueue() {
  while (activeCount < MAX_CONCURRENT && pendingQueue.length > 0) {
    const task = pendingQueue.shift();
    if (task) {
      task();
    }
  }
}

function isLocalDisplayPath(url) {
  return !url || /^wxfile:/.test(url) || /^data:/.test(url);
}

function toFullMediaUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }
  if (/^https?:\/\//.test(url) || /^wxfile:/.test(url)) {
    return url;
  }
  return request.resolveMediaUrl(url);
}

function downloadToLocal(url) {
  const fullUrl = toFullMediaUrl(url);
  if (!fullUrl || isLocalDisplayPath(fullUrl)) {
    return Promise.resolve(fullUrl || '');
  }

  if (cache[fullUrl]) {
    return Promise.resolve(cache[fullUrl]);
  }

  return new Promise(function (resolve) {
    const run = function () {
      activeCount += 1;
      let settled = false;

      function finish(result) {
        if (settled) {
          return;
        }
        settled = true;
        activeCount = Math.max(0, activeCount - 1);
        drainQueue();
        resolve(result);
      }

      const timer = setTimeout(function () {
        finish('');
      }, DOWNLOAD_TIMEOUT);

      wx.downloadFile({
        url: fullUrl,
        timeout: DOWNLOAD_TIMEOUT,
        success: function (res) {
          clearTimeout(timer);
          if (res.statusCode === 200 && res.tempFilePath) {
            cache[fullUrl] = res.tempFilePath;
            finish(res.tempFilePath);
            return;
          }
          finish('');
        },
        fail: function () {
          clearTimeout(timer);
          finish('');
        }
      });
    };

    if (activeCount < MAX_CONCURRENT) {
      run();
    } else {
      pendingQueue.push(run);
    }
  });
}

function hydrateStationMedia(station) {
  if (!station || !station.logoUrl) {
    return Promise.resolve(station);
  }
  return downloadToLocal(station.logoUrl).then(function (localUrl) {
    if (!localUrl) {
      return station;
    }
    return Object.assign({}, station, { logoUrl: localUrl });
  });
}

function hydratePlantMedia(plant) {
  if (!plant) {
    return Promise.resolve(plant);
  }

  const remotePhotos = plant.photos && plant.photos.length
    ? plant.photos
    : plant.photoUrl
      ? [plant.photoUrl]
      : [];

  if (!remotePhotos.length) {
    return Promise.resolve(plant);
  }

  return Promise.all(remotePhotos.map(downloadToLocal)).then(function (localPhotos) {
    const photos = localPhotos.filter(Boolean);
    return Object.assign({}, plant, {
      photoUrl: photos[0] || plant.photoUrl || '',
      photos: photos.length ? photos : plant.photos || []
    });
  });
}

function hydrateStations(stations) {
  return Promise.all((stations || []).map(hydrateStationMedia));
}

function hydratePlants(plants) {
  return Promise.all((plants || []).map(hydratePlantMedia));
}

module.exports = {
  downloadToLocal: downloadToLocal,
  hydrateStationMedia: hydrateStationMedia,
  hydratePlantMedia: hydratePlantMedia,
  hydrateStations: hydrateStations,
  hydratePlants: hydratePlants
};
