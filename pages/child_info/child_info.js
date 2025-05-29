// pages/child_info/child_info.js
const app = getApp()

Page({
  data: {
    userInfo: {
      nickname: '',
      avatar: ''
    },
    childInfo: {
      name: '',
      age: '',
      gender: '',
      englishLevel: '',
      avatar: '',
      description: '', // 新增孩子描述字段
      language: '', // 新增孩子语言字段
      tags: [] // 新增孩子标签字段
    },
    // OSS上传相关参数
    key: '',  // 待上传的文件名称
    policy: '',
    xOssSecurityToken: '',
    xOssSignatureVersion: '',
    xOssCredential: '',
    xOssDate: '',
    xOssSignature: '',
    currentLanguage: 'en', // 默认中文
    childTags:[], // 已选标签
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
    isLoggedIn: false, // 新增登录状态
    isEditing: false, // 新增编辑状态
    editingField: '', // 当前正在编辑的字段
    showRealAuthBtn: false,
  },

  onLoad: function() {
    // 检查登录状态
    this.checkLoginStatus();
    // 检查是否需要显示授权对话框
    if (app.globalData && app.globalData.needAuth) {
      // 确保showAuthDialog完全执行完毕后再调用loadChildInfo
      this.showAuthDialog()
        .then(() => {
          this.loadChildInfo();
        })
        .catch(() => {
          // 即使授权失败也加载孩子信息
          this.loadChildInfo();
        });
    } else {
      this.loadChildInfo();
    }
  },

  // 检查登录状态
  checkLoginStatus: function() {
      // 检查本地存储中是否有登录token
      const token = wx.getStorageSync('token');
      if (token) {
        this.setData({
          isLoggedIn: true
        });
        this.loadUserInfo();
      } else {
        this.setData({
          isLoggedIn: false,
          loginBtnVisible: true
        });
      }
  },

  // 显示授权对话框
  showAuthDialog: function() {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: '授权提示',
        content: '为了提供更好的服务，我们需要获取您的用户信息，是否授权？',
        confirmText: '接受',
        cancelText: '拒绝',
        success: (res) => {
          if (res.confirm) {
            // 用户点击接受，调用获取用户信息接口
            // 修改为等待handleUserAuth完成后再resolve
            this.handleUserAuthAsync()
              .then(() => {
                // 无论用户是否授权，都将needAuth设为false，避免重复弹窗
                if (app.globalData) {
                  app.globalData.needAuth = false;
                }
                // 授权对话框处理完毕后解析Promise
                resolve();
              })
              .catch((err) => {
                console.error('用户授权过程出错:', err);
                // 即使授权过程出错，也将needAuth设为false
                if (app.globalData) {
                  app.globalData.needAuth = false;
                }
                resolve(); // 仍然resolve以继续后续流程
              });
            
            this.setData({
              showRealAuthBtn: true
            });
          } else {
            // 用户点击拒绝
            wx.showToast({
              title: '您已拒绝授权，部分功能可能无法使用',
              icon: 'none',
              duration: 2000
            });
            
            // 无论用户是否授权，都将needAuth设为false，避免重复弹窗
            if (app.globalData) {
              app.globalData.needAuth = false;
            }
            // 授权对话框处理完毕后解析Promise
            resolve();
          }
        },
        fail: (err) => {
          // 处理可能的失败情况
          console.error('授权对话框显示失败:', err);
          reject(err);
        }
      });
    });
  },
  
  // 将handleUserAuth包装为返回Promise的函数
  handleUserAuthAsync: function() {
    return new Promise((resolve, reject) => {
      try {
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
                        if (app.globalData) {
                          app.globalData.token = result.data.token;
                          app.globalData.userInfo = result.data.userInfo;
                        }
                        console.log('hanxin', result.data.userInfo.nickname);
                        app.globalData.token = result.data.token;
                        app.globalData.userInfo = result.data.userInfo;
                        this.setData({
                          isLoggedIn: true,
                          loginBtnVisible: false,
                          userInfo: result.data.userInfo
                        });
                        
                        wx.showToast({
                          title: '登录成功',
                          icon: 'success'
                        });
                        
                        // 重新加载用户信息和孩子信息
                        this.loadUserInfo();
                        this.loadChildInfo();
                        
                        // 授权成功，解析Promise
                        resolve();
                      } else {
                        wx.showToast({
                          title: result.data.message || '微信登录失败',
                          icon: 'none'
                        });
                        reject(new Error(result.data.message || '微信登录失败'));
                      }
                    },
                    fail: (err) => {
                      wx.showToast({
                        title: '网络错误，请重试',
                        icon: 'none'
                      });
                      reject(err);
                    },
                    complete: () => {
                      wx.hideLoading();
                    }
                  });
                } else {
                  wx.hideLoading();
                  const error = new Error('获取微信code失败');
                  reject(error);
                }
              },
              fail: (err) => {
                wx.hideLoading();
                reject(err);
              }
            });
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            });
            reject(err);
          }
        });
      } catch (err) {
        wx.hideLoading();
        reject(err);
      }
    });
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于展示用户头像和昵称',
      success: (res) => {
        console.log('用户信息:', res.userInfo);
  
        // 这里设置按钮隐藏
        this.setData({
          showRealAuthBtn: false
        });
  
        wx.showToast({
          title: '授权成功',
        });
  
        // 可选：发送用户数据到后端
      },
      fail: () => {
        // 如果授权失败也隐藏按钮（或者保留以便用户重试）
        this.setData({
          showRealAuthBtn: false
        });
  
        wx.showToast({
          title: '授权失败',
          icon: 'none'
        });
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
                    if (app.globalData) {
                      app.globalData.token = result.data.token;
                      app.globalData.userInfo = result.data.userInfo;
                    }
                    console.log('hanxin', result.data.userInfo.nickname);
                    app.globalData.token = result.data.token;
                    app.globalData.userInfo = result.data.userInfo;
                    this.setData({
                      isLoggedIn: true,
                      loginBtnVisible: false,
                      userInfo: result.data.userInfo
                    });
                    
                    wx.showToast({
                      title: '登录成功',
                      icon: 'success'
                    });
                    
                    // 重新加载用户信息和孩子信息
                    this.loadUserInfo();
                    this.loadChildInfo();
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
            }
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 加载用户信息
  loadUserInfo: function() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    } else {
      // 如果本地没有用户信息，尝试从服务器获取
      if (wx.getStorageSync('token')) {
        wx.request({
          url: 'https://www.myia.fun/api/user/info',
          method: 'GET',
          header: {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + wx.getStorageSync('token')
          },
          success: (res) => {
            if (res.data.success) {
              const userInfo = {
                nickname: res.data.user.name,
                avatar: res.data.user.photo || '/images/default_avatar.png'
              };
              this.setData({
                userInfo: userInfo
              });
              wx.setStorageSync('userInfo', userInfo);
            }
          }
        });
      }
    }
  },

  // 加载孩子信息
  loadChildInfo: function() {
    console.log('min',wx.getStorageSync('token'));
    let childInfo = wx.getStorageSync('childInfo');
    if (childInfo) {
      this.setData({
        childInfo: childInfo
      });
      
      // 处理本地存储的标签
      this.processChildTags(childInfo.tags);
    } 
    else if (this.data.isLoggedIn) {
      // 如果已登录但没有本地孩子信息，尝试从服务器获取
      wx.request({
        url: 'https://www.myia.fun/api/child/info',
        header: {
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.data.success && res.data.childInfo) {
            
            childInfo = res.data.childInfo;
            // JSON.parse tags 字段
            if (typeof childInfo.tags === 'string') {
              try {
                childInfo.tags = JSON.parse(childInfo.tags);
              } catch (e) {
                console.error('tags JSON 解析失败:', e);
                childInfo.tags = [];
              }
            }
            
            // 确保tags是数组
            if (!Array.isArray(childInfo.tags)) {
              childInfo.tags = [];
            }
            
            console.log('childInfo', childInfo.tags);
            if (childInfo.gender === '0') {
              childInfo.gender = '男';
            }
            else{
              childInfo.gender = '女';
            }
            this.setData({
              childInfo: childInfo,
            });
            wx.setStorageSync('childInfo', childInfo);
            
            // 处理从服务器获取的标签
            this.processChildTags(childInfo.tags);
          }
        }
      });
    }
  },
  
  // 处理孩子标签
  processChildTags: function(tags) {
    if (tags && Array.isArray(tags) && tags.length > 0) {
      // 确保每个标签都有正确的格式
      const formattedTags = tags.map(tag => {
        // 如果tag是字符串，转换为对象格式
        if (typeof tag === 'string') {
          return { text: tag, selected: true };
        }
        // 如果tag已经是对象但没有selected属性，添加该属性
        if (typeof tag === 'object' && !tag.hasOwnProperty('selected')) {
          return { ...tag, selected: true };
        }
        return tag;
      });
      
      this.setData({
        childTags: formattedTags
      });
      
      // 更新预定义标签的选中状态
      const updatedPredefinedTags = this.data.predefinedTags.map(tag => {
        const found = formattedTags.find(item => item.text === tag.text);
        return found ? { ...tag, selected: true } : tag;
      });
      
      this.setData({
        predefinedTags: updatedPredefinedTags
      });
    }
  
  },

  // 切换语言
  switchLanguage: function(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({
      currentLanguage: lang
    });
    // 可以在这里添加语言切换的相关逻辑
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

  // 导航到智能体页面
  navigateToAgent: function() {
    wx.navigateTo({
      url: '/pages/new_index/new_index'
    });
  },
  
  // 显示设备匹配弹窗
  showDeviceMatchModal: function() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showDeviceMatchModal: true,
      activationCode: '',
      agentId: '349a5021389e4adbb74fca7b268fcee7'
    });
  },
  
  // 隐藏设备匹配弹窗
  hideDeviceMatchModal: function() {
    this.setData({
      showDeviceMatchModal: false
    });
  },
  
  // 输入激活码
  inputActivationCode: function(e) {
    this.setData({
      activationCode: e.detail.value
    });
  },
  
  // 输入智能体ID
  inputAgentId: function(e) {
    this.setData({
      agentId: e.detail.value
    });
  },
  
  // 激活设备
  activateDevice: function() {
    const { activationCode, agentId, isActivating } = this.data;
    
    // 防止重复点击
    if (isActivating) {
      return;
    }
    
    // 验证输入
    if (!activationCode || activationCode.length !== 6) {
      wx.showToast({
        title: '请输入6位激活码',
        icon: 'none'
      });
      return;
    }
    
    if (!agentId) {
      wx.showToast({
        title: '请输入智能体ID',
        icon: 'none'
      });
      return;
    }
    
    // 设置激活中状态
    this.setData({
      isActivating: true
    });
    
    // 获取token
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      this.setData({
        isActivating: false
      });
      return;
    }
    // 调用我们自己的后端API激活设备
    wx.request({
      url: 'https://www.myia.fun/api/device/activate',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      data: {
        activationCode: activationCode,
        agentId: agentId
      },
      success: (res) => {
        if (res.data.success) {
          // 调用智控台API完成设备与智控台的绑定
          wx.request({
            url: 'https://server.myia.fun/xiaozhi/device/bind/' + agentId + '/' + activationCode,
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'Authorization': 'Bearer'+ ' cad835a093c6c3c81d4f0671b112a3e7'
            },
            success: (bindRes) => {
              console.log('设备与智控台绑定成功:', bindRes.data);
              wx.showToast({
                title: '设备激活成功',
                icon: 'success'
              });
              
              // 关闭弹窗
              this.hideDeviceMatchModal();
              
              // 获取本地存储的孩子信息
              const childInfo = wx.getStorageSync('childInfo');
              
              // 如果有孩子信息且有孩子ID，则关联设备与孩子
              if (childInfo && childInfo.id) {
                // 调用后端API关联设备与孩子
                wx.request({
                  url: 'https://www.myia.fun/api/device/link-child',
                  method: 'POST',
                  header: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + token
                  },
                  data: {
                    deviceId: res.data.deviceId, // 使用从服务器返回的deviceId
                    childId: childInfo.id
                  },
                  success: (linkRes) => {
                    console.log('设备与孩子关联成功:', linkRes.data);
                  },
                  fail: (err) => {
                    console.error('设备与孩子关联失败:', err);
                  }
                });
              }
              
              // 可以选择跳转到设备管理页面
              wx.navigateTo({
                url: '/pages/deviceManagement/deviceManagement'
              });
            },
            fail: (bindErr) => {
              console.error('设备与智控台绑定失败:', bindErr);
              wx.showToast({
                title: '设备激活失败',
                icon: 'none'
              });
              this.setData({
                isActivating: false
              });
            }
          });
        
        } else {
          wx.showToast({
            title: res.data.message || '激活失败，请检查激活码',
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
        this.setData({
          isActivating: false
        });
      }
    });
  },

  // 用户登录按钮点击事件
  login: function() {
    this.handleUserAuth();
  },

  // 开始编辑字段
  startEdit: function(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      isEditing: true,
      editingField: field
    });
  },

  // 保存编辑内容
  saveEdit: function(e) {
    // 从事件中获取字段名，如果没有则使用当前编辑字段
    const field = e.currentTarget.dataset.field || this.data.editingField;
    const value = e.detail.value;
    
    console.log('保存字段:', field, '值:', value);
    
    // 更新对应字段
    let childInfo = this.data.childInfo;
    childInfo[field] = value;
    
    this.setData({
      childInfo: childInfo,
      isEditing: false,
      editingField: ''
    });
    
    // 保存到本地存储
    wx.setStorageSync('childInfo', childInfo);
    let gender1;
    if (childInfo.gender==='男') {
      gender1=0
    }
    else{
      gender1=1
    }
    const childData = {
      name: childInfo.name,
      age: childInfo.age,
      gender: gender1,
      englishLevel: childInfo.englishLevel,
      description: childInfo.description,
      avatar: childInfo.avatar,
      language: childInfo.language,
      tags: JSON.stringify(this.data.childTags),
      birthday: childInfo.birthday.split('T')[0],
    };
    console.log('childData', childData);
    // 如果已登录，同步到服务器
    if (this.data.isLoggedIn) {
      wx.request({
        url: 'https://www.myia.fun/api/child/update',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + (app.globalData.token || wx.getStorageSync('token'))
        },
        data: childData,
        success: (res) => {
          if (res.data.success) {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
    }
  },

  // 取消编辑
  cancelEdit: function() {
    this.setData({
      isEditing: false,
      editingField: ''
    });
  },

  // 导航到孩子信息编辑页面
  navigateToChildProfile: function() {
    wx.navigateTo({
      url: '/pages/childProfile/childProfile'
    });
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
          'x-oss-signature-version': this.data.xOssSignatureVersion,  // 指定签名的版本和算法
          'x-oss-credential': this.data.xOssCredential,   // 指明派生密钥的参数集
          'x-oss-date': this.data.xOssDate,   // 请求的时间
          'x-oss-signature': this.data.xOssSignature,   // 签名认证描述信息
          'x-oss-security-token': this.data.xOssSecurityToken,  // 安全令牌
          success_action_status: "200"  // 上传成功后响应状态码
        };
        // 发送请求上传文件
        wx.uploadFile({
          url: 'https://myia-user-info.oss-cn-wulanchabu.aliyuncs.com',  // OSS Bucket域名
          filePath: filePath,
          name: 'file',   // 固定值为file
          formData: formData,
          success: (res) => {
            wx.hideLoading();
            
            if (res.statusCode === 200) {
              // 上传成功，构建头像URL
              const avatarUrl = `https://myia-user-info.oss-cn-wulanchabu.aliyuncs.com/${this.data.key}`;
              
              // 更新本地数据
              let childInfo = this.data.childInfo;
              childInfo.avatar = avatarUrl;
              
              this.setData({
                childInfo: childInfo
              });
              
              // 保存到本地存储
              wx.setStorageSync('childInfo', childInfo);
              
              // 更新到服务器
              this.updateAvatarToServer(avatarUrl);
              
              wx.showToast({
                title: '头像上传成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '上传失败，请重试',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '上传失败，请重试',
              icon: 'none'
            });
            console.error('上传失败:', err);
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '获取上传参数失败',
          icon: 'none'
        });
        console.error('获取签名失败:', err);
      }
    });
  },
  
  // 更新头像URL到服务器
  updateAvatarToServer: function(avatarUrl) {
    wx.request({
      url: 'https://www.myia.fun/api/user/update-photo',
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        photo: avatarUrl
      },
      success: (res) => {
        if (res.data.success) {
          console.log('头像URL已更新到服务器');
          
          // 更新全局用户信息
          if (app.globalData.userInfo) {
            app.globalData.userInfo.photo = avatarUrl;
          }
          
          // 更新本地存储的用户信息
          let userInfo = wx.getStorageSync('userInfo') || {};
          userInfo.avatar = avatarUrl;
          wx.setStorageSync('userInfo', userInfo);
          
          this.setData({
            'userInfo.avatar': avatarUrl
          });
        } else {
          console.error('更新头像URL失败:', res.data.message);
        }
      },
      fail: (err) => {
        console.error('更新头像URL请求失败:', err);
      }
    });
  }
});