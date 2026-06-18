const request = require('./request');
const auth = require('./auth');

function isMediaUrl(value) {
  return !!value && (value.indexOf('/api/') === 0 || value.indexOf('http') === 0);
}

function normalizeStation(station) {
  if (!station) {
    return station;
  }
  const rawLogo = station.logoUrl || (isMediaUrl(station.image) ? station.image : '');
  return Object.assign({}, station, {
    logoUrl: request.resolveMediaUrl(rawLogo),
    image: isMediaUrl(station.image) ? station.imageEmoji || '🏡' : station.image || station.imageEmoji || '🏡'
  });
}

function normalizePlant(plant) {
  if (!plant) {
    return plant;
  }
  const photos = (plant.photos || []).map(request.resolveMediaUrl).filter(Boolean);
  const photoUrl = request.resolveMediaUrl(plant.photoUrl || photos[0] || '');
  return Object.assign({}, plant, { photos: photos, photoUrl: photoUrl });
}

function normalizeError(err) {
  if (!err) {
    return { message: '请求失败' };
  }
  let message = err.message;
  if (Array.isArray(message)) {
    message = message.join('；');
  }
  if (typeof message !== 'string' || !message) {
    message = '请求失败';
  }
  return Object.assign({}, err, { message: message });
}

function getStations(activeOnly) {
  return request
    .get('/stations', { activeOnly: activeOnly ? 'true' : 'false' })
    .then(function (stations) {
      return stations.map(normalizeStation);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getStationById(stationId) {
  return request
    .get('/stations/' + stationId)
    .then(function (station) {
      return normalizeStation(station);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getPlantByCode(plantCode) {
  return request
    .get('/plants/code/' + encodeURIComponent(plantCode))
    .then(function (plant) {
      return normalizePlant(plant);
    })
    .catch(function (err) {
      if (err && (err.statusCode === 404 || err.message === '植物不存在')) {
        return null;
      }
      return Promise.reject(normalizeError(err));
    });
}

function getPlantById(plantId) {
  return request
    .get('/plants/' + plantId)
    .then(function (plant) {
      return normalizePlant(plant);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getAvailablePlantsByStation(stationId) {
  return request
    .get('/stations/' + stationId + '/plants')
    .then(function (plants) {
      return plants.map(normalizePlant);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getNewPlants() {
  return request
    .get('/plants')
    .then(function (plants) {
      return plants.map(normalizePlant);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function probeApi() {
  return request
    .get('/stations', { activeOnly: 'false' })
    .then(function () {
      return true;
    })
    .catch(function () {
      return false;
    });
}

function donatePlant(payload) {
  return auth
    .ensureLogin()
    .then(function () {
      return request.post('/plants/donate', {
        plantCode: payload.plantCode,
        name: payload.name,
        category: payload.category,
        stationId: payload.stationId,
        description: payload.description,
        image: payload.image,
        photoUrl: payload.photoPath || payload.photoUrl
      });
    })
    .then(function (result) {
      return Object.assign({}, result, {
        qrImageUrl: request.getQrImageUrl('plant', result.plant.plantCode)
      });
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function adoptPlant(plantId) {
  return auth
    .ensureLogin()
    .then(function () {
      return request.post('/plants/' + plantId + '/adopt', {});
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getUserStats() {
  return auth
    .ensureLogin()
    .then(function () {
      return request.get('/users/me/stats');
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getFavorites() {
  return auth
    .ensureLogin()
    .then(function () {
      return request.get('/users/me/favorites');
    })
    .then(function (result) {
      return {
        plants: (result.plants || []).map(normalizePlant),
        stations: (result.stations || []).map(normalizeStation)
      };
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function checkPlantFavorite(plantId) {
  return auth
    .ensureLogin()
    .then(function () {
      return request.get('/users/me/favorites/check', { plantId: plantId });
    })
    .then(function (result) {
      return !!(result && result.favorited);
    })
    .catch(function () {
      return false;
    });
}

function checkStationFavorite(stationId) {
  return auth
    .ensureLogin()
    .then(function () {
      return request.get('/users/me/favorites/check', { stationId: stationId });
    })
    .then(function (result) {
      return !!(result && result.favorited);
    })
    .catch(function () {
      return false;
    });
}

function addFavorite(payload) {
  return auth
    .ensureLogin()
    .then(function () {
      return request.post('/users/me/favorites', payload);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function removeFavorite(payload) {
  return auth
    .ensureLogin()
    .then(function () {
      const query = { targetType: payload.targetType };
      if (payload.plantId) {
        query.plantId = payload.plantId;
      }
      if (payload.stationId != null) {
        query.stationId = payload.stationId;
      }
      return request.del('/users/me/favorites', query);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function togglePlantFavorite(plantId, favorited) {
  if (favorited) {
    return removeFavorite({ targetType: 'plant', plantId: plantId });
  }
  return addFavorite({ targetType: 'plant', plantId: plantId });
}

function toggleStationFavorite(stationId, favorited) {
  if (favorited) {
    return removeFavorite({ targetType: 'station', stationId: stationId });
  }
  return addFavorite({ targetType: 'station', stationId: stationId });
}

function scanCode() {
  return new Promise(function (resolve, reject) {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: function (res) {
        resolve(res.result || '');
      },
      fail: function (err) {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          reject({ cancelled: true });
          return;
        }
        reject(err || { message: '扫码失败' });
      }
    });
  });
}

function submitStationApplication(data) {
  return auth
    .ensureLogin()
    .then(function () {
      return request.post('/station-applications', data);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

module.exports = {
  probeApi,
  getStations,
  getStationById,
  getPlantByCode,
  getPlantById,
  getAvailablePlantsByStation,
  getNewPlants,
  donatePlant,
  adoptPlant,
  getUserStats,
  getFavorites,
  checkPlantFavorite,
  checkStationFavorite,
  addFavorite,
  removeFavorite,
  togglePlantFavorite,
  toggleStationFavorite,
  scanCode,
  submitStationApplication,
  getQrImageUrl: request.getQrImageUrl
};
