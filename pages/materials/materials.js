// pages/materials/materials.js
const app = getApp()

Page({
  data: {
    materials: [],
    officialMaterials: [],
    loading: true,
    categories: ['故事', '歌曲', '单词', '对话', '其他'],
    selectedCategory: '全部',
    showUploadModal: false,
    showTextInputModal: false,
    showFileUploadModal: false,
    sortOrder: 'time', // 'time' 或 'name'
    searchKeyword: '',
    newMaterial: {
      title: '',
      category: '故事',
      description: '',
      content: '',
      filePath: '',
      fileName: '',
      fileSize: '',
      fileType: ''
    }
  },
  
  onLoad: function (options) {
    this.loadMaterials()
    this.loadOfficialMaterials()
  },
  
  onPullDownRefresh: function () {
    this.loadMaterials(() => {
      wx.stopPullDownRefresh()
    })
    this.loadOfficialMaterials()
  },
  
  loadMaterials: function (callback) {
    this.setData({ loading: true })
    
    wx.request({
      url: 'https://www.myia.fun/api/materials',
      data: {
        category: this.data.selectedCategory !== '全部' ? this.data.selectedCategory : '',
        keyword: this.data.searchKeyword,
        sortBy: this.data.sortOrder
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        if (res.data.success) {
          // 处理文件状态
          const materials = res.data.materials.map(item => {
            return {
              ...item,
              status: item.isLearned ? '已学习' : '待学习'
            }
          })
          
          this.setData({
            materials: materials,
            loading: false
          })
        }
      },
      complete: () => {
        this.setData({ loading: false })
        if (callback) callback()
      }
    })
  },
  
  loadOfficialMaterials: function() {
    wx.request({
      url: 'https://www.myia.fun/api/official-materials',
      data: {
        category: this.data.selectedCategory !== '全部' ? this.data.selectedCategory : '',
        limit: 10
      },
      success: (res) => {
        if (res.data.success) {
          this.setData({
            officialMaterials: res.data.materials
          })
        }
      }
    })
  },
  
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },
  
  onSearch: function() {
    this.loadMaterials()
  },
  
  changeCategory: function (e) {
    this.setData({
      selectedCategory: e.currentTarget.dataset.category
    })
    this.loadMaterials()
    this.loadOfficialMaterials()
  },
  
  toggleSortOrder: function() {
    const newOrder = this.data.sortOrder === 'time' ? 'name' : 'time'
    this.setData({
      sortOrder: newOrder
    })
    this.loadMaterials()
  },
  
  showUploadOptions: function () {
    this.setData({
      showUploadModal: true
    })
  },
  
  hideUploadModal: function () {
    this.setData({
      showUploadModal: false
    })
  },
  
  inputText: function() {
    this.hideUploadModal()
    this.setData({
      showTextInputModal: true,
      newMaterial: {
        title: '',
        category: '故事',
        content: '',
        description: '',
        fileType: 'text'
      }
    })
  },
  
  hideTextInputModal: function() {
    this.setData({
      showTextInputModal: false
    })
  },
  
  chooseFile: function () {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0]
        // 获取文件类型
        const fileType = this.getFileType(file.name)
        
        this.hideUploadModal()
        this.setData({
          showFileUploadModal: true,
          newMaterial: {
            title: file.name.split('.')[0], // 默认使用文件名作为标题
            category: this.getCategoryByFileType(fileType),
            description: '',
            filePath: file.path,
            fileName: file.name,
            fileSize: this.formatFileSize(file.size),
            fileType: fileType
          }
        })
      }
    })
  },
  
  hideFileUploadModal: function() {
    this.setData({
      showFileUploadModal: false
    })
  },
  
  chooseImage: function() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        const file = res.tempFiles[0]
        
        this.hideUploadModal()
        this.setData({
          showFileUploadModal: true,
          newMaterial: {
            title: '图片材料',
            category: '其他',
            description: '',
            filePath: file.path,
            fileName: '图片.jpg',
            fileSize: this.formatFileSize(file.size),
            fileType: 'image'
          }
        })
      }
    })
  },
  
  recordAudio: function() {
    // 实现录音功能
    wx.showToast({
      title: '录音功能开发中',
      icon: 'none'
    })
  },
  
  inputTitle: function (e) {
    this.setData({
      'newMaterial.title': e.detail.value
    })
  },
  
  selectCategory: function (e) {
    this.setData({
      'newMaterial.category': this.data.categories[e.detail.value]
    })
  },
  
  inputDescription: function (e) {
    this.setData({
      'newMaterial.description': e.detail.value
    })
  },
  
  inputContent: function(e) {
    this.setData({
      'newMaterial.content': e.detail.value
    })
  },
  
  saveTextMaterial: function() {
    if (!this.data.newMaterial.title) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.newMaterial.content) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '保存中...',
    })
    
    // 保存文本内容
    wx.request({
      url: 'https://www.myia.fun/api/materials/text',
      method: 'POST',
      data: {
        title: this.data.newMaterial.title,
        category: this.data.newMaterial.category,
        content: this.data.newMaterial.content
      },
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token')),
        'Content-Type': 'application/json'
      },
      success: (result) => {
        if (result.data.success) {
          wx.showToast({
            title: '保存成功',
          })
          this.hideTextInputModal()
          this.loadMaterials()
        } else {
          wx.showToast({
            title: result.data.message || '保存失败',
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
  
  uploadMaterial: function () {
    if (!this.data.newMaterial.title) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.newMaterial.filePath) {
      wx.showToast({
        title: '请选择文件',
        icon: 'none'
      })
      return
    }
    
    wx.showLoading({
      title: '上传中...',
    })
    
    // 先上传文件
    wx.uploadFile({
      url: 'https://www.myia.fun/api/upload',
      filePath: this.data.newMaterial.filePath,
      name: 'file',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.success) {
          // 文件上传成功后，保存材料信息
          wx.request({
            url: 'https://www.myia.fun/api/materials',
            method: 'POST',
            data: {
              title: this.data.newMaterial.title,
              category: this.data.newMaterial.category,
              description: this.data.newMaterial.description,
              fileUrl: data.fileUrl,
              fileName: this.data.newMaterial.fileName,
              fileType: this.data.newMaterial.fileType
            },
            header: {
              'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token')),
              'Content-Type': 'application/json'
            },
            success: (result) => {
              if (result.data.success) {
                wx.showToast({
                  title: '上传成功',
                })
                this.hideFileUploadModal()
                this.loadMaterials()
              } else {
                wx.showToast({
                  title: result.data.message || '保存失败',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '上传失败',
          icon: 'none'
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  
  deleteMaterial: function (e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个学习材料吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `https://www.myia.fun/api/materials/${id}`,
            method: 'DELETE',
            header: {
              'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
            },
            success: (result) => {
              if (result.data.success) {
                wx.showToast({
                  title: '删除成功',
                })
                this.loadMaterials()
              } else {
                wx.showToast({
                  title: result.data.message || '删除失败',
                  icon: 'none'
                })
              }
            }
          })
        }
      }
    })
  },
  
  editMaterial: function(e) {
    const id = e.currentTarget.dataset.id
    // 获取材料详情
    const material = this.data.materials.find(item => item.id === id)
    
    if (material) {
      if (material.fileType === 'text') {
        // 编辑文本内容
        this.setData({
          showTextInputModal: true,
          newMaterial: {
            id: material.id,
            title: material.title,
            category: material.category,
            content: material.content,
            fileType: 'text'
          }
        })
      } else {
        // 编辑文件信息
        this.setData({
          showFileUploadModal: true,
          newMaterial: {
            id: material.id,
            title: material.title,
            category: material.category,
            description: material.description,
            fileName: material.fileName,
            fileType: material.fileType,
            fileUrl: material.fileUrl
          }
        })
      }
    }
  },
  
  viewMaterialDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/materialDetail/materialDetail?id=${id}`
    })
  },
  
  viewOfficialDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/officialMaterial/officialMaterial?id=${id}`
    })
  },
  
  viewMoreOfficial: function() {
    wx.navigateTo({
      url: '/pages/officialMaterials/officialMaterials'
    })
  },
  
  // 工具函数
  getFileType: function(fileName) {
    const ext = fileName.split('.').pop().toLowerCase()
    if (['doc', 'docx'].includes(ext)) return 'word'
    if (['pdf'].includes(ext)) return 'pdf'
    if (['txt'].includes(ext)) return 'text'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image'
    if (['mp3', 'wav'].includes(ext)) return 'audio'
    if (['mp4', 'mov'].includes(ext)) return 'video'
    return 'other'
  },
  
  getCategoryByFileType: function(fileType) {
    switch(fileType) {
      case 'audio':
        return '歌曲'
      case 'word':
      case 'pdf':
      case 'text':
        return '故事'
      case 'video':
        return '对话'
      default:
        return '其他'
    }
  },
  
  formatFileSize: function(size) {
    if (size < 1024) {
      return size + 'B'
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + 'KB'
    } else {
      return (size / (1024 * 1024)).toFixed(2) + 'MB'
    }
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