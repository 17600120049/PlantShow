const stations = [
  {
    id: 1,
    name: '城市根系中转站',
    image: '🏡',
    address: '杭州市余杭区良渚街道好运街99号',
    hours: '09:00-20:00',
    phone: '0571 8723 5456',
    plants: 45,
    distance: '1.2km'
  },
  {
    id: 2,
    name: '自丛中转站',
    image: '🌿',
    address: '杭州市西湖区转塘街道象山艺术公社21号',
    hours: '10:00-19:00',
    phone: '0571 8675 3210',
    plants: 28,
    distance: '3.5km'
  },
  {
    id: 3,
    name: '绿野中转站',
    image: '🌱',
    address: '杭州市拱墅区运河上街购物中心B1层',
    hours: '10:00-22:00',
    phone: '0571 8899 1234',
    plants: 56,
    distance: '5.8km'
  }
];

const newPlants = [
  {
    id: 1,
    plantCode: 'PW-000001',
    name: '鹿角蕨 OMG',
    category: '蕨类',
    status: '待领养',
    image: '🌿',
    station: '城市根系中转站',
    stationId: 1,
    donateTime: '2024-05-21'
  },
  {
    id: 2,
    plantCode: 'PW-000002',
    name: '龙舌兰 蓝鲸',
    category: '多肉',
    status: '待领养',
    image: '🌵',
    station: '自丛中转站',
    stationId: 2,
    donateTime: '2024-05-18'
  },
  {
    id: 3,
    plantCode: 'PW-000003',
    name: '龟背竹',
    category: '观叶',
    status: '待领养',
    image: '🍃',
    station: '城市根系中转站',
    stationId: 1,
    donateTime: '2024-05-15'
  },
  {
    id: 4,
    plantCode: 'PW-000004',
    name: '观音莲',
    category: '多肉',
    status: '待领养',
    image: '🪴',
    station: '绿野中转站',
    stationId: 3,
    donateTime: '2024-05-14'
  }
];

const favoritePlants = [
  {
    id: 1,
    name: '鹿角蕨 OMG',
    category: '蕨类',
    image: '🌿',
    station: '城市根系中转站',
    status: '待领养'
  },
  {
    id: 2,
    name: '龟背竹',
    category: '观叶',
    image: '🍃',
    station: '城市根系中转站',
    status: '待领养'
  },
  {
    id: 3,
    name: '白锦龟背竹',
    category: '观叶',
    image: '🌿',
    station: '自丛中转站',
    status: '待领养'
  }
];

const favoriteStations = stations.slice(0, 2).map(function (station) {
  return {
    id: station.id,
    name: station.name,
    image: station.image,
    address: station.address,
    plants: station.plants,
    distance: station.distance
  };
});

module.exports = {
  stations,
  newPlants,
  favoritePlants,
  favoriteStations
};
