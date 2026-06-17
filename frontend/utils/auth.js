const request = require('./request');

let loginPromise = null;

function ensureLogin() {
  const app = getApp();
  if (app.globalData.token && app.globalData.userInfo) {
    return Promise.resolve(app.globalData.userInfo);
  }

  if (!loginPromise) {
    loginPromise = request
      .post('/auth/dev-login', { nickname: '叶子先生' })
      .then(function (res) {
        app.globalData.token = res.token;
        app.globalData.userInfo = res.user;
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
