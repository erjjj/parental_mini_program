// app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态并尝试自动登录
    this.checkLoginAndAutoLogin()
  },
  
  // 验证token有效性
  verifyToken: function(token) {
    wx.request({
      url: 'https://www.myia.fun/api/verify-token',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data.success) {
          // token有效，获取用户信息
          this.getUserInfo(token)
        } else {
          // token无效，清除本地存储
          wx.removeStorageSync('token')
          this.globalData.token = null
          this.globalData.userInfo = null
        }
      },
      fail: () => {
        // 请求失败，可能是服务器问题
        console.log('验证token失败，可能是服务器未启动')
      }
    })
  },
  
  // 获取用户信息
  getUserInfo: function(token) {
    wx.request({
      url: 'https://www.myia.fun/api/user/profile',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data.success) {
          this.globalData.userInfo = res.data.userInfo
        }
      }
    })
  },
  
  // 检查登录状态并尝试自动登录
  checkLoginAndAutoLogin: function() {
    // 获取本地存储的token
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      // 验证token有效性并获取用户信息
      this.verifyToken(token)
      return
    }
    
    // 检查是否有保存的微信用户信息
    const wxUserInfo = wx.getStorageSync('wxUserInfo')
    
    // 如果有用户信息，尝试自动登录
    if (wxUserInfo) {
      // 有用户信息，尝试自动登录
      this.autoWxLogin(wxUserInfo)
    } else {
      // 设置标志，让首页显示授权对话框
      this.globalData.needAuth = true
    }
  },
  
  // 获取用户信息并登录
  getUserProfileAndLogin: function() {
    // 不再直接调用wx.getUserProfile，而是由页面上的按钮触发
    // 此方法保留供页面调用
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        const userInfo = res.userInfo
        // 保存用户信息到本地
        wx.setStorageSync('wxUserInfo', userInfo)
        // 使用获取到的用户信息进行登录
        this.autoWxLogin(userInfo)
      },
      fail: (err) => {
        console.log('用户拒绝授权', err)
        // 用户拒绝授权，不做处理，用户可以手动在设置页面登录
        wx.showToast({
          title: '您已拒绝授权',
          icon: 'none',
          duration: 2000
        })
      }
    })
  
  },
  
  // 自动微信登录
  autoWxLogin: function(wxUserInfo) {
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          wx.request({
            url: 'https://www.myia.fun/api/wx-login',
            method: 'POST',
            data: {
              code: res.code,
              userInfo: wxUserInfo
            },
            success: (result) => {
              if (result.data.success) {
                // 登录成功，保存token和用户信息
                wx.setStorageSync('token', result.data.token)
                this.globalData.token = result.data.token
                
                // 合并微信用户信息和后端返回的用户信息
                const combinedUserInfo = {
                  ...result.data.userInfo,
                  avatarUrl: wxUserInfo.avatarUrl,
                  nickName: wxUserInfo.nickName
                }
                
                this.globalData.userInfo = combinedUserInfo
              }
            }
          })
        }
      }
    })
  },
  
  // 获取官方智能体列表
  getOurAgents: function(callback) {
    wx.request({
      url: 'https://www.myia.fun/api/our-agents',
      success: (res) => {
        if (callback && typeof callback === 'function') {
          callback(res.data)
        }
      },
      fail: (err) => {
        console.log('获取官方智能体失败', err)
        if (callback && typeof callback === 'function') {
          callback({ success: false })
        }
      }
    })
  },
  
  // 获取用户绑定的智能体
  getUserAgents: function(callback) {
    const token = this.globalData.token || wx.getStorageSync('token')
    if (!token) {
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: '用户未登录' })
      }
      return
    }
    
    wx.request({
      url: 'https://www.myia.fun/api/agents/user',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (callback && typeof callback === 'function') {
          callback(res.data)
        }
      },
      fail: (err) => {
        console.log('获取用户智能体失败', err)
        if (callback && typeof callback === 'function') {
          callback({ success: false })
        }
      }
    })
  },
  
  // 创建新智能体
  createAgent: function(agentData, callback) {
    const token = this.globalData.token || wx.getStorageSync('token')
    if (!token) {
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: '用户未登录' })
      }
      return
    }
    
    wx.request({
      url: 'https://www.myia.fun/api/agents/create',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      data: agentData,
      success: (res) => {
        if (callback && typeof callback === 'function') {
          callback(res.data)
        }
      },
      fail: (err) => {
        console.log('创建智能体失败', err)
        if (callback && typeof callback === 'function') {
          callback({ success: false })
        }
      }
    })
  },
  
  globalData: {
    userInfo: null,
    token: null,
    childInfo: null,
    aiAgent: null,
    needAuth: false
  }
})
