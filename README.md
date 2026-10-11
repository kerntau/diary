# 日记 Diary

一个面向个人使用的 Web 日记系统：用 Markdown 保存正文，用 JSON 维护索引，支持写作、检索、日历和数据备份。

## 功能

- 新建、编辑、删除与恢复日记
- 分类、标签、心情和全文搜索
- 日历视图、写作统计和导出
- 创建日记时可记录城市、天气、湿度与风况
- 数据备份、回收站和索引维护
- PWA 离线缓存与响应式界面

## 技术栈

- 前端：Vue 3、Vite、TypeScript、Naive UI、Pinia
- 服务端：Node.js 原生 HTTP 服务
- 内容：Markdown 文件 + JSON 索引
- 图表与渲染：ECharts、Marked、Highlight.js

## 本地开发

需要 Node.js 18+。

~~~bash
npm install
npm run dev
~~~

开发服务默认监听 http://127.0.0.1:1021。生产构建与预览：

~~~bash
npm run build
npm start
~~~

生产服务默认监听 3000，可放在 Nginx 或 Caddy 后面提供 HTTPS。

## 配置

复制环境变量示例并填写安全值：

~~~bash
cp .env.example .env
~~~

~~~env
ADMIN_PASSWORD_HASH=
SESSION_SECRET=replace-with-a-long-random-secret
DIARY_DATA_DIR=./data
PORT=3000
~~~

使用脚本生成管理员密码哈希：

~~~bash
npm run hash-password -- "你的新密码"
~~~

公网部署前请务必设置随机的 SESSION_SECRET、强密码哈希，并限制 data/ 目录权限。浏览器定位和天气服务需要在设置页配置；室内温度只能手动填写。

## 目录

- src/：Vue 前端
- server/：Node 服务、认证与 API
- data/：日记正文、索引、备份和回收站
- public/：静态资源
- scripts/：构建与维护脚本

## 许可证

仓库中的 LICENSE 文件为准。
