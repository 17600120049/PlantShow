const request = require('./request');
const config = require('../config');

const STORAGE_TOKEN = 'token';
const STORAGE_USER = 'userInfo';

let loginPromise = null;

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

function loadStoredSession(app) {
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

function loginWithWechat() {
  return wxLoginCode().then(function (code) {
    return request.post('/auth/wx-login', { code: code });
  });
}

function loginWithDev() {
  return request.post('/auth/dev-login', { nickname: '叶子先生' });
}

function shouldFallbackToDev(err) {
  const message = (err && (err.message || err.errMsg)) || '';
  if (!/未配置|微信登录|400|401|500/.test(String(message))) {
    return false;
  }
  return config.isDevtools() || config.ALLOW_DEV_LOGIN;
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
      saveSession(app, res.token, res.user);
      return res.user;
    });
}

function ensureLogin(appContext) {
  const app = getAppContext(appContext);
  if (!app) {
    return Promise.reject({ message: '应用未初始化' });
  }

  loadStoredSession(app);

  if (app.globalData.token && app.globalData.userInfo) {
    return Promise.resolve(app.globalData.userInfo);
  }

  if (app.globalData.token && !app.globalData.userInfo) {
    return request.get('/users/me').then(function (user) {
      saveSession(app, app.globalData.token, user);
      return user;
    });
  }

  if (!loginPromise) {
    loginPromise = performLogin(appContext).finally(function () {
      loginPromise = null;
    });
  }

  return loginPromise;
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

module.exports = {
  ensureLogin: ensureLogin,
  updateProfile: updateProfile,
  refreshProfile: refreshProfile
};
