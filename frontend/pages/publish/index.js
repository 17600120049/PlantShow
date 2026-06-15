// pages/publish/index.js
Page({
  data: {
    postType: 'plant', // plant 或 moment
    plantName: '',
    plantSpecies: '',
    plantLocation: '',
    plantAge: '',
    plantDescription: '',
    momentContent: '',
    images: [],
    showTypePicker: false,
    typeOptions: [
      { value: 'plant', label: '发布植物' },
      { value: 'moment', label: '发布动态' }
    ]
  },

  // 切换发布类型
  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ postType: type })
  },

  // 输入处理
  onPlantNameInput(e) {
    this.setData({ plantName: e.detail.value })
  },

  onPlantSpeciesInput(e) {
    this.setData({ plantSpecies: e.detail.value })
  },

  onPlantLocationInput(e) {
    this.setData({ plantLocation: e.detail.value })
  },

  onPlantAgeInput(e) {
    this.setData({ plantAge: e.detail.value })
  },

  onPlantDescriptionInput(e) {
    this.setData({ plantDescription: e.detail.value })
  },

  onMomentContentInput(e) {
    this.setData({ momentContent: e.detail.value })
  },

  // 选择图片
  chooseImage() {
    const that = this
    const remaining = 9 - this.data.images.length
    if (remaining <= 0) {
      wx.showToast({ title: '最多只能上传9张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const newImages = res.tempFiles.map(file => file.tempFilePath)
        that.setData({
          images: [...that.data.images, ...newImages]
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  // 选择位置
  chooseLocation() {
    const that = this
    wx.chooseLocation({
      success(res) {
        that.setData({ plantLocation: res.name || res.address })
      },
      fail(err) {
        console.log('[Publish] 位置选择失败', err)
      }
    })
  },

  // 提交发布
  submitPublish() {
    const { postType, plantName, plantSpecies, plantLocation, plantAge, plantDescription, momentContent, images } = this.data

    if (postType === 'plant') {
      if (!plantName) {
        wx.showToast({ title: '请输入植物名称', icon: 'none' })
        return
      }
      if (!plantSpecies) {
        wx.showToast({ title: '请输入植物品种', icon: 'none' })
        return
      }
    } else {
      if (!momentContent) {
        wx.showToast({ title: '请输入动态内容', icon: 'none' })
        return
      }
    }

    wx.showLoading({ title: '发布中...' })

    // 模拟上传（实际应该调用后端API）
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })

      // 清空表单
      this.setData({
        plantName: '',
        plantSpecies: '',
        plantLocation: '',
        plantAge: '',
        plantDescription: '',
        momentContent: '',
        images: []
      })

      // 延迟跳转
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/index' })
      }, 1500)
    }, 1000)
  }
})
