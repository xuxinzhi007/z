/**
 * Z+潮流社区 - 用户数据管理模块
 * 纯前端localStorage实现
 */

const UserManager = {
    // 存储键名（对齐标准结构）
    STORAGE_KEYS: {
        USERS: 'z_users',
        CURRENT_USER: 'currentUser',
        IS_LOGIN: 'isLogin'
    },

    /**
     * 初始化用户存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify({}));
        }
    },

    /**
     * 简单密码加密(Base64)
     * 注意:生产环境需使用bcrypt等真实加密
     */
    encryptPassword(password) {
        return btoa(password);
    },

    /**
     * 密码解密
     */
    decryptPassword(encrypted) {
        try {
            return atob(encrypted);
        } catch (e) {
            return null;
        }
    },

    /**
     * 注册新用户
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @param {string} tag - 个性标签
     * @returns {Object} {success: boolean, message: string}
     */
    registerUser(username, password, tag = '潮流新星') {
        this.init();

        // 获取所有用户
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS));

        // 检查用户名是否已存在
        if (users[username]) {
            return {
                success: false,
                message: '这个潮号已经被占用啦～'
            };
        }

        // 创建新用户（对齐标准结构）
        const newUser = {
            username: username,
            password: this.encryptPassword(password),
            avatar: `https://picsum.photos/200/200?random=${Date.now()}`,
            tags: [tag],
            signature: '分享我的潮流日常～',
            cover: `https://picsum.photos/800/300?random=${Date.now()}`, // 个人主页封面图
            points: 0, // 积分系统
            role: 'user', // 权限字段：user, admin
            permissions: ['read', 'write', 'comment', 'like', 'collect', 'community'], // 具体权限列表，添加community权限
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
        };

        // 保存用户
        users[username] = newUser;
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        // 自动登录
        this.setLoginState(username);

        return {
            success: true,
            message: '注册成功！',
            user: newUser
        };
    },

    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Object} {success: boolean, message: string, user: Object}
     */
    loginUser(username, password) {
        this.init();

        // 获取所有用户
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS));

        // 检查用户是否存在
        if (!users[username]) {
            return {
                success: false,
                message: '找不到这个潮号哦～'
            };
        }

        // 验证密码
        const user = users[username];
        const decryptedPassword = this.decryptPassword(user.password);

        if (decryptedPassword !== password) {
            return {
                success: false,
                message: '密码不对哦，再检查下～'
            };
        }

        // 登录成功
        this.setLoginState(username);

        return {
            success: true,
            message: '登录成功，潮人已上线～',
            user: user
        };
    },

    /**
     * 设置登录状态
     * @param {string} username - 用户名
     */
    setLoginState(username) {
        localStorage.setItem(this.STORAGE_KEYS.IS_LOGIN, 'true');
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, username);
    },

    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    isLoggedIn() {
        return localStorage.getItem(this.STORAGE_KEYS.IS_LOGIN) === 'true';
    },

    /**
     * 获取当前登录用户信息
     * @returns {Object|null} 用户信息或null
     */
    getCurrentUser() {
        if (!this.isLoggedIn()) {
            return null;
        }

        const username = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '{}');

        return users[username] || null;
    },

    /**
     * 获取当前用户名
     * @returns {string|null}
     */
    getCurrentUsername() {
        if (!this.isLoggedIn()) {
            return null;
        }
        return localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    },

    /**
     * 更新用户信息
     * @param {Object} data - 要更新的数据
     * @returns {Object} {success: boolean, message: string}
     */
    updateUserInfo(data) {
        if (!this.isLoggedIn()) {
            return {
                success: false,
                message: '请先登录～'
            };
        }

        const username = this.getCurrentUsername();
        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS));

        if (!users[username]) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        // 更新用户信息
        users[username] = {
            ...users[username],
            ...data,
            updateTime: new Date().toISOString()
        };

        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        return {
            success: true,
            message: '更新成功！',
            user: users[username]
        };
    },

    /**
     * 退出登录
     */
    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.IS_LOGIN);
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    },

    /**
     * 获取所有用户(仅用于调试)
     */
    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '{}');
    },

    /**
     * 检查用户是否有特定权限
     * @param {Object} user - 用户对象
     * @param {string} permission - 权限名称
     * @returns {boolean} 是否有该权限
     */
    checkPermission(user, permission) {
        if (!user) return false;
        // 管理员拥有所有权限
        if (user.role === 'admin') return true;
        // 检查具体权限列表
        return user.permissions && user.permissions.includes(permission);
    },

    /**
     * 检查当前登录用户是否有特定权限
     * @param {string} permission - 权限名称
     * @returns {boolean} 是否有该权限
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        return this.checkPermission(user, permission);
    },

    /**
     * 检查用户是否是管理员
     * @param {Object} user - 用户对象
     * @returns {boolean} 是否是管理员
     */
    isAdmin(user) {
        if (!user) return false;
        return user.role === 'admin';
    },

    /**
     * 检查当前登录用户是否是管理员
     * @returns {boolean} 是否是管理员
     */
    isCurrentUserAdmin() {
        const user = this.getCurrentUser();
        return this.isAdmin(user);
    },

    /**
     * 更新用户角色
     * @param {string} username - 用户名
     * @param {string} role - 角色名称
     * @returns {Object} {success: boolean, message: string}
     */
    updateUserRole(username, role) {
        if (!this.isCurrentUserAdmin()) {
            return {
                success: false,
                message: '只有管理员才能修改用户角色'
            };
        }

        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '{}');
        if (!users[username]) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        users[username].role = role;
        users[username].updateTime = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        return {
            success: true,
            message: '角色更新成功'
        };
    },

    /**
     * 更新用户权限列表
     * @param {string} username - 用户名
     * @param {Array} permissions - 权限列表
     * @returns {Object} {success: boolean, message: string}
     */
    updateUserPermissions(username, permissions) {
        if (!this.isCurrentUserAdmin()) {
            return {
                success: false,
                message: '只有管理员才能修改用户权限'
            };
        }

        const users = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS) || '{}');
        if (!users[username]) {
            return {
                success: false,
                message: '用户不存在'
            };
        }

        users[username].permissions = permissions;
        users[username].updateTime = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

        return {
            success: true,
            message: '权限更新成功'
        };
    },

    /**
     * 清空所有数据(仅用于调试)
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEYS.USERS);
        localStorage.removeItem(this.STORAGE_KEYS.IS_LOGIN);
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    }
};

// 初始化
UserManager.init();

