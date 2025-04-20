// pages/conversations/conversations.js
const app = getApp()

Page({
  data: {
    conversations: [],
    loading: true,
    page: 1,
    hasMore: true
  },
  
  onLoad: function (options) {
    this.loadConversations()
  },
  
  onPullDownRefresh: function () {
    this.setData({
      conversations: [],
      page: 1,
      hasMore: true
    })
    this.loadConversations(() => {
      wx.stopPullDownRefresh()
    })
  },
  
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreConversations()
    }
  },
  
  loadConversations: function (callback) {
    this.setData({ loading: true })
    
    wx.request({
      url: 'https://your-api-server.com/api/conversations',
      data: {
        page: 1,
        limit: 20
      },
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            conversations: res.data.conversations,
            hasMore: res.data.hasMore,
            page: 2,
            loading: false
          })
        }
      },
      complete: () => {
        this.setData({ loading: false })
        if (callback) callback()
      }
    })
  },
  
  loadMoreConversations: function () {
    this.setData({ loading: true })
    
    wx.request({
      url: 'https://your-api-server.com/api/conversations',
      data: {
        page: this.data.page,
        limit: 20
      },
      header: {
        'Authorization': 'Bearer ' + app.globalData.token
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            conversations: [...this.data.conversations, ...res.data.conversations],
            hasMore: res.data.hasMore,
            page: this.data.page + 1
          })
        }
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },
  
  viewConversationDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/conversationDetail/conversationDetail?id=${id}`,
    })
  },
  
  formatDate: function (timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
  }
})