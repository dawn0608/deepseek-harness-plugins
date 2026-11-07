# 示例插件（@dawn0608/dsh-example）

本仓库维护的最小 DeepSeek Harness 插件骨架。复制 `templates/plugin/` 到 `plugins/<name>/` 后替换：

- `package.json`：包名、描述、版本、仓库信息；
- `cordis.patch.yml`：行 id 与包名；
- `src/client/index.js`、`src/client/i18n.js`、`src/client/style.css`：loader id、locale 命名空间、CSS 前缀；
- `locale/en.json`、`locale/zh.json`：插件页元数据；
- `README.md`、`README.zh.md` 与 `icon.svg`。

## 目录

| 路径 | 作用 |
| --- | --- |
| `src/index.js` | Host 入口（`apply`）。 |
| `src/client/index.js` | Web 入口：只导出 `apply`/`inject` 的干净模块，构建时注入 loader 外壳。 |
| `src/client/i18n.js` | 中英文字典与 locale 服务绑定。 |
| `src/client/style.css` | 客户端样式，构建期作为文本内联。 |
| `cordis.patch.yml` | 插入组合包行。 |
| `locale/{en,zh}.json` | 插件管理器标题与描述。 |
| `icon.svg` | 插件行图标。 |
| `test/` | locale 与 client 契约测试。 |
| `lib/` | 构建产物，由 `npm run build` 生成（不入库）。 |

## 开发

```sh
npm run build
npm test
```

`npm run build` 生成 `lib/index.js` 与 `lib/client.js`；`npm test` 会先构建再运行测试。

## 安装

构建后安装包目录：

```sh
npm run build
dsh plugin --profile <profile> add ./plugins/<name>
```

模板是 `private` 包；发布到 npm 前移除 `"private": true`。
