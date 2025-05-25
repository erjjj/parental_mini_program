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
      birthday: '', // 新增出生日期字段
      gender: '',
      englishLevel: '',
      description: '',
      avatar: '',
      language: 'zh',
      tags: [],
    },
    genderArray: ['男', '女'],
    childTags: [],
    predefinedTags: [
      { text: "绘画", selected: false },
      { text: "音乐", selected: false },
      { text: "阅读", selected: false },
      { text: "体育", selected: false },
      { text: "科学", selected: false },
      { text: "数学", selected: false },
      { text: "语言学习", selected: false },
      { text: "手工制作", selected: false },
      { text: "自然探索", selected: false },
      { text: "社交活动", selected: false }
    ],
    showTagSelector: false,
    // OSS上传相关参数
    key: '',  // 待上传的文件名称
    policy: '',
    xOssSecurityToken: '',
    xOssSignatureVersion: '',
    xOssCredential: '',
    xOssDate: '',
    xOssSignature: ''
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

  switchLanguage: function(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      currentLanguage: lang
    });
    // 可以在这里添加语言切换的相关逻辑
  },

  getChildInfo: function() {
    if (!this.data.isLoggedIn) return;
    
    // 显示加载中
    wx.showLoading({
      title: '加载中...',
    })
    
    // 先检查全局数据中是否有孩子信息
    if (app.globalData.childInfo) {
      // 获取生日并计算年龄
      const birthday = app.globalData.childInfo.birthday || '';
      const age = birthday ? this.calculateAge(birthday) : app.globalData.childInfo.age || '';
      
      this.setData({
        childInfo: app.globalData.childInfo,
        formData: {
          name: app.globalData.childInfo.name || '',
          age: age,
          birthday: birthday,
          gender: app.globalData.childInfo.gender || '',
          englishLevel: app.globalData.childInfo.englishLevel || '',
          description: app.globalData.childInfo.description || '',
          avatar: app.globalData.childInfo.avatar || '',
          language: app.globalData.childInfo.language || 'zh'
        }
      })
      
      // 加载标签
      const childTags = this.data.childInfo.tags;
      if (childTags && childTags.length > 0) {
        this.setData({
          childTags: childTags
        });
        
        // 更新预定义标签的选中状态
        const updatedPredefinedTags = this.data.predefinedTags.map(tag => {
          const found = childTags.find(item => item.text === tag.text);
          return found ? { ...tag, selected: true } : tag;
        });
        
        this.setData({
          predefinedTags: updatedPredefinedTags
        });
      }
      
      wx.hideLoading()
      return
    }
    
    // 从服务器获取孩子信息
    wx.request({
      url: 'https://www.myia.fun/api/child/info',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.success && res.data.childInfo) {
          const childInfo = res.data.childInfo;
          // JSON.parse tags 字段
          if (typeof childInfo.tags === 'string') {
            try {
              childInfo.tags = JSON.parse(childInfo.tags);
            } catch (e) {
              console.error('tags JSON 解析失败:', e);
              childInfo.tags = [];
            }
          }
          
          // 获取生日并计算年龄
          const birthday = childInfo.birthday || '';
          const age = birthday ? this.calculateAge(birthday) : childInfo.age || '';
          
          this.setData({
            childInfo: childInfo,
            formData: {
              name: res.data.childInfo.name || '',
              age: age,
              birthday: birthday,
              gender: res.data.childInfo.gender || '',
              englishLevel: res.data.childInfo.englishLevel || '',
              description: res.data.childInfo.description || '',
              avatar: res.data.childInfo.avatar || '',
              language: res.data.childInfo.language || 'zh',
              tags: childInfo.tags || []
            }
          })
          
          // 更新全局数据
          app.globalData.childInfo = childInfo;
          
          // 加载标签
          const childTags = childInfo.tags;
          if (childTags && childTags.length > 0) {
            this.setData({
              childTags: childTags
            });
            
            // 更新预定义标签的选中状态
            const updatedPredefinedTags = this.data.predefinedTags.map(tag => {
              const found = childTags.find(item => item.text === tag.text);
              return found ? { ...tag, selected: true } : tag;
            });
            
            this.setData({
              predefinedTags: updatedPredefinedTags
            });
          }
        } else {
          // 如果没有孩子信息，显示空表单
          this.setData({
            childInfo: null,
            formData: {
              name: '',
              age: '',
              birthday: '',
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
  
  // 计算年龄的函数
  calculateAge: function(birthday) {
    if (!birthday) return '';
    
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // 如果当前月份小于出生月份，或者当前月份等于出生月份但当前日期小于出生日期，则年龄减1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  },
  
  // 选择出生日期
  bindBirthdayChange: function(e) {
    const birthday = e.detail.value;
    const age = this.calculateAge(birthday);
    
    this.setData({
      'formData.birthday': birthday,
      'formData.age': age
    });
  },
  
  inputEnglishLevel: function(e) {
    this.setData({
      'formData.englishLevel': e.detail.value
    })
  },
  
  inputDescription: function(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },
  
  // 切换语言
  switchLanguage: function(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      'formData.language': lang
    });
  },
  
  // 切换标签选中状态
  toggleTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const childTags = this.data.childTags;
    childTags[index].selected = !childTags[index].selected;
    
    this.setData({
      childTags: childTags
    });
    
    wx.setStorageSync('childTags', childTags);
  },

  // 显示标签选择器
  showTagSelector: function() {
    this.setData({
      showTagSelector: true
    });
  },

  // 隐藏标签选择器
  hideTagSelector: function() {
    this.setData({
      showTagSelector: false
    });
  },

  // 选择标签
  selectTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const predefinedTags = this.data.predefinedTags;
    predefinedTags[index].selected = !predefinedTags[index].selected;
    
    this.setData({
      predefinedTags: predefinedTags
    });
  },

  // 确认标签选择
  confirmTagSelection: function() {
    // 将选中的预定义标签添加到已选标签中
    const selectedTags = this.data.predefinedTags.filter(tag => tag.selected);
    
    this.setData({
      childTags: selectedTags,
      showTagSelector: false
    });
    
    wx.setStorageSync('childTags', selectedTags);
  },
  
  // 选择并上传头像
  chooseAndUploadAvatar: function() {
    // 检查是否已登录
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 显示加载中
        wx.showLoading({
          title: '上传中...',
        });
        
        // 设置文件名，使用用户ID+avatar+时间戳+后缀
        const userId = app.globalData.userInfo ? app.globalData.userInfo.id : 'user';
        const timestamp = new Date().getTime();
        const fileExt = tempFilePath.substring(tempFilePath.lastIndexOf('.'));
        this.data.key = `${userId}_avatar_${timestamp}${fileExt}`;
        
        // 上传到OSS
        this.uploadAvatarToOSS(tempFilePath);
      }
    });
  },
  
  // 上传头像到OSS
  uploadAvatarToOSS: function(filePath) {
    // 后端服务API接口地址
    const apiUrl = 'https://oss.minip.myia.fun/generate_signature';
    
    // 发送请求获取签名信息
    wx.request({
      url: apiUrl,
      success: (res) => {
        // 用接口返回的数据替换原有的上传参数
        this.data.xOssSignatureVersion = res.data.x_oss_signature_version;
        this.data.xOssCredential = res.data.x_oss_credential;
        this.data.xOssDate = res.data.x_oss_date;
        this.data.xOssSignature = res.data.signature;
        this.data.xOssSecurityToken = res.data.security_token;
        this.data.policy = res.data.policy;
        
        // 上传参数
        const formData = {
          key: this.data.key,  // 上传文件名称
          policy: this.data.policy,   // 表单域
          OSSAccessKeyId: this.data.xOssCredential.split('/')[0],  // 访问ID
          success_action_status: '200',  // 成功后的状态码
          signature: this.data.xOssSignature,  // 签名
          'x-oss-security-token': this.data.xOssSecurityToken  // 安全令牌
        };
        
        // 上传文件到OSS
        wx.uploadFile({
          url: 'https://aliyun-nmt.oss-cn-hangzhou.aliyuncs.com',  // OSS上传地址
          filePath: filePath,  // 要上传的文件路径
          name: 'file',  // 文件对应的key
          formData: formData,
          success: (uploadRes) => {
            // 上传成功后，更新头像URL
            const avatarUrl = `https://aliyun-nmt.oss-cn-hangzhou.aliyuncs.com/${this.data.key}`;
            
            // 更新表单数据
            this.setData({
              'formData.avatar': avatarUrl
            });
            
            wx.hideLoading();
            wx.showToast({
              title: '上传成功',
              icon: 'success'
            });
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
            console.error('上传失败:', err);
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '获取签名失败',
          icon: 'none'
        });
        console.error('获取签名失败:', err);
      }
    });
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
    if (!this.data.formData.name || !this.data.formData.birthday || !this.data.formData.gender) {
      wx.showToast({
        title: '请填写必要信息',
        icon: 'none'
      })
      return;
    }
    
    wx.showLoading({
      title: '保存中...',
    })
    let gender1;
    if (this.data.formData.gender==='男') {
      gender1=0
    }
    else{
      gender1=1
    }
    // 准备要发送的数据
    const childData = {
      name: this.data.formData.name,
      age: this.data.formData.age,
      gender: gender1,
      englishLevel: this.data.formData.englishLevel,
      description: this.data.formData.description,
      avatar: this.data.formData.avatar,
      language: this.data.formData.language,
      tags: JSON.stringify(this.data.childTags),
      birthday: this.data.formData.birthday
    };
    
    // 尝试发送请求保存孩子信息
    wx.request({
      url: 'https://www.myia.fun/api/child/update',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token')),
        'Content-Type': 'application/json'
      },
      data: childData,
      success: (res) => {
        wx.hideLoading()
        if (res.data && res.data.success) {
          // 更新全局数据
          app.globalData.childInfo = childData
          
          // 保存标签到本地存储
          wx.setStorageSync('childTags', this.data.childTags);
          
          // 保存孩子信息到本地存储
          wx.setStorageSync('childInfo', app.globalData.childInfo);
          
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