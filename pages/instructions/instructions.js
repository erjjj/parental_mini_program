// pages/instructions/instructions.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedType: '',
    selectedTemplateId: '',
    instructionContent: '',
    difficultyIndex: 0,
    difficulties: ['初级', '中级', '高级'],
    themeIndex: 0,
    themes: ['动物', '家庭', '学校', '旅行', '科技', '自然'],
    duration: 15,
    templates: [
      // 学习指导模板
      {
        id: 'learning_1',
        type: 'learning',
        name: '单词学习',
        description: '帮助孩子学习和记忆新单词',
        content: '请帮助孩子学习以下主题的单词：[主题]。难度级别：[难度]。'
      },
      {
        id: 'learning_2',
        type: 'learning',
        name: '语法练习',
        description: '针对特定语法点进行练习',
        content: '请为孩子提供[难度]级别的语法练习，重点是：[语法点]。'
      },
      // 对话练习模板
      {
        id: 'conversation_1',
        type: 'conversation',
        name: '日常对话',
        description: '模拟日常生活中的对话场景',
        content: '请与孩子进行一个关于[场景]的日常对话，难度级别：[难度]。'
      },
      {
        id: 'conversation_2',
        type: 'conversation',
        name: '角色扮演',
        description: '通过角色扮演提高口语能力',
        content: '请与孩子进行角色扮演，场景是[场景]，孩子扮演[角色1]，你扮演[角色2]。难度级别：[难度]。'
      },
      // 故事创作模板
      {
        id: 'story_1',
        type: 'story',
        name: '故事续写',
        description: '根据开头续写故事',
        content: '请帮助孩子完成一个关于[主题]的故事续写。故事开头：[故事开头]'
      },
      {
        id: 'story_2',
        type: 'story',
        name: '创作故事',
        description: '根据主题创作完整故事',
        content: '请帮助孩子创作一个关于[主题]的完整故事，包含以下元素：[元素]。'
      },
      // 游戏互动模板
      {
        id: 'game_1',
        type: 'game',
        name: '猜词游戏',
        description: '通过描述猜测单词',
        content: '请与孩子玩猜词游戏，主题是[主题]。你描述一个单词，让孩子猜测。'
      },
      {
        id: 'game_2',
        type: 'game',
        name: '情景问答',
        description: '根据情景进行问答互动',
        content: '请与孩子进行情景问答游戏，主题是[主题]。你描述一个情景，然后提问，孩子回答。'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 如果有传入的类型参数，直接选择该类型
    if (options.type) {
      this.selectType(null, options.type)
    }
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack()
  },

  /**
   * 选择指令类型
   */
  selectType: function(e, typeParam) {
    const type = typeParam || e.currentTarget.dataset.type
    this.setData({
      selectedType: type,
      selectedTemplateId: '',
      instructionContent: ''
    })
    
    // 根据类型筛选模板
    this.filterTemplates(type)
  },

  /**
   * 根据类型筛选模板
   */
  filterTemplates: function(type) {
    const filteredTemplates = this.data.templates.filter(template => template.type === type)
    this.setData({
      filteredTemplates: filteredTemplates
    })
  },

  /**
   * 选择模板
   */
  selectTemplate: function(e) {
    const templateId = e.currentTarget.dataset.id
    const template = this.data.templates.find(t => t.id === templateId)
    
    if (template) {
      this.setData({
        selectedTemplateId: templateId,
        instructionContent: template.content
      })
    }
  },

  /**
   * 输入指令内容
   */
  inputInstruction: function(e) {
    this.setData({
      instructionContent: e.detail.value
    })
  },

  /**
   * 选择难度级别
   */
  bindDifficultyChange: function(e) {
    this.setData({
      difficultyIndex: e.detail.value
    })
    
    // 更新指令内容中的难度
    this.updateInstructionContent('难度', this.data.difficulties[e.detail.value])
  },

  /**
   * 选择主题
   */
  bindThemeChange: function(e) {
    this.setData({
      themeIndex: e.detail.value
    })
    
    // 更新指令内容中的主题
    this.updateInstructionContent('主题', this.data.themes[e.detail.value])
  },

  /**
   * 设置时长
   */
  bindDurationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  },

  /**
   * 更新指令内容中的参数
   */
  updateInstructionContent: function(param, value) {
    let content = this.data.instructionContent
    const regex = new RegExp(`\\[${param}\\]`, 'g')
    content = content.replace(regex, value)
    
    this.setData({
      instructionContent: content
    })
  },

  /**
   * 取消操作
   */
  cancel: function() {
    wx.navigateBack()
  },

  /**
   * 发送指令
   */
  sendInstruction: function() {
    if (!this.data.instructionContent) {
      wx.showToast({
        title: '请输入指令内容',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '发送中...'
    })
    
    // 构建指令数据
    const instructionData = {
      type: this.data.selectedType,
      content: this.data.instructionContent,
      params: {
        difficulty: this.data.selectedType === 'learning' || this.data.selectedType === 'conversation' ? 
          this.data.difficulties[this.data.difficultyIndex] : null,
        theme: this.data.selectedType === 'story' || this.data.selectedType === 'game' ? 
          this.data.themes[this.data.themeIndex] : null,
        duration: this.data.duration
      },
      timestamp: new Date().getTime()
    }
    
    // 模拟发送指令到服务器
    setTimeout(() => {
      wx.hideLoading()
      
      // 保存到本地历史记录
      let history = wx.getStorageSync('instruction_history') || []
      history.unshift(instructionData)
      wx.setStorageSync('instruction_history', history)
      
      wx.showToast({
        title: '发送成功',
        icon: 'success'
      })
      
      // 跳转到对话页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/conversationDetail/conversationDetail?type=instruction&id=' + new Date().getTime()
        })
      }, 1500)
    }, 1500)
  }
})