Component({
  data: {
    selected: 0,
    color: "#999999",
    selectedColor: "#3a5a40",
    list: [
      {
        pagePath: "/pages/home/index",
        text: "首页",
        iconPath: "/static/icons/home.png",
        selectedIconPath: "/static/icons/home-active.png",
        emoji: "🏡"
      },
      {
        pagePath: "/pages/discover/index",
        text: "发现",
        iconPath: "/static/icons/community.png",
        selectedIconPath: "/static/icons/community-active.png",
        emoji: "🔍"
      },
      {
        pagePath: "/pages/publish/index",
        text: "发布",
        isPublish: true
      },
      {
        pagePath: "/pages/messages/index",
        text: "消息",
        iconPath: "/static/icons/plant.png",
        selectedIconPath: "/static/icons/plant-active.png",
        emoji: "💬"
      },
      {
        pagePath: "/pages/profile/index",
        text: "我的",
        iconPath: "/static/icons/profile.png",
        selectedIconPath: "/static/icons/profile-active.png",
        emoji: "👤"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const dataset = e.currentTarget.dataset
      console.log('[TabBar] 点击事件', dataset)
      
      if (dataset.ispublish) {
        console.log('[TabBar] 跳转到发布页')
        wx.navigateTo({
          url: '/pages/publish/index',
          fail(err) {
            console.error('[TabBar] 跳转失败', err)
          }
        })
      } else {
        const url = dataset.path
        console.log('[TabBar] 切换tab', url)
        wx.switchTab({ url })
      }
    }
  }
})
