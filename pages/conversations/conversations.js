// pages/conversations/conversations.js
const app = getApp()

Page({
  data: {
    agentList: [],         // 用户绑定的智能体列表
    selectedAgentId: null, // 当前选中的智能体ID
    chatHistory: [],
    currentAgent: {},      // 当前选中的智能体信息
    conversations: [],     // 对话记录列表
    loading: true,
    page: 1,
    hasMore: true,
    isLoggedIn: false,
    hasBoundAgent: false,
    // 对话总结相关
    showSummaryModal: false,
    conversationSummary: '',
    // 筛选相关
    showFilterModal: false,
    filterKeyword: '',
    filterStartDate: '',
    filterEndDate: ''
  },
  
  onShow: function () {
    this.checkLoginStatus()
    if (this.data.isLoggedIn) {
      this.loadAgentList()
    }
  },

  onLoad: function (options) {
    // 如果从new_index页面传递了agent_id参数，直接设置为选中的智能体
    if (options.agent_id) {
      this.setData({
        selectedAgentId: options.agent_id
      })
    }
  },
  
  checkLoginStatus: function() {
    // 检查用户是否已登录
    const token = app.globalData.token || wx.getStorageSync('token')
    // console.log(app.globalData.token)
    // console.log(wx.getStorageSync('token'))
    // 很神奇的功能，确实是相等的
    this.setData({
      isLoggedIn: !!token // 强制转换为布尔值
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
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success && res.data.agents && res.data.agents.length > 0) {
          // 如果没有预先设置selectedAgentId（从new_index页面传入），则默认选择第一个智能体
          const selectedId = this.data.selectedAgentId || res.data.agents[0].agent_id;
          const currentAgent = res.data.agents.find(agent => agent.agent_id === selectedId) || {};
          
          this.setData({
            agentList: res.data.agents,
            selectedAgentId: selectedId,
            currentAgent: currentAgent,
            hasBoundAgent: true
          })
          
          // 加载选中智能体的对话记录
          this.loadConversations()
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
      const currentAgent = this.data.agentList.find(agent => agent.agent_id === agentId) || {};
      this.setData({
        selectedAgentId: agentId,
        currentAgent: currentAgent,
        conversations: [],
        page: 1,
        hasMore: true
      })
      this.loadConversations()
    }
  },
  
  navigateToLogin: function() {
    wx.switchTab({
      url: '/pages/settings/settings'
    })
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
    // 如果未登录或未绑定智能体，不加载对话记录
    if (!this.data.isLoggedIn) {
      this.setData({ 
        loading: false, 
        conversations: [],
        hasMore: false
      })
      if (callback) callback()
      return 
    }
    if (!this.data.hasBoundAgent || !this.data.selectedAgentId) {
      this.setData({ loading: false })
      if (callback) callback()
      return
    }
    
    wx.request({
      url: 'https://www.myia.fun/api/chat/history',
      method: 'GET',
      data: {
        agent_id: this.data.selectedAgentId,
        page: this.data.page,
        limit: 20,
        // keyword: this.data.filterKeyword,
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          // 处理对话数据，确保每条对话都有用户消息和智能体消息
          const sortedHistory= this.processChatHistory(res.data.history)
          
          this.setData({
            conversations: sortedHistory,
            hasMore: res.data.hasMore,
            loading: false
          })
        }
        else{
          this.setData({loading: false})
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
        this.setData({ loading: false })
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

  loadMoreConversations: function () {
    this.setData({ loading: true })
    
    wx.request({
      url: 'https://www.myia.fun/api/conversations/agent/' + this.data.selectedAgentId,
      data: {
        page: this.data.page,
        limit: 20,
        keyword: this.data.filterKeyword,
        startDate: this.data.filterStartDate,
        endDate: this.data.filterEndDate
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          // 处理对话数据
          const newConversations = res.data.conversations.map(conv => {
            return {
              ...conv,
              user_message: conv.user_message || '无内容',
              agent_message: conv.agent_message || '无内容',
              create_date: this.formatDate(conv.create_date)
            };
          });
          
          this.setData({
            conversations: [...this.data.conversations, ...newConversations],
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
  
  // 查看对话详情
  viewConversationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/conversationDetail/conversationDetail?conversation_id=${id}&agent_id=${this.data.selectedAgentId}`,
    });
  },
  // 处理聊天记录数据，按时间排序
  processChatHistory: function(history) {
    if (!history || history.length === 0) return []
    
    // 按创建时间排序
    return history.sort((a, b) => {
      return new Date(a.create_date) - new Date(b.create_date)
    })
  },
  // 显示对话总结弹窗
  showSummary: function() {
    if (!this.data.selectedAgentId) {
      wx.showToast({
        title: '请先选择智能体',
        icon: 'none'
      })
      return
    }
    
    // 获取当前智能体的对话总结
    wx.showLoading({
      title: '加载中...'
    })
    
    wx.request({
      url: 'https://www.myia.fun/api/conversations/summary/' + this.data.selectedAgentId,
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            showSummaryModal: true,
            conversationSummary: res.data.summary || '暂无总结内容'
          })
        } else {
          wx.showToast({
            title: '获取总结失败',
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
  
  // 关闭对话总结弹窗
  closeSummary: function() {
    this.setData({
      showSummaryModal: false
    })
  },
  
  // 显示筛选弹窗
  showFilter: function() {
    this.setData({
      showFilterModal: true
    })
  },
  
  // 关闭筛选弹窗
  closeFilter: function() {
    this.setData({
      showFilterModal: false
    })
  },
  
  // 关键词输入
  onKeywordInput: function(e) {
    this.setData({
      filterKeyword: e.detail.value
    })
  },
  
  // 开始日期选择
  onStartDateChange: function(e) {
    this.setData({
      filterStartDate: e.detail.value
    })
  },
  
  // 结束日期选择
  onEndDateChange: function(e) {
    this.setData({
      filterEndDate: e.detail.value
    })
  },
  
  // 应用筛选
  applyFilter: function() {
    this.setData({
      showFilterModal: false,
      page: 1,
      conversations: [],
      hasMore: true
    })
    this.loadConversations()
  },
  
  formatDate: function (timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
  }
})