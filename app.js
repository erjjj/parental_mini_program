// app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          // 可以将res.code发送给后台，后台换取openId等信息
        }
      }
    })
    
    // 获取本地存储的token
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      // 可以在这里验证token有效性并获取用户信息
    }
  },
  globalData: {
    userInfo: null,
    token: null,
    childInfo: null,
    aiAgent: null
  }
})
