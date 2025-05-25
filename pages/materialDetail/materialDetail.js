// pages/materialDetail/materialDetail.js
const app = getApp()

Page({
  data: {
    material: null,
    relatedMaterials: [],
    isPlaying: false,
    audioProgress: 0,
    currentTime: '00:00',
    duration: '00:00',
    audioContext: null
  },
  
  onLoad: function (options) {
    const id = options.id
    this.loadMaterialDetail(id)
    this.loadRelatedMaterials(id)
    
    // 创建音频上下文
    this.audioContext = wx.createInnerAudioContext()
    this.audioContext.onPlay(() => {
      this.setData({ isPlaying: true })
    })
    this.audioContext.onPause(() => {
      this.setData({ isPlaying: false })
    })
    this.audioContext.onTimeUpdate(() => {
      const currentTime = this.formatTime(this.audioContext.currentTime)
      const duration = this.formatTime(this.audioContext.duration)
      const progress = this.audioContext.currentTime / this.audioContext.duration * 100
      
      this.setData({
        currentTime,
        duration,
        audioProgress: progress
      })
    })
  },
  
  onUnload: function() {
    // 页面卸载时停止音频
    if (this.audioContext) {
      this.audioContext.stop()
    }
  },
  
  loadMaterialDetail: function(id) {
    wx.showLoading({
      title: '加载中...',
    })
    
    wx.request({
      url: `https://www.myia.fun/api/materials/${id}`,
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            material: res.data.material
          })
          
          // 如果是音频，设置音频源
          if (res.data.material.fileType === 'audio' && res.data.material.fileUrl) {
            this.audioContext.src = res.data.material.fileUrl
          }
        } else {
          wx.showToast({
            title: '获取材料失败',
            icon: 'none'
          })
        }
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  loadRelatedMaterials: function(id) {
    wx.request({
      url: `https://www.myia.fun/api/materials/related/${id}`,
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            relatedMaterials: res.data.materials
          })
        }
      }
    })
  },
  
  navigateBack: function() {
    wx.navigateBack()
  },
  
  audioPlay: function() {
    if (this.data.isPlaying) {
      this.audioContext.pause()
    } else {
      this.audioContext.play()
    }
  },
  
  audioSeek: function(e) {
    const position = e.detail.value * this.audioContext.duration / 100
    this.audioContext.seek(position)
  },
  
  downloadFile: function() {
    if (!this.data.material.fileUrl) {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '下载中...',
    })
    
    wx.downloadFile({
      url: this.data.material.fileUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          // 保存文件到本地
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (result) => {
              wx.hideLoading()
              wx.showToast({
                title: '下载成功',
              })
              
              // 打开文件
              wx.openDocument({
                filePath: result.savedFilePath,
                success: function() {
                  console.log('打开文件成功')
                },
                fail: function() {
                  wx.showToast({
                    title: '无法打开此类型文件',
                    icon: 'none'
                  })
                }
              })
            },
            fail: () => {
              wx.hideLoading()
              wx.showToast({
                title: '保存文件失败',
                icon: 'none'
              })
            }
          })
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
  },
  
  aiLearnMaterial: function() {
    if (!this.data.material) return
    
    wx.showLoading({
      title: 'AI正在学习...',
    })
    
    wx.request({
      url: 'https://www.myia.fun/api/ai/learn',
      method: 'POST',
      data: {
        materialId: this.data.material.id
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token')),
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: 'AI已学习此材料',
          })
          
          // 更新材料状态
          let material = this.data.material
          material.status = '已学习'
          this.setData({
            material: material
          })
        } else {
          wx.showToast({
            title: res.data.message || 'AI学习失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  aiExplainMaterial: function() {
    if (!this.data.material) return
    
    wx.navigateTo({
      url: `/pages/aiExplain/aiExplain?materialId=${this.data.material.id}&title=${encodeURIComponent(this.data.material.title)}`
    })
  },
  
  viewRelatedMaterial: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/materialDetail/materialDetail?id=${id}`
    })
  },
  
  formatTime: function(seconds) {
    seconds = Math.floor(seconds)
    let minutes = Math.floor(seconds / 60)
    seconds = seconds % 60
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  },
  
  getColorByType: function(fileType) {
    switch(fileType) {
      case 'pdf':
        return '#f56c6c'
      case 'word':
        return '#409eff'
      case 'text':
        return '#67c23a'
      case 'image':
        return '#e6a23c'
      case 'audio':
        return '#9c27b0'
      case 'video':
        return '#ff9800'
      default:
        return '#909399'
    }
  },
  
  getIconByType: function(fileType) {
    switch(fileType) {
      case 'pdf':
        return '📕'
      case 'word':
        return '📘'
      case 'text':
        return '📝'
      case 'image':
        return '🖼️'
      case 'audio':
        return '🎵'
      case 'video':
        return '🎬'
      default:
        return '📄'
    }
  }
})