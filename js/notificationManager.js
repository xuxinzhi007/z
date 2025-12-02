/**
 * Z+潮流社区 - 通知管理模块
 * 纯前端localStorage实现
 */

const NotificationManager = {
    // 存储键名
    STORAGE_KEY: 'z_notifications',

    /**
     * 初始化通知存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    },

    /**
     * 创建通知
     * @param {Object} notificationData - 通知数据
     * @param {string} notificationData.type - 通知类型: system, like, comment, follow, join
     * @param {string} notificationData.title - 通知标题
     * @param {string} notificationData.content - 通知内容
     * @param {string} notificationData.targetId - 关联目标ID
     * @param {string} notificationData.sender - 发送者用户名
     * @returns {Object} 创建的通知对象
     */
    createNotification(notificationData) {
        this.init();

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const currentUser = UserManager.getCurrentUsername();

        const notification = {
            id: `notification_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type: notificationData.type,
            title: notificationData.title,
            content: notificationData.content,
            targetId: notificationData.targetId,
            sender: notificationData.sender || 'system',
            recipient: currentUser,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notifications.unshift(notification); // 新通知放在最前面
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));

        return notification;
    },

    /**
     * 获取当前用户的所有通知
     * @param {number} limit - 限制返回数量
     * @returns {Array} 通知列表
     */
    getNotifications(limit = 50) {
        this.init();

        const currentUser = UserManager.getCurrentUsername();
        if (!currentUser) {
            return [];
        }

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        return notifications
            .filter(notification => notification.recipient === currentUser)
            .slice(0, limit);
    },

    /**
     * 获取未读通知数量
     * @returns {number} 未读通知数量
     */
    getUnreadCount() {
        this.init();

        const currentUser = UserManager.getCurrentUsername();
        if (!currentUser) {
            return 0;
        }

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        return notifications.filter(notification => 
            notification.recipient === currentUser && !notification.isRead
        ).length;
    },

    /**
     * 将通知标记为已读
     * @param {string} notificationId - 通知ID
     * @returns {boolean} 操作结果
     */
    markAsRead(notificationId) {
        this.init();

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const index = notifications.findIndex(notification => notification.id === notificationId);

        if (index !== -1) {
            notifications[index].isRead = true;
            notifications[index].updatedAt = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
            return true;
        }

        return false;
    },

    /**
     * 将所有通知标记为已读
     * @returns {boolean} 操作结果
     */
    markAllAsRead() {
        this.init();

        const currentUser = UserManager.getCurrentUsername();
        if (!currentUser) {
            return false;
        }

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const updatedNotifications = notifications.map(notification => {
            if (notification.recipient === currentUser && !notification.isRead) {
                return {
                    ...notification,
                    isRead: true,
                    updatedAt: new Date().toISOString()
                };
            }
            return notification;
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
        return true;
    },

    /**
     * 删除通知
     * @param {string} notificationId - 通知ID
     * @returns {boolean} 操作结果
     */
    deleteNotification(notificationId) {
        this.init();

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
        return true;
    },

    /**
     * 清空所有通知
     * @returns {boolean} 操作结果
     */
    clearAllNotifications() {
        this.init();

        const currentUser = UserManager.getCurrentUsername();
        if (!currentUser) {
            return false;
        }

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const updatedNotifications = notifications.filter(notification => notification.recipient !== currentUser);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
        return true;
    },

    /**
     * 发送系统通知
     * @param {string} title - 通知标题
     * @param {string} content - 通知内容
     * @param {string} targetId - 关联目标ID
     */
    sendSystemNotification(title, content, targetId = '') {
        this.createNotification({
            type: 'system',
            title,
            content,
            targetId,
            sender: 'system'
        });
    },

    /**
     * 发送互动通知
     * @param {string} type - 通知类型: like, comment, follow, join
     * @param {string} sender - 发送者用户名
     * @param {string} recipient - 接收者用户名
     * @param {string} content - 通知内容
     * @param {string} targetId - 关联目标ID
     */
    sendInteractionNotification(type, sender, recipient, content, targetId = '') {
        this.init();

        const notification = {
            id: `notification_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type,
            title: this.getNotificationTitle(type),
            content,
            targetId,
            sender,
            recipient,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        notifications.unshift(notification);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
    },

    /**
     * 获取通知标题
     * @param {string} type - 通知类型
     * @returns {string} 通知标题
     */
    getNotificationTitle(type) {
        const titles = {
            like: '点赞通知',
            comment: '评论通知',
            follow: '关注通知',
            join: '加入通知',
            system: '系统通知'
        };
        return titles[type] || '通知';
    }
};

// 初始化
NotificationManager.init();