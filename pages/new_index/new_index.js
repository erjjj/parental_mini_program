// new_index.js
const app = getApp();

Page({
  data: {
    showDropdown: false,
    agentList: [],
    currentAgent: {},
    statusText: '',
    statusColor: '',
    statusValue: '',
    voiceList: [
      {
        id: 'v1',
        name: 'NEUTRAL',
        avatar: '/images/chat.png',
        description: 'Oh, yes! I can speak English, and I love to sing songs',
        sample: ''
      },
      {
        id: 'v2',
        name: '标准女声',
        avatar: '/images/chat.png',
        description: '清晰自然的标准女声',
        sample: ''
      },
      {
        id: 'v3',
        name: '温柔女声',
        avatar: '/images/chat.png',
        description: '柔和亲切的女声音色',
        sample: ''
      },
      {
        id: 'v4',
        name: '标准男声',
        avatar: '/images/chat.png',
        description: '清晰稳重的标准男声',
        sample: ''
      },
      {
        id: 'v5',
        name: '童声',
        avatar: '/images/chat.png',
        description: '活泼可爱的儿童声音',
        sample: ''
      }
    ],
    currentVoice: {},
    isLoggedIn: false,
    loginBtnVisible: false
  },

  onLoad: function() {
    // 检查登录状态
    this.checkLoginStatus();
    
    // 检查是否需要显示授权对话框
    if (app.globalData.needAuth) {
      this.showAuthDialog();
    }
  },
  
  // 显示授权对话框
  showAuthDialog: function() {
    wx.showModal({
      title: '授权提示',
      content: '为了提供更好的服务，我们需要获取您的用户信息，是否授权？',
      confirmText: '接受',
      cancelText: '拒绝',
      success: (res) => {
        if (res.confirm) {
          // 用户点击接受，调用获取用户信息接口
          this.handleUserAuth();
        } else {
          // 用户点击拒绝
          wx.showToast({
            title: '您已拒绝授权，部分功能可能无法使用',
            icon: 'none',
            duration: 2000
          });
        }
        // 无论用户是否授权，都将needAuth设为false，避免重复弹窗
        app.globalData.needAuth = false;
      }
    });
  },
  
  // 处理用户授权
  handleUserAuth: function() {
    // 显示加载中
    wx.showLoading({
      title: '登录中...',
    });
    
    // 调用微信获取用户信息接口
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        // 保存用户信息
        const userInfo = res.userInfo;
        wx.setStorageSync('wxUserInfo', userInfo);
        
        // 调用微信登录接口获取code
        wx.login({
          success: loginRes => {
            if (loginRes.code) {
              // 发送code和用户信息到后台换取token
              wx.request({
                url: 'https://www.myia.fun/api/wx-login',
                method: 'POST',
                data: {
                  code: loginRes.code,
                  userInfo: userInfo
                },
                success: (result) => {
                  if (result.data.success) {
                    // 登录成功，保存token和用户信息
                    wx.setStorageSync('token', result.data.token);
                    app.globalData.token = result.data.token;
                    app.globalData.userInfo = result.data.userInfo;
                    
                    this.setData({
                      isLoggedIn: true,
                      loginBtnVisible: false,
                      userInfo: result.data.userInfo
                    });
                    
                    // 获取用户绑定的智能体列表
                    this.getUserAgents();
                    
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success'
                    });
                  } else {
                    wx.showToast({
                      title: result.data.message || '微信登录失败',
                      icon: 'none'
                    });
                  }
                },
                fail: () => {
                  wx.showToast({
                    title: '网络错误，请重试',
                    icon: 'none'
                  });
                },
                complete: () => {
                  wx.hideLoading();
                }
              });
            } else {
              wx.hideLoading();
              wx.showToast({
                title: '微信登录失败',
                icon: 'none'
              });
            }
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({
              title: '微信登录失败',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '您已拒绝授权，部分功能可能无法使用',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  onShow: function() {
    // 页面显示时再次检查登录状态
    this.checkLoginStatus();
  },
  
  checkLoginStatus: function() {
    // 检查本地存储中是否有登录token
    const token = wx.getStorageSync('token');
    if (token) {
      // 使用app.js中的方法验证token有效性
      const app = getApp();
      app.verifyToken(token);
      
      // 检查全局数据中的token
      if (app.globalData.token) {
        this.setData({
          isLoggedIn: true,
          loginBtnVisible: false
        });
        // 获取用户绑定的智能体列表
        this.getUserAgents();
      } else {
        this.setData({
          isLoggedIn: false,
          loginBtnVisible: true
        });
        // 获取默认智能体列表
        this.getDefaultAgents();
      }
    } else {
      this.setData({
        isLoggedIn: false,
        loginBtnVisible: true
      });
      // 获取默认智能体列表
      this.getDefaultAgents();
    }
  },
  
  // 获取用户绑定的智能体列表
  getUserAgents: function() {
    const app = getApp();
    app.getUserAgents((res) => {
      if (res.success && res.agents && res.agents.length > 0) {
        // 格式化智能体数据
        const formattedAgents = res.agents.map(agent => ({
          id: agent.agent_id.toString(),
          name: agent.agent_name || '未命名智能体',
          avatar: agent.agent_image || '/images/chat.png',
          description: agent.agent_intro || '暂无描述',
          tags: agent.agent_tags || '',
          age: agent.agent_age || '',
          gender: agent.agent_sex || '',
          story: agent.agent_story || '',
          status: 'online', // 默认在线状态
          statusValue: 'normal'
        }));
        console.log(formattedAgents[0].id);
        this.setData({
          agentList: formattedAgents,
          currentAgent: formattedAgents[0]
        });
        
        this.updateStatusInfo();
      } else {
        // 如果用户没有绑定智能体，获取默认智能体
        this.getDefaultAgents();
      }
    });
  },
  
  
  // 获取默认智能体列表（从our_agent表）
  getDefaultAgents: function() {
    const app = getApp();
    app.getOurAgents((res) => {
      if (res.success && res.agents && res.agents.length > 0) {
        // 使用服务器返回的智能体数据
        const formattedAgents = res.agents.map(agent => ({
          id: agent.id || agent.agent_id.toString(),
          name: agent.name || agent.agent_name || '未命名智能体',
          avatar: agent.avatar || agent.agent_avatar || '/images/chat.png',
          description: agent.description || agent.agent_info || '暂无描述',
          tags: agent.tags || [],
          age: agent.age || '',
          gender: agent.gender || '',
          story: agent.story || '',
          status: 'online',
          statusValue: 'normal'
        }));
        
        this.setData({
          agentList: formattedAgents,
          currentAgent: formattedAgents[0]
        });
      } 
      else {
        // 如果API请求失败，使用默认数据
        const defaultAgents = [
            {
              id: 'db1',
              name: '雪宝',
              avatar: '/images/chat.png',
              description: '雪宝是一个由魔法创造的雪人，他活泼可爱，充满好奇心。他总是对世界充满了惊奇，喜欢探索新事物。',
              tags: ['好奇', '淘气', '善良'],
              age: '6',
              gender: '无',
              story: '雪宝是由艾莎女王用魔法创造的雪人，拥有神奇的生命。他天真无邪，对世界充满好奇。雪宝最喜欢温暖的拥抱，尽管这对雪人来说有点危险。他总是乐于助人，愿意为朋友付出一切。在冬日王国的冒险中，雪宝展现了非凡的勇气和忠诚。',
              status: 'online',
              statusValue: 'normal'
            },
            {
              id: 'db2',
              name: '喜羊羊',
              avatar: '/images/chat.png',
              description: '喜羊羊，一位生活在草原上的小羊。他有着白色的绒毛和一双聪明的眼睛，是羊村的领袖和智多星。',
              tags: ['聪明', '勇敢', '领导力'],
              age: '8',
              gender: '男',
              story: '喜羊羊是青青草原上最聪明的羊，凭借智慧和勇气多次带领羊村抵抗灰太狼的入侵。他发明了许多奇妙的工具，解决了无数难题。虽然有时会有些自负，但在危急时刻总能挺身而出，保护伙伴们的安全。他的梦想是让羊村变得更加美好和安全。',
              status: 'online',
              statusValue: 'normal'
            }
          ];
          
          this.setData({
            agentList: defaultAgents,
            currentAgent: defaultAgents[0]
          });
      }
      this.updateStatusInfo();
      fail:() => {
        // 如果API请求失败，使用默认数据
        const defaultAgents = [
          {
            id: 'db1',
            name: '雪宝',
            avatar: '/images/chat.png',
            description: '雪宝是一个由魔法创造的雪人，他活泼可爱，充满好奇心。他总是对世界充满了惊奇，喜欢探索新事物。',
            tags: ['好奇', '淘气', '善良'],
            age: '6',
            gender: '无',
            story: '雪宝是由艾莎女王用魔法创造的雪人，拥有神奇的生命。他天真无邪，对世界充满好奇。雪宝最喜欢温暖的拥抱，尽管这对雪人来说有点危险。他总是乐于助人，愿意为朋友付出一切。在冬日王国的冒险中，雪宝展现了非凡的勇气和忠诚。',
            status: 'online',
            statusValue: 'normal'
          },
          {
            id: 'db2',
            name: '喜羊羊',
            avatar: '/images/chat.png',
            description: '喜羊羊，一位生活在草原上的小羊。他有着白色的绒毛和一双聪明的眼睛，是羊村的领袖和智多星。',
            tags: ['聪明', '勇敢', '领导力'],
            age: '8',
            gender: '男',
            story: '喜羊羊是青青草原上最聪明的羊，凭借智慧和勇气多次带领羊村抵抗灰太狼的入侵。他发明了许多奇妙的工具，解决了无数难题。虽然有时会有些自负，但在危急时刻总能挺身而出，保护伙伴们的安全。他的梦想是让羊村变得更加美好和安全。',
            status: 'online',
            statusValue: 'normal'
          }
        ];
        
        this.setData({
          agentList: defaultAgents,
          currentAgent: defaultAgents[0]
        });
        
        this.updateStatusInfo();
      }
    });
  },
  
  // 切换下拉菜单显示状态
  toggleDropdown: function() {
    this.setData({
      showDropdown: !this.data.showDropdown
    });
  },
  
  // 搜索输入处理
  onSearchInput: function(e) {
    const keyword = e.detail.value.toLowerCase();
    if (keyword) {
      // 如果有输入内容，显示下拉菜单并过滤结果
      const filteredAgents = this.data.agentList.filter(agent => 
        agent.name.toLowerCase().includes(keyword)
      );
      
      this.setData({
        showDropdown: true,
        filteredAgentList: filteredAgents
      });
    } else {
      // 如果输入为空，隐藏下拉菜单
      this.setData({
        showDropdown: false
      });
    }
  },
  
  // 选择智能体
  selectAgent: function(e) {
    const agentId = e.currentTarget.dataset.id;
    const selectedAgent = this.data.agentList.find(agent => agent.id === agentId);
    
    if (selectedAgent) {
      this.setData({
        currentAgent: selectedAgent,
        showDropdown: false
      });
      
      this.updateStatusInfo();
    }
  },
  
  // 添加新智能体
  addNewAgent: function() {
    // 如果未登录，先跳转到登录页面
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/settings/settings'
      });
      return;
    }
    
    // 跳转到选择智能体形象页面
    wx.navigateTo({
      url: '/pages/new_agent/new_agent'
    });
  },
  
  // 跳转到登录页面
  navigateToLogin: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },
  
  // 前往设置页面
  goToSettings: function() {
    // 准备智能体数据
    const agentData = {
      id: this.data.currentAgent.id,
      name: this.data.currentAgent.name,
      avatar: this.data.currentAgent.avatar || '/images/chat.png',
      gender: this.data.currentAgent.gender || '',
      age: this.data.currentAgent.age || '',
      setting: this.data.currentAgent.story || '',
      introduction: this.data.currentAgent.description || '',
      greeting: this.data.currentAgent.greeting || '你好，很高兴认识你！',
      tags: this.data.currentAgent.tags || []
    };
    console.log('转向设置',agentData.id);
    // 跳转到设置页面并传递智能体信息
    wx.navigateTo({
      url: '/pages/agentSettings/agentSettings?agentData=' + encodeURIComponent(JSON.stringify(agentData))
    });
  },
  
  // 更新状态信息
  updateStatusInfo: function() {
    const agent = this.data.currentAgent;
    let statusText = '';
    let statusColor = '';
    
    switch(agent.status) {
      case 'online':
        statusText = '在线';
        statusColor = '#00ff00'; // 绿色
        break;
      case 'standby':
        statusText = '待机';
        statusColor = '#ffcc00'; // 黄色
        break;
      case 'offline':
        statusText = '离线';
        statusColor = '#ff0000'; // 红色
        break;
      default:
        statusText = '未知';
        statusColor = '#999999'; // 灰色
    }
    
    this.setData({
      statusText: statusText,
      statusColor: statusColor,
      statusValue: agent.statusValue
    });
  },
  
  // 选择音色
  selectVoice: function(e) {
    const voiceId = e.currentTarget.dataset.id;
    const selectedVoice = this.data.voiceList.find(voice => voice.id === voiceId);
    
    if (selectedVoice) {
      this.setData({
        currentVoice: selectedVoice
      });
      
      // 可以在这里添加选择音色后的逻辑，如保存设置等
    }
  },
  
  // 播放音色示例
  playVoiceSample: function(e) {
    const voiceId = e.currentTarget.dataset.id;
    const selectedVoice = this.data.voiceList.find(voice => voice.id === voiceId);
    
    if (selectedVoice && selectedVoice.sample) {
      // 播放示例音频
      const innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.src = selectedVoice.sample;
      innerAudioContext.play();
    } else {
      // 如果没有示例音频，可以提示用户
      wx.showToast({
        title: '暂无示例音频',
        icon: 'none'
      });
    }
  }
});