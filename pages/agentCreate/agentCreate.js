// agentCreate.js
Page({
  data: {
    agentInfo: {
      name: '',
      avatar: '',
      gender: '',
      age: '',
      setting: '',
      introduction: '',
      greeting: '',
      voice: '',
      backgroundMusic: ''
    },
    selectedTags: [],
    showAdvancedSettings: false,
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
    // 页面加载时的初始化逻辑
    // 检查是否有传入的智能体数据
    if (options.agentData) {
      try {
        const agentData = JSON.parse(decodeURIComponent(options.agentData));
        let real_tags = [];
        try {
          real_tags = JSON.parse(agentData.tags); 
        }
        catch (e) {
          real_tags = [agentData.tags]; 
        }
        console.log('real_tags:', real_tags);
        // 更新智能体信息
        this.setData({
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
          selectedTags: real_tags || []
        });
        
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

  // 自动生成人设
  autoGenerate: function() {
    wx.showToast({
      title: '自动生成功能开发中',
      icon: 'none'
    });
  },

  // 更新设定
  updateSetting: function() {
    wx.showToast({
      title: '设定已更新',
      icon: 'success'
    });
  },

  // 更新简介
  updateIntro: function() {
    wx.showToast({
      title: '简介已更新',
      icon: 'success'
    });
  },

  // 切换高级设置
  toggleAdvancedSettings: function() {
    this.setData({
      showAdvancedSettings: !this.data.showAdvancedSettings
    });
  },

  // 预览智能体
  previewAgent: function() {
    if (!this.validateInput()) return;
    
    wx.showToast({
      title: '预览功能开发中',
      icon: 'none'
    });
  },

  // 验证输入
  validateInput: function() {
    if (!this.data.agentInfo.name) {
      wx.showToast({
        title: '请输入智能体昵称',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.agentInfo.gender) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.agentInfo.age) {
      wx.showToast({
        title: '请输入年龄',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.agentInfo.setting) {
      wx.showToast({
        title: '请填写智能体设定',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.agentInfo.introduction) {
      wx.showToast({
        title: '请填写对外简介',
        icon: 'none'
      });
      return false;
    }

    if (!this.data.agentInfo.greeting) {
      wx.showToast({
        title: '请填写开场白',
        icon: 'none'
      });
      return false;
    }

    return true;
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
    
    this.setData({
      [`predefinedTags[${index}].selected`]: selected
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
  
  // 创建智能体
  createAgent: function() {
    if (!this.validateInput()) return;

    // 显示加载提示
    wx.showLoading({
      title: '创建中...',
    });
    
    // 获取选中的标签
    const selectedTags = this.data.selectedTags;
      
    // 准备智能体数据
    const agentData = {
      agent_name: this.data.agentInfo.name,
      agent_avatar: this.data.agentInfo.avatar || '/images/chat.png',
      agent_info: this.data.agentInfo.introduction,
      gender: this.data.agentInfo.gender,
      story: this.data.agentInfo.setting,
      age: this.data.agentInfo.age,
      greeting: this.data.agentInfo.greeting,
      tags: JSON.stringify(this.data.selectedTags),
      voice: this.data.agentInfo.voice || ''
    };

    // 将智能体信息保存到服务器
    const app = getApp();
    app.createAgent(agentData, (res) => {
      wx.hideLoading();
      
      if (res.success) {
        wx.showToast({
          title: '创建成功',
          icon: 'success',
          duration: 2000
        });
        
        // 创建成功后返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      } else {
        wx.showToast({
          title: res.message || '创建失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
    
    //原始实现，替换为app.js中的方法
    wx.request({
      url: 'https://www.myia.fun/api/agents/create',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        name: this.data.agentInfo.name,
        avatar: this.data.agentInfo.avatar || '/images/chat.png',
        gender: this.data.agentInfo.gender,
        setting: this.data.agentInfo.setting,
        introduction: this.data.agentInfo.introduction,
        age: this.data.agentInfo.age,
        tags: JSON.stringify(this.data.selectedTags), // 传递选中的标签数组
        greeting: this.data.agentInfo.greeting,
        voice: this.data.agentInfo.voice,
        backgroundMusic: this.data.agentInfo.backgroundMusic
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          // 保存成功后返回上一页
          wx.showToast({
            title: '创建成功',
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
            title: res.data.message || '创建失败',
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
  
  // 应用选中的标签到智能体设定中
  applyTags: function() {
    const selectedTags = this.data.predefinedTags
      .filter(tag => tag.selected)
      .map(tag => tag.text);
    
    if (selectedTags.length > 0) {
      const tagText = selectedTags.join('\n');
      let currentSetting = this.data.agentInfo.setting || '';
      
      // 如果当前设定不为空，添加换行
      if (currentSetting && !currentSetting.endsWith('\n')) {
        currentSetting += '\n\n';
      }
      
      // 添加标签到设定中
      currentSetting += tagText;
      
      this.setData({
        'agentInfo.setting': currentSetting,
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
