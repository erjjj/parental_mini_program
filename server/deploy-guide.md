# 部署指南

本文档提供了将Node.js服务部署到阿里云Ubuntu服务器(8.130.133.188)的详细步骤。

## 前置条件

- 已有阿里云Ubuntu服务器的root访问权限
- 服务器已安装Docker和Docker Compose
- 本地代码已完成修改并测试

## 部署步骤

### 1. 将代码传输到服务器

使用scp或其他工具将代码传输到服务器：

```bash
# 在本地执行
scp -r /path/to/wechat/server root@8.130.133.188:/root/wechat-server
```

或者使用Git：

```bash
# 在服务器上执行
git clone <your-repository-url> /root/wechat-server
```

### 2. 登录到服务器

```bash
ssh root@8.130.133.188
```

### 3. 进入项目目录

```bash
cd /root/wechat-server
```

### 4. 构建并启动Docker容器

```bash
docker-compose up -d --build
```

这个命令会：
- 构建Docker镜像
- 在后台启动容器
- 根据docker-compose.yml配置映射3001端口
- 加载.env文件中的环境变量

### 5. 验证服务是否正常运行

```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs <container_id>
```

## 访问服务

完成部署后，可以通过以下URL访问API服务：

```
https://www.myia.fun/api/...
```

## 常见问题排查

### 无法访问服务

1. 检查容器是否正常运行：`docker ps`
2. 检查容器日志：`docker logs <container_id>`
3. 确认阿里云安全组是否开放了3001端口
4. 检查服务器防火墙设置：`ufw status`

### 数据库连接问题

1. 确认.env文件中的数据库配置正确
2. 检查阿里云RDS的访问白名单是否包含服务器IP

## 更新部署

当需要更新服务时，执行以下步骤：

```bash
# 拉取最新代码（如果使用Git）
git pull

# 重新构建并启动容器
docker-compose down
docker-compose up -d --build
```