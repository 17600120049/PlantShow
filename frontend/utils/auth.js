const request = require('./request');
const config = require('../config');

const STORAGE_TOKEN = 'token';
const STORAGE_USER = 'userInfo';
const STORAGE_PROFILE_SETUP_SKIP = 'profileSetupSkipped';
const STORAGE_PRIVACY_AGREED = 'privacyAgreed';
const DEFAULT_NICKNAMES = ['微信用户'];

let loginWaitPromise = null;
let profileSetupOpening = false;

function getAppContext(appContext) {
  if (appContext && appContext.globalData) {
    return appContext;
  }
  try {
    const app = getApp({ allowDefault: true });
    if (app && app.globalData) {
      return app;
    }
  } catch (e) {
    // getApp may throw before App registration completes
  }
  return null;
}

function saveSession(app, token, userInfo) {
  if (!app || !app.globalData) {
    return;
  }
  app.globalData.token = token;
  app.globalData.userInfo = userInfo;
  try {
    wx.setStorageSync(STORAGE_TOKEN, token);
    wx.setStorageSync(STORAGE_USER, userInfo);
  } catch (e) {
    console.warn('[auth] 本地缓存失败', e);
  }
}

function clearSession(app) {
  if (!app || !app.globalData) {
    return;
  }
  app.globalData.token = '';
  app.globalData.userInfo = null;
  try {
    wx.removeStorageSync(STORAGE_TOKEN);
    wx.removeStorageSync(STORAGE_USER);
  } catch (e) {
    console.warn('[auth] 清除本地缓存失败', e);
  }
}

function initSession(appContext) {
  const app = getAppContext(appContext);
  if (!app || !app.globalData || app.globalData.token) {
    return;
  }
  try {
    const token = wx.getStorageSync(STORAGE_TOKEN);
    const userInfo = wx.getStorageSync(STORAGE_USER);
    if (token) {
      app.globalData.token = token;
      app.globalData.userInfo = userInfo || null;
    }
  } catch (e) {
    console.warn('[auth] 读取本地缓存失败', e);
  }
}

function isLoggedIn(appContext) {
  const app = getAppContext(appContext);
  return !!(app && app.globalData && app.globalData.token);
}

function hasAgreedPrivacy() {
  try {
    return !!wx.getStorageSync(STORAGE_PRIVACY_AGREED);
  } catch (e) {
    return false;
  }
}

function markPrivacyAgreed() {
  try {
    wx.setStorageSync(STORAGE_PRIVACY_AGREED, true);
  } catch (e) {
    console.warn('[auth] 保存隐私协议状态失败', e);
  }
}

function wxLoginCode() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          resolve(res.code);
          return;
        }
        reject({ message: '微信登录失败' });
      },
      fail: function (err) {
        reject(err || { message: '微信登录失败' });
      }
    });
  });
}

function getPendingReferralCode() {
  const app = getAppContext();
  return (app && app.globalData && app.globalData.pendingReferralCode) || '';
}

function clearPendingReferralCode() {
  const app = getAppContext();
  if (app && app.globalData) {
    app.globalData.pendingReferralCode = '';
  }
}

function setPendingReferralCode(code) {
  const app = getAppContext();
  if (!app || !app.globalData) {
    return;
  }
  app.globalData.pendingReferralCode = (code || '').trim().toUpperCase();
}

function loginWithWechat() {
  return wxLoginCode().then(function (code) {
    const payload = { code: code };
    const referralCode = getPendingReferralCode();
    if (referralCode) {
      payload.referralCode = referralCode;
    }
    return request.post('/auth/wx-login', payload);
  });
}

function loginWithDev() {
  const payload = { nickname: '微信用户' };
  const referralCode = getPendingReferralCode();
  if (referralCode) {
    payload.referralCode = referralCode;
  }
  return request.post('/auth/dev-login', payload);
}

function shouldFallbackToDev(err) {
  if (!(config.isDevtools() || config.ALLOW_DEV_LOGIN)) {
    return false;
  }

  const statusCode = err && err.statusCode;
  if (statusCode === 400 || statusCode === 401 || statusCode === 500) {
    return true;
  }

  const message = String((err && (err.message || err.errMsg)) || '');
  return /未配置|微信登录|appsecret|Unauthorized|invalid code|登录失败/i.test(message);
}

function performLogin(appContext) {
  return loginWithWechat()
    .catch(function (err) {
      if (shouldFallbackToDev(err)) {
        console.warn('[auth] 微信登录不可用，使用开发登录', err);
        return loginWithDev();
      }
      throw err;
    })
    .then(function (res) {
      const app = getAppContext(appContext);
      clearPendingReferralCode();
      saveSession(app, res.token, res.user);
      return res.user;
    });
}

function getSessionUser(appContext) {
  const app = getAppContext(appContext);
  if (!app) {
    return Promise.reject({ message: '应用未初始化' });
  }

  initSession(app);

  if (!app.globalData.token) {
    return Promise.reject({ needLogin: true });
  }

  if (app.globalData.userInfo) {
    return Promise.resolve(app.globalData.userInfo);
  }

  return request.get('/users/me').then(function (user) {
    saveSession(app, app.globalData.token, user);
    return user;
  }).catch(function (err) {
    if (err && err.statusCode === 401) {
      clearSession(app);
      return Promise.reject({ needLogin: true });
    }
    throw err;
  });
}

function finishLoginFlow(user) {
  tryShowProfileSetup(user);
  return user;
}

