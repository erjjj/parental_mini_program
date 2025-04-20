// pages/aiExplain/aiExplain.js
const app = getApp()

Page({
  data: {
    materialId: '',
    title: '',
    messages: [],
    inputMessage: '',
    isAiTyping: false,
    scrollToMessage: '',
    suggestions: []
  },
  
  onLoad: function (options) {
    const materialId = options.materialId
    const title = options.title ? decodeURIComponent(options.title) : '学习材料'
    
    this.setData({
      materialId: materialId,
      title: title
    })
    
    // 初始化对话
    this.initConversation()
  },
  
  initConversation: function() {
    this.setData({
      isAiTyping: true
    })
    
    wx.request({
      url: 'https://your-api-server.com/api/ai/explain/init',
      method: 'POST',
      data: {
        materialId: this.data.materialId
      },
      header: {
        'Authorization': 'Bearer ' + app.globalData.token,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          const now = this.formatTime(new Date())
          
          this.setData({
            messages: [{
              role: 'ai',
              content: res.data.message,
              time: now
            }],
            suggestions: res.data.suggestions || [],
            isAiTyping: false,
            scrollToMessage: 'msg-0'
          })
        } else {
          this.setData({
            messages: [{
              role: 'ai',
              content: '很抱歉，我无法解析这个材料。请尝试其他材料或稍后再试。',
              time: this.formatTime(new Date())
            }],
            isAiTyping: false
          })
        }
      },
      fail: () => {
        this.setData({
          messages: [{
            role: 'ai',
            content: '网络错误，请检查您的网络连接后重试。',
            time: this.formatTime(new Date())
          }],
          isAiTyping: false
        })
      }
    })
  },
  
  onInputChange: function(e) {
    this.setData({
      inputMessage: e.detail.value
    })
  },
  
  sendMessage: function() {
    if (!this.data.inputMessage.trim() || this.data.isAiTyping) return
    
    const userMessage = this.data.inputMessage
    const now = this.formatTime(new Date())
    
    // 添加用户消息
    const messages = this.data.messages.concat([{
      role: 'user',
      content: userMessage,
      time: now
    }])
    
    this.setData({
      messages: messages,
      inputMessage: '',
      isAiTyping: true,
      scrollToMessage: `msg-${messages.length - 1}`
    })
    
    // 发送请求获取AI回复
    wx.request({
      url: 'https://your-api-server.com/api/ai/explain/chat',
      method: 'POST',
      data: {
        materialId: this.data.materialId,
        message: userMessage,
        history: this.data.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      },
      header: {
        'Authorization': 'Bearer ' + app.globalData.token,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          const aiReplyTime = this.formatTime(new Date())
          
          // 添加AI回复
          const updatedMessages = this.data.messages.concat([{
            role: 'ai',
            content: res.data.message,
            time: aiReplyTime
          }])
          
          this.setData({
            messages: updatedMessages,
            suggestions: res.data.suggestions || [],
            isAiTyping: false,
            scrollToMessage: `msg-${updatedMessages.length - 1}`
          })
        } else {
          // 添加错误消息
          const updatedMessages = this.data.messages.concat([{
            role: 'ai',
            content: '很抱歉，我无法回答这个问题。请尝试其他问题或稍后再试。',
            time: this.formatTime(new Date())
          }])
          
          this.setData({
            messages: updatedMessages,
            isAiTyping: false,
            scrollToMessage: `msg-${updatedMessages.length - 1}`
          })
        }
      },
      fail: () => {
        // 添加网络错误消息
        const updatedMessages = this.data.messages.concat([{
          role: 'ai',
          content: '网络错误，请检查您的网络连接后重试。',
          time: this.formatTime(new Date())
        }])
        
        this.setData({
          messages: updatedMessages,
          isAiTyping: false,
          scrollToMessage: `msg-${updatedMessages.length - 1}`
        })
      }
    })
  },
  
  useSuggestion: function(e) {
    const suggestion = e.currentTarget.dataset.suggestion
    this.setData({
      inputMessage: suggestion
    }, () => {
      this.sendMessage()
    })
  },
  
  navigateBack: function() {
    wx.navigateBack()
  },
  
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
})