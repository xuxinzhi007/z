/**
 * Z+潮流社区 - 热更新管理模块
 * 使用Gitee实现热更新功能
 */

const UpdateManager = {
    // 配置参数
    config: {
        // GitHub仓库信息
        github: {
            repo: 'https://github.com/xuxinzhi007/z', // 替换为你的GitHub仓库地址
            branch: 'main', // GitHub默认分支通常是main而不是master
            updatePath: 'updates', // 更新包存储路径
            versionFile: 'version.json' // 版本文件名称
        },
        // 本地存储键名
        storageKeys: {
            currentVersion: 'app_current_version',
            updateInfo: 'app_update_info',
            lastCheckTime: 'app_last_check_time'
        },
        // 应用信息
        appInfo: {
            name: 'Z+潮流社区',
            currentVersion: '1.0.0', // 当前应用版本
            platform: ''
        }
    },

    // 获取当前平台
    getPlatform() {
        const userAgent = navigator.userAgent;
        if (/Android/i.test(userAgent)) {
            return 'android';
        } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
            return 'ios';
        } else {
            return 'web';
        }
    },

    // 初始化更新管理器
    init() {
        // 设置平台信息
        this.config.appInfo.platform = this.getPlatform();
        
        // 保存当前版本到本地存储
        const storedVersion = localStorage.getItem(this.config.storageKeys.currentVersion);
        if (!storedVersion) {
            localStorage.setItem(this.config.storageKeys.currentVersion, this.config.appInfo.currentVersion);
        }
    },

    // 获取当前版本
    getCurrentVersion() {
        return localStorage.getItem(this.config.storageKeys.currentVersion) || this.config.appInfo.currentVersion;
    },

    // 检查更新
    async checkUpdate(showLoading = true) {
        try {
            if (showLoading) {
                this.showLoading('检查更新中...');
            }

            // 构建GitHub版本文件URL
            // 正确的GitHub raw URL格式：https://raw.githubusercontent.com/username/repo/branch/path/to/file
            const repoUrl = this.config.github.repo;
            const repoParts = repoUrl.replace('https://github.com/', '').split('/');
            const username = repoParts[0];
            const repoName = repoParts[1];
            const branch = this.config.github.branch;
            const versionUrl = `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${this.config.github.updatePath}/${this.config.github.versionFile}`;
            
            // 发送请求获取最新版本信息
            const response = await fetch(versionUrl);
            if (!response.ok) {
                throw new Error('获取版本信息失败');
            }

            const latestVersion = await response.json();
            
            // 保存检查时间
            localStorage.setItem(this.config.storageKeys.lastCheckTime, new Date().toISOString());
            
            // 比较版本号
            const currentVersion = this.getCurrentVersion();
            const hasUpdate = this.compareVersions(latestVersion.version, currentVersion) > 0;
            
            if (showLoading) {
                this.hideLoading();
            }
            
            // 保存更新信息到本地
            localStorage.setItem(this.config.storageKeys.updateInfo, JSON.stringify(latestVersion));
            
            return {
                hasUpdate: hasUpdate,
                currentVersion: currentVersion,
                latestVersion: latestVersion,
                updateInfo: latestVersion
            };
        } catch (error) {
            if (showLoading) {
                this.hideLoading();
            }
            console.error('检查更新失败:', error);
            return {
                hasUpdate: false,
                error: error.message
            };
        }
    },

    // 比较版本号
    compareVersions(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        
        return 0;
    },

    // 下载更新包
    async downloadUpdate(updateInfo, onProgress) {
        try {
            this.showLoading('下载更新中...');
            
            // 构建更新包URL
            // 正确的GitHub raw URL格式：https://raw.githubusercontent.com/username/repo/branch/path/to/file
            const repoUrl = this.config.github.repo;
            const repoParts = repoUrl.replace('https://github.com/', '').split('/');
            const username = repoParts[0];
            const repoName = repoParts[1];
            const branch = this.config.github.branch;
            const updateUrl = `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${this.config.github.updatePath}/${updateInfo.packageName}`;
            
            // 发送请求下载更新包
            const response = await fetch(updateUrl);
            if (!response.ok) {
                throw new Error('下载更新包失败');
            }
            
            // 获取文件大小
            const contentLength = response.headers.get('content-length');
            const totalSize = contentLength ? parseInt(contentLength) : 0;
            
            // 读取文件内容
            const reader = response.body.getReader();
            let receivedSize = 0;
            let chunks = [];
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunks.push(value);
                receivedSize += value.length;
                
                // 调用进度回调
                if (onProgress && totalSize > 0) {
                    const progress = Math.round((receivedSize / totalSize) * 100);
                    onProgress(progress);
                }
            }
            
            // 合并文件内容
            const blob = new Blob(chunks);
            const text = await blob.text();
            
            this.hideLoading();
            
            return text;
        } catch (error) {
            this.hideLoading();
            console.error('下载更新失败:', error);
            throw error;
        }
    },

    // 安装更新
    async installUpdate(updateContent) {
        try {
            this.showLoading('安装更新中...');
            
            // 解析更新内容
            const updateData = JSON.parse(updateContent);
            
            // 更新本地文件（这里需要根据实际情况实现）
            // 注意：在浏览器环境中，直接修改本地文件是受限的
            // 这里提供两种方案：
            
            // 方案1：使用localStorage存储更新内容
            localStorage.setItem('app_update_content', updateContent);
            
            // 方案2：使用Service Worker实现离线更新
            // 这里简化处理，直接刷新页面
            
            // 保存新的版本号
            localStorage.setItem(this.config.storageKeys.currentVersion, updateData.version);
            
            this.hideLoading();
            
            // 提示用户重启应用
            if (confirm('更新已下载完成，是否立即重启应用？')) {
                window.location.reload();
            }
            
            return true;
        } catch (error) {
            this.hideLoading();
            console.error('安装更新失败:', error);
            throw error;
        }
    },

    // 显示加载提示
    showLoading(message) {
        // 创建加载提示元素
        let loadingElement = document.getElementById('updateLoading');
        if (!loadingElement) {
            loadingElement = document.createElement('div');
            loadingElement.id = 'updateLoading';
            loadingElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                color: white;
                font-size: 16px;
            `;
            document.body.appendChild(loadingElement);
        }
        
        loadingElement.innerHTML = `
            <div style="width: 40px; height: 40px; border: 4px solid rgba(255, 255, 255, 0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px;"></div>
            <div>${message}</div>
        `;
        
        // 添加旋转动画
        if (!document.getElementById('updateSpinAnimation')) {
            const style = document.createElement('style');
            style.id = 'updateSpinAnimation';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loadingElement.style.display = 'flex';
    },

    // 隐藏加载提示
    hideLoading() {
        const loadingElement = document.getElementById('updateLoading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    },

    // 显示更新提示
    showUpdateDialog(updateInfo) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            z-index: 10000;
        `;
        
        dialog.innerHTML = `
            <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: bold; color: #1E293B;">发现新版本</h3>
            <div style="margin-bottom: 16px; color: #64748b;">
                <p style="margin: 0 0 8px;"><strong>版本：</strong>${updateInfo.version}</p>
                <p style="margin: 0 0 8px;"><strong>大小：</strong>${updateInfo.size}</p>
                <p style="margin: 0 0 8px;"><strong>更新内容：</strong></p>
                <ul style="margin: 0; padding-left: 20px; color: #94a3b8;">
                    ${updateInfo.changelog.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div style="display: flex; gap: 12px;">
                <button id="updateCancelBtn" style="flex: 1; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; color: #64748b; font-weight: 500; cursor: pointer;">稍后更新</button>
                <button id="updateConfirmBtn" style="flex: 1; padding: 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #FF6B35, #FF7DAB); color: white; font-weight: 500; cursor: pointer;">立即更新</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 取消按钮事件
        document.getElementById('updateCancelBtn').addEventListener('click', () => {
            dialog.remove();
        });
        
        // 确认按钮事件
        document.getElementById('updateConfirmBtn').addEventListener('click', async () => {
            dialog.remove();
            
            try {
                // 下载更新
                const updateContent = await this.downloadUpdate(updateInfo, (progress) => {
                    this.showLoading(`下载更新中... ${progress}%`);
                });
                
                // 安装更新
                await this.installUpdate(updateContent);
            } catch (error) {
                alert('更新失败：' + error.message);
            }
        });
    },

    // 显示没有更新的提示
    showNoUpdateDialog() {
        alert('当前已是最新版本');
    },

    // 执行更新检查和提示
    async checkAndPromptUpdate() {
        const result = await this.checkUpdate();
        
        if (result.hasUpdate) {
            this.showUpdateDialog(result.latestVersion);
        } else {
            this.showNoUpdateDialog();
        }
    },

    // 获取最后检查更新时间
    getLastCheckTime() {
        return localStorage.getItem(this.config.storageKeys.lastCheckTime);
    },

    // 清除更新信息
    clearUpdateInfo() {
        localStorage.removeItem(this.config.storageKeys.updateInfo);
    }
};

// 初始化更新管理器
UpdateManager.init();
