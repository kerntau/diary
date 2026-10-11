<div align="center">

# DIARY // 日记

**个人 Markdown 日记与生活索引系统**<br>
*Private writing, searchable memories.*

[![Vue 3](https://img.shields.io/badge/Vue-3-42B883?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-See%20LICENSE-555555?style=for-the-badge)](LICENSE)

</div>

---

## 01. THE PURPOSE // 项目本源

Diary 是面向单人使用的 Web 日记应用。正文以 Markdown 文件保存，JSON 文件维护索引与配置，适合自托管和长期归档。

[Repository](https://github.com/kerntau/diary)

## 02. CORE ARCHITECTURE // 核心架构

~~~mermaid
graph LR
  UI[Vue 3 + Vite] --> API[Node HTTP service]
  API --> MD[Markdown entries]
  API --> IDX[JSON index/config]
  API --> BK[Backups & trash]
  UI --> EXT[Weather/location providers]
~~~

服务端负责认证、日记 API、索引和备份；浏览器负责编辑、搜索、日历与统计。天气和定位仅在用户配置后调用。

## 03. TECHNICAL MATRIX // 技术矩阵

| 模块 | 选型 | 责任 |
| --- | --- | --- |
| UI | Vue 3、Naive UI、Pinia | 编辑器、日历、筛选和主题 |
| 构建 | Vite、TypeScript | 开发服务器与生产打包 |
| 内容 | Markdown、Marked、Highlight.js | 正文存储与渲染 |
| 服务 | Node.js 原生 HTTP | 会话、API、备份和导出 |
| 数据 | JSON 索引 + 文件目录 | 无数据库依赖的持久化 |

## 04. REPOSITORY TOPOLOGY // 源码拓扑

~~~text
src/            # Vue 页面、组件和状态
server/         # HTTP 服务、认证、密码哈希
data/           # entries、index、config、backups、trash
public/         # 静态资源与 PWA 文件
scripts/        # 构建和维护脚本
.env.example    # 环境变量模板
~~~

## 05. CLONE & QUICK START // 极速开始

需要 Node.js 18+。

~~~bash
git clone https://github.com/kerntau/diary.git
cd diary
npm install
npm run dev
~~~

开发服务默认在 http://127.0.0.1:1021。生产构建：

~~~bash
npm run build
npm start
~~~

## 06. DEPLOYMENT & VERIFICATION // 部署与验证

复制 .env.example 为 .env，至少设置随机 SESSION_SECRET 和 ADMIN_PASSWORD_HASH。使用 npm run hash-password -- "新密码" 生成密码哈希。生产服务默认监听 3000，建议置于 HTTPS 反向代理之后。

提交前执行 npm run build；首次公网部署后验证登录、备份、恢复和导出流程。

## 07. ENGINEERING CONTRACT // 工程契约

- 不提交 data/ 中的个人日记、备份、会话或密钥。
- 认证和文件写入改动必须同时检查路径校验与错误处理。
- 新增字段需兼容已有 JSON 索引，并提供迁移或默认值。
- 提交信息使用清晰的 feat/fix/docs 前缀。

## 08. ROADMAP // 演进路线

- [x] Markdown 日记、索引、搜索与日历
- [x] 备份、回收站、天气和定位扩展
- [ ] 可选的端到端加密导出
- [ ] 更细粒度的多设备同步策略

## 09. LICENSE // 许可证

以仓库中的 LICENSE 文件为准。
