// pages/conversations/conversations.js
const app = getApp()

Page({
  data: {
    conversations: [],
    groupedConversations: [],
    loading: true,
    page: 1,
    hasMore: true,
    isLoggedIn: false,
    hasBoundAgent: false
  },
  
  onShow: function () {
    this.checkLoginStatus()
    this.checkAgentBinding()
    this.loadConversations() 
  },

  onLoad: function (options) {
    // this.checkLoginStatus()
    // this.checkAgentBinding()
    // this.loadConversations()
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
  
  checkAgentBinding: function() {
    // 检查用户是否已绑定智能体
    if (!this.data.isLoggedIn) {
      this.setData({
        hasBoundAgent: false
      })
      return
    }
    console.log('checkAgentBinding')
    // 发送请求获取用户绑定的智能体
    wx.request({
      url: 'http://localhost:3000/api/agents/user',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success && res.data.agents && res.data.agents.length > 0) {
          this.setData({
            hasBoundAgent: true
          })
          // 在确认有绑定智能体后立即加载对话记录
          this.loadConversations()
        } else {
          this.setData({
            hasBoundAgent: false
          })
        }
      },
      fail: () => {
        this.setData({
          hasBoundAgent: false
        })
      }
    })
  },
  
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/index/index',
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
    console.log('loadConversations')
    // 如果未登录或未绑定智能体，不加载对话记录
    if (!this.data.isLoggedIn) {
      this.setData({ loading: false })
      if (callback) callback()
        console.log('未登录，不加载对话记录')
      return 
    }
    if (!this.data.hasBoundAgent) {
      this.setData({ loading: false })
      if (callback) callback()
        console.log('未绑定智能体，不加载对话记录')
      return
    }
    console.log('开始加载对话记录')
    wx.request({
      url: 'http://localhost:3000/api/conversations',
      method: 'GET',
      data: {
        page: 1,
        limit: 20
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          const conversations = res.data.conversations;
          // 按智能体ID分组并排序
          const groupedConvs = this.groupConversationsByAgent(conversations);
          this.setData({
            conversations: conversations,
            // conversations: conversations.sort((a, b) => new Date(b.date) - new Date(a.date)),
            groupedConversations: groupedConvs,
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
      url: 'http://localhost:3000/api/conversations',
      data: {
        page: this.data.page,
        limit: 20
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          const newConversations = [...this.data.conversations, ...res.data.conversations];
          const groupedConvs = this.groupConversationsByAgent(newConversations);
          this.setData({
            conversations: newConversations,
            groupedConversations: groupedConvs,
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
  
    groupConversationsByAgent: function(conversations) {
    // 按智能体ID分组
    const groups = {};
    conversations.forEach(conv => {
      // 使用agent_id而不是agentId，匹配服务器返回的数据结构
      if (!groups[conv.agent_id]) {
        groups[conv.agent_id] = [];
      }
      groups[conv.agent_id].push(conv);
    });

    // 将分组转换为数组并按智能体ID排序
    return Object.entries(groups)
      .sort(([agentIdA], [agentIdB]) => agentIdA - agentIdB)
      .map(([agentId, convs]) => ({
        agentId: agentId,
        // 使用content作为最新消息预览，使用create_date作为日期
        latestMessage: convs.sort((a, b) => new Date(b.create_date) - new Date(a.create_date))[0].content || '无内容',
        conversations: convs
      }));
  },

  viewConversationDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/conversationDetail/conversationDetail?agent_id=${id}`,
    });
  }
  ,
  
  formatDate: function (timestamp) {
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
  }
})