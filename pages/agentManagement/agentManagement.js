// pages/agentManagement/agentManagement.js
Page({
  data: {
    agentList: [],
    showEditModal: false,
    showDeleteConfirm: false,
    currentAgent: {
      id: '',
      name: '',
      description: '',
      avatar: ''
    },
    deleteAgentId: ''
  },

  onLoad: function (options) {
    // 加载智能体列表
    this.loadAgentList();
  },

  // 加载智能体列表
  loadAgentList: function() {
    // 模拟数据，实际应用中应该从服务器或本地存储获取
    const mockAgents = [
      { id: 'agent001', name: '学习助手', description: '帮助孩子学习和解答问题的智能助手', avatar: '/images/chat.png' },
      { id: 'agent002', name: '故事大王', description: '可以讲述各种有趣故事的智能体', avatar: '/images/chat.png' },
      { id: 'agent003', name: '数学老师', description: '专注于数学教学和解题的智能体', avatar: '/images/chat.png' }
    ];
    
    this.setData({
      agentList: mockAgents
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 创建新智能体
  createNewAgent: function() {
    wx.navigateTo({
      url: '/pages/agentCreate/agentCreate',
    });
  },

  // 编辑智能体
  editAgent: function(e) {
    const agentId = e.currentTarget.dataset.id;
    const agent = this.data.agentList.find(item => item.id === agentId);
    
    if (agent) {
      this.setData({
        showEditModal: true,
        currentAgent: { ...agent }
      });
    }
  },

  // 删除智能体
  deleteAgent: function(e) {
    const agentId = e.currentTarget.dataset.id;
    const agent = this.data.agentList.find(item => item.id === agentId);
    
    if (agent) {
      this.setData({
        showDeleteConfirm: true,
        currentAgent: { ...agent },
        deleteAgentId: agentId
      });
    }
  },

  // 关闭编辑弹窗
  closeModal: function() {
    this.setData({
      showEditModal: false
    });
  },

  // 关闭删除确认弹窗
  closeDeleteConfirm: function() {
    this.setData({
      showDeleteConfirm: false
    });
  },

  // 输入智能体名称
  inputAgentName: function(e) {
    this.setData({
      'currentAgent.name': e.detail.value
    });
  },

  // 输入智能体描述
  inputAgentDescription: function(e) {
    this.setData({
      'currentAgent.description': e.detail.value
    });
  },

  // 确认编辑智能体
  confirmEditAgent: function() {
    const { id, name, description } = this.data.currentAgent;
    
    if (!name) {
      wx.showToast({
        title: '请填写智能体名称',
        icon: 'none'
      });
      return;
    }
    
    // 更新智能体信息
    const agentList = this.data.agentList.map(agent => {
      if (agent.id === id) {
        return { ...agent, name, description };
      }
      return agent;
    });
    
    this.setData({
      agentList,
      showEditModal: false
    });
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 确认删除智能体
  confirmDeleteAgent: function() {
    const agentId = this.data.deleteAgentId;
    
    // 从列表中移除智能体
    const agentList = this.data.agentList.filter(agent => agent.id !== agentId);
    
    this.setData({
      agentList,
      showDeleteConfirm: false
    });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  }
})