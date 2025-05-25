Page({
  data: {
    agentName: '',
    tags: [],
    description: '',
    age: '',
    gender: '',
    story: '',
    avatar: '',
    agentData: null,
    showTagSelector: false,
    predefinedTags: [
      { text: "🎨 谈论绘画", selected: false },
      { text: "🧸 多陪孩子玩", selected: false },
      { text: "🔤 练习英语", selected: false },
      { text: "👦 鼓励孩子独立做事", selected: false },
      { text: "📝 帮助孩子建立良好的作息", selected: false },
      { text: "📚 阅读更多诗人", selected: false },
      { text: "📖 阅读更多故事", selected: false },
      { text: "🙌 鼓励孩子尝试新事物", selected: false },
      { text: "🤔 多问问题来启发他/她", selected: false },
      { text: "✏️ 鼓励孩子学习", selected: false }
    ]
  },

  onLoad(options) {
    if (options.agentData) {
      try {
        const agentData = JSON.parse(decodeURIComponent(options.agentData));
        this.setData({
          agentName: agentData.name,
          tags: agentData.tags || [],
          description: agentData.description || '',
          age: agentData.age || '',
          gender: agentData.gender || '',
          story: agentData.story || '',
          avatar: agentData.avatar || '/images/chat.png',
          agentData: agentData
        });
      } catch (error) {
        console.error('解析智能体数据失败:', error);
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '未接收到智能体数据',
        icon: 'none'
      });
    }
  },

  handleChoose() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const prevPage = pages[pages.length - 2];
      prevPage.setData({
        selectedAgent: this.data.agentData
      });
      wx.showToast({
        title: '已选择' + this.data.agentName,
        icon: 'success',
        duration: 1500,
        success: function() {
          setTimeout(function() {
            wx.navigateBack();
          }, 1500);
        }
      });
    } else {
      wx.navigateBack();
    }
  },
  
  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },
  
  // 显示标签选择器
  showTagSelector: function() {
    this.setData({
      showTagSelector: true
    });
  },
  
  // 切换标签选择状态
  toggleTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const selected = !this.data.predefinedTags[index].selected;
    const key = `predefinedTags[${index}].selected`;
    
    this.setData({
      [key]: selected
    });
  },
  
  // 应用选中的标签到智能体故事中
  applyTags: function() {
    const selectedTags = this.data.predefinedTags
      .filter(tag => tag.selected)
      .map(tag => tag.text);
    
    if (selectedTags.length > 0) {
      const tagText = selectedTags.join('\n');
      let currentStory = this.data.story || '';
      
      // 如果当前故事不为空，添加换行
      if (currentStory && !currentStory.endsWith('\n')) {
        currentStory += '\n\n';
      }
      
      // 添加标签到故事中
      currentStory += tagText;
      
      this.setData({
        story: currentStory,
        showTagSelector: false
      });
      
      wx.showToast({
        title: '标签已应用',
        icon: 'success'
      });
    } else {
      this.setData({
        showTagSelector: false
      });
    }
  }
});
