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
  const statusBarHeight = getStatusBarHeight();
  const menuButton = getMenuButtonRect();
  const systemInfo = wx.getSystemInfoSync?.() || {};
  const screenWidth = systemInfo.screenWidth || 375;

  if (!menuButton || !menuButton.top) {
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
  const navBarBottom = menuButton.bottom + navPaddingX;

  page.setData({
    statusBarHeight: statusBarHeight,
    navContentTop: menuButton.top,
    navContentHeight: menuButton.height,
    navBarBottom: navBarBottom,
    navPaddingX: navPaddingX,
    navCapsuleWidth: menuButton.width
  });
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
  getStatusBarHeight,
  initStatusBarHeight,
  initDetailNav,
  setTabBarSelected,
  showComingSoon
};
