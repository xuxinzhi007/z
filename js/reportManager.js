/**
 * Z+潮流社区 - 举报管理模块
 * 纯前端localStorage实现
 */

const ReportManager = {
    // 存储键名
    STORAGE_KEY: 'z_reports',

    /**
     * 举报类型
     */
    REPORT_TYPES: {
        POST: 'post',
        USER: 'user',
        COMMUNITY: 'community',
        COMMENT: 'comment'
    },

    /**
     * 举报原因
     */
    REPORT_REASONS: [
        '违法违规',
        '色情低俗',
        '暴力恐怖',
        '赌博诈骗',
        '侵犯隐私',
        '垃圾广告',
        '人身攻击',
        '其他违规'
    ],

    /**
     * 初始化举报存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    },

    /**
     * 提交举报
     * @param {Object} reportData - 举报数据
     * @param {string} reportData.type - 举报类型
     * @param {string} reportData.targetId - 举报目标ID
     * @param {string} reportData.reason - 举报原因
     * @param {string} [reportData.description] - 举报描述（可选）
     * @returns {Object} 举报结果
     */
    submitReport(reportData) {
        this.init();

        const reports = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const currentUser = UserManager.getCurrentUsername();

        // 检查是否已举报过
        const existingReport = reports.find(report => 
            report.type === reportData.type && 
            report.targetId === reportData.targetId && 
            report.reporter === currentUser
        );

        if (existingReport) {
            return { 
                success: false, 
                message: '您已经举报过该内容' 
            };
        }

        const report = {
            id: `report_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            type: reportData.type,
            targetId: reportData.targetId,
            reporter: currentUser,
            reason: reportData.reason,
            description: reportData.description || '',
            status: 'pending', // pending, processed, dismissed
            createdAt: new Date().toISOString(),
            processedAt: null,
            processor: null
        };

        reports.push(report);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));

        // 发送系统通知
        if (NotificationManager) {
            NotificationManager.sendSystemNotification(
                '举报成功',
                '感谢您的举报，我们会尽快处理',
                report.id
            );
        }

        return { 
            success: true, 
            message: '举报成功，我们会尽快处理',
            reportId: report.id 
        };
    },

    /**
     * 获取所有举报
     * @returns {Array} 举报列表
     */
    getAllReports() {
        this.init();
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },

    /**
     * 获取用户的举报记录
     * @param {string} username - 用户名
     * @returns {Array} 举报记录
     */
    getUserReports(username) {
        this.init();
        const reports = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        return reports.filter(report => report.reporter === username);
    },

    /**
     * 根据ID获取举报
     * @param {string} reportId - 举报ID
     * @returns {Object|null} 举报对象
     */
    getReportById(reportId) {
        this.init();
        const reports = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        return reports.find(report => report.id === reportId) || null;
    },

    /**
     * 更新举报状态
     * @param {string} reportId - 举报ID
     * @param {string} status - 新状态
     * @param {string} [processor] - 处理人
     * @returns {boolean} 操作结果
     */
    updateReportStatus(reportId, status, processor = null) {
        this.init();
        const reports = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const index = reports.findIndex(report => report.id === reportId);

        if (index !== -1) {
            reports[index].status = status;
            reports[index].processedAt = new Date().toISOString();
            reports[index].processor = processor;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
            return true;
        }

        return false;
    },

    /**
     * 删除举报
     * @param {string} reportId - 举报ID
     * @returns {boolean} 操作结果
     */
    deleteReport(reportId) {
        this.init();
        const reports = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
        const updatedReports = reports.filter(report => report.id !== reportId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedReports));
        return true;
    },

    /**
     * 显示举报弹窗
     * @param {string} type - 举报类型
     * @param {string} targetId - 举报目标ID
     */
    showReportModal(type, targetId) {
        // 创建举报弹窗
        const modal = this.createReportModal(type, targetId);
        document.body.appendChild(modal);
        
        // 显示弹窗
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    },

    /**
     * 创建举报弹窗
     * @param {string} type - 举报类型
     * @param {string} targetId - 举报目标ID
     * @returns {HTMLElement} 弹窗元素
     */
    createReportModal(type, targetId) {
        // 弹窗容器
        const modalContainer = document.createElement('div');
        modalContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300';
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                this.hideReportModal(modalContainer);
            }
        });

        // 弹窗内容
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white dark:bg-dark-card rounded-xl p-6 max-w-md w-full mx-4 transform translate-y-8 transition-transform duration-300';
        
        // 弹窗标题
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'text-xl font-bold mb-4 dark:text-white';
        modalTitle.textContent = '举报内容';
        modalContent.appendChild(modalTitle);

        // 举报类型显示
        const typeDisplay = document.createElement('p');
        typeDisplay.className = 'text-sm text-gray-500 dark:text-gray-400 mb-4';
        typeDisplay.textContent = `举报类型：${this.getTypeLabel(type)}`;
        modalContent.appendChild(typeDisplay);

        // 举报原因选择
        const reasonLabel = document.createElement('label');
        reasonLabel.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
        reasonLabel.textContent = '举报原因';
        modalContent.appendChild(reasonLabel);

        const reasonSelect = document.createElement('select');
        reasonSelect.className = 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card text-dark dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary mb-4';
        reasonSelect.id = 'reportReason';

        this.REPORT_REASONS.forEach(reason => {
            const option = document.createElement('option');
            option.value = reason;
            option.textContent = reason;
            reasonSelect.appendChild(option);
        });
        modalContent.appendChild(reasonSelect);

        // 举报描述
        const descriptionLabel = document.createElement('label');
        descriptionLabel.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2';
        descriptionLabel.textContent = '详细描述（可选）';
        modalContent.appendChild(descriptionLabel);

        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.className = 'w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-card text-dark dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary mb-6';
        descriptionTextarea.id = 'reportDescription';
        descriptionTextarea.rows = 3;
        descriptionTextarea.placeholder = '请详细描述您的举报内容...';
        modalContent.appendChild(descriptionTextarea);

        // 按钮容器
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'flex gap-3';

        // 取消按钮
        const cancelButton = document.createElement('button');
        cancelButton.className = 'flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-primary hover:text-primary transition-colors';
        cancelButton.textContent = '取消';
        cancelButton.addEventListener('click', () => {
            this.hideReportModal(modalContainer);
        });
        buttonsContainer.appendChild(cancelButton);

        // 提交按钮
        const submitButton = document.createElement('button');
        submitButton.className = 'flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors';
        submitButton.textContent = '提交举报';
        submitButton.addEventListener('click', () => {
            this.handleSubmitReport(type, targetId, modalContainer);
        });
        buttonsContainer.appendChild(submitButton);

        modalContent.appendChild(buttonsContainer);
        modalContainer.appendChild(modalContent);

        // 键盘事件处理
        modalContainer.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideReportModal(modalContainer);
            }
        });

        return modalContainer;
    },

    /**
     * 处理举报提交
     * @param {string} type - 举报类型
     * @param {string} targetId - 举报目标ID
     * @param {HTMLElement} modalContainer - 弹窗容器
     */
    handleSubmitReport(type, targetId, modalContainer) {
        const reason = document.getElementById('reportReason').value;
        const description = document.getElementById('reportDescription').value.trim();

        const result = this.submitReport({
            type: type,
            targetId: targetId,
            reason: reason,
            description: description
        });

        if (result.success) {
            alert(result.message);
            this.hideReportModal(modalContainer);
        } else {
            alert(result.message);
        }
    },

    /**
     * 隐藏举报弹窗
     * @param {HTMLElement} modalContainer - 弹窗容器
     */
    hideReportModal(modalContainer) {
        modalContainer.classList.remove('show');
        setTimeout(() => {
            modalContainer.remove();
        }, 300);
    },

    /**
     * 获取举报类型标签
     * @param {string} type - 举报类型
     * @returns {string} 举报类型标签
     */
    getTypeLabel(type) {
        const typeLabels = {
            [this.REPORT_TYPES.POST]: '动态',
            [this.REPORT_TYPES.USER]: '用户',
            [this.REPORT_TYPES.COMMUNITY]: '社群',
            [this.REPORT_TYPES.COMMENT]: '评论'
        };
        return typeLabels[type] || '未知类型';
    },

    /**
     * 添加举报按钮事件监听
     */
    initReportButtons() {
        // 举报动态按钮
        document.querySelectorAll('.report-post-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = button.dataset.postId;
                this.showReportModal(this.REPORT_TYPES.POST, postId);
            });
        });

        // 举报用户按钮
        document.querySelectorAll('.report-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const username = button.dataset.username;
                this.showReportModal(this.REPORT_TYPES.USER, username);
            });
        });

        // 举报社群按钮
        document.querySelectorAll('.report-community-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const communityId = button.dataset.communityId;
                this.showReportModal(this.REPORT_TYPES.COMMUNITY, communityId);
            });
        });
    }
};

// 初始化
ReportManager.init();

// 页面加载完成后初始化举报按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ReportManager.initReportButtons();
    });
} else {
    ReportManager.initReportButtons();
}