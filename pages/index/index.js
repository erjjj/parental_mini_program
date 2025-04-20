// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    childInfo: null,
    recentConversations: [],
    aiStatus: '在线'
  },
  
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.getChildInfo()
      this.getRecentConversations()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        })
        this.getChildInfo()
        this.getRecentConversations()
      }
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
  
  getChildInfo: function() {
    wx.request({
      url: 'https://your-api-server.com/api/child/info',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            childInfo: res.data.childInfo
          })
          app.globalData.childInfo = res.data.childInfo
        } else {
          wx.navigateTo({
            url: '/pages/childProfile/childProfile',
          })
        }
      }
    })
  },
  
  getRecentConversations: function() {
    wx.request({
      url: 'https://your-api-server.com/api/conversations/recent',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            recentConversations: res.data.conversations
          })
        }
      }
    })
  },
  
  navigateToConversations: function() {
    wx.switchTab({
      url: '/pages/conversations/conversations',
    })
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
  
  navigateToChildProfile: function() {
    wx.navigateTo({
      url: '/pages/childProfile/childProfile',
    })
  }
})
