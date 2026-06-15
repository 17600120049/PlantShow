Component({
  data: {
    selected: 0,
    color: '#999999',
    selectedColor: '#3a5a40',
    list: [
      {
        pagePath: '/pages/home/index',
        text: '首页',
        iconPath: '/static/icons/home.png',
        selectedIconPath: '/static/icons/home-active.png'
      },
      {
        pagePath: '/pages/discover/index',
        text: '发现',
        iconPath: '/static/icons/plant.png',
        selectedIconPath: '/static/icons/plant-active.png'
      },
      {
        pagePath: '/pages/publish/index',
        text: '发布',
        iconPath: '/static/icons/publish.png',
        selectedIconPath: '/static/icons/publish.png',
        isCenter: true
      },
      {
        pagePath: '/pages/messages/index',
        text: '消息',
        iconPath: '/static/icons/community.png',
        selectedIconPath: '/static/icons/community-active.png'
      },
      {
        pagePath: '/pages/profile/index',
        text: '我的',
        iconPath: '/static/icons/profile.png',
        selectedIconPath: '/static/icons/profile-active.png'
      }
    ]
  },

  attached() {
  },

  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      if (data.isCenter) {
        wx.navigateTo({ url: '/pages/publish/index' })
        return
      }
      wx.switchTab({ url })
    }
  }
})