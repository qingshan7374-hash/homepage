# 青山 · A-Qing

一个用 three.js 手写的动态个人主页：粒子山川、粒子文字工坊、可点开的作品卡片、命令面板（⌘K）。

## 本地预览

```bash
cd deliverables/homepage
python -m http.server 8080
# 打开 http://localhost:8080
```

three.js 已经放在 `js/vendor/`，不依赖 CDN；但浏览器不允许 `file://` 加载 ES module，所以还是走上面的本地服务。

## 目录

```
index.html                 页面结构（全部文案都在这里）
css/main.css               设计系统与全部样式
js/main.js                 交互 + 两个 three.js 场景（hero 粒子山川、粒子文字）
js/vendor/three.module.js  three.js 0.160（本地化，避免 CDN 抽风）
assets/favicon.svg         图标
assets/og.png              分享卡片图（1200×630）
deploy.ps1                 一键推到 GitHub
.nojekyll                  让 GitHub Pages 原样发布（不跑 Jekyll）
```

## 部署到 GitHub Pages

1. 在 GitHub 新建一个公开仓库，比如 `homepage`。
2. 在本目录执行（会提示你登录 GitHub）：

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -Repo https://github.com/<你的用户名>/homepage.git
```

3. 仓库 Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`，目录 `/ (root)`，保存。
4. 等一分钟，访问 `https://<你的用户名>.github.io/homepage/`。

> 想用根域名（`https://<用户名>.github.io/`），仓库名要叫 `<用户名>.github.io`。

## 改内容

- 文案、作品卡片、时间线都在 `index.html`；每张卡片的详细说明在 `js/main.js` 顶部的 `WORKS` 数组里。
- 联系方式在「联系」区：现在是 QQ `3434233147`，`href` 与 `data-copy` 两处都要改。
- 底部 GitHub / QQ / Bilibili 链接现在指向页内锚点，换成你的主页地址。
- 配色在 `css/main.css` 顶部的 `:root`：`--jade` / `--cyan` / `--violet`。
- 技能条数值在 `data-fill`，统计数字在 `data-count`。

## 技术

- three.js 0.160（ESM + importmap，本地文件）
- 原生 JS，无构建步骤，直接静态托管
- CSS 变量 + IntersectionObserver 入场 + 自定义光标
- 适配移动端与 `prefers-reduced-motion`
