// new_agent.js
const app = getApp();

Page({
  data: {
    agentList: [],
    selectedAgentId: '',
    selectedAgent: null,
    isLoading: true,
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
      }
    ],
    currentVoice: null
  },

  onLoad: function() {
    // 页面加载时获取官方智能体列表
    this.getOurAgents();
  },
  
  // 获取官方智能体列表
  getOurAgents: function() {
    this.setData({
      isLoading: true
    });
    
    wx.request({
      url: 'https://www.myia.fun/api/our-agents',
      success: (res) => {
        if (res.data.success && res.data.agents && res.data.agents.length > 0) {
          this.setData({
            agentList: res.data.agents,
            isLoading: false
          });
        } else {
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
              story: '雪宝是由艾莎女王用魔法创造的雪人，拥有神奇的生命。他天真无邪，对世界充满好奇。雪宝最喜欢温暖的拥抱，尽管这对雪人来说有点危险。他总是乐于助人，愿意为朋友付出一切。在冬日王国的冒险中，雪宝展现了非凡的勇气和忠诚。'
            },
            {
              id: 'db2',
              name: '喜羊羊',
              avatar: '/images/chat.png',
              description: '喜羊羊，一位生活在草原上的小羊。他有着白色的绒毛和一双聪明的眼睛，是羊村的领袖和智多星。',
              tags: ['聪明', '勇敢', '领导力'],
              age: '8',
              gender: '男',
              story: '喜羊羊是青青草原上最聪明的羊，凭借智慧和勇气多次带领羊村抵抗灰太狼的入侵。他发明了许多奇妙的工具，解决了无数难题。虽然有时会有些自负，但在危急时刻总能挺身而出，保护伙伴们的安全。他的梦想是让羊村变得更加美好和安全。'
            }
          ];
          
          this.setData({
            agentList: defaultAgents,
            isLoading: false
          });
        }
      },
      fail: () => {
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
            story: '雪宝是由艾莎女王用魔法创造的雪人，拥有神奇的生命。他天真无邪，对世界充满好奇。雪宝最喜欢温暖的拥抱，尽管这对雪人来说有点危险。他总是乐于助人，愿意为朋友付出一切。在冬日王国的冒险中，雪宝展现了非凡的勇气和忠诚。'
          },
          {
            id: 'db2',
            name: '喜羊羊',
            avatar: '/images/chat.png',
            description: '喜羊羊，一位生活在草原上的小羊。他有着白色的绒毛和一双聪明的眼睛，是羊村的领袖和智多星。',
            tags: ['聪明', '勇敢', '领导力'],
            age: '8',
            gender: '男',
            story: '喜羊羊是青青草原上最聪明的羊，凭借智慧和勇气多次带领羊村抵抗灰太狼的入侵。他发明了许多奇妙的工具，解决了无数难题。虽然有时会有些自负，但在危急时刻总能挺身而出，保护伙伴们的安全。他的梦想是让羊村变得更加美好和安全。'
          }
        ];
        
        this.setData({
          agentList: defaultAgents,
          isLoading: false
        });
      }
    });
  },

  // 选择智能体
  selectAgent: function(e) {
    const agentId = e.currentTarget.dataset.id;
    
    this.setData({
      selectedAgentId: agentId
    });
    
    // 获取选中的智能体信息
    const selectedAgent = this.data.agentList.find(agent => agent.id === agentId);
    
    if (selectedAgent) {
      // 将智能体信息转换为agentCreate页面所需的格式
      const agentData = {
        id: selectedAgent.id,
        name: selectedAgent.name,
        avatar: selectedAgent.avatar || '/images/chat.png',
        gender: selectedAgent.gender || '',
        age: selectedAgent.age || '',
        setting: selectedAgent.story || '',
        introduction: selectedAgent.description || '',
        greeting: selectedAgent.greeting || '你好，很高兴认识你！',
        tags: selectedAgent.tags || []
      };
      
      // 跳转到agentCreate页面，传递智能体详细信息
      wx.navigateTo({
        url: '/pages/agentCreate/agentCreate?agentData=' + encodeURIComponent(JSON.stringify(agentData))
      });
    }
  },

  // 创建新角色
  createNewAgent: function() {
    // 跳转到创建新角色页面
    wx.navigateTo({
      url: '/pages/agentCreate/agentCreate'
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },
  
  // 接收从agent_info页面返回的选中智能体
  onShow: function() {
    if (this.data.selectedAgent) {
      // 如果有选中的智能体，可以进行后续处理
      console.log('选中的智能体:', this.data.selectedAgent);
      
      // 这里可以添加选中智能体后的逻辑，比如返回到上一页并传递数据
      const pages = getCurrentPages();
      if (pages.length > 1) {
        const prevPage = pages[pages.length - 2];
        // 将选中的智能体信息传递给上一页
        prevPage.setData({
          newAgent: this.data.selectedAgent
        });
        
        // 清空选中状态，避免重复处理
        this.setData({
          selectedAgent: null
        });
        
        wx.navigateBack();
      }
    }
  },
  
  // 选择音色
  selectVoice: function(e) {
    const voiceId = e.currentTarget.dataset.id;
    const selectedVoice = this.data.voiceList.find(voice => voice.id === voiceId);
    if (selectedVoice) {
      this.setData({
        currentVoice: selectedVoice
      });
    }
  },
  
  // 播放音色示例
  playVoiceSample: function(e) {
    const voiceId = e.currentTarget.dataset.id;
    const selectedVoice = this.data.voiceList.find(voice => voice.id === voiceId);
    
    if (selectedVoice && selectedVoice.sample) {
      const innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.src = selectedVoice.sample;
      innerAudioContext.play();
    } else {
      wx.showToast({
        title: '暂无示例音频',
        icon: 'none'
      });
    }
  }
});