// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLoggedIn: false,
    showLoginForm: false,
    showRegisterForm: false,
    loginForm: {
      username: '',
      password: ''
    },
    registerForm: {
      id: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: ''
    }
  },

  onLoad: function (options) {
    // 检查是否已登录
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        isLoggedIn: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        })
        this.checkLoginStatus()
      }
    }
    
    // 检查登录状态
    this.checkLoginStatus()
  },
  
  onShow: function() {
    // 页面显示时再次检查登录状态
    this.checkLoginStatus()
  },
  
  checkLoginStatus: function() {
    // 检查本地存储中是否有登录token
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token有效性
      wx.request({
        url: 'http://localhost:3000/api/verify-token',
        header: {
          'Authorization': 'Bearer ' + token
        },
        success: (res) => {
          if (res.data.success) {
            this.setData({
              isLoggedIn: true
            })
            // 获取用户信息
            this.getUserProfile()
          } else {
            // token无效，清除本地存储
            wx.removeStorageSync('token')
            this.setData({
              isLoggedIn: false,
              userInfo: null,
              hasUserInfo: false
            })
          }
        },
        fail: () => {
          this.setData({
            isLoggedIn: false
          })
        }
      })
    } else {
      this.setData({
        isLoggedIn: false
      })
    }
  },
  
  showLogin: function() {
    this.setData({
      showLoginForm: true,
      showRegisterForm: false
    })
  },
  
  showRegister: function() {
    this.setData({
      showRegisterForm: true,
      showLoginForm: false
    })
  },
  
  hideLoginForm: function() {
    this.setData({
      showLoginForm: false
    })
  },
  
  hideRegisterForm: function() {
    this.setData({
      showRegisterForm: false
    })
  },
  
  inputLoginUsername: function(e) {
    this.setData({
      'loginForm.username': e.detail.value
    })
  },
  
  inputLoginPassword: function(e) {
    this.setData({
      'loginForm.password': e.detail.value
    })
  },
  
  inputRegisterUsername: function(e) {
    this.setData({
      'registerForm.id': e.detail.value
    })
  },
  
  inputRegisterPassword: function(e) {
    this.setData({
      'registerForm.password': e.detail.value
    })
  },
  
  inputRegisterConfirmPassword: function(e) {
    this.setData({
      'registerForm.confirmPassword': e.detail.value
    })
  },
  
  inputRegisterEmail: function(e) {
    this.setData({
      'registerForm.email': e.detail.value
    })
  },

  inputRegisterPhone: function(e) {
    this.setData({
      'registerForm.phone': e.detail.value
    })
  },

  login: function() {
    // 表单验证
    if (!this.data.loginForm.username || !this.data.loginForm.password) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '登录中...',
    })
    
    // 发送登录请求
    wx.request({
      url: 'http://localhost:3000/api/login',
      method: 'POST',
      data: {id: parseInt(this.data.loginForm.username), password: this.data.loginForm.password},
      success: (res) => {
        if (res.data.success) {
          // 登录成功，保存token
          wx.setStorageSync('token', res.data.token)
          app.globalData.token = res.data.token
          app.globalData.userInfo = res.data.userInfo
          
          this.setData({
            isLoggedIn: true,
            userInfo: res.data.userInfo,
            hasUserInfo: true,
            showLoginForm: false
          })
          
          wx.showToast({
            title: '登录成功',
          })
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  register: function() {
    // 表单验证
    if (!this.data.registerForm.id || !this.data.registerForm.password || !this.data.registerForm.confirmPassword) {
      wx.showToast({
        title: '请填写必要信息',
        icon: 'none'
      })
      return
    }
    
    if (this.data.registerForm.password !== this.data.registerForm.confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      })
      return
    }
    
    // wx.showLoading({
    //   title: '注册中...',
    // })
    
    // 发送注册请求
    wx.request({
      url: 'http://localhost:3000/api/register',
      method: 'POST',
      data: this.data.registerForm,
      success: (res) => {
        if (res.data.success) {
          // 注册成功，自动登录
          wx.setStorageSync('token', res.data.token)
          app.globalData.token = res.data.token
          app.globalData.userInfo = res.data.userInfo
          
          this.setData({
            isLoggedIn: true,
            userInfo: res.data.userInfo,
            hasUserInfo: true,
            showRegisterForm: false
          })
          
          wx.showToast({
            title: '注册成功',
          })
        } else {
          wx.showToast({
            title: res.data.message || '注册失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  logout: function() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('token')
          app.globalData.token = null
          app.globalData.userInfo = null
          
          this.setData({
            isLoggedIn: false,
            userInfo: null,
            hasUserInfo: false
          })
          
          wx.showToast({
            title: '已退出登录',
          })
        }
      }
    })
  },
  
  getUserProfile: function() {
    // 获取用户详细信息
    wx.request({
      url: 'https://your-api-server.com/api/user/profile',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            userInfo: res.data.userInfo
          })
          app.globalData.userInfo = res.data.userInfo
        }
      }
    })
  },
  
  // 其他设置项功能
  navigateToAbout: function() {
    wx.navigateTo({
      url: '/pages/about/about',
    })
  },
  
  navigateToHelp: function() {
    wx.navigateTo({
      url: '/pages/help/help',
    })
  },
  
  navigateToFeedback: function() {
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  }
})