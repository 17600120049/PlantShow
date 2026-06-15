Page({
  data: {
    statusBarHeight: 44,
    activeTab: 'chat',
    chatList: [
      { id: 1, name: '叶上森林', avatar: '👤', lastMessage: '好的，那明天见！', time: '14:32', unread: 2 },
      { id: 2, name: '多肉小筑', avatar: '👩', lastMessage: '你家龙舌兰状态真好', time: '昨天', unread: 0 },
      { id: 3, name: '城市农夫', avatar: '👨', lastMessage: '想交换我的龟背竹', time: '昨天', unread: 1 },
      { id: 4, name: '锦化达人', avatar: '🧑', lastMessage: '白锦这个价格可以吗？', time: '2天前', unread: 0 },
      { id: 5, name: '晶莹阁', avatar: '👵', lastMessage: '好的，已发货', time: '3天前', unread: 2 }
    ],
    notifyList: [
      { id: 1, type: 'like', icon: '❤️', title: '新的点赞', description: '鹿角蕨小王子 赞了你的动态', time: '2小时前' },
      { id: 2, type: 'comment', icon: '💬', title: '新的评论', description: '植物不语: 太漂亮了！', time: '5小时前' },
      { id: 3, type: 'follow', icon: '👥', title: '新的关注', description: '绿野仙踪 关注了你', time: '1天前' }
    ],
    systemList: [
      { id: 1, title: '欢迎使用流浪植物', description: '感谢您加入流浪植物社区', time: '2026-06-01' }
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
        selected: 3
      });
    }
  },

  setTab: function (e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  goToChat: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/chat/index?id=${id}`
    });
  }
});