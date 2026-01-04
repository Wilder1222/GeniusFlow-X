# Android 模拟器测试指南

本指南将帮助你在 Android 模拟器上测试 GeniusFlow-X 移动应用。

## 📋 前置要求

### 1. 安装 Android Studio
1. 下载并安装 [Android Studio](https://developer.android.com/studio)
2. 安装完成后,打开 Android Studio
3. 进入 **Settings/Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
4. 确保安装以下组件:
   - Android SDK Platform (推荐 API 33 或更高)
   - Android SDK Build-Tools
   - Android Emulator
   - Android SDK Platform-Tools

### 2. 配置环境变量

#### Windows
1. 打开系统环境变量设置
2. 添加以下环境变量:
   ```
   ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
   ```
3. 在 Path 中添加:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

#### macOS/Linux
在 `~/.bash_profile` 或 `~/.zshrc` 中添加:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. 验证安装
在终端运行以下命令验证:
```bash
adb version
emulator -version
```

## 🚀 创建 Android 虚拟设备 (AVD)

### 方法一: 通过 Android Studio (推荐)
1. 打开 Android Studio
2. 点击 **Tools** → **Device Manager**
3. 点击 **Create Device**
4. 选择设备型号 (推荐: Pixel 5 或 Pixel 6)
5. 选择系统镜像:
   - 推荐: **API 33 (Android 13)** 或更高
   - 选择 **x86_64** 架构 (更快)
   - 如果提示下载,点击 Download
6. 配置 AVD:
   - **AVD Name**: GeniusFlow-Test
   - **Startup orientation**: Portrait
   - **Graphics**: Hardware - GLES 2.0
   - **RAM**: 2048 MB 或更高
7. 点击 **Finish**

### 方法二: 通过命令行
```bash
# 列出可用的系统镜像
sdkmanager --list | grep system-images

# 下载系统镜像 (API 33)
sdkmanager "system-images;android-33;google_apis;x86_64"

# 创建 AVD
avdmanager create avd -n GeniusFlow-Test -k "system-images;android-33;google_apis;x86_64" -d pixel_5
```

## 📱 启动模拟器

### 方法一: 通过 Android Studio
1. 打开 **Device Manager**
2. 找到 **GeniusFlow-Test**
3. 点击 ▶️ 播放按钮启动

### 方法二: 通过命令行
```bash
# 列出所有 AVD
emulator -list-avds

# 启动指定 AVD
emulator -avd GeniusFlow-Test
```

### 验证模拟器运行
```bash
# 查看连接的设备
adb devices

# 应该看到类似输出:
# List of devices attached
# emulator-5554   device
```

## 🧪 运行应用测试

### 1. 准备工作
确保你在项目的 `mobile` 目录下:
```bash
cd d:\study\projects\GeniusFlow-X\mobile
```

### 2. 启动 Expo 开发服务器
```bash
# 方法一: 使用 npm script (推荐)
npm run android

# 方法二: 使用 expo 命令
npx expo start --android

# 方法三: 手动选择
npx expo start
# 然后在终端按 'a' 键选择 Android
```

### 3. 首次安装
第一次运行时,Expo 会:
1. 自动检测运行中的模拟器
2. 安装 Expo Go 应用 (如果使用开发构建则跳过)
3. 安装并启动你的应用

### 4. 开发模式功能

#### 重新加载应用
- **快捷键**: 在模拟器中按 `R` 两次
- **命令**: 在 Expo 终端按 `r`
- **摇一摇**: Ctrl + M (Windows) 或 Cmd + M (Mac) 打开开发菜单

#### 开发菜单选项
- **Reload**: 重新加载应用
- **Debug Remote JS**: 使用 Chrome DevTools 调试
- **Enable Fast Refresh**: 启用热重载
- **Toggle Inspector**: 检查元素
- **Show Performance Monitor**: 显示性能监控

## 🔍 测试清单

### 基础功能测试
- [ ] **应用启动**: 应用能正常启动并显示启动屏幕
- [ ] **导航**: 所有 Tab 导航正常工作
- [ ] **主题切换**: 浅色/深色主题切换正常
- [ ] **语言切换**: 中英文切换正常显示

### 认证流程测试
- [ ] **登录**: 使用测试账号登录
- [ ] **注册**: 新用户注册流程
- [ ] **登出**: 登出功能正常
- [ ] **会话保持**: 关闭应用后重新打开,会话保持

### 核心功能测试
- [ ] **卡组列表**: 显示所有卡组
- [ ] **创建卡组**: 创建新卡组
- [ ] **卡片学习**: 学习流程正常
- [ ] **评分系统**: 评分按钮响应正常
- [ ] **AI 生成**: AI 生成卡片功能
- [ ] **统计数据**: 统计图表显示正常

### 离线功能测试
1. 在模拟器中启用飞行模式:
   - 下拉通知栏 → 点击飞行模式
2. 测试离线功能:
   - [ ] 查看已缓存的卡组
   - [ ] 离线学习卡片
   - [ ] 数据本地保存
3. 恢复网络连接:
   - [ ] 数据自动同步
   - [ ] 同步状态显示

### 性能测试
- [ ] **启动时间**: 应用启动速度 (< 3秒)
- [ ] **页面切换**: 页面切换流畅度
- [ ] **列表滚动**: 长列表滚动性能
- [ ] **内存使用**: 无明显内存泄漏
- [ ] **动画流畅度**: 所有动画 60fps

### UI/UX 测试
- [ ] **响应式布局**: 不同屏幕尺寸适配
- [ ] **触摸反馈**: 按钮点击有反馈
- [ ] **加载状态**: 加载时显示 loading
- [ ] **错误处理**: 错误信息友好显示
- [ ] **空状态**: 空数据时显示提示

## 🐛 调试技巧

### 1. 查看日志
```bash
# 实时查看 Android 日志
adb logcat

# 过滤 Expo 相关日志
adb logcat | grep Expo

# 过滤应用日志
adb logcat | grep ReactNativeJS
```

### 2. Chrome DevTools 调试
1. 在 Expo 终端按 `j` 打开 Chrome DevTools
2. 或在开发菜单中选择 "Debug Remote JS"
3. 在 Chrome 中打开 `chrome://inspect`
4. 点击 "inspect" 开始调试

### 3. React DevTools
```bash
# 安装 React DevTools
npm install -g react-devtools

# 启动
react-devtools
```

### 4. 网络调试
在开发菜单中启用 "Debug Remote JS",然后在 Chrome DevTools 的 Network 标签查看网络请求。

### 5. 性能分析
```bash
# 启用性能监控
# 在开发菜单中选择 "Show Performance Monitor"
```

## 📸 截图和录屏

### 截图
```bash
# 截图并保存到电脑
adb exec-out screencap -p > screenshot.png
```

### 录屏
```bash
# 开始录屏 (最长 3 分钟)
adb shell screenrecord /sdcard/demo.mp4

# 停止录屏: Ctrl + C

# 下载录屏文件
adb pull /sdcard/demo.mp4
```

## 🔧 常见问题

### 问题 1: 模拟器启动失败
**解决方案**:
```bash
# 清理并重启 ADB
adb kill-server
adb start-server

# 检查 HAXM/Hyper-V 是否启用
# Windows: 确保 Hyper-V 或 HAXM 已安装
```

### 问题 2: 应用无法连接到开发服务器
**解决方案**:
```bash
# 反向代理端口
adb reverse tcp:8081 tcp:8081

# 如果使用自定义端口
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
```

### 问题 3: Metro bundler 错误
**解决方案**:
```bash
# 清理缓存并重启
npx expo start --clear
```

### 问题 4: 模拟器性能慢
**优化建议**:
1. 在 AVD 设置中增加 RAM (推荐 4GB)
2. 启用硬件加速 (Graphics: Hardware - GLES 2.0)
3. 关闭不必要的后台应用
4. 使用 x86_64 架构而非 ARM

### 问题 5: 环境变量配置问题
**解决方案**:
```bash
# 验证环境变量
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME% # Windows

# 验证 adb 可用
where adb  # Windows
which adb  # macOS/Linux
```

## 📊 测试报告模板

测试完成后,建议记录测试结果:

```markdown
## 测试报告

**测试日期**: 2026-01-04
**测试人员**: [你的名字]
**应用版本**: 1.0.0
**模拟器配置**: Pixel 5, Android 13 (API 33)

### 测试结果
- ✅ 通过: XX 项
- ❌ 失败: XX 项
- ⚠️ 警告: XX 项

### 发现的问题
1. **[严重]** 问题描述
   - 复现步骤: ...
   - 预期结果: ...
   - 实际结果: ...
   
2. **[中等]** 问题描述
   - ...

### 性能指标
- 启动时间: X.X 秒
- 平均 FPS: XX
- 内存使用: XX MB

### 建议
- ...
```

## 🎯 下一步

完成模拟器测试后,建议:
1. **真机测试**: 在真实 Android 设备上测试
2. **构建 APK**: 创建独立的 APK 进行测试
   ```bash
   eas build --platform android --profile preview
   ```
3. **Beta 测试**: 通过 Google Play 内部测试分发
4. **自动化测试**: 集成 Detox 或 Appium 进行自动化测试

## 📚 参考资源

- [Expo Android 开发文档](https://docs.expo.dev/workflow/android-studio-emulator/)
- [Android Studio 用户指南](https://developer.android.com/studio/intro)
- [React Native 调试指南](https://reactnative.dev/docs/debugging)
- [ADB 命令参考](https://developer.android.com/studio/command-line/adb)
