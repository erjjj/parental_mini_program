// wxAuth.js - 微信登录相关工具函数
const axios = require('axios');
const jwt = require('jsonwebtoken');
const dbUtil = require('./dbUtil');

// 微信小程序配置信息
const APPID = process.env.WX_APPID || 'your_appid'; // 从环境变量获取，或使用默认值
const SECRET = process.env.WX_SECRET || 'your_secret'; // 从环境变量获取，或使用默认值
const JWT_SECRET = process.env.JWT_SECRET; // 使用与主应用相同的JWT密钥

/**
 * 通过code获取微信openid和session_key
 * @param {string} code - 小程序登录时获取的code
 * @returns {Promise<Object>} 包含openid和session_key的对象
 */
async function getWxSession(code) {
  try {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`;
    const response = await axios.get(url);
    const data = response.data;
    
    if (data.errcode) {
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }
    
    return {
      id: data.openid,
      session_key: data.session_key
    };
  } catch (error) {
    console.error('获取微信session失败:', error);
    throw error;
  }
}

/**
 * 处理微信登录
 * @param {string} code - 小程序登录时获取的code
 * @param {Object} userInfo - 用户信息，包含昵称、头像等
 * @returns {Promise<Object>} 登录结果，包含token和用户信息
 */
async function handleWxLogin(code, userInfo = {}) {
  try {
    // 获取微信openid
    const wxSession = await getWxSession(code);
    const { id } = wxSession;
    
    // 查询数据库中是否已存在该openid的用户
    let user = await dbUtil.findOne('user_info', { wechat_id:id });
    
    if (user) {
      // 用户已存在，更新用户信息
      if (userInfo.nickName || userInfo.avatarUrl) {
        const updateData = {};
        if (userInfo.nickName) updateData.username = userInfo.nickName;
        if (userInfo.avatarUrl) updateData.photo_url = userInfo.avatarUrl;
        
        // 使用openid作为条件更新用户信息，而不是user.id
        await dbUtil.update('user_info', updateData, {wechat_id:id});
        // 重新获取更新后的用户信息
        user = await dbUtil.findOne('user_info', { wechat_id:id });
      }
    } else {
      // 创建新用户
      const newUser = {
        wechat_id:id,
        username: userInfo.nickName || '',
        photo_url: userInfo.avatarUrl || '/images/chat.png',
        // 生成随机密码，用户后续可以修改
        password: Math.random().toString(36).slice(-8)
      };
      
      const userId = await dbUtil.insert('user_info', newUser);
      user = await dbUtil.findOne('user_info', { id: userId });
    }
    
    // 生成JWT token
    const token = jwt.sign({ id: user.wechat_id }, JWT_SECRET, { expiresIn: '30d' });
    
    return {
      success: true,
      token,
      userInfo: {
        id: user.wechat_id,
        name: user.username || '',
        photo: user.photo_url || '/images/chat.png'
      }
    };
  } catch (error) {
    console.error('微信登录处理失败:', error);
    return {
      success: false,
      message: error.message || '微信登录失败'
    };
  }
}

module.exports = {
  getWxSession,
  handleWxLogin
};