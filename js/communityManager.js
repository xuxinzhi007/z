/**
 * Z+潮流社区 - 社群数据管理模块
 * 纯前端localStorage实现
 */

const CommunityManager = {
    // 存储键名
    STORAGE_KEY: 'allCommunities',
    USER_COMMUNITIES_KEY: 'userCommunities', // 用户加入的社群

    /**
     * 初始化社群存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.USER_COMMUNITIES_KEY)) {
            localStorage.setItem(this.USER_COMMUNITIES_KEY, JSON.stringify({}));
        }
    },

    /**
     * 获取所有社群
     * @returns {Array} 社群列表
     */
    getAllCommunities() {
        this.init();
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    },

    /**
     * 创建新社群
     * @param {Object} communityData - 社群数据
     * @param {string} communityData.name - 社群名称
     * @param {string} communityData.description - 社群描述
     * @param {string} communityData.category - 社群分类（如：游戏、穿搭、音乐等）
     * @returns {Object} {success: boolean, message: string, community: Object}
     */
    createCommunity(communityData) {
        // 检查是否登录
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const communities = this.getAllCommunities();

        // 验证输入
        if (!communityData.name || communityData.name.trim() === '') {
            return {
                success: false,
                message: '社群名称不能为空'
            };
        }

        if (communityData.name.length > 20) {
            return {
                success: false,
                message: '社群名称不能超过20个字'
            };
        }

        // 检查社群名是否已存在
        if (communities.some(c => c.name === communityData.name)) {
            return {
                success: false,
                message: '这个社群名已经存在了～'
            };
        }

        // 创建新社群
        const newCommunity = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: communityData.name.trim(),
            description: communityData.description || '一个有趣的社群',
            category: communityData.category || '其他',
            creator: currentUser,
            avatar: `https://picsum.photos/100/100?random=${Date.now()}`,
            members: [currentUser], // 创建者自动加入
            memberCount: 1,
            posts: 0, // 社群内的动态数
            createTime: new Date().toLocaleString(),
            updateTime: new Date().toLocaleString()
        };

        communities.push(newCommunity);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(communities));

        // 添加到用户的社群列表
        this.joinCommunity(newCommunity.id);

        return {
            success: true,
            message: '社群创建成功！',
            community: newCommunity
        };
    },

    /**
     * 加入社群
     * @param {number} communityId - 社群ID
     * @returns {Object} {success: boolean, message: string}
     */
    joinCommunity(communityId) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const communities = this.getAllCommunities();
        const communityIndex = communities.findIndex(c => c.id === communityId);

        if (communityIndex === -1) {
            return {
                success: false,
                message: '社群不存在'
            };
        }

        const community = communities[communityIndex];

        // 检查是否已加入
        if (community.members.includes(currentUser)) {
            return {
                success: false,
                message: '你已经加入这个社群了～'
            };
        }

        // 加入社群
        community.members.push(currentUser);
        community.memberCount = community.members.length;
        community.updateTime = new Date().toLocaleString();

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(communities));

        // 记录用户加入的社群
        const userCommunities = JSON.parse(localStorage.getItem(this.USER_COMMUNITIES_KEY) || '{}');
        if (!userCommunities[currentUser]) {
            userCommunities[currentUser] = [];
        }
        if (!userCommunities[currentUser].includes(communityId)) {
            userCommunities[currentUser].push(communityId);
        }
        localStorage.setItem(this.USER_COMMUNITIES_KEY, JSON.stringify(userCommunities));

        return {
            success: true,
            message: '加入社群成功！'
        };
    },

    /**
     * 退出社群
     * @param {number} communityId - 社群ID
     * @returns {Object} {success: boolean, message: string}
     */
    leaveCommunity(communityId) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const communities = this.getAllCommunities();
        const communityIndex = communities.findIndex(c => c.id === communityId);

        if (communityIndex === -1) {
            return {
                success: false,
                message: '社群不存在'
            };
        }

        const community = communities[communityIndex];

        // 检查是否是创建者
        if (community.creator === currentUser) {
            return {
                success: false,
                message: '社群创建者不能退出，可以删除社群'
            };
        }

        // 移除成员
        const memberIndex = community.members.indexOf(currentUser);
        if (memberIndex > -1) {
            community.members.splice(memberIndex, 1);
            community.memberCount = community.members.length;
            community.updateTime = new Date().toLocaleString();
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(communities));

        // 从用户社群列表中移除
        const userCommunities = JSON.parse(localStorage.getItem(this.USER_COMMUNITIES_KEY) || '{}');
        if (userCommunities[currentUser]) {
            userCommunities[currentUser] = userCommunities[currentUser].filter(id => id !== communityId);
        }
        localStorage.setItem(this.USER_COMMUNITIES_KEY, JSON.stringify(userCommunities));

        return {
            success: true,
            message: '已退出社群'
        };
    },

    /**
     * 获取用户加入的社群
     * @param {string} username - 用户名
     * @returns {Array} 用户加入的社群列表
     */
    getUserCommunities(username) {
        this.init();
        const userCommunities = JSON.parse(localStorage.getItem(this.USER_COMMUNITIES_KEY) || '{}');
        const communityIds = userCommunities[username] || [];
        const allCommunities = this.getAllCommunities();

        return allCommunities.filter(c => communityIds.includes(c.id));
    },

    /**
     * 根据ID获取社群
     * @param {number} communityId - 社群ID
     * @returns {Object|null} 社群对象或null
     */
    getCommunityById(communityId) {
        const communities = this.getAllCommunities();
        return communities.find(c => c.id === communityId) || null;
    },

    /**
     * 检查用户是否加入了某社群
     * @param {number} communityId - 社群ID
     * @param {string} username - 用户名
     * @returns {boolean}
     */
    isUserInCommunity(communityId, username) {
        const community = this.getCommunityById(communityId);
        return community ? community.members.includes(username) : false;
    },

    /**
     * 编辑社群（仅创建者可编辑）
     * @param {number} communityId - 社群ID
     * @param {Object} updateData - 要更新的数据
     * @param {string} updateData.name - 社群名称
     * @param {string} updateData.description - 社群描述
     * @param {string} updateData.category - 社群分类
     * @returns {Object} {success: boolean, message: string, community: Object}
     */
    editCommunity(communityId, updateData) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const communities = this.getAllCommunities();
        const communityIndex = communities.findIndex(c => c.id === communityId);

        if (communityIndex === -1) {
            return {
                success: false,
                message: '社群不存在'
            };
        }

        const community = communities[communityIndex];

        // 检查是否是创建者
        if (community.creator !== currentUser) {
            return {
                success: false,
                message: '只有社群创建者才能编辑社群'
            };
        }

        // 验证输入
        if (updateData.name && updateData.name.trim() === '') {
            return {
                success: false,
                message: '社群名称不能为空'
            };
        }

        if (updateData.name && updateData.name.length > 20) {
            return {
                success: false,
                message: '社群名称不能超过20个字'
            };
        }

        // 检查新名称是否与其他社群重复
        if (updateData.name && updateData.name !== community.name) {
            if (communities.some(c => c.name === updateData.name && c.id !== communityId)) {
                return {
                    success: false,
                    message: '这个社群名已经存在了～'
                };
            }
        }

        // 更新社群信息
        if (updateData.name) community.name = updateData.name.trim();
        if (updateData.description) community.description = updateData.description.trim();
        if (updateData.category) community.category = updateData.category;
        community.updateTime = new Date().toLocaleString();

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(communities));

        return {
            success: true,
            message: '社群信息已更新',
            community: community
        };
    },

    /**
     * 删除社群（仅创建者可删除）
     * @param {number} communityId - 社群ID
     * @returns {Object} {success: boolean, message: string}
     */
    deleteCommunity(communityId) {
        if (!UserManager.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const currentUser = UserManager.getCurrentUsername();
        const communities = this.getAllCommunities();
        const communityIndex = communities.findIndex(c => c.id === communityId);

        if (communityIndex === -1) {
            return {
                success: false,
                message: '社群不存在'
            };
        }

        const community = communities[communityIndex];

        // 检查是否是创建者
        if (community.creator !== currentUser) {
            return {
                success: false,
                message: '只有社群创建者才能删除社群'
            };
        }

        // 删除社群
        communities.splice(communityIndex, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(communities));

        // 从所有用户的社群列表中移除
        const userCommunities = JSON.parse(localStorage.getItem(this.USER_COMMUNITIES_KEY) || '{}');
        Object.keys(userCommunities).forEach(username => {
            userCommunities[username] = userCommunities[username].filter(id => id !== communityId);
        });
        localStorage.setItem(this.USER_COMMUNITIES_KEY, JSON.stringify(userCommunities));

        return {
            success: true,
            message: '社群已删除'
        };
    },

    /**
     * 获取热门社群（按成员数排序）
     * @param {number} limit - 返回数量
     * @returns {Array} 热门社群列表
     */
    getPopularCommunities(limit = 10) {
        const communities = this.getAllCommunities();
        return communities
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, limit);
    },

    /**
     * 按分类获取社群
     * @param {string} category - 分类名称
     * @returns {Array} 该分类的社群列表
     */
    getCommunitiesByCategory(category) {
        const communities = this.getAllCommunities();
        return communities.filter(c => c.category === category);
    },

    /**
     * 清空所有社群（仅用于调试）
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.USER_COMMUNITIES_KEY);
    }
};

// 初始化
CommunityManager.init();
