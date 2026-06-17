Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/home/index',
        text: '首页',
        icon: '/static/icons/tab/home.png',
        iconActive: '/static/icons/tab/home-active.png'
      },
      {
        pagePath: '/pages/favorites/index',
        text: '收藏',
        icon: '/static/icons/tab/heart.png',
        iconActive: '/static/icons/tab/heart-active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        icon: '/static/icons/tab/user.png',
        iconActive: '/static/icons/tab/user-active.png'
      }
    ]
  },

  methods: {
    switchTab: function (e) {
      wx.switchTab({ url: e.currentTarget.dataset.path });
    }
  }
});
