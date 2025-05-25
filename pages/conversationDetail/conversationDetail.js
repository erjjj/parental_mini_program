// pages/conversationDetail/conversationDetail.js
const app = getApp()

Page({
  data: {
    agentList: [],         // 用户绑定的智能体列表
    selectedAgentId: null, // 当前选中的智能体ID
    chatHistory: [],       // 对话历史记录
    loading: true,         // 加载状态
    page: 1,               // 当前页码
    hasMore: true,         // 是否有更多数据
    isLoggedIn: false,     // 用户是否已登录
    hasBoundAgent: false   // 用户是否已绑定智能体
  },
  
  onLoad: function (options) {
    // 检查登录状态
    this.checkLoginStatus()
    // 如果已登录，加载用户绑定的智能体列表
    if (this.data.isLoggedIn) {
      this.loadAgentList()
      
      // 如果从conversations页面传递了agent_id参数，直接设置为选中的智能体
      if (options.agent_id) {
        this.setData({
          selectedAgentId: options.agent_id
        })
      }
    } else {
      this.setData({ loading: false })
    }
  },
  
  // 检查用户是否已登录
  checkLoginStatus: function() {
    const token = app.globalData.token || wx.getStorageSync('token')
    this.setData({
      isLoggedIn: !!token
    })
  },
  
  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  
  // 加载用户绑定的智能体列表
  loadAgentList: function() {
    wx.showLoading({
      title: '加载中...',
    })
    
    wx.request({
      url: 'https://www.myia.fun/api/agents/user',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.data.success && res.data.agents.length > 0) {
          // 如果没有预先设置selectedAgentId（从conversations页面传入），则默认选择第一个智能体
          const selectedId = this.data.selectedAgentId || res.data.agents[0].agent_id;
          
          this.setData({
            agentList: res.data.agents,
            selectedAgentId: selectedId,
            hasBoundAgent: true
          })
          
          // 加载选中智能体的对话历史
          this.loadChatHistory()
        } else {
          this.setData({
            loading: false,
            hasBoundAgent: false
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        this.setData({
          loading: false
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  // 切换选中的智能体
  changeAgent: function(e) {
    const agentId = e.currentTarget.dataset.id
    if (agentId !== this.data.selectedAgentId) {
      this.setData({
        selectedAgentId: agentId,
        chatHistory: [],
        page: 1,
        hasMore: true,
        loading: true
      })
      
      // 加载新选中智能体的对话历史
      this.loadChatHistory()
    }
  },
  
  // 加载对话历史
  loadChatHistory: function(callback) {
    if (!this.data.selectedAgentId) {
      if (callback) callback()
      return
    }
    
    this.setData({ loading: true })
    
    wx.request({
      url: 'https://www.myia.fun/api/chat/history',
      data: {
        agent_id: this.data.selectedAgentId,
        page: this.data.page,
        limit: 20
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          // 按时间排序处理聊天记录
          const sortedHistory = this.processChatHistory(res.data.history)
          
          this.setData({
            chatHistory: sortedHistory,
            hasMore: res.data.hasMore,
            loading: false
          })
        } else {
          this.setData({ loading: false })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
        this.setData({ loading: false })
      },
      complete: () => {
        if (callback) callback()
      }
    })
  },
  
  // 加载更多对话历史
  loadMoreHistory: function() {
    if (this.data.hasMore && !this.data.loading) {
      const nextPage = this.data.page + 1
      this.setData({
        page: nextPage,
        loading: true
      })
      
      wx.request({
        url: 'https://www.myia.fun/api/chat/history',
        data: {
          agent_id: this.data.selectedAgentId,
          page: nextPage,
          limit: 20
        },
        header: {
          'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
        },
        success: (res) => {
          if (res.data.success) {
            // 处理并合并聊天记录
            const newHistory = this.processChatHistory(res.data.history)
            const mergedHistory = [...this.data.chatHistory, ...newHistory]
            
            this.setData({
              chatHistory: mergedHistory,
              hasMore: res.data.hasMore,
              loading: false
            })
          } else {
            this.setData({ loading: false })
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          })
          this.setData({ loading: false })
        }
      })
    }
  },
  
  // 处理聊天记录数据，按时间排序
  processChatHistory: function(history) {
    if (!history || history.length === 0) return []
    
    // 按创建时间排序
    return history.sort((a, b) => {
      return new Date(a.create_date) - new Date(b.create_date)
    })
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      chatHistory: [],
      page: 1,
      hasMore: true
    })
    
    this.loadChatHistory(() => {
      wx.stopPullDownRefresh()
    })
  },
  
  // 触底加载更多
  onReachBottom: function() {
    this.loadMoreHistory()
  },
  
  // 格式化日期
  formatTime: function(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
})