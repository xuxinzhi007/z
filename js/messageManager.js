/**
 * Z+潮流社区 - 消息管理模块
 * 纯前端localStorage实现
 */

const MessageManager = {
    // 存储键名
    STORAGE_KEYS: {
        MESSAGES: 'z_messages',
        CONVERSATIONS: 'z_conversations',
        UNREAD_COUNT: 'z_unread_count'
    },

    /**
     * 初始化消息存储
     */
    init() {
        // 初始化消息存储
        if (!localStorage.getItem(this.STORAGE_KEYS.MESSAGES)) {
            localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify({}));
        }
        
        // 初始化会话存储
        if (!localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS)) {
            localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify({}));
        }
        
        // 初始化未读消息计数存储
        if (!localStorage.getItem(this.STORAGE_KEYS.UNREAD_COUNT)) {
            localStorage.setItem(this.STORAGE_KEYS.UNREAD_COUNT, JSON.stringify({}));
        }
    },

    /**
     * 发送消息
     * @param {string} fromUser - 发送者用户名
     * @param {string} toUser - 接收者用户名
     * @param {string} content - 消息内容
     * @returns {Object} 消息对象
     */
    sendMessage(fromUser, toUser, content) {
        this.init();
        
        // 创建消息对象
        const message = {
            id: Date.now() + Math.floor(Math.random() * 1000), // 唯一ID
            from: fromUser,
            to: toUser,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            isRead: false,
            type: 'text' // 目前只支持文本消息
        };
        
        // 获取现有消息
        const messages = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MESSAGES));
        
        // 确保消息对象中存在发送者和接收者的键
        if (!messages[fromUser]) {
            messages[fromUser] = {};
        }
        if (!messages[fromUser][toUser]) {
            messages[fromUser][toUser] = [];
        }
        if (!messages[toUser]) {
            messages[toUser] = {};
        }
        if (!messages[toUser][fromUser]) {
            messages[toUser][fromUser] = [];
        }
        
        // 添加消息到发送者和接收者的对话中
        messages[fromUser][toUser].push(message);
        messages[toUser][fromUser].push(message);
        
        // 更新消息存储
        localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        
        // 更新会话列表
        this.updateConversation(fromUser, toUser, message);
        this.updateConversation(toUser, fromUser, message);
        
        // 更新未读消息计数
        if (fromUser !== toUser) {
            this.incrementUnreadCount(toUser, fromUser);
        }
        
        return message;
    },

    /**
     * 获取与特定用户的聊天记录
     * @param {string} currentUser - 当前用户名
     * @param {string} otherUser - 对方用户名
     * @returns {Array} 聊天记录
     */
    getChatHistory(currentUser, otherUser) {
        this.init();
        
        const messages = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MESSAGES));
        
        return messages[currentUser]?.[otherUser] || [];
    },

    /**
     * 获取用户的会话列表
     * @param {string} username - 用户名
     * @returns {Array} 会话列表，按最后消息时间倒序排列
     */
    getConversations(username) {
        this.init();
        
        const conversations = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS));
        
        if (!conversations[username]) {
            return [];
        }
        
        // 转换为数组并按最后消息时间倒序排列
        return Object.values(conversations[username]).sort((a, b) => {
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });
    },

    /**
     * 更新会话列表
     * @param {string} username - 用户名
     * @param {string} otherUser - 对方用户名
     * @param {Object} message - 最新消息
     */
    updateConversation(username, otherUser, message) {
        this.init();
        
        const conversations = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS));
        
        // 确保会话对象中存在用户名的键
        if (!conversations[username]) {
            conversations[username] = {};
        }
        
        // 获取对方用户信息
        const users = JSON.parse(localStorage.getItem(UserManager.STORAGE_KEYS.USERS) || '{}');
        const otherUserInfo = users[otherUser] || { username: otherUser, avatar: 'https://picsum.photos/200/200?random=default' };
        
        // 更新或创建会话
        conversations[username][otherUser] = {
            user: {
                username: otherUser,
                avatar: otherUserInfo.avatar
            },
            lastMessage: message,
            updatedAt: message.createdAt
        };
        
        // 更新会话存储
        localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    },

    /**
     * 标记与特定用户的所有消息为已读
     * @param {string} currentUser - 当前用户名
     * @param {string} otherUser - 对方用户名
     */
    markMessagesAsRead(currentUser, otherUser) {
        this.init();
        
        const messages = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MESSAGES));
        const unreadCount = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.UNREAD_COUNT));
        
        // 更新当前用户接收的来自对方用户的消息
        if (messages[currentUser] && messages[currentUser][otherUser]) {
            messages[currentUser][otherUser].forEach(message => {
                if (message.from === otherUser && !message.isRead) {
                    message.isRead = true;
                }
            });
            
            // 更新消息存储
            localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        }
        
        // 重置未读消息计数
        if (unreadCount[currentUser]) {
            delete unreadCount[currentUser][otherUser];
            localStorage.setItem(this.STORAGE_KEYS.UNREAD_COUNT, JSON.stringify(unreadCount));
        }
    },

    /**
     * 获取未读消息数量
     * @param {string} username - 用户名
     * @param {string} [otherUser] - 可选，特定用户
     * @returns {number} 未读消息数量
     */
    getUnreadCount(username, otherUser = null) {
        this.init();
        
        const unreadCount = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.UNREAD_COUNT));
        
        if (!unreadCount[username]) {
            return 0;
        }
        
        if (otherUser) {
            return unreadCount[username][otherUser] || 0;
        }
        
        // 计算总未读消息数量
        return Object.values(unreadCount[username]).reduce((total, count) => total + count, 0);
    },

    /**
     * 增加未读消息计数
     * @param {string} username - 接收者用户名
     * @param {string} fromUser - 发送者用户名
     */
    incrementUnreadCount(username, fromUser) {
        this.init();
        
        const unreadCount = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.UNREAD_COUNT));
        
        if (!unreadCount[username]) {
            unreadCount[username] = {};
        }
        
        if (!unreadCount[username][fromUser]) {
            unreadCount[username][fromUser] = 0;
        }
        
        unreadCount[username][fromUser]++;
        
        // 更新未读消息计数存储
        localStorage.setItem(this.STORAGE_KEYS.UNREAD_COUNT, JSON.stringify(unreadCount));
    },

    /**
     * 删除与特定用户的聊天记录
     * @param {string} currentUser - 当前用户名
     * @param {string} otherUser - 对方用户名
     * @returns {boolean} 是否删除成功
     */
    deleteChatHistory(currentUser, otherUser) {
        this.init();
        
        const messages = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MESSAGES));
        const conversations = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CONVERSATIONS));
        const unreadCount = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.UNREAD_COUNT));
        
        // 删除消息
        if (messages[currentUser] && messages[currentUser][otherUser]) {
            delete messages[currentUser][otherUser];
            localStorage.setItem(this.STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        }
        
        // 删除会话
        if (conversations[currentUser] && conversations[currentUser][otherUser]) {
            delete conversations[currentUser][otherUser];
            localStorage.setItem(this.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
        }
        
        // 删除未读消息计数
        if (unreadCount[currentUser] && unreadCount[currentUser][otherUser]) {
            delete unreadCount[currentUser][otherUser];
            localStorage.setItem(this.STORAGE_KEYS.UNREAD_COUNT, JSON.stringify(unreadCount));
        }
        
        return true;
    },

    /**
     * 获取用户的消息列表
     * @param {string} username - 用户名
     * @returns {Array} 所有与该用户相关的消息
     */
    getAllMessages(username) {
        this.init();
        
        const messages = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MESSAGES));
        
        if (!messages[username]) {
            return [];
        }
        
        // 合并所有对话的消息
        const allMessages = [];
        Object.values(messages[username]).forEach(chatMessages => {
            allMessages.push(...chatMessages);
        });
        
        // 按时间排序
        return allMessages.sort((a, b) => {
            return new Date(a.createdAt) - new Date(b.createdAt);
        });
    }
};

// 初始化
MessageManager.init();