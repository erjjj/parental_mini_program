// pages/report_push/report_push.js
Page({
  data: {
    currentDate: '',
    reportContent: '日期：2025年5月20日\n亲爱的妈妈爸爸：\n今天小宝心情非常好，聊天1小时，听学2小时，喝水刷牙习惯打卡都已完成，以下是小宝今日的学习成果和成长观察：\n🌟 今日学习内容\n📜 国学小课堂：\n时长1小时\n听了2遍《三字经》选段："人之初，性本善。性相近，习相远。"\n宝贝能跟着朗读，并对"善"字表现出兴趣，知道"善"是"善良、友好"的意思。\n🌍 英文小课堂\n时长30分钟\n播放了三遍歌曲：《Hello Spring!》宝宝会跟着一起吟唱。 歌曲中有单词："sunny（晴朗）"、"butterfly（蝴蝶）"，宝宝可以跟读啦\n播放了xx绘本，学习了与"家庭"相关的词汇："family（家庭）"、"mother（妈妈）"、"father（爸爸）"。\n🔍逻辑思维：\n时长30分钟\n聊天给宝宝猜谜语："圆圆的，红红的，一口咬下去甜甜的。"（答案：苹果）\n小宝很快猜出答案，并联想到了其他水果，逻辑联想能力很棒！\n🌟 兴趣爱好观察\n小宝跟唱《Hello Spring!》的时候节奏感很强，可以发展语音相关的兴趣爱好哦\n🌟 社交与习惯\n小宝提到又在幼儿园交了新朋友小乖，很开心呢\n提示小宝喝水和刷牙，都顺利完成任务啦\n小建议：\n和小宝聊天的时候提到了好朋友之前去露营，他也特别想去呢，如果方便的话，周末可以带小宝找个营地找找"春天的痕迹"',
    enablePush: true,
    childReport: [] // 添加孩子的report数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setCurrentDate();
    this.loadPushSetting();
    this.loadChildReport();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setCurrentDate();
    this.loadChildReport();
  },
  
  /**
   * 加载孩子的report数据
   */
  loadChildReport: function() {
    const token = wx.getStorageSync('token');
    if (!token) {
      console.log('用户未登录，无法获取孩子信息');
      return;
    }
    
    wx.request({
      url: 'https://www.myia.fun/api/child/info',
      header: {
        'Authorization': 'Bearer ' + token
      },
      success: (res) => {
        if (res.data.success && res.data.childInfo && res.data.childInfo.report) {
          try {
            // 解析report数据
            const reportData = JSON.parse(res.data.childInfo.report);
            this.setData({
              childReport: reportData
            });
            
            // 更新报告内容，将report数据格式化显示
            this.formatReportContent(reportData);
          } catch (e) {
            console.error('解析report数据失败', e);
          }
        }
      },
      fail: (err) => {
        console.error('获取孩子信息失败', err);
      }
    });
  },
  
  /**
   * 格式化report数据为可读内容
   */
  formatReportContent: function(reportData) {
    if (!reportData || reportData.length === 0) {
      return;
    }
    
    let formattedContent = `日期：${this.data.currentDate}\n亲爱的妈妈爸爸：\n\n以下是小宝的学习记录和成长观察：\n\n`;
    
    reportData.forEach((item, index) => {
      formattedContent += `🌟 话题${index + 1}：${item.topic}\n`;
      formattedContent += `👶 孩子的问题：${item.child_utterance}\n`;
      
      // 添加知识点
      if (item.knowledge_points && item.knowledge_points.length > 0) {
        formattedContent += `📚 相关知识点：\n`;
        item.knowledge_points.forEach(point => {
          formattedContent += `  • ${point}\n`;
        });
      }
      
      // 添加孩子理解程度
      if (item.child_understanding && item.child_understanding.length > 0) {
        formattedContent += `🧠 孩子的理解：\n`;
        item.child_understanding.forEach(understanding => {
          formattedContent += `  • ${understanding}\n`;
        });
      }
      
      // 添加建议的下一步
      if (item.suggested_next_steps && item.suggested_next_steps.length > 0) {
        formattedContent += `🔍 建议的下一步：\n`;
        item.suggested_next_steps.forEach(step => {
          formattedContent += `  • ${step}\n`;
        });
      }
      
      formattedContent += `\n`;
    });
    
    this.setData({
      reportContent: formattedContent
    });
  },

  /**
   * 设置当前日期
   */
  setCurrentDate: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const formattedDate = `${year}年${month}月${day}日`;
    this.setData({
      currentDate: formattedDate
    });
  },

  /**
   * 删除报告内容
   */
  deleteReport: function () {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除当前成长报告吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            reportContent: ''
          });
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 跳转到对话记录页面
   */
  navigateToConversations: function () {
    wx.navigateTo({
      url: '/pages/conversations/conversations'
    });
  },

  /**
   * 切换每日推送开关
   */
  togglePush: function () {
    const newStatus = !this.data.enablePush;
    this.setData({
      enablePush: newStatus
    });
    this.savePushSetting(newStatus);
    wx.showToast({
      title: newStatus ? '已开启每日推送' : '已关闭每日推送',
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 保存推送设置到本地存储
   */
  savePushSetting: function (status) {
    wx.setStorageSync('enableDailyPush', status);
  },

  /**
   * 从本地存储加载推送设置
   */
  loadPushSetting: function () {
    try {
      const enablePush = wx.getStorageSync('enableDailyPush');
      if (enablePush !== '') {
        this.setData({
          enablePush: enablePush
        });
      }
    } catch (e) {
      console.error('加载推送设置失败', e);
    }
  }
});