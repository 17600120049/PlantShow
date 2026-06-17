Page({
  data: {
    statusBarHeight: 20,
    stations: [
      {
        id: 1,
        name: '城市根系驿站',
        image: '🏡',
        address: '杭州市余杭区良渚街道好运街99号',
        hours: '09:00-20:00',
        phone: '0571 8723 5456',
        plants: 45,
        distance: '1.2km',
        isActive: true
      },
      {
        id: 2,
        name: '自丛驿站',
        image: '🌿',
        address: '杭州市西湖区转塘街道象山艺术公社21号',
        hours: '10:00-19:00',
        phone: '0571 8675 3210',
        plants: 28,
        distance: '3.5km',
        isActive: true
      },
      {
        id: 3,
        name: '绿野中转站',
        image: '🌱',
        address: '杭州市拱墅区运河上街购物中心B1层',
        hours: '10:00-22:00',
        phone: '0571 8899 1234',
        plants: 56,
        distance: '5.8km',
        isActive: false
      }
    ],
    newPlants: [
      {
        id: 1,
        name: '鹿角蕨 OMG',
        category: '蕨类',
        status: '待领养',
        image: '🌿',
        station: '城市根系驿站',
        donateTime: '2024-05-21'
      },
      {
        id: 2,
        name: '龙舌兰 蓝鲸',
        category: '多肉',
        status: '待领养',
        image: '🌵',
        station: '自丛驿站',
        donateTime: '2024-05-18'
      },
      {
        id: 3,
        name: '龟背竹',
        category: '观叶',
        status: '待领养',
        image: '🍃',
        station: '城市根系驿站',
        donateTime: '2024-05-15'
      },
      {
        id: 4,
        name: '观音莲',
        category: '多肉',
        status: '待领养',
        image: '🪴',
        station: '绿野中转站',
        donateTime: '2024-05-14'
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
        selected: 0
      });
    }
  },

  goToStationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/station-detail/index?id=${id}`
    });
  },

  goToScanDonate: function () {
    wx.navigateTo({
      url: '/pages/scan-donate/index'
    });
  },

  goToScanAdopt: function () {
    wx.navigateTo({
      url: '/pages/scan-adopt/index'
    });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plant-detail/index?id=${id}`
    });
  }
});