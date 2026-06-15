Page({
  data: {
    statusBarHeight: 20,
    recommendPosts: [
      {
        id: 1,
        type: '开箱记录',
        title: 'P. willinckii \'OMG\' 新居展开的瞬间',
        author: '鹿角蕨小王子',
        likes: 128,
        emoji: '🌿'
      },
      {
        id: 2,
        type: '日常分享',
        title: '龙舌兰 · 笹之雪 今日状态',
        author: '植物不语',
        likes: 96,
        emoji: '🌵'
      },
      {
        id: 3,
        type: '成长记录',
        title: '我的第一株龟背竹 一年的变化',
        author: '绿野仙踪',
        likes: 245,
        emoji: '🌱'
      }
    ],
    newPlants: [
      {
        id: 1,
        name: '鹿角蕨 P. willinckii \'Bacteria\'',
        description: '爆侧芽，适合新手养护',
        status: '换植物',
        location: '杭州',
        emoji: '🌿',
        author: '叶上森林',
        authorAvatar: '👤'
      },
      {
        id: 2,
        name: '龙舌兰 Agave titanota \'蓝鲸\'',
        description: '根系健康，叶片紧凑',
        status: '免费',
        location: '杭州',
        emoji: '🌵',
        author: '多肉小筑',
        authorAvatar: '👩'
      },
      {
        id: 3,
        name: '龟背竹 Monstera Deliciosa',
        description: '两年生，有开背',
        status: '换植物',
        location: '上海',
        emoji: '🌱',
        author: '城市农夫',
        authorAvatar: '👨'
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

  goToPage: function (e) {
    const page = e.currentTarget.dataset.page;
    wx.switchTab({
      url: `/pages/${page}/index`
    });
  },

  goToCircle: function () {
    wx.navigateTo({
      url: '/pages/plant-circle/index'
    });
  },

  goToArchive: function () {
    wx.navigateTo({
      url: '/pages/plant-archive/index'
    });
  },

  goToMap: function () {
    wx.navigateTo({
      url: '/pages/plant-map/index'
    });
  },

  goToPost: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/post-detail/index?id=${id}`
    });
  },

  goToPlantDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plant-detail/index?id=${id}`
    });
  },

  goToPublish: function () {
    wx.navigateTo({
      url: '/pages/publish/index'
    });
  }
});