// app.js是服务器相关的代码，每一次修改都需要重新启动服务器。

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dbUtil = require('../utils/dbUtil');
const crypto = require('crypto');

const JWT_SECRET = 'your-secret-key'; // 在生产环境中应该使用环境变量
const mysql = require('mysql');

// 创建数据库连接池
const pool = mysql.createPool({
  host: '10.129.203.188',
  user: 'wechat_user',
  password: '1234',
  database: 'test',
  port: 3306,
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
    console.log('req.user:', req.user);
    // console.log(req);
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

// 获取用户绑定的智能体列表
app.get('/api/agents/user', verifyToken, async (req, res) => {
  try {
    // 根据用户ID查询绑定的智能体
    const agents = await dbUtil.findAll('agent_info', { user_id: req.user.id });
    // console.log(agents);
    res.json({ success: true, agents: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取智能体与用户的对话历史
app.get('/api/chat/history', verifyToken, async (req, res) => {
  try {
    const { agent_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // 构建SQL查询
    const sql = `SELECT * FROM ai_chat_history 
               WHERE agent_id = ? 
               ORDER BY create_date DESC 
               LIMIT ? OFFSET ?`;
    
    // 执行查询
    const history = await query(sql, [agent_id, parseInt(limit), offset]);
    
    // 查询总记录数以判断是否有更多数据
    const countSql = `SELECT COUNT(*) as total FROM ai_chat_history WHERE agent_id = ?`;
    const countResult = await query(countSql, [agent_id]);
    const total = countResult[0].total;
    
    res.json({
      success: true,
      history: history,
      hasMore: total > offset + history.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取对话列表
app.get('/api/conversations', verifyToken, async (req, res) => {
  try {
    
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // 构建SQL查询 - 获取每个智能体的最新一条对话
    const sql = `SELECT a.*, h.content, h.create_date 
               FROM agent_info a 
               LEFT JOIN (
                 SELECT agent_id, content, create_date, 
                        ROW_NUMBER() OVER (PARTITION BY agent_id ORDER BY create_date DESC) as rn 
                 FROM ai_chat_history
               ) h ON a.agent_id = h.agent_id AND h.rn = 1 
               WHERE a.user_id = ? 
               ORDER BY h.create_date DESC 
               LIMIT ? OFFSET ?`;
    // 执行查询
    const conversations = await query(sql, [req.user.id, parseInt(limit), offset]);
    
    // console.log(conversations);
    // 查询总记录数
    const countSql = `SELECT COUNT(*) as total FROM agent_info WHERE user_id = ?`;
    const countResult = await query(countSql, [req.user.id]);
    // console.log(countResult);
    // 检查是否有更多记录
    const total = countResult[0].total;
    
    res.json({
      success: true,
      conversations: conversations,
      hasMore: total > offset + conversations.length
    });
  } catch (error) {
    console.error('错误详情:', error); // 打印完整错误堆栈
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取官方材料
app.get('/api/official-materials', async (req, res) => {
  try {
    const { category = '', limit = 10 } = req.query;
    
    // 构建SQL查询
    let sql = `SELECT * FROM materials WHERE is_official = 1`;
    const values = [];
    
    if (category) {
      sql += ` AND category = ?`;
      values.push(category);
    }
    
    sql += ` ORDER BY create_date DESC LIMIT ?`;
    values.push(parseInt(limit));
    
    // 执行查询
    const materials = await query(sql, values);
    
    res.json({
      success: true,
      materials: materials
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 处理文本材料上传
app.post('/api/materials/text', verifyToken, async (req, res) => {
  try {
    const { title, category, content } = req.body;
    
    // 验证必要字段
    if (!title || !content) {
      return res.status(400).json({ success: false, message: '标题和内容不能为空' });
    }
    
    // 插入材料记录
    const materialData = {
      title,
      category: category || '其他',
      content,
      fileType: 'text',
      user_id: req.user.id,
      create_date: new Date()
    };
    
    const id = await dbUtil.insert('materials', materialData);
    
    res.json({
      success: true,
      material: { id, ...materialData }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 处理文件上传
app.post('/api/upload', verifyToken, async (req, res) => {
  // 这里应该有文件上传的处理逻辑
  // 由于微信小程序的限制，实际上传文件需要特殊处理
  // 这里简化处理，返回一个模拟的文件URL
  res.json({
    success: true,
    fileUrl: `http://localhost:3000/uploads/${Date.now()}.file`
  });
});

// 获取相关材料
app.get('/api/materials/related/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    
    // 获取当前材料的类别
    const material = await dbUtil.findOne('materials', { id: materialId });
    if (!material) {
      return res.status(404).json({ success: false, message: '材料不存在' });
    }
    
    // 查询同类别的其他材料
    const sql = `SELECT * FROM materials WHERE category = ? AND id != ? LIMIT 5`;
    const relatedMaterials = await query(sql, [material.category, materialId]);
    
    res.json({
      success: true,
      materials: relatedMaterials
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});