Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'plants',
    favoritePlants: [
      {
        id: 1,
        name: '鹿角蕨 OMG',
        category: '蕨类',
        image: '🌿',
        station: '城市根系驿站',
        status: '待领养'
      },
      {
        id: 2,
        name: '龟背竹',
        category: '观叶',
        image: '🍃',
        station: '城市根系驿站',
        status: '待领养'
      },
      {
        id: 3,
        name: '白锦龟背竹',
        category: '观叶',
        image: '🌿',
        station: '自丛驿站',
        status: '待领养'
      }
    ],
    favoriteStations: [
      {
        id: 1,
        name: '城市根系驿站',
        image: '🏡',
        address: '杭州市余杭区良渚街道好运街99号',
        plants: 45,
        distance: '1.2km'
      },
      {
        id: 2,
        name: '自丛驿站',
        image: '🌿',
        address: '杭州市西湖区转塘街道象山艺术公社21号',
        plants: 28,
        distance: '3.5km'
      }
    ]
  },

  onLoad: function () {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const windowInfo = wx.getWindowInfo?.();
      const statusBarHeight = windowInfo?.statusBarHeight || systemInfo.statusBarHeight || 44;
      this.setData({
        statusBarHeight: Math.max(statusBarHeight, 44)
      });
    } catch (e) {
      this.setData({
        statusBarHeight: 60
      });
    }
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
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