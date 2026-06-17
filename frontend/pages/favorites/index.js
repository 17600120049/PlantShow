const { initStatusBarHeight, setTabBarSelected } = require('../../utils/system');
const mockData = require('../../utils/mockData');

Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'plants',
    favoritePlants: mockData.favoritePlants,
    favoriteStations: mockData.favoriteStations
  },

  onLoad: function () {
    initStatusBarHeight(this);
  },

  onShow: function () {
    setTabBarSelected(this, 1);
  },

  setTab: function (e) {
    this.setData({
      activeTab: e.currentTarget.dataset.tab
    });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plant-detail/index?id=${id}`
    });
  },

  goToStationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/station-detail/index?id=${id}`
    });
  },

  removeFavorite: function (e) {
    const type = e.currentTarget.dataset.type;
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏吗？',
      success: (res) => {
        if (res.confirm) {
          if (type === 'plant') {
            const newPlants = this.data.favoritePlants.filter(item => item.id !== id);
            this.setData({ favoritePlants: newPlants });
          } else {
            const newStations = this.data.favoriteStations.filter(item => item.id !== id);
            this.setData({ favoriteStations: newStations });
          }
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        }
      }
    });
  }
});
