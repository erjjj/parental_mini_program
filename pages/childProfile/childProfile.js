// pages/childProfile/childProfile.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    childInfo: null,
    isLoggedIn: false,
    formData: {
      name: '',
      age: '',
      gender: '',
      englishLevel: '',
      interests: ''
    },
    genderArray: ['男', '女']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus()
    this.getChildInfo()
  },

  checkLoginStatus: function() {
    // 检查本地存储中是否有登录token
    const token = wx.getStorageSync('token')
    if (token) {
      this.setData({
        isLoggedIn: true
      })
    } else {
      this.setData({
        isLoggedIn: false
      })
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index',
        })
      }, 1000)
    }
  },
  
  getChildInfo: function() {
    if (!this.data.isLoggedIn) return;
    
    // 显示加载中
    wx.showLoading({
      title: '加载中...',
    })
    
    // 先检查全局数据中是否有孩子信息
    if (app.globalData.childInfo) {
      this.setData({
        childInfo: app.globalData.childInfo,
        formData: {
          name: app.globalData.childInfo.name || '',
          age: app.globalData.childInfo.age || '',
          gender: app.globalData.childInfo.gender || '',
          englishLevel: app.globalData.childInfo.englishLevel || '',
          interests: app.globalData.childInfo.interests || ''
        }
      })
      wx.hideLoading()
      return
    }
    
    // 从服务器获取孩子信息
    wx.request({
      url: 'http://localhost:3000/api/child/info',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.success && res.data.childInfo) {
          this.setData({
            childInfo: res.data.childInfo,
            formData: {
              name: res.data.childInfo.name || '',
              age: res.data.childInfo.age || '',
              gender: res.data.childInfo.gender || '',
              englishLevel: res.data.childInfo.englishLevel || '',
              interests: res.data.childInfo.interests || ''
            }
          })
          // 更新全局数据
          app.globalData.childInfo = res.data.childInfo
        } else {
          // 如果没有孩子信息，显示空表单
          this.setData({
            childInfo: null,
            formData: {
              name: '',
              age: '',
              gender: '',
              englishLevel: '',
              interests: ''
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },
  
  inputName: function(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },
  
  inputAge: function(e) {
    this.setData({
      'formData.age': e.detail.value
    })
  },
  
  inputEnglishLevel: function(e) {
    this.setData({
      'formData.englishLevel': e.detail.value
    })
  },
  
  inputInterests: function(e) {
    this.setData({
      'formData.interests': e.detail.value
    })
  },

  bindGenderChange: function(e) {
    this.setData({
      'formData.gender': this.data.genderArray[e.detail.value]
    })
  },
  
  goBack: function() {
    wx.navigateBack()
  },
  
  saveChildInfo: function() {
    if (!this.data.isLoggedIn) return;
    
    // 表单验证
    if (!this.data.formData.name || !this.data.formData.age || !this.data.formData.gender) {
      wx.showToast({
        title: '请填写必要信息',
        icon: 'none'
      })
      return;
    }
    
    wx.showLoading({
      title: '保存中...',
    })
    
    // 尝试发送请求保存孩子信息
    wx.request({
      url: 'http://localhost:3000/api/child/update',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token')),
        'Content-Type': 'application/json'
      },
      data: this.data.formData,
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.success) {
          // 更新全局数据
          app.globalData.childInfo = res.data.childInfo || this.data.formData
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          wx.showToast({
            title: res.data.message || '保存失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
    })
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkLoginStatus()
    this.getChildInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})