Page({
  data: {
    statusBarHeight: 20,
    activeCategory: 'all',
    plants: [
      { id: 1, name: '鹿角蕨 P. willinckii', description: '爆侧芽，适合新手', status: '换植物', location: '杭州', emoji: '🌿', author: '叶上森林', authorAvatar: '👤' },
      { id: 2, name: '龙舌兰 \'蓝鲸\'', description: '根系健康，叶片紧凑', status: '免费', location: '杭州', emoji: '🌵', author: '多肉小筑', authorAvatar: '👩' },
      { id: 3, name: '龟背竹 Monstera', description: '两年生，有开背', status: '换植物', location: '上海', emoji: '🌱', author: '城市农夫', authorAvatar: '👨' },
      { id: 4, name: '白锦龟背竹', description: '变异锦化，极稀有', status: '换植物', location: '北京', emoji: '🌿', author: '锦化达人', authorAvatar: '🧑' },
      { id: 5, name: '玉露 Haworthia', description: '晶莹剔透，状态好', status: '免费', location: '深圳', emoji: '🌵', author: '晶莹阁', authorAvatar: '👵' },
      { id: 6, name: '蕨类 Pteris', description: '叶片优美，适合室内', status: '免费', location: '广州', emoji: '🌿', author: '绿色生活', authorAvatar: '👨‍🦱' }
    ]
  },

  onLoad: function () {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
  },

  onShow: function () {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  },

  setCategory: function (e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category });
  },

  showFilter: function () {
    wx.showActionSheet({
      itemList: ['最新发布', '距离最近', '热门程度'],
      success: function (res) {
        console.log('选择了：', res.tapIndex);
      }
    });
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/plant-detail/index?id=${id}`
    });
  }
});