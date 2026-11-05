# DeepSeek Harness Plugins

个人维护的 DeepSeek Harness 插件集合，用于集中维护、版本管理和分享。

## 插件

| 插件 | 说明 | 适用 DSH | 安装包 |
| --- | --- | --- | --- |
| [session-cost](plugins/session-cost/README.md) | 在输入框下方显示当前会话花费与 DeepSeek 账户余额 | `>=0.2.2-rc.1 <0.3.0` | `@dawn0608/dsh-session-cost` |

## 安装

Desktop 应用请在「插件」页搜索/安装上表的 npm 包名。非 Desktop profile 也可以使用 CLI：

```bash
dsh plugin --profile <profile> add @dawn0608/dsh-session-cost
```

安装后需要在 DSH 中配置 DeepSeek 模型和 `DEEPSEEK_API_KEY`。插件读取余额时使用当前配置的 API Key，不会读取或上传其他人的凭据。

如果要从本仓库的源码开发版安装，可以在插件目录本地打包：

```bash
cd plugins/session-cost
npm pack
```

## 开发

```bash
cd plugins/session-cost
npm test
```

插件源码、适用版本、计费口径和已知限制详见各自的 README。

## 获取仓库

```bash
git clone https://github.com/dawn0608/deepseek-harness-plugins.git
cd deepseek-harness-plugins
```

## 开发约定

- 插件代码与对应说明一起维护。
- 配置示例仅使用占位符，不提交真实凭据、环境文件或本地运行数据。
- 项目协作规范见 [AGENTS.md](AGENTS.md)。

## 许可证

本项目使用 [MIT License](LICENSE)。
