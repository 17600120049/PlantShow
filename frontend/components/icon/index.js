const { resolveIconSrc } = require('./resolver');

Component({
  properties: {
    name: {
      type: String,
      value: 'home'
    },
    size: {
      type: Number,
      value: 48
    },
    color: {
      type: String,
      value: '#2D4739'
    },
    strokeWidth: {
      type: Number,
      value: 2
    },
    filled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    src: '/static/icons/home/default.svg'
  },

  observers: {
    'name, color, strokeWidth, filled': function (name, color, strokeWidth, filled) {
      this.setData({
        src: resolveIconSrc(name, color, strokeWidth, filled)
      });
    }
  },

  lifetimes: {
    attached: function () {
      const p = this.properties;
      this.setData({
        src: resolveIconSrc(p.name, p.color, p.strokeWidth, p.filled)
      });
    }
  }
});
