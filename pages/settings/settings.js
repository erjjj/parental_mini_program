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
    showFeedbackForm: false,
    wxLoginLoading: false,
    deviceList: [], // 用户绑定的设备列表
    agentList: [], // 用户创建的智能体列表
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
    },
    feedbackTypes: ['功能建议', '问题反馈', '内容建议', '其他'],
    feedbackTypeIndex: 0,
    feedbackContent: '',
    feedbackContact: '',
    cacheSize: '0.5MB'
  },

  onLoad: function (options) {
    // 检查是否已登录
    if (app.globalData.userInfo) {
      
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        isLoggedIn: true
      })
      console.log('man',this.data.userInfo.nickName);
    } 
    else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        })
        this.checkLoginStatus()
      }
    }
    
    // 如果未登录，尝试自动微信登录
    if (!app.globalData.userInfo && !wx.getStorageSync('token')) {
      // 使用新的自动登录方法
      this.autoWxLogin()
    }
    
    // 如果传入showLogin参数，自动显示登录弹窗
    if (options.showLogin) {
      this.showLogin()
    }
    
    // 检查登录状态
    this.checkLoginStatus()
  },
  
  onShow: function() {
    // 检查是否已登录
    if (app.globalData.userInfo) {
      
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        isLoggedIn: true
      })
      console.log('man',this.data.userInfo.nickName);
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        })
        this.checkLoginStatus()
      }
    }
    
    // 如果未登录，尝试自动微信登录
    if (!app.globalData.userInfo && !wx.getStorageSync('token')) {
      // 使用新的自动登录方法
      this.autoWxLogin()
    }
    
    // // 如果传入showLogin参数，自动显示登录弹窗
    // if (options.showLogin) {
    //   this.showLogin()
    // }

    // 页面显示时再次检查登录状态
    this.checkLoginStatus()
  },
  
  checkLoginStatus: function() {
    // 检查本地存储中是否有登录token
    const token = wx.getStorageSync('token')
    if (token) {
      // 验证token有效性
      wx.request({
        url: 'https://www.myia.fun/api/verify-token',
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
  
  // 设备管理相关函数
  navigateToDeviceManagement: function() {
    wx.navigateTo({
      url: '/pages/deviceManagement/deviceManagement',
    })
  },
  
  // 智能体管理相关函数
  navigateToAgentManagement: function() {
    wx.navigateTo({
      url: '/pages/agentManagement/agentManagement',
    })
  },
  
  // 创建新智能体
  createNewAgent: function() {
    wx.navigateTo({
      url: '/pages/agentCreate/agentCreate',
    })
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
      url: 'https://www.myia.fun/api/login',
      method: 'POST',
      data: {id: parseInt(this.data.loginForm.username), password: this.data.loginForm.password},
      success: (res) => {
        if (res.data.success) {
          // 登录成功，保存token
          wx.setStorageSync('token', res.data.token)
          app.globalData.token = res.data.token
          
          // 确保用户信息中包含头像，如果没有则使用默认头像
          const userInfo = res.data.userInfo;
          if (!userInfo.photo) {
            userInfo.photo = '/images/chat.png';
          }
          app.globalData.userInfo = userInfo;
          
          this.setData({
            isLoggedIn: true,
            userInfo: userInfo,
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
      url: 'https://www.myia.fun/api/register',
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
          wx.removeStorageSync('wxUserInfo')
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
  
  // 微信一键登录
  wxLogin: function(e) {
    // 检查用户是否授权获取用户信息
    if (e.detail.userInfo) {
      this.setData({
        wxLoginLoading: true
      })
      
      // 保存用户信息
      const userInfo = e.detail.userInfo
      // 确保保存微信的头像和昵称信息
      wx.setStorageSync('wxUserInfo', userInfo)
      
      // 调用微信登录接口获取code
      wx.login({
        success: res => {
          if (res.code) {
            // 发送code和用户信息到后台换取token
            wx.request({
              url: 'https://www.myia.fun/api/wx-login',
              method: 'POST',
              data: {
                code: res.code,
                userInfo: userInfo
              },
              success: (result) => {
                if (result.data.success) {
                  // 登录成功，保存token和用户信息
                  wx.setStorageSync('token', result.data.token)
                  app.globalData.token = result.data.token
                  
                  // 合并微信用户信息和后端返回的用户信息
                  const combinedUserInfo = {
                    ...result.data.userInfo,
                    avatarUrl: userInfo.avatarUrl,
                    nickName: userInfo.nickName
                  }
                  
                  app.globalData.userInfo = combinedUserInfo
                  
                  this.setData({
                    isLoggedIn: true,
                    userInfo: combinedUserInfo,
                    hasUserInfo: true,
                    wxLoginLoading: false
                  })
                  
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  })
                } else {
                  wx.showToast({
                    title: result.data.message || '微信登录失败',
                    icon: 'none'
                  })
                  this.setData({
                    wxLoginLoading: false
                  })
                }
              },
              fail: () => {
                wx.showToast({
                  title: '网络错误，请重试',
                  icon: 'none'
                })
                this.setData({
                  wxLoginLoading: false
                })
              }
            })
          } else {
            wx.showToast({
              title: '微信登录失败',
              icon: 'none'
            })
            this.setData({
              wxLoginLoading: false
            })
          }
        },
        fail: () => {
          wx.showToast({
            title: '微信登录失败',
            icon: 'none'
          })
          this.setData({
            wxLoginLoading: false
          })
        }
      })
    } else {
      wx.showToast({
        title: '您拒绝了授权',
        icon: 'none'
      })
    }
  },
  
  // 自动微信登录（静默）
  autoWxLogin: function() {
    // 检查是否有保存的微信用户信息
    const wxUserInfo = wx.getStorageSync('wxUserInfo')
    
    if (wxUserInfo) {
      // 调用微信登录接口获取code
      wx.login({
        success: res => {
          if (res.code) {
            // 发送code和用户信息到后台换取token
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
                  app.globalData.token = result.data.token
                  
                  // 合并微信用户信息和后端返回的用户信息
                  const combinedUserInfo = {
                    ...result.data.userInfo,
                    avatarUrl: wxUserInfo.avatarUrl,
                    nickName: wxUserInfo.nickName
                  }
                  
                  app.globalData.userInfo = combinedUserInfo
                  
                  this.setData({
                    isLoggedIn: true,
                    userInfo: combinedUserInfo,
                    hasUserInfo: true
                  })
                }
              }
            })
          }
        }
      })
    } else {
      // 如果没有用户信息，尝试获取用户授权
      this.getUserProfileAndLogin()
    }
  },
  
  // 获取用户信息并登录
  getUserProfileAndLogin: function() {
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途
      success: (res) => {
        const userInfo = res.userInfo
        // 保存用户信息到本地
        wx.setStorageSync('wxUserInfo', userInfo)
        // 使用获取到的用户信息进行登录
        wx.login({
          success: loginRes => {
            if (loginRes.code) {
              wx.request({
                url: 'https://www.myia.fun/api/wx-login',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: userInfo
                },
                success: (result) => {
                  if (result.data.success) {
                    // 登录成功，保存token和用户信息
                    wx.setStorageSync('token', result.data.token)
                    app.globalData.token = result.data.token
                    
                    // 合并微信用户信息和后端返回的用户信息
                    const combinedUserInfo = {
                      ...result.data.userInfo,
                      avatarUrl: userInfo.avatarUrl,
                      nickName: userInfo.nickName
                    }
                    
                    app.globalData.userInfo = combinedUserInfo
                    
                    this.setData({
                      isLoggedIn: true,
                      userInfo: combinedUserInfo,
                      hasUserInfo: true
                    })
                  }
                }
              })
            }
          }
        })
      },
      fail: (err) => {
        console.log('用户拒绝授权', err)
        // 用户拒绝授权，不做处理，用户可以手动在设置页面登录
      }
    })
  },
  
  getUserProfile: function() {
    // 获取用户详细信息
    wx.request({
      url: 'https://www.myia.fun/api/user/profile',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          // 获取存储的微信用户信息
          const wxUserInfo = wx.getStorageSync('wxUserInfo');
          
          // 合并后端返回的用户信息和微信用户信息
          let userInfoData = res.data.userInfo;
          
          if (wxUserInfo) {
            userInfoData = {
              ...userInfoData,
              avatarUrl: wxUserInfo.avatarUrl,
              nickName: wxUserInfo.nickName
            };
          }
          
          this.setData({
            userInfo: userInfoData,
            hasUserInfo: true,
            isLoggedIn: true
          })
          
          app.globalData.userInfo = userInfoData;
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
  
  showFeedbackForm: function() {
    this.setData({
      showFeedbackForm: true
    })
  },
  
  hideFeedbackForm: function() {
    this.setData({
      showFeedbackForm: false
    })
  },
  
  bindFeedbackTypeChange: function(e) {
    this.setData({
      feedbackTypeIndex: e.detail.value
    })
  },
  
  inputFeedbackContent: function(e) {
    this.setData({
      feedbackContent: e.detail.value
    })
  },
  
  inputFeedbackContact: function(e) {
    this.setData({
      feedbackContact: e.detail.value
    })
  },
  
  submitFeedback: function() {
    if (!this.data.feedbackContent) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '提交中...'
    })
    
    // 模拟提交反馈
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      this.setData({
        showFeedbackForm: false,
        feedbackContent: '',
        feedbackContact: '',
        feedbackTypeIndex: 0
      })
    }, 1500)
  },
  
  navigateToChildSettings: function() {
    wx.navigateTo({
      url: '/pages/childProfile/childProfile',
    })
  },
  
  navigateToChildInterests: function() {
    wx.navigateTo({
      url: '/pages/childProfile/childProfile?tab=interests',
    })
  },
  
  navigateToChildLearning: function() {
    wx.navigateTo({
      url: '/pages/childProfile/childProfile?tab=learning',
    })
  },
  
  navigateToAIPersonality: function() {
    wx.navigateTo({
      url: '/pages/aiSettings/aiSettings?tab=personality',
    })
  },
  
  navigateToAIVoice: function() {
    wx.navigateTo({
      url: '/pages/aiSettings/aiSettings?tab=voice',
    })
  },
  
  navigateToAIResponse: function() {
    wx.navigateTo({
      url: '/pages/aiSettings/aiSettings?tab=response',
    })
  },
  
  clearCache: function() {
    wx.showModal({
      title: '提示',
      content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清除中...'
          })
          
          // 模拟清除缓存
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '清除成功',
              icon: 'success'
            })
            this.setData({
              cacheSize: '0MB'
            })
          }, 1500)
        }
      }
    })
  }
})