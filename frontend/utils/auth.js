const request = require('./request');

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

function ensureLogin(appContext) {
  const app = getAppContext(appContext);
  if (!app) {
    return Promise.reject({ message: '应用未初始化' });
  }

  if (app.globalData.token && app.globalData.userInfo) {
    return Promise.resolve(app.globalData.userInfo);
  }

  if (!loginPromise) {
    loginPromise = request
      .post('/auth/dev-login', { nickname: '叶子先生' })
      .then(function (res) {
        const currentApp = getAppContext(appContext);
        if (currentApp && currentApp.globalData) {
          currentApp.globalData.token = res.token;
          currentApp.globalData.userInfo = res.user;
        }
        return res.user;
      })
      .catch(function (err) {
        loginPromise = null;
        throw err;
      });
  }

  return loginPromise;
}

module.exports = {
  ensureLogin: ensureLogin
};
