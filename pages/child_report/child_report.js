// pages/child_report/child_report.js
Page({
  data: {
    reportMessages: [],
    isGenerating: false
  },

  onLoad: function (options) {
    // 加载已有的成长报告数据
    this.loadReportData();
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.loadReportData();
  },

  // 加载成长报告数据
  loadReportData: function() {
    // 这里可以从本地存储或服务器获取数据
    const reports = wx.getStorageSync('childReports') || [];
    this.setData({
      reportMessages: reports
    });
  },

  // 生成新的成长报告
  generateReport: function() {
    if (this.data.isGenerating) {
      return;
    }

    this.setData({
      isGenerating: true
    });

    // 模拟生成报告的过程
    wx.showLoading({
      title: '生成中...',
    });

    // 这里可以调用后端API生成报告，这里使用模拟数据
    setTimeout(() => {
      const achievements = [
        { title: '语言进步', content: '本周孩子的英语词汇量增加了20个单词，能够使用简单的英语句子进行日常对话。' },
        { title: '阅读成就', content: '完成了第一本英文绘本的阅读，能够理解故事情节并复述主要内容。' },
        { title: '听力提升', content: '能够听懂80%的英语儿歌内容，并能跟着节奏唱出部分歌词。' },
        { title: '口语突破', content: '开始尝试用英语表达自己的需求和想法，发音更加准确。' },
        { title: '学习习惯', content: '养成了每天学习英语的习惯，学习时间和专注度都有所提高。' }
      ];

      // 随机选择一个成就
      const randomIndex = Math.floor(Math.random() * achievements.length);
      const newReport = {
        id: Date.now().toString(),
        date: this.formatDate(new Date()),
        title: achievements[randomIndex].title,
        content: achievements[randomIndex].content
      };

      // 更新报告列表
      const reports = this.data.reportMessages;
      reports.unshift(newReport); // 将新报告添加到列表开头

      // 保存到本地存储
      wx.setStorageSync('childReports', reports);

      this.setData({
        reportMessages: reports,
        isGenerating: false
      });

      wx.hideLoading();
      wx.showToast({
        title: '生成成功',
        icon: 'success'
      });
    }, 1500);
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 导航到对话记录页面
  navigateToConversations: function() {
    wx.switchTab({
      url: '/pages/conversations/conversations'
    });
  }
})