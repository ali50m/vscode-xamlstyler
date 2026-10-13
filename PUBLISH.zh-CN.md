# markupfmt 发布备忘

这份文档用于维护和发布自己的扩展。仓库名称仍为 `vscode-xamlstyler`，扩展名称为 `markupfmt`，发布者为 `ali50m`，扩展 ID 为 `ali50m.markupfmt`。

## 两个仓库的关系

- 外层仓库：`git@github.com:ali50m/vscode-xamlstyler.git`，负责 VS Code 插件和发布流程。
- 底层仓库：`git@github.com:ali50m/XamlStyler.git`，通过 `tools/XamlStyler` 子模块引用，负责 C# 格式化工具。
- 外层只记录底层的一个提交号。修改底层后，必须先提交并推送底层，再在外层提交新的子模块引用。
- 原有 `xamlstyler.*` 设置和 `Settings.XamlStyler` 配置文件继续使用，无需迁移已有格式规则。

## 首次发布前配置

- [ ] 确认 `package.json` 的 `name` 为 `markupfmt`、`publisher` 为 `ali50m`，`src/common.ts` 的扩展 ID 为 `ali50m.markupfmt`。
- [ ] 确认 VS Code Marketplace 发布者和 Open VSX 命名空间均为 `ali50m`，且相应 Token 有发布权限。
- [ ] 在插件仓库的 **Settings → Secrets and variables → Actions → Repository secrets** 配置下表中的两个 Secret。

| Secret 名称 | 用途 |
| --- | --- |
| `TOKEN` | VS Code Marketplace 发布凭据 |
| `OVSX_TOKEN` | Open VSX Registry 发布凭据 |

当前工作流读取的是 `TOKEN` 和 `OVSX_TOKEN`，与 numt 仓库统一使用相同的 Secret 名称。Token 不写进源码或本文档。

发布命令通过 `-p` 显式读取工作流中的 Token 环境变量，避免自定义变量名不被命令行工具自动识别。

- [ ] 确认 `.gitmodules` 指向自己的底层 Fork，引用的提交已推送到 GitHub，Actions 能拉取子模块。
- [ ] 保留插件根目录的 MIT 许可证和来源声明。工作流构建工具后会将底层许可证复制到 `tools/xstyler/LICENSE`，一起打包。

## 每次发布前

### 1. 如果修改了底层工具，先提交底层

进入子模块，检查所在分支和改动；不要在未确认状态时切换或更新子模块。

```powershell
cd C:\Users\liu\source\repos\vscode-xamlstyler\tools\XamlStyler
git status
git branch --show-current
```

运行测试。当前电脑只有 .NET 10 运行时，因此为 net8.0 测试开启运行时向前兼容；安装 .NET 8 后可以省略环境变量。

```powershell
cd src
$env:DOTNET_ROLL_FORWARD = 'Major'
dotnet test XamlStyler.UnitTests/XamlStyler.UnitTest.csproj
cd ..
```

测试通过后，在自己的底层分支提交、推送。首次推送分支使用 `git push -u origin <分支名>`，后续使用 `git push`。

### 2. 更新外层版本和记录

```powershell
cd C:\Users\liu\source\repos\vscode-xamlstyler
git status
git submodule status
npm version patch --no-git-tag-version
```

`npm version patch` 同时更新 `package.json` 和 `package-lock.json`。需要小版本或大版本升级时，将 `patch` 换成 `minor` 或 `major`。首次发布可以保留当前版本；后续发布使用新的版本号，并确认同名 GitHub Release / Tag 尚未存在。

在 `CHANGELOG.md` 记录本次变更。GitHub Actions 会根据版本号创建 `v<版本号>` 的 Release 和 Tag，因此这里不手动创建 Tag。

### 3. 本地构建并检查安装包

```powershell
npm ci
npm run package
dotnet publish -f net8.0 -p:RollForward=Major -o ./tools/xstyler ./tools/XamlStyler/src/XamlStyler.Console
Copy-Item -LiteralPath ./tools/XamlStyler/LICENSE -Destination ./tools/xstyler/LICENSE
npx @vscode/vsce package
```

安装包名为 `markupfmt-<版本号>.vsix`。检查包内包含 `dist/extension.js`、`tools/xstyler/xstyler.dll`、依赖 DLL、运行时配置和工具许可证；不要把底层源码、测试目录或本发布备忘打进安装包。

在 VS Code 执行 **Extensions: Install from VSIX...**，安装生成的包。将 markupfmt 选为目标文件的默认格式化器，确认 `xamlstyler.useGlobalTool` 为 `false`，以便测试本次打包的工具。

针对已修复的问题：连续格式化带 `xml:space="preserve"` 和注释的文件，确认注释前空行不再增加，字符串首尾空格保持一致。安装新扩展不会自动把旧扩展的默认格式化器设置迁移过来：

```json
"[xml]": {
  "editor.defaultFormatter": "ali50m.markupfmt"
}
```

如果文件识别为 `xaml` 或 `axaml`，修改对应语言的配置段。

### 4. 提交并推送外层仓库

确认底层提交已经推送，再提交外层的版本、变更日志、代码以及子模块引用。

```powershell
git diff --check
git diff --submodule=short
git status
```

选择需要提交的文件后提交并推送到自己的插件仓库。生成的安装包、工具构建产物和 `node_modules` 不作为源码提交。

## 手动发布

1. 打开自己的 `ali50m/vscode-xamlstyler` GitHub 仓库。
2. 进入 **Actions → Release VSCode Extension → Run workflow**。
3. 选择包含本次发布提交的分支，通常是 `main`。
4. 正式发布时 `prerelease` 选择 `false`；预发布选择 `true`。
5. 运行后分别检查两个市场发布步骤和 GitHub Release 附件。

工作流会拉取子模块、安装 npm 依赖、构建底层工具、打包，并发布到两个市场，最后上传 `.vsix` 到 GitHub Release。

**不要只看整个工作流是否变绿。** 当前两个市场的发布步骤使用 `continue-on-error: true`，而且缺少 Token 时会跳过发布。需要检查每个发布步骤的日志，并确认两个市场显示预期版本。

## 常见排查

- **旧问题还在：** 检查默认格式化器是否为 `ali50m.markupfmt`、是否误用了全局工具，以及安装包是否包含最新底层提交的构建结果。
- **Actions 拉不到底层提交：** 检查底层提交是否已经推送，以及外层引用是否正确。仅修改底层文件、没有提交和推送，不会出现在远程构建中。
- **Token 未生效：** 检查 Secret 名称、有效期、市场账号以及发布权限；两个仓库的 Secret 不会自动共享。
- **版本或 Release 冲突：** 核对两个市场和 GitHub 上已有版本，选择新版本号后重新提交、推送。
- **仅发布到一个市场：** 根据失败步骤的具体原因处理；不要直接重复整个流程，以免已经成功的市场或 Release 发生版本冲突。
