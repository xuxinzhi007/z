/**
 * Z+潮流社区 - 分享管理模块
 * 纯前端实现，使用Web Share API
 */

const ShareManager = {
    /**
     * 检查浏览器是否支持Web Share API
     * @returns {boolean} 是否支持
     */
    isShareSupported() {
        return navigator.share !== undefined;
    },

    /**
     * 分享动态
     * @param {Object} post - 动态对象
     * @returns {Promise} 分享结果
     */
    sharePost(post) {
        if (!this.isShareSupported()) {
            return this.fallbackShare(`分享动态 - ${post.username}`, post.content);
        }

        try {
            return navigator.share({
                title: `分享动态 - ${post.username}`,
                text: post.content,
                url: window.location.origin + '/post.html?id=' + post.id
            });
        } catch (error) {
            console.error('分享失败:', error);
            return this.fallbackShare(`分享动态 - ${post.username}`, post.content);
        }
    },

    /**
     * 分享社群
     * @param {Object} community - 社群对象
     * @returns {Promise} 分享结果
     */
    shareCommunity(community) {
        if (!this.isShareSupported()) {
            return this.fallbackShare(`加入社群 - ${community.name}`, community.description);
        }

        try {
            return navigator.share({
                title: `加入社群 - ${community.name}`,
                text: community.description,
                url: window.location.origin + '/communities.html?id=' + community.id
            });
        } catch (error) {
            console.error('分享失败:', error);
            return this.fallbackShare(`加入社群 - ${community.name}`, community.description);
        }
    },

    /**
     * 分享用户
     * @param {Object} user - 用户对象
     * @returns {Promise} 分享结果
     */
    shareUser(user) {
        if (!this.isShareSupported()) {
            return this.fallbackShare(`关注用户 - ${user.username}`, user.signature || '查看该用户的更多动态');
        }

        try {
            return navigator.share({
                title: `关注用户 - ${user.username}`,
                text: user.signature || '查看该用户的更多动态',
                url: window.location.origin + '/profile.html?username=' + user.username
            });
        } catch (error) {
            console.error('分享失败:', error);
            return this.fallbackShare(`关注用户 - ${user.username}`, user.signature || '查看该用户的更多动态');
        }
    },

    /**
     * 通用分享函数
     * @param {string} title - 分享标题
     * @param {string} text - 分享文本
     * @param {string} url - 分享链接
     * @returns {Promise} 分享结果
     */
    share(title, text, url) {
        if (!this.isShareSupported()) {
            return this.fallbackShare(title, text);
        }

        try {
            return navigator.share({
                title,
                text,
                url
            });
        } catch (error) {
            console.error('分享失败:', error);
            return this.fallbackShare(title, text);
        }
    },

    /**
     * 降级分享方案（复制链接到剪贴板）
     * @param {string} title - 分享标题
     * @param {string} text - 分享文本
     * @returns {Promise} 分享结果
     */
    fallbackShare(title, text) {
        // 创建分享内容
        const shareContent = `${title}\n\n${text}\n\n${window.location.href}`;

        // 复制到剪贴板
        return navigator.clipboard.writeText(shareContent)
            .then(() => {
                alert('分享链接已复制到剪贴板');
                return { success: true };
            })
            .catch(error => {
                console.error('复制失败:', error);
                alert('分享失败，请手动复制链接');
                return { success: false, error };
            });
    },

    /**
     * 添加分享按钮事件监听
     */
    initShareButtons() {
        // 分享动态按钮
        document.querySelectorAll('.share-post-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = button.dataset.postId;
                const post = this.getPostById(postId);
                if (post) {
                    this.sharePost(post);
                }
            });
        });

        // 分享社群按钮
        document.querySelectorAll('.share-community-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const communityId = button.dataset.communityId;
                const community = this.getCommunityById(communityId);
                if (community) {
                    this.shareCommunity(community);
                }
            });
        });

        // 分享用户按钮
        document.querySelectorAll('.share-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const username = button.dataset.username;
                const user = this.getUserByUsername(username);
                if (user) {
                    this.shareUser(user);
                }
            });
        });
    },

    /**
     * 根据ID获取动态
     * @param {string} postId - 动态ID
     * @returns {Object|null} 动态对象
     */
    getPostById(postId) {
        const posts = JSON.parse(localStorage.getItem(PostsManager.STORAGE_KEY) || '[]');
        return posts.find(post => post.id === postId) || null;
    },

    /**
     * 根据ID获取社群
     * @param {string} communityId - 社群ID
     * @returns {Object|null} 社群对象
     */
    getCommunityById(communityId) {
        const communities = JSON.parse(localStorage.getItem(CommunityManager.STORAGE_KEY) || '[]');
        return communities.find(community => community.id === communityId) || null;
    },

    /**
     * 根据用户名获取用户
     * @param {string} username - 用户名
     * @returns {Object|null} 用户对象
     */
    getUserByUsername(username) {
        const users = JSON.parse(localStorage.getItem(UserManager.STORAGE_KEYS.USERS) || '{}');
        return users[username] || null;
    }
};

// 页面加载完成后初始化分享按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ShareManager.initShareButtons();
    });
} else {
    ShareManager.initShareButtons();
}