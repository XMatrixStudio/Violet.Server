

# Violet.Server 中文文档

> Violet正在重构，**next**分支无法正常工作，请切换至**master**分支。
>
> **master**分支版本为2.0，**next**分支版本为3.0。

Violet 中央授权系统的Nodejs服务端，提供一系列的API接口。

[![Build Status](https://travis-ci.com/XMatrixStudio/Violet.svg?branch=next)](https://travis-ci.com/XMatrixStudio/Violet)
[![Coverage Status](https://coveralls.io/repos/github/XMatrixStudio/Violet/badge.svg?branch=next)](https://coveralls.io/github/XMatrixStudio/Violet?branch=next)

[[3.0文档](https://xmatrix.studio/docs/swagger/?url=https://xmatrix.studio/docs/api/v3-internal.yml)] (**开发中，不完整**)

## 如何使用

### 依赖环境

- 数据库： Mongodb
- 图片储存： 腾讯COS
- 手机短信：腾讯SMS

配置文件样例暂不提供，请等待3.0正式发布。

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

## TODO

### Architecture

- [ ] 使用Redis缓存Session和用户等级信息，防止实时从数据库获取等级信息。

### API Support

- [ ] 添加对用户行为的监控，增加Log数据库。
- [ ] 支持系统通知、应用通知、开发者与用户对话。

