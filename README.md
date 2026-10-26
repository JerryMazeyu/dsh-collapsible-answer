# 折叠回复（Collapsible Replies）

一个 DeepSeek Harness Web UI 插件：不展开时看到的是完整而精简的答案；展开时看到额外细节。

## 行为

- 回复开头（第一个标题之前的内容）始终显示，而且是**完整的结论**，不整条折叠。
- `##`（以及 `#`、`###`）标题下的内容是可跳过的细节：
  - 长小节（超过 240 字符或 6 行）默认折叠，点击标题展开；
  - 短小节直接显示。
- 有两个及以上可折叠小节时，右上角提供「展开全部 / 收起全部」。
- 流式输出时小节自动展开，输出结束后长小节恢复折叠。
- 思考过程单独收起，点击「思考」查看。
- 小节标题是普通可选中文本：备注插件可以直接对标题文字做备注，选中后再点击不会误触折叠。
- 展开状态只记在当前页面内。

## 输出结构约定

Host 半向系统提示词注入一段格式约定：开头写明结果/结论（一到五行或三条以内要点），必须自成完整答案；`##` 小节只放可选的深度（依据、示例、边界情况、日志等），必读内容不得放进小节。该约定作用于当前 profile 下的所有会话。

## 安装

要求：DeepSeek Harness 的 **Web profile**（在 `0.2.1-rc.2` 上验证）。

1. 把本目录放到任意位置。
2. 在 Harness 中让 agent 执行 `plugin_manager install_bundle`，`target` 指向本目录的**绝对路径**；或在 Plugins 页面安装本地包。
3. 安装后 profile 的 `package.json` 会增加一条 `link:` 依赖，`dsh.profile.bundles` 增加本包。

卸载：

```
plugin_manager remove_bundle  @local/dsh-collapsible-answer
```

## 实现

- `index.js`：Host 半，注册系统提示词段。
- `client.js`：浏览器半，以优先级 `-1` 注册 `conversation.chat.node` 的 `assistant-step` 渲染器，覆盖官方渲染器。
- `locale/*.json`：插件管理页的标题与描述。
- `icon.svg`：插件图标。

## 兼容性

插件替换官方 `assistant-step` 渲染器，依赖 `conversation.chat.node` 槽位与 `@deepseek-ai/dsh-client-ui-primitives` 平台模块；升级 Harness 后若聊天行结构变化，可能需要同步更新。

## License

MIT
