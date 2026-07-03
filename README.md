# 标题日记 - 单人文件版

这个项目基于 [KyleBing/diary](https://github.com/KyleBing/diary) 重做为单人自用版本：保留原来的 Vue3/Vite 写作界面和主要日记体验，去掉注册、找回密码、邀请码、安装向导和多用户管理流程。

当前版本内置一个轻量 Node 服务，不再依赖原 `portal` 后端或数据库。日记会保存为 Markdown 文件，索引保存为 JSON：

- `data/entries/YYYY/MM/{id}.md`
- `data/index.json`
- `data/config.json`
- `data/backups/`
- `data/vault/cards.json`
- `data/finance/transactions.json`

## 本地运行

```powershell
npm install
npm run dev
```

打开 [http://127.0.0.1:1021](http://127.0.0.1:1021)。

开发默认登录密码：

- 密码：`diary`

这是本地开发兜底密码，公网部署前必须改掉。

## 生产运行

```powershell
npm run build
npm start
```

生产服务默认监听 `3000`，会同时提供前端静态文件和 API。可以放在 Nginx/Caddy 后面做 HTTPS 反向代理。

## 配置

复制 `.env.example` 为 `.env`，按需配置：

```env
ADMIN_PASSWORD_HASH=
SESSION_SECRET=replace-with-a-long-random-secret
VAULT_SECRET=replace-with-another-long-random-secret
DIARY_DATA_DIR=./data
PORT=3000
```

生成密码哈希：

```powershell
npm run hash-password -- "你的新密码"
```

把输出填入 `ADMIN_PASSWORD_HASH`。如果安装了 `argon2` 依赖会生成 Argon2id 哈希；否则使用 Node 内置 scrypt 哈希。公网部署建议安装并使用 Argon2id。

## 已简化

- 只支持一个用户。
- 登录只需要管理员密码；`ADMIN_EMAIL` 仅保留为内部用户资料和旧接口兼容字段。
- 注册、邀请码、找回密码、安装数据库配置等多用户流程已移除入口。
- 日记、日历、列表、瀑布流、统计、导出等核心写作功能保留。
- 银行卡已拆为独立保险箱模块，卡号使用 `VAULT_SECRET` 派生密钥加密保存，列表默认脱敏。
- 账单已拆为独立结构化模块，保存在 `data/finance/transactions.json`，不再依赖 `bill` 日记分类。
- 系统设置提供旧数据迁移预览/导入：扫描“我的银行卡列表”日记和旧 `bill` 分类日记，导入前自动备份，原始日记不删除。

## 天气与位置

系统设置里配置和风天气 Host 与 API Key 后，新建今天日记时可以使用浏览器定位或手动城市搜索，自动写入城市、天气、室外温度、湿度和风况。浏览器无法读取室内温度，因此室内温度仍由你手动输入。

## 授权

原项目为 GPL-3.0，本仓库保留 `LICENSE` 与原作者信息。感谢 KyleBing 的优秀日记项目。
