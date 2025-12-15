/**
 * Z+潮流社区 - 拉黑管理模块
 * 纯前端localStorage实现
 */

const BlacklistManager = {
    // 存储键名
    STORAGE_KEY: 'z_blacklists',

    /**
     * 初始化拉黑存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
        }
    },

    /**
     * 拉黑用户
     * @param {string} username - 被拉黑的用户名
     * @returns {Object} 操作结果
     */
    blacklistUser(username) {
        this.init();

        const blacklists = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const currentUser = UserManager.getCurrentUsername();

        // 初始化当前用户的黑名单
        if (!blacklists[currentUser]) {
            blacklists[currentUser] = [];
        }

        // 检查是否已经在黑名单中
        if (blacklists[currentUser].includes(username)) {
            return { 
                success: false, 
                message: '该用户已经在黑名单中' 
            };
        }

        // 添加到黑名单
        blacklists[currentUser].push(username);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(blacklists));

        // 发送系统通知
        if (NotificationManager) {
            NotificationManager.sendSystemNotification(
                '拉黑成功',
                `您已将${username}加入黑名单，将不再看到该用户的内容`,
                `blacklist_${Date.now()}`
            );
        }

        return { 
            success: true, 
            message: `已将${username}加入黑名单` 
        };
    },

    /**
     * 取消拉黑用户
     * @param {string} username - 要取消拉黑的用户名
     * @returns {Object} 操作结果
     */
    unblacklistUser(username) {
        this.init();

        const blacklists = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const currentUser = UserManager.getCurrentUsername();

        // 检查当前用户是否有黑名单
        if (!blacklists[currentUser]) {
            return { 
                success: false, 
                message: '您没有黑名单记录' 
            };
        }

        // 检查用户是否在黑名单中
        const index = blacklists[currentUser].indexOf(username);
        if (index === -1) {
            return { 
                success: false, 
                message: '该用户不在黑名单中' 
            };
        }

        // 从黑名单中移除
        blacklists[currentUser].splice(index, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(blacklists));

        // 发送系统通知
        if (NotificationManager) {
            NotificationManager.sendSystemNotification(
                '取消拉黑成功',
                `您已将${username}从黑名单中移除`,
                `unblacklist_${Date.now()}`
            );
        }

        return { 
            success: true, 
            message: `已将${username}从黑名单中移除` 
        };
    },

    /**
     * 检查用户是否被当前用户拉黑
     * @param {string} username - 要检查的用户名
     * @returns {boolean} 是否被拉黑
     */
    isUserBlacklisted(username) {
        this.init();

        const blacklists = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const currentUser = UserManager.getCurrentUsername();

        return blacklists[currentUser] && blacklists[currentUser].includes(username);
    },

    /**
     * 获取当前用户的黑名单
     * @returns {Array} 黑名单列表
     */
    getBlacklist() {
        this.init();

        const blacklists = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const currentUser = UserManager.getCurrentUsername();

        return blacklists[currentUser] || [];
    },

    /**
     * 获取黑名单用户数量
     * @returns {number} 黑名单用户数量
     */
    getBlacklistCount() {
        return this.getBlacklist().length;
    },

    /**
     * 显示拉黑确认弹窗
     * @param {string} username - 要拉黑的用户名
     */
    showBlacklistModal(username) {
        if (confirm(`确定要将${username}加入黑名单吗？`)) {
            const result = this.blacklistUser(username);
            alert(result.message);
        }
    },

    /**
     * 显示取消拉黑确认弹窗
     * @param {string} username - 要取消拉黑的用户名
     */
    showUnblacklistModal(username) {
        if (confirm(`确定要将${username}从黑名单中移除吗？`)) {
            const result = this.unblacklistUser(username);
            alert(result.message);
        }
    },

    /**
     * 过滤掉被拉黑用户的动态
     * @param {Array} posts - 动态列表
     * @returns {Array} 过滤后的动态列表
     */
    filterBlacklistedPosts(posts) {
        this.init();

        const blacklist = this.getBlacklist();
        if (blacklist.length === 0) {
            return posts;
        }

        return posts.filter(post => !blacklist.includes(post.username));
    },

    /**
     * 过滤掉被拉黑用户的社群
     * @param {Array} communities - 社群列表
     * @returns {Array} 过滤后的社群列表
     */
    filterBlacklistedCommunities(communities) {
        this.init();

        const blacklist = this.getBlacklist();
        if (blacklist.length === 0) {
            return communities;
        }

        return communities.filter(community => !blacklist.includes(community.creator));
    }
};

// 初始化
BlacklistManager.init();