FROM node:16-alpine

WORKDIR /usr/src/app

# 安装wget用于健康检查，这个会保留
RUN apk add --no-cache wget

# 安装编译依赖，这些是临时的，后面会删除
# python3: 用于编译原生模块
# make: 用于执行编译命令
# g++: 用于C++代码编译
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    && npm config set registry https://registry.npmmirror.com/

# 复制package文件
COPY package*.json ./

# 清理编译依赖，但保留wget
RUN npm install --production && \
    npm cache clean --force && \
    apk del .build-deps

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production

# 创建日志目录
RUN mkdir -p /usr/src/app/logs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget -q --spider http://localhost:3001/api/verify-token || exit 1

# 暴露端口
EXPOSE 3001

CMD ["npm", "start"]
