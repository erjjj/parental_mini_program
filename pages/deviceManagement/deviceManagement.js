// pages/deviceManagement/deviceManagement.js
Page({
  data: {
    deviceList: [],
    showAddDeviceModal: false,
    newDevice: {
      id: '',
      name: '',
      isConnected: false
    }
  },

  onLoad: function (options) {
    // 加载设备列表
    this.loadDeviceList();
  },

  // 加载设备列表
  loadDeviceList: function() {
    // 模拟数据，实际应用中应该从服务器或本地存储获取
    const mockDevices = [
      { id: 'dev001', name: '我的手机', icon: '📱', isConnected: true },
      { id: 'dev002', name: '平板电脑', icon: '💻', isConnected: false },
      { id: 'dev003', name: '家庭电脑', icon: '🖥️', isConnected: false }
    ];
    
    this.setData({
      deviceList: mockDevices
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 切换设备连接状态
  toggleConnection: function(e) {
    const deviceId = e.currentTarget.dataset.id;
    const currentStatus = e.currentTarget.dataset.status;
    
    // 更新设备连接状态
    const deviceList = this.data.deviceList.map(device => {
      if (device.id === deviceId) {
        return { ...device, isConnected: !currentStatus };
      }
      return device;
    });
    
    this.setData({ deviceList });
    
    // 提示用户
    wx.showToast({
      title: currentStatus ? '已断开连接' : '已连接',
      icon: 'success'
    });
  },

  // 解除设备绑定
  unbindDevice: function(e) {
    const deviceId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '解除绑定',
      content: '确定要解除此设备的绑定吗？',
      success: (res) => {
        if (res.confirm) {
          // 从列表中移除设备
          const deviceList = this.data.deviceList.filter(device => device.id !== deviceId);
          this.setData({ deviceList });
          
          wx.showToast({
            title: '已解除绑定',
            icon: 'success'
          });
        }
      }
    });
  },

  // 显示添加设备弹窗
  addDevice: function() {
    this.setData({
      showAddDeviceModal: true,
      newDevice: {
        id: '',
        name: '',
        isConnected: false
      }
    });
  },

  // 关闭弹窗
  closeModal: function() {
    this.setData({
      showAddDeviceModal: false
    });
  },

  // 输入设备ID
  inputDeviceId: function(e) {
    this.setData({
      'newDevice.id': e.detail.value
    });
  },

  // 输入设备名称
  inputDeviceName: function(e) {
    this.setData({
      'newDevice.name': e.detail.value
    });
  },

  // 确认添加设备
  confirmAddDevice: function() {
    const { id, name } = this.data.newDevice;
    
    if (!id || !name) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }
    
    // 检查设备ID是否已存在
    const isExist = this.data.deviceList.some(device => device.id === id);
    if (isExist) {
      wx.showToast({
        title: '设备ID已存在',
        icon: 'none'
      });
      return;
    }
    
    // 添加新设备
    const newDevice = {
      id,
      name,
      icon: '📱',
      isConnected: false
    };
    
    const deviceList = [...this.data.deviceList, newDevice];
    
    this.setData({
      deviceList,
      showAddDeviceModal: false
    });
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  }
})