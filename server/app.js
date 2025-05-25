// app.js是服务器相关的代码，每一次修改都需要重新启动服务器。

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dbUtil = require('./dbUtil');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET; // 使用环境变量中的密钥
const mysql = require('mysql');

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ 无法连接数据库:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
    connection.release();
  }
});
// 执行SQL查询的通用方法
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error('❌ 数据库连接获取失败:', err);
        reject(new Error('ConnectionError: ' + err.message));
        return;
      }

      connection.query(sql, values, (error, results) => {
        connection.release(); // 一定要释放
        if (error) {
          console.error('❌ SQL执行失败:', error);
          reject(new Error('QueryError: ' + error.message));
          return;
        }
        resolve(results);
      });
    });
  });
};

// Token验证中间件
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (!bearerHeader) {
    return res.status(403).json({ success: false, message: '未提供token' });
  }

  const bearer = bearerHeader.split(' ');
  const token = bearer[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // console.log('req.headers.authorization:', req.headers['authorization']);
    // console.log('req.user:', req.user);
    // console.log(req);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'token无效' });
  }
};

const app = express();
const port = 3001;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// 验证token接口
app.get('/api/verify-token', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 微信登录接口
const wxAuth = require('./wxAuth');
app.post('/api/wx-login', async (req, res) => {
  try {
    const { code, userInfo } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: '缺少必要参数code' });
    }
    
    const result = await wxAuth.handleWxLogin(code, userInfo);
    res.json(result);
  } catch (error) {
    console.error('微信登录接口错误:', error);
    res.status(500).json({ success: false, message: error.message || '微信登录失败' });
  }
});

// 更新用户头像接口
app.post('/api/user/update-photo', verifyToken, async (req, res) => {
  try {
    const { photo } = req.body;
    
    // 更新用户头像
    await dbUtil.update('user_info', {photo_url: photo }, { wechat_id: req.user.id });
    
    res.json({
      success: true,
      message: '头像更新成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取用户信息接口
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await dbUtil.findOne('user_info', { wechat_id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 检查用户头像是否为空，如果为空则设置默认头像并更新数据库
    if (!user.photo_url) {
      const defaultPhoto = '/images/chat.png';
      await dbUtil.update('user_info',  { photo: defaultPhoto },{ id: user.id },);
      user.photo = defaultPhoto;
    }

    res.json({
      success: true,
      userInfo: {
        id: user.wechat_id,
        name: user.username || '',
        photo: user.photo_url || '',
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取孩子信息接口
app.get('/api/child/info', verifyToken, async (req, res) => {
  try {
    const parent_info=await dbUtil.findOne('user_info', { wechat_id: req.user.id });
    // 根据父母ID查询孩子信息
    const childInfo = await dbUtil.findOne('child_info', { parent_id: parent_info.id });
    
    if (childInfo) {
      // 格式化返回数据，与前端对应，添加孩子ID
      res.json({
        success: true,
        childInfo: {
          id: childInfo.id, // 添加孩子ID
          name: childInfo.child_name || '',
          age: childInfo.age.toString() || '',
          gender: childInfo.gender || '',
          englishLevel: childInfo.english_level || '',
          birthday: childInfo.birthday || '',
          description: childInfo.description || '',
          tags: childInfo.tags || [],
          avatar: childInfo.avatar_url || '',
          report: childInfo.report || '[]' // 添加report字段
        }
      });
    }
    else {
      // 如果没有找到孩子信息，返回成功但没有数据
      res.json({
        success: true,
        childInfo: null
      });
    }
  } catch (error) {
    console.error('获取孩子信息错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新孩子信息接口
app.post('/api/child/update', verifyToken, async (req, res) => {
  try {
    const { name, age,gender, englishLevel, description,avatar,language,tags,birthday } = req.body;
    const parent_info = await dbUtil.findOne('user_info', { wechat_id: req.user.id });
    // 检查是否已有孩子信息
    const existingChild = await dbUtil.findOne('child_info', { parent_id: parent_info.id });
    
    let childInfo;
    if (existingChild) {
      // 更新现有记录
      await dbUtil.update('child_info', {
        child_name: name || '',
        gender: gender,  // 默认为空字符串
        age: parseInt(age) || 0,
        english_level: englishLevel || '',
        description: description || '',
        birthday:birthday || '',
        tags: tags || '',
        avatar_url: avatar || ''
      }, { parent_id: parent_info.id });
      
      // 获取更新后的信息
      childInfo = await dbUtil.findOne('child_info', { parent_id: parent_info.id });
    } 
    else {
      // 创建新记录
      await dbUtil.insert('child_info', {
        parent_id: parent_info.id,
        child_name: name || '',
        gender: gender,  // 默认为空字符串
        age: parseInt(age) || 0,
        english_level: englishLevel || '',
        description: description || '',
        tags: tags || '',
        avatar_url: avatar || '',
        birthday:birthday || '',
      });
      
      // 获取新创建的信息
      childInfo = await dbUtil.findOne('child_info', { parent_id: parent_info.id });
    }
    // 返回格式化的孩子信息
    res.json({
      success: true,
      childInfo: {
        id: childInfo.id, // 添加孩子ID
        name: childInfo.child_name || '',
        age: childInfo.age.toString() || '',
        gender: childInfo.gender || '',
        englishLevel: childInfo.english_level || '',
        description: childInfo.description || '',
        birthday: childInfo.birthday || '',
        tags: childInfo.tags || [],
        avatar: childInfo.avatar_url || ''
      }
    });
  } catch (error) {
    console.error('更新孩子信息错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 设备与孩子关联接口
app.post('/api/device/link-child', verifyToken, async (req, res) => {
  try {
    const { deviceId, childId } = req.body;
    
    if (!deviceId || !childId) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }
    
    // 检查设备是否已存在
    const existingDevice = await dbUtil.findOne('device_info', { id: deviceId });
    
    if (existingDevice) {
      // 更新设备关联的孩子ID
      await dbUtil.update('device_info', { child_id: childId }, { id: deviceId });
    } else {
      // 创建新的设备记录
      await dbUtil.insert('device_info', {
        id: deviceId,
        child_id: childId
      });
    }
    
    res.json({
      success: true,
      message: '设备与孩子关联成功'
    });
  } catch (error) {
    console.error('设备与孩子关联错误:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// 启动服务器
app.listen(port,() => {
  console.log(`服务器运行在 http://localhost:${port}`);
});