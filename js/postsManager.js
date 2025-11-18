/**
 * Z+潮流社区 - 动态数据管理模块
 * 纯前端localStorage实现
 */

const PostsManager = {
    // 存储键名
    STORAGE_KEY: 'allPosts',

    /**
     * 初始化动态存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    },

    /**
     * 获取所有动态
     * @returns {Array} 动态列表
     */
    getAllPosts() {
        this.init();
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    },

    /**
     * 发布新动态
     * @param {Object} postData - 动态数据
     * @param {string} postData.content - 动态文字内容
     * @param {Array} postData.images - 图片数组（base64或URL）
     * @param {Array} postData.tags - 标签数组（如：['#街头穿搭']）
     * @returns {Object} {success: boolean, message: string, post: Object}
     */
    createPost(postData) {
        // 检查是否登录
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const posts = this.getAllPosts();

        // 创建新动态（对齐标准结构）
        const newPost = {
            id: Date.now() + Math.floor(Math.random() * 1000), // 唯一ID
            username: currentUser, // 关联发布者
            content: postData.content || '',
            images: postData.images || [], // 最多3张
            tags: postData.tags || [], // 最多3个
            createTime: new Date().toLocaleString(), // 发布时间
            likes: [], // 点赞用户列表（存用户名，避免重复点赞）
            comments: [], // 评论列表
            collects: [] // 收藏用户列表（存用户名）
        };

        // 添加到动态列表（新动态在前）
        posts.unshift(newPost);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));

        return {
            success: true,
            message: '发布成功！',
            post: newPost
        };
    },

    /**
     * 获取指定用户的动态
     * @param {string} username - 用户名
     * @returns {Array} 该用户的动态列表
     */
    getUserPosts(username) {
        const posts = this.getAllPosts();
        return posts.filter(post => post.username === username);
    },

    /**
     * 根据ID获取动态
     * @param {number} postId - 动态ID
     * @returns {Object|null} 动态对象或null
     */
    getPostById(postId) {
        const posts = this.getAllPosts();
        return posts.find(post => post.id === postId) || null;
    },

    /**
     * 点赞/取消点赞动态
     * @param {number} postId - 动态ID
     * @returns {Object} {success: boolean, message: string, isLiked: boolean}
     */
    toggleLike(postId) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const posts = this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return {
                success: false,
                message: '动态不存在'
            };
        }

        const post = posts[postIndex];
        const likeIndex = post.likes.indexOf(currentUser);

        if (likeIndex > -1) {
            // 已点赞，取消点赞
            post.likes.splice(likeIndex, 1);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
            return {
                success: true,
                message: '已取消点赞',
                isLiked: false
            };
        } else {
            // 未点赞，添加点赞
            post.likes.push(currentUser);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
            return {
                success: true,
                message: '点赞成功',
                isLiked: true
            };
        }
    },

    /**
     * 评论动态
     * @param {number} postId - 动态ID
     * @param {string} content - 评论内容
     * @returns {Object} {success: boolean, message: string, comment: Object}
     */
    addComment(postId, content) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        if (!content || content.trim() === '') {
            return {
                success: false,
                message: '评论内容不能为空'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const posts = this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return {
                success: false,
                message: '动态不存在'
            };
        }

        const comment = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            username: currentUser,
            content: content.trim(),
            createTime: new Date().toLocaleString()
        };

        posts[postIndex].comments.push(comment);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));

        return {
            success: true,
            message: '评论成功',
            comment: comment
        };
    },

    /**
     * 收藏/取消收藏动态
     * @param {number} postId - 动态ID
     * @returns {Object} {success: boolean, message: string, isCollected: boolean}
     */
    toggleCollect(postId) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const posts = this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return {
                success: false,
                message: '动态不存在'
            };
        }

        const post = posts[postIndex];
        const collectIndex = post.collects.indexOf(currentUser);

        if (collectIndex > -1) {
            // 已收藏，取消收藏
            post.collects.splice(collectIndex, 1);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
            return {
                success: true,
                message: '已取消收藏',
                isCollected: false
            };
        } else {
            // 未收藏，添加收藏
            post.collects.push(currentUser);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
            return {
                success: true,
                message: '收藏成功',
                isCollected: true
            };
        }
    },

    /**
     * 删除动态（仅作者可删除）
     * @param {number} postId - 动态ID
     * @returns {Object} {success: boolean, message: string}
     */
    deletePost(postId) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const posts = this.getAllPosts();
        const postIndex = posts.findIndex(post => post.id === postId);

        if (postIndex === -1) {
            return {
                success: false,
                message: '动态不存在'
            };
        }

        // 检查是否是作者
        if (posts[postIndex].username !== currentUser) {
            return {
                success: false,
                message: '只能删除自己的动态'
            };
        }

        posts.splice(postIndex, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));

        return {
            success: true,
            message: '删除成功'
        };
    },

    /**
     * 获取用户收藏的动态
     * @param {string} username - 用户名
     * @returns {Array} 收藏的动态列表
     */
    getUserCollections(username) {
        const posts = this.getAllPosts();
        return posts.filter(post => post.collects.includes(username));
    },

    /**
     * 检查用户是否点赞了某动态
     * @param {number} postId - 动态ID
     * @param {string} username - 用户名
     * @returns {boolean}
     */
    isLikedByUser(postId, username) {
        const post = this.getPostById(postId);
        return post ? post.likes.includes(username) : false;
    },

    /**
     * 检查用户是否收藏了某动态
     * @param {number} postId - 动态ID
     * @param {string} username - 用户名
     * @returns {boolean}
     */
    isCollectedByUser(postId, username) {
        const post = this.getPostById(postId);
        return post ? post.collects.includes(username) : false;
    },

    /**
     * 清空所有动态（仅用于调试）
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// 初始化
PostsManager.init();

