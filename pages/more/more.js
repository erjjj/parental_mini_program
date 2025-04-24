// pages/more/more.js
Page({
  data: {
    
  },

  onLoad: function (options) {
    
  },

  navigateToFeature: function(e) {
    const featureId = e.currentTarget.dataset.feature;
    wx.showToast({
      title: `功能${featureId}即将上线`,
      icon: 'none'
    })
  },

  onShareAppMessage: function () {
    return {
      title: '更多功能',
      path: '/pages/more/more'
    }
  }
})