function openLoginPage() {
  if (loginWaitPromise) {
    return loginWaitPromise;
  }

  loginWaitPromise = new Promise(function (resolve, reject) {
    const app = getAppContext();
    if (!app || !app.globalData) {
      loginWaitPromise = null;
      reject({ message: '应用未初始化' });
      return;
    }

    app.globalData._loginCallback = {
      resolve: function (user) {
        loginWaitPromise = null;
        app.globalData._loginCallback = null;
        resolve(finishLoginFlow(user));
      },
      reject: function (err) {
        loginWaitPromise = null;
        app.globalData._loginCallback = null;
        reject(err || { cancelled: true });
      }
    };

    wx.navigateTo({
      url: '/pages/login/index',
      fail: function (err) {
        app.globalData._loginCallback = null;
        loginWaitPromise = null;
        reject(err || { message: '无法打开登录页' });
      }
    });
  });

  return loginWaitPromise;
}

function resolveLoginPage(user) {
  const app = getAppContext();
  if (app && app.globalData && app.globalData._loginCallback) {
    app.globalData._loginCallback.resolve(user);
    return;
  }
  finishLoginFlow(user);
}

function rejectLoginPage(err) {
  const app = getAppContext();
  if (app && app.globalData && app.globalData._loginCallback) {
    app.globalData._loginCallback.reject(err);
  }
}

function requireLogin(appContext) {
  return getSessionUser(appContext).catch(function (err) {
    if (err && err.needLogin) {
      return openLoginPage();
    }
    throw err;
  });
}

function requireSession(appContext) {
  return getSessionUser(appContext);
}

function navigateWithLogin(url) {
  return requireLogin().then(function () {
    wx.navigateTo({ url: url });
  });
}

function ensureLogin(appContext) {
  return requireSession(appContext);
}

function updateProfile(data) {
  var patchCall =
    typeof request.patch === 'function'
      ? request.patch('/users/me', data)
      : request.send({ url: '/users/me', method: 'PATCH', data: data });
  return patchCall.then(function (user) {
    const app = getAppContext();
    if (app && app.globalData && app.globalData.token) {
      saveSession(app, app.globalData.token, user);
    }
    return user;
  });
}

function refreshProfile() {
  return request.get('/users/me').then(function (user) {
    const app = getAppContext();
    if (app && app.globalData && app.globalData.token) {
      saveSession(app, app.globalData.token, user);
    }
    return user;
  });
}

function getSkippedUserIds() {
  try {
    const stored = wx.getStorageSync(STORAGE_PROFILE_SETUP_SKIP);
    return Array.isArray(stored) ? stored : [];
  } catch (e) {
    return [];
  }
}

function hasSkippedProfileSetup(userId) {
  if (!userId) {
    return false;
  }
  return getSkippedUserIds().indexOf(userId) >= 0;
}

function markProfileSetupSkipped(userId) {
  if (!userId) {
    return;
  }
  const ids = getSkippedUserIds();
  if (ids.indexOf(userId) < 0) {
    ids.push(userId);
    try {
      wx.setStorageSync(STORAGE_PROFILE_SETUP_SKIP, ids);
    } catch (e) {
      console.warn('[auth] 保存跳过状态失败', e);
    }
  }
}

function needsProfileSetup(user) {
  if (!user || !user.id) {
    return false;
  }
  const nickname = (user.nickname || '').trim();
  const hasAvatar = !!(user.avatar && String(user.avatar).trim());
  const isDefaultNickname = !nickname || DEFAULT_NICKNAMES.indexOf(nickname) >= 0;
  return !hasAvatar || isDefaultNickname;
}

function isOnProfileSetupPage() {
  const pages = getCurrentPages();
  if (!pages.length) {
    return false;
  }
  const route = pages[pages.length - 1].route || '';
  return route.indexOf('profile-setup/index') >= 0;
}

function openProfileSetupPage() {
  if (profileSetupOpening || isOnProfileSetupPage()) {
    return;
  }

  profileSetupOpening = true;
  setTimeout(function () {
    if (isOnProfileSetupPage()) {
      profileSetupOpening = false;
      return;
    }
    wx.navigateTo({
      url: '/pages/profile-setup/index',
      fail: function (err) {
        console.warn('[auth] 打开资料引导失败', err);
        profileSetupOpening = false;
      },
      success: function () {
        profileSetupOpening = false;
      }
    });
  }, 300);
}

function tryShowProfileSetup(user) {
  const currentUser = user || (getAppContext() && getAppContext().globalData.userInfo);
  if (!currentUser || !needsProfileSetup(currentUser) || hasSkippedProfileSetup(currentUser.id)) {
    return;
  }
  openProfileSetupPage();
}

module.exports = {
  initSession: initSession,
  isLoggedIn: isLoggedIn,
  hasAgreedPrivacy: hasAgreedPrivacy,
  markPrivacyAgreed: markPrivacyAgreed,
  performLogin: performLogin,
  resolveLoginPage: resolveLoginPage,
  rejectLoginPage: rejectLoginPage,
  requireLogin: requireLogin,
  requireSession: requireSession,
  navigateWithLogin: navigateWithLogin,
  ensureLogin: ensureLogin,
  updateProfile: updateProfile,
  refreshProfile: refreshProfile,
  needsProfileSetup: needsProfileSetup,
  tryShowProfileSetup: tryShowProfileSetup,
  markProfileSetupSkipped: markProfileSetupSkipped,
  getPendingReferralCode: getPendingReferralCode,
  setPendingReferralCode: setPendingReferralCode
};
