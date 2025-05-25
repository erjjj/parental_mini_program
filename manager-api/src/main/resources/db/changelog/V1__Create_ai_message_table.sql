DROP TABLE IF EXISTS ai_message;

CREATE TABLE IF NOT EXISTS ai_message (
    id VARCHAR(36) PRIMARY KEY COMMENT '主键',
    session_id VARCHAR(255) NOT NULL COMMENT '会话ID',
    user_id VARCHAR(255)  NOT NULL COMMENT '用户ID',
    input_prompt JSON COMMENT '输入提示词(JSON格式)',
    output_response JSON COMMENT '输出响应(JSON格式)',
    model_type VARCHAR(100) COMMENT '模型类型',
    model_name VARCHAR(100) COMMENT '模型名称',
    duration_ms BIGINT COMMENT '耗时(毫秒)',
    status INT COMMENT '状态(0失败 1成功)',
    error_msg TEXT COMMENT '错误信息',
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_session_id (session_id),
    INDEX idx_create_time (create_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大模型交互消息记录表';
