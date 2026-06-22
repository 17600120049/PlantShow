const { setupDetailNav } = require('../../utils/system');
const plantStore = require('../../utils/plantStore');
const request = require('../../utils/request');

Page({
  data: {
    navContentTop: 50,
    navContentHeight: 32,
    navBarBottom: 88,
    navPaddingX: 16,
    navCapsuleWidth: 88,
    stationId: 0,
    plantId: '',
    plant: null,
    name: '',
    species: '',
    description: '',
    photos: [],
    listStatus: 'AVAILABLE',
    canEdit: true,
    loading: true,
    saving: false,
    loadError: ''
  },

  onLoad: function (options) {
    setupDetailNav(this);
    const stationId = Number(options.stationId || 0);
    const plantId = options.plantId || '';
    this.setData({ stationId: stationId, plantId: plantId });
    if (stationId && plantId) {
      this.loadPlant(stationId, plantId);
    } else {
      this.setData({ loading: false, loadError: '参数无效' });
    }
  },

  loadPlant: function (stationId, plantId) {
    const that = this;
    that.setData({ loading: true, loadError: '' });
    plantStore
      .getManagedPlants(stationId)
      .then(function (plants) {
        const plant = (plants || []).find(function (item) {
          return item.id === plantId;
        });
        if (!plant) {
          that.setData({ loading: false, loadError: '植物不存在' });
          return;
        }
        const adopted = plant.plantStatus === 'ADOPTED' || plant.status === '已领养';
        that.setData({
          plant: plant,
          name: plant.name || '',
          species: plant.category || plant.species || '',
          description: plant.description || '',
          photos: plant.photos && plant.photos.length ? plant.photos : plant.photoUrl ? [plant.photoUrl] : [],
          listStatus: plant.listStatus || 'NONE',
          canEdit: !adopted,
          loading: false
        });
      })
      .catch(function (err) {
        that.setData({
          loading: false,
          loadError: (err && err.message) || '加载失败'
        });
      });
  },

  onNameInput: function (e) {
    this.setData({ name: e.detail.value });
  },

  onSpeciesInput: function (e) {
    this.setData({ species: e.detail.value });
  },

  onDescriptionInput: function (e) {
    this.setData({ description: e.detail.value });
  },

  onListStatusChange: function (e) {
    this.setData({ listStatus: e.detail.value });
  },

  choosePhoto: function () {
    const that = this;
    wx.chooseMedia({
      count: 3 - that.data.photos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const paths = (res.tempFiles || []).map(function (file) {
          return file.tempFilePath;
        });
        that.setData({ photos: that.data.photos.concat(paths).slice(0, 3) });
      }
    });
  },

  deletePhoto: function (e) {
    const index = Number(e.currentTarget.dataset.index);
    const photos = this.data.photos.slice();
    photos.splice(index, 1);
    this.setData({ photos: photos });
  },

  savePlant: function () {
    const that = this;
    const name = (this.data.name || '').trim();
    const species = (this.data.species || '').trim();

    if (!that.data.canEdit) {
      wx.showToast({ title: '已领养的植物不可编辑', icon: 'none' });
      return;
    }
    if (!name) {
      wx.showToast({ title: '请填写植物名称', icon: 'none' });
      return;
    }
    if (!species) {
      wx.showToast({ title: '请填写植物品种', icon: 'none' });
      return;
    }
    if (that.data.saving) {
      return;
    }

    that.setData({ saving: true });

    const uploadPromises = that.data.photos.map(function (photo) {
      if (photo.indexOf('http') === 0 || photo.indexOf('/api/') === 0) {
        return Promise.resolve(photo);
      }
      return request.uploadFile(photo);
    });

    Promise.all(uploadPromises)
      .then(function (photos) {
        return plantStore.updateManagedPlant(that.data.stationId, that.data.plantId, {
          name: name,
          species: species,
          description: (that.data.description || '').trim(),
          photos: photos,
          listStatus: that.data.listStatus
        });
      })
      .then(function () {
        wx.showToast({ title: '已保存', icon: 'success' });
        setTimeout(function () {
          wx.navigateBack({ delta: 1 });
        }, 500);
      })
      .catch(function (err) {
        wx.showToast({ title: (err && err.message) || '保存失败', icon: 'none' });
      })
      .finally(function () {
        that.setData({ saving: false });
      });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  }
});
