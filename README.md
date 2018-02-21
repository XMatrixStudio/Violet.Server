# Violet.Server 中文文档

Violet 中央授权系统的Nodejs服务端，提供一系列的API接口

## 如何使用

### 依赖环境

- 数据库： Mongodb
- 图片储存： 腾讯COS
- 邮件系统： mutt + msmtp

首先根据configExample里面的例子新建配置文件夹config， 并填充好需要的配置

- mail-cn.html 中文邮件模板文件
- muttrc.conf 邮件系统配置

### 运行环境

建议使用PM2管理

```sh
npm i -g pm2
```

### 运行

```sh
pm2 start ./index.js --name violet #运行
pm2 restart violet #重启
pm2 stop violet #停止运行
```

