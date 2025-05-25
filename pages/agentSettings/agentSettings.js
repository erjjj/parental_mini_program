// agentSettings.js
Page({
  data: {
    agentId: '',
    agentInfo: {
      name: '',
      avatar: '',
      gender: '',
      age: '',
      setting: '',
      introduction: '',
      tags:[],
      greeting: '',
      voice: '',
      backgroundMusic: ''
    },
    selectedTags: [],
    showTagSelector: false,
    predefinedTags: [
      { text: "谈论绘画", selected: false },
      { text: "多陪孩子玩", selected: false },
      { text: "练习英语", selected: false },
      { text: "鼓励孩子独立做事", selected: false },
      { text: "帮助孩子建立良好的作息", selected: false },
      { text: "阅读更多诗人", selected: false },
      { text: "阅读更多故事", selected: false },
      { text: "鼓励孩子尝试新事物", selected: false },
      { text: "多问问题来启发他/她", selected: false },
      { text: "鼓励孩子学习", selected: false }
    ]
  },
  onLoad: function(options) {
    console.log('man',options.id);
    if (options.id) {
      console.log('从参数中获取的智能体数据1:');
      this.setData({
        agentId: options.id
      });
      this.loadAgentInfo();
    } 
    else if (options.agentData) {
      try {
        const agentData = JSON.parse(decodeURIComponent(options.agentData));
        console.log('从参数中获取的智能体数据123:');
        // 更新智能体信息
        this.setData({
          agentId: agentData.id || '',
          agentInfo: {
            name: agentData.name || '',
            avatar: agentData.avatar || '',
            gender: agentData.gender || '',
            age: agentData.age || '',
            setting: agentData.setting || '',
            introduction: agentData.introduction || '',
            greeting: agentData.greeting || '',
            voice: agentData.voice || '',
            backgroundMusic: agentData.backgroundMusic || ''
          },
          selectedTags: JSON.parse(agentData.tags) || []
        });
        console.log('tags',this.data.selectedTags);
        console.log(agentData);
        // 更新预定义标签的选中状态
        if (agentData.tags && agentData.tags.length > 0) {
          const updatedTags = this.data.predefinedTags.map(tag => {
            if (agentData.tags.includes(tag.text)) {
              return { ...tag, selected: true };
            }
            return tag;
          });
          
          this.setData({
            predefinedTags: updatedTags
          });
        }
      } catch (error) {
        console.error('解析智能体数据失败:', error);
      }
    }
  },

  // 加载智能体信息
  loadAgentInfo: function() {
    // 从服务器获取智能体信息
    wx.showLoading({
      title: '加载中...'
    });
    
    wx.request({
      url: 'https://www.myia.fun/api/agents/user',
      method: 'GET',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success && res.data.agents) {
          // 查找当前编辑的智能体
          const agent = res.data.agents.find(a => a.agent_id.toString() === this.data.agentId);
          if (agent) {
            // 解析标签
            let tags = [];
            try {
              if (agent.tags) {
                console.log('原始标签:', agent.tags);
                tags = JSON.parse(agent.tags);
              }
            } catch (e) {
              console.error('解析标签失败:', e);
              tags = [];
            }
            
            // 更新智能体信息，字段映射
            this.setData({
              agentInfo: {
                name: agent.agent_name || '',
                avatar: agent.agent_avatar || '/images/chat.png',
                gender: agent.agent_sex || '',
                age: agent.age || '',
                setting: agent.agent_story || '',
                introduction: agent.agent_info || '',
                greeting: agent.agent_greeting || '',
                voice: agent.agent_voice || '',
                backgroundMusic: agent.agent_music || ''
              },
              selectedTags: tags
            });
            
            // 更新预定义标签的选中状态
            if (tags && tags.length > 0) {
              const updatedTags = this.data.predefinedTags.map(tag => {
                if (tags.includes(tag.text)) {
                  return { ...tag, selected: true };
                }
                return tag;
              });
              
              this.setData({
                predefinedTags: updatedTags
              });
            }
          }
        } else {
          wx.showToast({
            title: '获取智能体信息失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 修改智能体名称
  onNameChange: function(e) {
    this.setData({
      'agentInfo.name': e.detail.value
    });
  },

  // 修改智能体设定
  onSettingChange: function(e) {
    this.setData({
      'agentInfo.setting': e.detail.value
    });
  },

  // 修改对外简介
  onIntroductionChange: function(e) {
    this.setData({
      'agentInfo.introduction': e.detail.value
    });
  },

  // 修改开场白
  onGreetingChange: function(e) {
    this.setData({
      'agentInfo.greeting': e.detail.value
    });
  },

  // 选择头像
  chooseAvatar: function() {
    const that = this;
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: function(res) {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: sourceType,
          success: function(res) {
            that.setData({
              'agentInfo.avatar': res.tempFilePaths[0]
            });
          }
        });
      }
    });
  },
  
  // 修改年龄
  onAgeChange: function(e) {
    this.setData({
      'agentInfo.age': e.detail.value
    });
  },

  // 选择性别
  selectGender: function(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'agentInfo.gender': gender
    });
  },
  
  // 显示标签选择器
  showTagSelector: function() {
    this.setData({
      showTagSelector: true
    });
  },
  
  // 切换标签选中状态
  toggleTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const predefinedTags = this.data.predefinedTags;
    predefinedTags[index].selected = !predefinedTags[index].selected;
    
    this.setData({
      predefinedTags: predefinedTags
    });
  },
  
  // 应用选中的标签
  applyTags: function() {
    const selectedTags = this.data.predefinedTags
      .filter(tag => tag.selected)
      .map(tag => tag.text);
    
    this.setData({
      selectedTags: selectedTags,
      showTagSelector: false
    });
  },
  
  // 取消标签选择
  cancelTagSelection: function() {
    this.setData({
      showTagSelector: false
    });
  },
  
  // 移除已选标签
  removeTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const selectedTags = this.data.selectedTags;
    let predefinedTags = [...this.data.predefinedTags];

    // 获取要移除的标签文本
    const removedTagText = selectedTags[index];

    selectedTags.splice(index, 1);
    
    // 同时更新预定义标签的选中状态
    predefinedTags = predefinedTags.map(tag => {
      if (tag.text === removedTagText) {
        return { ...tag, selected: false };
      }
      return tag;
    });
    
    this.setData({
      selectedTags: selectedTags,
      predefinedTags: predefinedTags
    });
  },

  // 根据操作激活 显示自定义标签输入框
  showCustomTagInput: function() {
    this.setData({
      showCustomTagInput: true,
      customTag: ''
    });
  },

  // 新增: 输入自定义标签
  onCustomTagInput: function(e) {
    this.setData({
      customTag: e.detail.value
    });
  },

  // 新增: 添加自定义标签
  addCustomTag: function() {
    const customTag = this.data.customTag.trim();
    if (customTag) {
      // 添加到预定义标签列表
      const newTag = {
        text: customTag,
        selected: true,
        custom: true // 标记为自定义标签
      };

      const predefinedTags = [...this.data.predefinedTags, newTag];

      this.setData({
        predefinedTags: predefinedTags,
        showCustomTagInput: false,
        customTag: ''
      });
    }
  },

  // 新增: 编辑标签
  editTag: function(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      editingTagIndex: index,
      customTag: this.data.predefinedTags[index].text
    });
  },

  // 新增: 保存编辑后的标签
  saveTagEdit: function() {
    const editedText = this.data.customTag.trim();
    if (editedText && this.data.editingTagIndex >= 0) {
      const predefinedTags = this.data.predefinedTags;
      predefinedTags[this.data.editingTagIndex].text = editedText;

      this.setData({
        predefinedTags: predefinedTags,
        editingTagIndex: -1,
        customTag: ''
      });
    }
  },

  // 新增: 删除标签
  deleteTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const predefinedTags = this.data.predefinedTags.filter((_, i) => i !== index);

    this.setData({
      predefinedTags: predefinedTags
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 添加音色
  addVoice: function() {
    wx.showToast({
      title: '音色选择功能开发中',
      icon: 'none'
    });
  },

  // 选择背景音乐
  selectMusic: function() {
    wx.showToast({
      title: '音乐选择功能开发中',
      icon: 'none'
    });
  },
  
  // 保存设置
  saveSettings: function() {
    // 验证输入
    if (!this.data.agentInfo.name) {
      wx.showToast({
        title: '请输入智能体名称',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.agentInfo.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.agentInfo.setting) {
      wx.showToast({
        title: '请输入智能体设定',
        icon: 'none'
      });
      return;
    }
    
    if (!this.data.agentInfo.introduction) {
      wx.showToast({
        title: '请输入对外简介',
        icon: 'none'
      });
      return;
    }
    
    // 将修改后的信息保存到服务器
    wx.showLoading({
      title: '保存中...'
    });
    
    // 准备要更新的数据，字段映射
    const agentData = {
      agent_id: this.data.agentId,
      agent_name: this.data.agentInfo.name,
      agent_image: this.data.agentInfo.avatar || '/images/chat.png',
      agent_sex: this.data.agentInfo.gender,
      agent_age: this.data.agentInfo.age,
      agent_story: this.data.agentInfo.setting,
      agent_intro: this.data.agentInfo.introduction,
      agent_greeting: this.data.agentInfo.greeting,
      agent_voice: this.data.agentInfo.voice,
      agent_music: this.data.agentInfo.backgroundMusic,
      agent_tags: JSON.stringify(this.data.selectedTags)
    };
    
    // 发送更新请求
    wx.request({
      url: 'https://www.myia.fun/api/agents/update',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        ...agentData
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          wx.showToast({
            title: '设置已保存',
            icon: 'success',
            duration: 2000,
            success: function() {
              setTimeout(function() {
                wx.navigateBack();
              }, 2000);
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
  
});