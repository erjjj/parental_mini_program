// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    childInfo: null,
    recentConversations: [],
    aiStatus: '在线',
    isLoggedIn: false
  },
  
  onLoad: function () {
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
    if (token && app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        isLoggedIn: true
      })
      this.getChildInfo()
      this.getRecentConversations()
    } else if (token) {
      // 有token但没有用户信息，获取用户信息
      this.getUserProfile()
    } else {
      this.setData({
        isLoggedIn: false,
        hasUserInfo: false
      })
    }
  },
  
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.getChildInfo()
    this.getRecentConversations()
  },
  
  getUserProfile: function() {
    // 获取用户详细信息
    wx.request({
      url: 'http://localhost:3000/api/user/profile',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success) {
          // 确保用户信息中包含头像，如果没有则使用默认头像
          const userInfo = res.data.userInfo;
          if (!userInfo.photo) {
            userInfo.photo = '/images/chat.png';
          }
          
          this.setData({
            userInfo: userInfo,
            hasUserInfo: true,
            isLoggedIn: true
          })
          app.globalData.userInfo = userInfo
          this.getChildInfo()
          this.getRecentConversations()
        }
      }
    })
  },
  
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/settings/settings',
    })
  },
  
  getChildInfo: function() {
    if (!this.data.isLoggedIn){ 
      app.globalData.childInfo = null
      return;
    }
    wx.request({
      url: 'http://localhost:3000/api/child/info',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            childInfo: res.data.childInfo
          })
          app.globalData.childInfo = res.data.childInfo
        } else {
          // 不直接跳转，而是设置一个标志，让用户手动创建孩子信息
          this.setData({
            childInfo: null
          })
          // 显示提示，引导用户创建孩子信息
          wx.showToast({
            title: '请先创建孩子信息',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },
  
  getRecentConversations: function() {
    if (!this.data.isLoggedIn) {
      this.setData({
        recentConversations: []
      });
      return;
    }
    wx.request({
      url: 'http://localhost:3000/api/conversations/recent',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          // 确保每条消息都有speaker字段，如果没有则根据默认规则设置
          const chats = res.data.recentChats || [];
          chats.forEach(chat => {
            // 如果没有speaker字段，根据消息内容或其他规则判断
            if (!chat.speaker) {
              // 这里假设服务器返回的数据中没有speaker字段
              // 可以根据实际情况调整判断逻辑
              chat.speaker = chat.is_from_user ? 'user' : 'ai';
            }
          });
          
          this.setData({
            recentConversations: chats
          })
        }
      }
    })
  },
  
  // 获取最近聊天记录
  // 移除重复的getRecentChats函数，统一使用getRecentConversations
  // getRecentChats: function() {
  //   // 此函数已被移除，避免重复加载对话记录
  // }
  
  
  // 格式化时间
  formatTime: function(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    return `${year}/${month}/${day} ${hour}:${minute}`;
  },
  
  navigateToConversations: function() {
    wx.switchTab({
      url: '/pages/conversations/conversations',
    })
  },
  
  // 查看对话详情
  viewConversationDetail: function(e) {
    const agentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/conversationDetail/conversationDetail?agentId=${agentId}`
    });
  },
  
  navigateToMaterials: function() {
    wx.switchTab({
      url: '/pages/materials/materials',
    })
  },
  
  navigateToInstructions: function() {
    wx.navigateTo({
      url: '/pages/instructions/instructions',
    })
  },
  
  // 新增的第二排按钮导航函数
  navigateToFeatureFive: function() {
    wx.showToast({
      title: '功能五即将上线',
      icon: 'none'
    })
  },
  
  navigateToFeatureSix: function() {
    wx.showToast({
      title: '功能六即将上线',
      icon: 'none'
    })
  },
  
  navigateToFeatureSeven: function() {
    wx.showToast({
      title: '功能七即将上线',
      icon: 'none'
    })
  },
  
  navigateToMore: function() {
    wx.navigateTo({
      url: '/pages/more/more'
    })
  },
  
  navigateToChildProfile: function() {
    wx.navigateTo({
      url: '/pages/childProfile/childProfile',
    })
  }
})
