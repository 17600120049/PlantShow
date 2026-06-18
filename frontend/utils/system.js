function getStatusBarHeight() {
  try {
    const systemInfo = wx.getSystemInfoSync();
    const windowInfo = wx.getWindowInfo?.();
    const statusBarHeight = windowInfo?.statusBarHeight || systemInfo.statusBarHeight || 44;
    return Math.max(statusBarHeight, 44);
  } catch (e) {
    return 60;
  }
}

function getMenuButtonRect() {
  try {
    if (typeof wx.getMenuButtonBoundingClientRect === 'function') {
      return wx.getMenuButtonBoundingClientRect();
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function initStatusBarHeight(page, extraTop) {
  const statusBarHeight = getStatusBarHeight();
  const extra = typeof extraTop === 'number' ? extraTop : 0;
  page.setData({
    statusBarHeight: statusBarHeight,
    navPaddingTop: statusBarHeight + extra
  });
}

function initDetailNav(page) {
  const windowInfo = wx.getWindowInfo?.() || wx.getSystemInfoSync?.() || {};
  const statusBarHeight = windowInfo.statusBarHeight || getStatusBarHeight();
  const screenWidth = windowInfo.screenWidth || 375;
  const menuButton = getMenuButtonRect();

  if (!menuButton || !menuButton.height) {
    page.setData({
      statusBarHeight: statusBarHeight,
      navContentTop: statusBarHeight + 6,
      navContentHeight: 32,
      navBarBottom: statusBarHeight + 48,
      navPaddingX: 16,
      navCapsuleWidth: 88
    });
    return;
  }

  const navPaddingX = screenWidth - menuButton.right;
  const navGap = menuButton.top - statusBarHeight;

  page.setData({
    statusBarHeight: statusBarHeight,
    navContentTop: menuButton.top,
    navContentHeight: menuButton.height,
    navBarBottom: menuButton.bottom + navGap,
    navPaddingX: navPaddingX,
    navCapsuleWidth: menuButton.width
  });
}

function setupDetailNav(page) {
  initDetailNav(page);

  if (page.__detailNavReadyBound) {
    return;
  }
  page.__detailNavReadyBound = true;

  const originalReady = page.onReady;
  page.onReady = function () {
    initDetailNav(this);
    if (typeof originalReady === 'function') {
      originalReady.call(this);
    }
  };

  const originalShow = page.onShow;
  page.onShow = function () {
    initDetailNav(this);
    if (typeof originalShow === 'function') {
      originalShow.call(this);
    }
  };
}

function setTabBarSelected(page, index) {
  if (typeof page.getTabBar === 'function' && page.getTabBar()) {
    page.getTabBar().setData({ selected: index });
  }
}

function showComingSoon(title) {
  wx.showToast({
    title: title || '功能开发中',
    icon: 'none'
  });
}

module.exports = {
  initStatusBarHeight,
  setupDetailNav,
  setTabBarSelected,
  showComingSoon
};
