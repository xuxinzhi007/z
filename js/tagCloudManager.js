/**
 * Z+潮流社区 - 标签云管理模块
 * 实现标签云的生成和展示
 */

const TagCloudManager = {
    /**
     * 生成标签云HTML
     * @param {Array} tags - 标签数组，每个标签对象包含tag和count属性
     * @param {Object} options - 配置选项
     * @returns {string} 标签云HTML
     */
    generateTagCloud(tags, options = {}) {
        // 默认配置
        const config = {
            minSize: 14, // 最小字体大小（px）
            maxSize: 28, // 最大字体大小（px）
            minOpacity: 0.7, // 最小透明度
            maxOpacity: 1, // 最大透明度
            colorRange: ['#FF6B35', '#FF7DAB', '#40BFFF', '#FFD166'], // 颜色范围
            showCount: true, // 是否显示标签数量
            countFormat: '(${count})', // 数量格式
            className: 'tag-cloud', // 容器类名
            tagClassName: 'tag-cloud-item', // 标签项类名
            linkPrefix: '#', // 链接前缀
            randomOrder: true, // 是否随机排序
            ...options
        };

        if (!Array.isArray(tags) || tags.length === 0) {
            return '<p class="text-center py-8 text-gray-500 dark:text-gray-400">暂无标签</p>';
        }

        // 计算标签数量的最小值和最大值
        const counts = tags.map(tag => tag.count);
        const minCount = Math.min(...counts);
        const maxCount = Math.max(...counts);
        const countRange = maxCount - minCount || 1;

        // 生成标签HTML
        let tagsHtml = tags.map(tag => {
            // 计算字体大小（根据标签数量）
            const sizeRatio = (tag.count - minCount) / countRange;
            const fontSize = config.minSize + sizeRatio * (config.maxSize - config.minSize);

            // 计算透明度
            const opacity = config.minOpacity + sizeRatio * (config.maxOpacity - config.minOpacity);

            // 随机选择颜色
            const colorIndex = Math.floor(Math.random() * config.colorRange.length);
            const color = config.colorRange[colorIndex];

            // 生成标签HTML
            const countText = config.showCount ? ` ${config.countFormat.replace('${count}', tag.count)}` : '';
            const tagText = tag.tag + countText;

            return `
                <a href="${config.linkPrefix}${tag.tag.replace('#', '')}" 
                   class="${config.tagClassName}" 
                   style="
                       font-size: ${fontSize}px;
                       opacity: ${opacity};
                       color: ${color};
                   "
                   data-tag="${tag.tag}"
                   data-count="${tag.count}"
                >
                    ${tagText}
                </a>
            `;
        });

        // 随机排序
        if (config.randomOrder) {
            tagsHtml = this.shuffleArray(tagsHtml);
        }

        return `<div class="${config.className}">${tagsHtml.join('')}</div>`;
    },

    /**
     * 随机打乱数组
     * @param {Array} array - 要打乱的数组
     * @returns {Array} 打乱后的数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * 渲染标签云到指定容器
     * @param {string} containerId - 容器ID
     * @param {Array} tags - 标签数组
     * @param {Object} options - 配置选项
     */
    renderTagCloud(containerId, tags, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器ID ${containerId} 不存在`);
            return;
        }
        container.innerHTML = this.generateTagCloud(tags, options);
    },

    /**
     * 从动态数据中提取标签统计
     * @param {Array} posts - 动态数组
     * @returns {Array} 标签统计数组
     */
    extractTagsFromPosts(posts) {
        const tagCount = {};

        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        // 转换为数组并按数量排序
        return Object.entries(tagCount)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count);
    },

    /**
     * 获取热门标签（调用StatsManager）
     * @param {number} limit - 返回的标签数量
     * @returns {Array} 热门标签数组
     */
    getHotTags(limit = 20) {
        if (typeof StatsManager !== 'undefined') {
            return StatsManager.getHotTags(limit);
        }
        return [];
    },

    /**
     * 初始化标签云样式
     * @param {string} [tagClassName] - 标签项类名
     */
    initTagStyles(tagClassName = 'tag-cloud-item') {
        // 创建样式元素
        const style = document.createElement('style');
        style.textContent = `
            .tag-cloud {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }

            .${tagClassName} {
                display: inline-block;
                padding: 6px 14px;
                border-radius: 20px;
                background: linear-gradient(135deg, var(--tag-color), var(--tag-color) 50%, rgba(255, 255, 255, 0.1));
                color: white;
                text-decoration: none;
                font-weight: 500;
                transition: all 0.3s ease;
                cursor: pointer;
                opacity: var(--tag-opacity, 1);
                backdrop-filter: blur(5px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                position: relative;
                overflow: hidden;
            }

            .${tagClassName}::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: left 0.5s ease;
            }

            .${tagClassName}:hover::before {
                left: 100%;
            }

            .${tagClassName}:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
                opacity: 1 !important;
            }

            .${tagClassName}:active {
                transform: translateY(0);
            }

            /* 暗黑模式适配 */
            .dark .${tagClassName} {
                background: linear-gradient(135deg, var(--tag-color), var(--tag-color) 50%, rgba(0, 0, 0, 0.2));
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            .dark .${tagClassName}:hover {
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
            }
        `;

        // 添加到文档头部
        document.head.appendChild(style);
    },

    /**
     * 为标签云添加交互事件
     * @param {string} containerId - 容器ID
     * @param {Function} clickHandler - 点击事件处理函数
     */
    addTagClickEvents(containerId, clickHandler) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器ID ${containerId} 不存在`);
            return;
        }

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-cloud-item')) {
                e.preventDefault();
                const tag = e.target.dataset.tag;
                const count = e.target.dataset.count;
                if (typeof clickHandler === 'function') {
                    clickHandler(tag, count);
                }
            }
        });
    },

    /**
     * 过滤标签云，只显示包含关键词的标签
     * @param {string} containerId - 容器ID
     * @param {string} keyword - 过滤关键词
     */
    filterTagCloud(containerId, keyword) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器ID ${containerId} 不存在`);
            return;
        }

        const tags = container.querySelectorAll('.tag-cloud-item');
        const lowerKeyword = keyword.toLowerCase();

        tags.forEach(tag => {
            const tagText = tag.dataset.tag.toLowerCase();
            if (tagText.includes(lowerKeyword)) {
                tag.style.display = 'inline-block';
            } else {
                tag.style.display = 'none';
            }
        });
    },

    /**
     * 重置标签云过滤
     * @param {string} containerId - 容器ID
     */
    resetTagCloudFilter(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器ID ${containerId} 不存在`);
            return;
        }

        const tags = container.querySelectorAll('.tag-cloud-item');
        tags.forEach(tag => {
            tag.style.display = 'inline-block';
        });
    },

    /**
     * 导出标签云为JSON
     * @param {Array} tags - 标签数组
     * @returns {string} JSON格式的标签数组
     */
    exportTagCloud(tags) {
        return JSON.stringify(tags, null, 2);
    },

    /**
     * 从JSON导入标签云
     * @param {string} jsonStr - JSON格式的标签数组
     * @returns {Array} 标签数组
     */
    importTagCloud(jsonStr) {
        try {
            const tags = JSON.parse(jsonStr);
            if (Array.isArray(tags)) {
                return tags;
            }
        } catch (error) {
            console.error('导入标签云失败:', error);
        }
        return [];
    }
};

// 初始化标签样式
TagCloudManager.initTagStyles();