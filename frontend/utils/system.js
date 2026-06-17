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

function initStatusBarHeight(page) {
  page.setData({ statusBarHeight: getStatusBarHeight() });
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
  setTabBarSelected,
  showComingSoon
};
