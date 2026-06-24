const request = require('./request');
const auth = require('./auth');

function apiPatch(url, data) {
  if (typeof request.patch === 'function') {
    return request.patch(url, data);
  }
  return request.send({ url: url, method: 'PATCH', data: data });
}

function apiDelete(url, data) {
  if (typeof request.del === 'function') {
    return request.del(url, data);
  }
  return request.send({ url: url, method: 'DELETE', data: data });
}

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
  const photos = (plant.photos || [])
    .map(request.resolveMediaUrl)
    .filter(function (url) {
      return url && isMediaUrl(url);
    });
  const photoUrl = request.resolveMediaUrl(plant.photoUrl || photos[0] || '');
  return Object.assign({}, plant, {
    photos: photos,
    photoUrl: isMediaUrl(photoUrl) ? photoUrl : photos[0] || ''
  });
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
  const photoPath = payload.photoPath || payload.photoUrl || '';
  const photoPromise = isMediaUrl(photoPath)
    ? Promise.resolve(photoPath)
    : photoPath
      ? request.uploadFile(photoPath)
      : Promise.resolve('');

  return photoPromise
    .then(function (photoUrl) {
      return auth.requireSession().then(function () {
        return request.post('/plants/donate', {
          plantCode: payload.plantCode,
          name: payload.name,
          category: payload.category,
          stationId: payload.stationId,
          description: payload.description,
          image: payload.image,
          photoUrl: photoUrl || undefined
        });
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
    .requireSession()
    .then(function () {
      return request.post('/plants/' + plantId + '/adopt', {});
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getUserStats() {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/users/me/stats');
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getMyDonations() {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/users/me/donations');
    })
    .then(function (records) {
      return (records || []).map(function (record) {
        return Object.assign({}, record, {
          plant: normalizePlant(record.plant)
        });
      });
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getMyAdoptions() {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/users/me/adoptions');
    })
    .then(function (records) {
      return (records || []).map(function (record) {
        return Object.assign({}, record, {
          plant: normalizePlant(record.plant)
        });
      });
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getPointsHistory() {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/users/me/points');
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getFavorites() {
  return auth
    .requireSession()
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
    .requireSession()
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
    .requireSession()
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
    .requireSession()
    .then(function () {
      return request.post('/users/me/favorites', payload);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function removeFavorite(payload) {
  return auth
    .requireSession()
    .then(function () {
      const query = { targetType: payload.targetType };
      if (payload.plantId) {
        query.plantId = payload.plantId;
      }
      if (payload.stationId != null) {
        query.stationId = payload.stationId;
      }
      return apiDelete('/users/me/favorites', query);
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
    .requireSession()
    .then(function () {
      return request.post('/station-applications', data);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getManagedStations() {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/users/me/managed-stations');
    })
    .then(function (stations) {
      return (stations || []).map(normalizeStation);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getStationManagerAccess(stationId) {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/stations/' + stationId + '/manager-access');
    })
    .then(function (station) {
      return normalizeStation(station);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function setStationOpenStatus(stationId, isActive) {
  return auth
    .requireSession()
    .then(function () {
      return apiPatch('/stations/' + stationId + '/open-status', { isActive: isActive });
    })
    .then(function (station) {
      return normalizeStation(station);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function updateManagedStation(stationId, data) {
  return auth
    .requireSession()
    .then(function () {
      return apiPatch('/stations/' + stationId + '/managed', data);
    })
    .then(function (station) {
      return normalizeStation(station);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function getManagedPlants(stationId) {
  return auth
    .requireSession()
    .then(function () {
      return request.get('/stations/' + stationId + '/managed-plants');
    })
    .then(function (plants) {
      return (plants || []).map(normalizePlant);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function updateManagedPlant(stationId, plantId, data) {
  return auth
    .requireSession()
    .then(function () {
      return apiPatch('/stations/' + stationId + '/plants/' + plantId, data);
    })
    .then(function (plant) {
      return normalizePlant(plant);
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function syncStationOpenStatus(stationId, signals) {
  return auth
    .requireSession()
    .then(function () {
      return request.post('/stations/' + stationId + '/open-status/sync', signals || {});
    })
    .then(function (result) {
      return Object.assign({}, normalizeStation(result), {
        sync: result.sync || null
      });
    })
    .catch(function (err) {
      return Promise.reject(normalizeError(err));
    });
}

function syncManagedOpenStatus(signals) {
  return auth
    .requireSession()
    .then(function () {
      return request.post('/users/me/managed-stations/open-status/sync', signals || {});
    })
    .then(function (result) {
      return {
        stations: (result.stations || []).map(function (item) {
          return Object.assign({}, normalizeStation(item), {
            sync: item.sync || null,
            isManager: item.isManager,
            canToggleStatus: item.canToggleStatus
          });
        })
      };
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
  getMyDonations,
  getMyAdoptions,
  getPointsHistory,
  getFavorites,
  checkPlantFavorite,
  checkStationFavorite,
  addFavorite,
  removeFavorite,
  togglePlantFavorite,
  toggleStationFavorite,
  scanCode,
  submitStationApplication,
  getManagedStations,
  getStationManagerAccess,
  setStationOpenStatus,
  updateManagedStation,
  getManagedPlants,
  updateManagedPlant,
  syncStationOpenStatus,
  syncManagedOpenStatus,
  getQrImageUrl: request.getQrImageUrl
};
