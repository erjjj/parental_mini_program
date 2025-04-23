const mysql = require('mysql');
const dbConfig = require('../config/db');

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

// 数据库操作工具对象
const dbUtil = {
  // 查询多条记录
  findAll: async (tableName, conditions = {}) => {
    const keys = Object.keys(conditions);
    const where = keys.length > 0 ? 
      'WHERE ' + keys.map(key => `${key} = ?`).join(' AND ') : '';
    const values = keys.map(key => conditions[key]);
    const sql = `SELECT * FROM ${tableName} ${where}`;
    return await query(sql, values);
  },

  // 查询单条记录
  findOne: async (tableName, conditions) => {
    const results = await dbUtil.findAll(tableName, conditions);
    return results[0];
  },

  // 插入记录
  insert: async (tableName, data) => {
    const keys = Object.keys(data);
    const values = keys.map(key => data[key]);
    const sql = `INSERT INTO ${tableName} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`;
    const result = await query(sql, values);
    return result.insertId;
  },

  // 更新记录
  update: async (tableName, data, conditions) => {
    const dataKeys = Object.keys(data);
    const conditionKeys = Object.keys(conditions);
    const sql = `UPDATE ${tableName} SET ${dataKeys.map(key => `${key} = ?`).join(', ')} WHERE ${conditionKeys.map(key => `${key} = ?`).join(' AND ')}`;
    const values = [...dataKeys.map(key => data[key]), ...conditionKeys.map(key => conditions[key])];
    const result = await query(sql, values);
    return result.affectedRows;
  },

  // 删除记录
  delete: async (tableName, conditions) => {
    const keys = Object.keys(conditions);
    const sql = `DELETE FROM ${tableName} WHERE ${keys.map(key => `${key} = ?`).join(' AND ')}`;
    const values = keys.map(key => conditions[key]);
    const result = await query(sql, values);
    return result.affectedRows;
  }
};

module.exports = dbUtil;