const mockData = require('./mockData');
const request = require('./request');
const auth = require('./auth');
const { withStationOpenStatus, isStationOpenByHours } = require('./stationHours');

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

const STORAGE_KEY = 'plantWanderData';
const DONATE_POINTS = 10;
let useLocalMode = false;

function markLocalMode() {
  useLocalMode = true;
}

function clearLocalMode() {
  useLocalMode = false;
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

function isLocalMode() {
  return useLocalMode;
}

function getDefaultData() {
  return {
    plants: mockData.newPlants.map(function (plant) {
      return Object.assign({}, plant, {
        plantCode: plant.plantCode || 'PW-' + String(plant.id).padStart(6, '0'),
        stationId: plant.stationId || findStationIdByName(plant.station),
        ownerId: null
      });
    }),
    stations: mockData.stations.map(function (station) {
      return Object.assign({}, station);
    }),
    donations: [],
    adoptions: [],
    stats: {
      donatedCount: 0,
      adoptedCount: 0,
      points: 0
    }
  };
}

function findStationIdByName(name) {
  const station = mockData.stations.find(function (s) {
    return s.name === name;
  });
  return station ? station.id : null;
}

function readStorage() {
  try {
    return wx.getStorageSync(STORAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function writeStorage(data) {
  wx.setStorageSync(STORAGE_KEY, data);
}

function mergeStations(defaultStations, storedStations) {
  const map = {};
  defaultStations.forEach(function (station) {
    map[station.id] = Object.assign({}, station);
  });
  (storedStations || []).forEach(function (station) {
    map[station.id] = Object.assign({}, map[station.id] || {}, station);
  });
  return Object.keys(map)
    .map(function (key) {
      return map[key];
    })
    .sort(function (a, b) {
      return a.id - b.id;
    });
}

function mergePlants(defaultPlants, storedPlants) {
  const map = {};
  defaultPlants.forEach(function (plant) {
    map[plant.id] = Object.assign({}, plant);
  });
  (storedPlants || []).forEach(function (plant) {
    map[plant.id] = Object.assign({}, map[plant.id] || {}, plant);
  });
  return Object.keys(map)
    .map(function (item) {
      return map[item];
    })
    .sort(function (a, b) {
      return String(b.id).localeCompare(String(a.id));
    });
}

function getLocalData() {
  const defaults = getDefaultData();
  const stored = readStorage();
  if (!stored) {
    return defaults;
  }
  return {
    plants: mergePlants(defaults.plants, stored.plants),
    stations: mergeStations(defaults.stations, stored.stations),
    donations: stored.donations || [],
    adoptions: stored.adoptions || [],
    stats: Object.assign({}, defaults.stats, stored.stats || {})
  };
}

function saveLocalData(data) {
  writeStorage(data);
}

function getStationsLocal(activeOnly) {
  const data = getLocalData();
  const stations = data.stations.map(withStationOpenStatus).map(normalizeStation);
  if (!activeOnly) {
    return stations;
  }
  return stations.filter(function (station) {
    return station.isActive;
  });
}

function getStationByIdLocal(stationId) {
  const id = Number(stationId);
  const station = getLocalData().stations.find(function (item) {
    return item.id === id;
  });
  return station ? withStationOpenStatus(station) : null;
}

function getPlantByCodeLocal(plantCode) {
  const code = (plantCode || '').toUpperCase();
  return getLocalData().plants.find(function (plant) {
    return (plant.plantCode || '').toUpperCase() === code;
  }) || null;
}

function getAvailablePlantsByStationLocal(stationId) {
  const id = Number(stationId);
  return getLocalData().plants.filter(function (plant) {
    return plant.stationId === id && plant.status === '待领养';
  });
}

function getNewPlantsLocal() {
  return getLocalData().plants.filter(function (plant) {
    return plant.status === '待领养';
  });
}

function nextPlantId(plants) {
  let maxId = 0;
  plants.forEach(function (plant) {
    const numericId = Number(plant.id);
    if (!isNaN(numericId) && numericId > maxId) {
      maxId = numericId;
    }
  });
  return maxId + 1;
}

function generatePlantCode() {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return 'PW-' + suffix;
}

function formatDate(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function donatePlantLocal(payload) {
  const data = getLocalData();
  const station = getStationByIdLocal(payload.stationId);
  if (!station) {
    return { success: false, message: '中转站不存在' };
  }
  if (!isStationOpenByHours(station.hours)) {
    return { success: false, message: '该中转站当前不在营业时间内，请选择其他中转站' };
  }

  const plantCode = (payload.plantCode || generatePlantCode()).toUpperCase();
  let plant = getPlantByCodeLocal(plantCode);

  if (plant && plant.status === '待领养') {
    return { success: false, message: '该植物已在中转站待领养中' };
  }

  const photoUrl = payload.photoPath || payload.photoUrl || '';
  const now = formatDate();
  if (plant) {
    plant = Object.assign({}, plant, {
      status: '待领养',
      stationId: station.id,
      station: station.name,
      donateTime: now,
      name: payload.name || plant.name,
      category: payload.category || plant.category,
      description: payload.description || plant.description || '',
      image: payload.image || plant.image || '🌿',
      photoUrl: photoUrl || plant.photoUrl || ''
    });
    data.plants = data.plants.map(function (item) {
      return item.id === plant.id ? plant : item;
    });
  } else {
    plant = {
      id: nextPlantId(data.plants),
      plantCode: plantCode,
      name: payload.name,
      category: payload.category,
      status: '待领养',
      image: payload.image || '🌿',
      photoUrl: photoUrl,
      station: station.name,
      stationId: station.id,
      donateTime: now,
      description: payload.description || ''
    };
    data.plants.unshift(plant);
  }

  data.donations.unshift({
    plantId: plant.id,
    plantCode: plant.plantCode,
    plantName: plant.name,
    stationId: station.id,
    stationName: station.name,
    time: now,
    points: DONATE_POINTS
  });

  data.stats.donatedCount += 1;
  data.stats.points += DONATE_POINTS;

  data.stations = data.stations.map(function (item) {
    if (item.id === station.id) {
      return Object.assign({}, item, { plants: (item.plants || 0) + 1 });
    }
    return item;
  });

  saveLocalData(data);
  return {
    success: true,
    plant: plant,
    station: station,
    points: DONATE_POINTS,
    totalPoints: data.stats.points,
    qrImageUrl: ''
  };
}

function adoptPlantLocal(plantId) {
  const data = getLocalData();
  const plant = data.plants.find(function (item) {
    return String(item.id) === String(plantId);
  });
  if (!plant) {
    return { success: false, message: '植物不存在' };
  }
  if (plant.status !== '待领养') {
    return { success: false, message: '该植物已被领养' };
  }

  const station = getStationByIdLocal(plant.stationId);
  const now = formatDate();

  plant.status = '已领养';
  plant.adoptTime = now;

  data.plants = data.plants.map(function (item) {
    return String(item.id) === String(plantId) ? plant : item;
  });

  data.adoptions.unshift({
    plantId: plant.id,
    plantCode: plant.plantCode,
    plantName: plant.name,
    stationId: plant.stationId,
    stationName: plant.station,
    time: now
  });

  data.stats.adoptedCount += 1;

  if (station) {
    data.stations = data.stations.map(function (item) {
      if (item.id === station.id) {
        return Object.assign({}, item, { plants: Math.max(0, (item.plants || 1) - 1) });
      }
      return item;
    });
  }

  saveLocalData(data);
  return {
    success: true,
    plant: plant,
    station: station
  };
}

function getUserStatsLocal() {
  const data = getLocalData();
  return {
    donatedCount: data.stats.donatedCount,
    adoptedCount: data.stats.adoptedCount,
    points: data.stats.points,
    currentReservation: 0
  };
}

function getStations(activeOnly) {
  return request
    .get('/stations', { activeOnly: activeOnly ? 'true' : 'false' })
    .then(function (stations) {
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
    .then(function (result) {
      clearLocalMode();
      return result;
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
    .then(function (stats) {
      clearLocalMode();
      return stats;
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
      clearLocalMode();
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
      clearLocalMode();
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
      clearLocalMode();
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
    .then(function (result) {
      clearLocalMode();
      return result;
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
    .then(function (result) {
      clearLocalMode();
      return result;
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

module.exports = {
  DONATE_POINTS,
  isLocalMode,
  clearLocalMode,
  probeApi,
  getStations,
  getStationById,
  getPlantByCode,
  getPlantById,
  getAvailablePlantsByStation,
  getNewPlants,
  generatePlantCode,
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
  getQrImageUrl: request.getQrImageUrl
};
