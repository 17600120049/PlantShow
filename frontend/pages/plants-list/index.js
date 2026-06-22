const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const media = require('../../utils/media');

function buildStationOptions(plants) {
  const stationMap = {};

  plants.forEach(function (plant) {
    if (plant.stationId && plant.station) {
      stationMap[plant.stationId] = plant.station;
    }
  });

  return Object.keys(stationMap)
    .map(function (id) {
      return { id: Number(id), name: stationMap[id] };
    })
    .sort(function (a, b) {
      return a.name.localeCompare(b.name, 'zh-CN');
    });
}

function applyFilters(plants, keyword, stationId) {
  const kw = (keyword || '').trim().toLowerCase();
  return plants.filter(function (plant) {
    if (stationId && Number(plant.stationId) !== Number(stationId)) {
      return false;
    }
    if (!kw) {
      return true;
    }
    const haystack = [plant.name, plant.category, plant.station, plant.plantCode]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.indexOf(kw) !== -1;
  });
}

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    allPlants: [],
    plants: [],
    stations: [],
    stationPickerLabels: ['全部中转站'],
    stationPickerIndex: 0,
    searchKeyword: '',
    selectedStationId: 0,
    hasActiveFilters: false,
    loading: true,
    loadError: ''
  },

  onLoad: function () {
    setupDetailNav(this);
    this.loadPlants();
  },

  loadPlants: function () {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    plantStore
      .getNewPlants()
      .then(function (plants) {
        that.setPlants(plants);
        return media.hydratePlants(plants);
      })
      .then(function (plants) {
        if (plants) {
          that.setPlants(plants);
        }
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          loadError: (err && err.message) || '植物列表加载失败'
        });
      });
  },

  setPlants: function (plants) {
    const stations = buildStationOptions(plants);
    const stationPickerLabels = ['全部中转站'].concat(
      stations.map(function (item) {
        return item.name;
      })
    );
    const stationPickerIndex = this.resolveStationPickerIndex(
      stations,
      this.data.selectedStationId
    );
    const selectedStationId =
      stationPickerIndex > 0 && stations[stationPickerIndex - 1]
        ? stations[stationPickerIndex - 1].id
        : 0;

    this.setData({
      allPlants: plants,
      stations: stations,
      stationPickerLabels: stationPickerLabels,
      stationPickerIndex: stationPickerIndex,
      selectedStationId: selectedStationId,
      loading: false,
      loadError: ''
    });
    this.refreshFilteredPlants();
  },

  resolveStationPickerIndex: function (stations, stationId) {
    if (!stationId) {
      return 0;
    }
    const index = stations.findIndex(function (item) {
      return Number(item.id) === Number(stationId);
    });
    return index >= 0 ? index + 1 : 0;
  },

  refreshFilteredPlants: function () {
    const data = this.data;
    const filtered = applyFilters(
      data.allPlants,
      data.searchKeyword,
      data.selectedStationId
    );
    const hasActiveFilters = !!(
      (data.searchKeyword && data.searchKeyword.trim()) ||
      data.selectedStationId
    );

    this.setData({
      plants: filtered,
      hasActiveFilters: hasActiveFilters
    });
  },

  onSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value || '' });
    this.refreshFilteredPlants();
  },

  clearSearch: function () {
    this.setData({ searchKeyword: '' });
    this.refreshFilteredPlants();
  },

  onStationFilterChange: function (e) {
    const index = Number(e.detail.value);
    const stations = this.data.stations;
    const selectedStationId = index > 0 && stations[index - 1] ? stations[index - 1].id : 0;
    this.setData({
      stationPickerIndex: index,
      selectedStationId: selectedStationId
    });
    this.refreshFilteredPlants();
  },

  resetFilters: function () {
    this.setData({
      searchKeyword: '',
      selectedStationId: 0,
      stationPickerIndex: 0
    });
    this.refreshFilteredPlants();
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/plant-detail/index?id=' + id
    });
  },

  onPullDownRefresh: function () {
    this.loadPlants();
    setTimeout(function () {
      wx.stopPullDownRefresh();
    }, 500);
  }
});
