// app.js是服务器相关的代码，每一次修改都需要重新启动服务器。

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dbUtil = require('../utils/dbUtil');
const crypto = require('crypto');

const JWT_SECRET = 'your-secret-key'; // 在生产环境中应该使用环境变量

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
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'token无效' });
  }
};

const app = express();
const port = 3000;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 用户注册
app.post('/api/register', async (req, res) => {
  try {
    const { id, password } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await dbUtil.findOne('user_info', { id });
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 对密码进行加密
    //const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    
    // 创建新用户
    const userId = await dbUtil.insert('user_info', {
      id:id,
      password: password
    });
    
    // 生成token
    const token = jwt.sign({ id: userId}, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      success: true, 
      token,
      userInfo: { id: userId}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 用户登录
app.post('/api/login', async (req, res) => {
  try {
    const { id, password } = req.body;
    // 将id转换为整数类型
    const userId = parseInt(id);
    // 查找用户
    const user = await dbUtil.findOne('user_info', { id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 验证密码
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: '密码错误' });
    }
    
    // 生成token
    const token = jwt.sign({ id: user.id}, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      success: true, 
      token,
      userInfo: { id: user.id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// 验证token接口
app.get('/api/verify-token', verifyToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 获取用户信息接口
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await dbUtil.findOne('user_info', { id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      userInfo: {
        id: user.id,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 材料相关API
// 获取材料列表
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await dbUtil.findAll('materials', req.query);
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取单个材料
app.get('/api/materials/:id', async (req, res) => {
  try {
    const material = await dbUtil.findOne('materials', { id: req.params.id });
    if (!material) {
      return res.status(404).json({ success: false, message: '材料不存在' });
    }
    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 添加新材料
app.post('/api/materials', async (req, res) => {
  try {
    const id = await dbUtil.insert('materials', req.body);
    res.json({ success: true, data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新材料
app.put('/api/materials/:id', async (req, res) => {
  try {
    const result = await dbUtil.update('materials', req.body, { id: req.params.id });
    if (result === 0) {
      return res.status(404).json({ success: false, message: '材料不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 删除材料
app.delete('/api/materials/:id', async (req, res) => {
  try {
    const result = await dbUtil.delete('materials', { id: req.params.id });
    if (result === 0) {
      return res.status(404).json({ success: false, message: '材料不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});