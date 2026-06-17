Component({
  data: {
    selected: 0,
    color: "#8b8680",
    selectedColor: "#2D4739",
    list: [
      {
        pagePath: "/pages/home/index",
        text: "首页"
      },
      {
        pagePath: "/pages/favorites/index",
        text: "收藏"
      },
      {
        pagePath: "/pages/profile/index",
        text: "我的"
      }
    ]
  },

  methods: {
    switchTab(e) {
      const dataset = e.currentTarget.dataset
      const url = dataset.path
      wx.switchTab({ url })
    }
  }
})