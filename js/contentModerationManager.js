/**
 * Z+潮流社区 - 内容审核管理模块
 * 纯前端实现敏感词过滤
 */

const ContentModerationManager = {
    // 存储键名
    STORAGE_KEY: 'z_sensitive_words',

    /**
     * 默认敏感词列表
     */
    DEFAULT_SENSITIVE_WORDS: [
        '违法',
        '违规',
        '色情',
        '低俗',
        '暴力',
        '恐怖',
        '赌博',
        '诈骗',
        '毒品',
        '政治',
        '反共',
        '邪教',
        '辱骂',
        '人身攻击',
        '垃圾广告',
        '钓鱼网站',
        '病毒',
        '木马',
        '黑客',
        '破解'
    ],

    /**
     * 初始化敏感词存储
     */
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_SENSITIVE_WORDS));
        }
    },

    /**
     * 获取敏感词列表
     * @returns {Array} 敏感词列表
     */
    getSensitiveWords() {
        this.init();
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },

    /**
     * 添加敏感词
     * @param {string} word - 敏感词
     * @returns {Object} 操作结果
     */
    addSensitiveWord(word) {
        this.init();

        const sensitiveWords = this.getSensitiveWords();
        const trimmedWord = word.trim();

        if (!trimmedWord) {
            return { 
                success: false, 
                message: '敏感词不能为空' 
            };
        }

        if (sensitiveWords.includes(trimmedWord)) {
            return { 
                success: false, 
                message: '该敏感词已存在' 
            };
        }

        sensitiveWords.push(trimmedWord);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensitiveWords));

        return { 
            success: true, 
            message: '敏感词添加成功' 
        };
    },

    /**
     * 删除敏感词
     * @param {string} word - 敏感词
     * @returns {Object} 操作结果
     */
    removeSensitiveWord(word) {
        this.init();

        const sensitiveWords = this.getSensitiveWords();
        const index = sensitiveWords.indexOf(word);

        if (index === -1) {
            return { 
                success: false, 
                message: '该敏感词不存在' 
            };
        }

        sensitiveWords.splice(index, 1);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensitiveWords));

        return { 
            success: true, 
            message: '敏感词删除成功' 
        };
    },

    /**
     * 批量添加敏感词
     * @param {Array} words - 敏感词数组
     * @returns {Object} 操作结果
     */
    addBatchSensitiveWords(words) {
        this.init();

        const sensitiveWords = this.getSensitiveWords();
        let addedCount = 0;
        let failedCount = 0;
        const failedWords = [];

        words.forEach(word => {
            const trimmedWord = word.trim();
            if (trimmedWord && !sensitiveWords.includes(trimmedWord)) {
                sensitiveWords.push(trimmedWord);
                addedCount++;
            } else {
                failedCount++;
                failedWords.push(word);
            }
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sensitiveWords));

        return { 
            success: true, 
            message: `成功添加 ${addedCount} 个敏感词，失败 ${failedCount} 个`,
            addedCount: addedCount,
            failedCount: failedCount,
            failedWords: failedWords
        };
    },

    /**
     * 清空敏感词列表
     * @returns {Object} 操作结果
     */
    clearSensitiveWords() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        return { 
            success: true, 
            message: '敏感词列表已清空' 
        };
    },

    /**
     * 检测文本中是否包含敏感词
     * @param {string} text - 待检测文本
     * @returns {Object} 检测结果
     */
    detectSensitiveWords(text) {
        this.init();

        const sensitiveWords = this.getSensitiveWords();
        const foundWords = [];

        if (!text) {
            return { 
                hasSensitiveWords: false, 
                foundWords: [] 
            };
        }

        // 检测每个敏感词
        sensitiveWords.forEach(word => {
            if (text.includes(word)) {
                foundWords.push(word);
            }
        });

        return { 
            hasSensitiveWords: foundWords.length > 0, 
            foundWords: foundWords 
        };
    },

    /**
     * 过滤文本中的敏感词，替换为星号
     * @param {string} text - 待过滤文本
     * @param {string} [replacement='***'] - 替换字符，默认为星号
     * @returns {string} 过滤后的文本
     */
    filterSensitiveWords(text, replacement = '***') {
        this.init();

        if (!text) {
            return text;
        }

        const sensitiveWords = this.getSensitiveWords();
        let filteredText = text;

        // 按长度排序，优先替换长词
        const sortedWords = [...sensitiveWords].sort((a, b) => b.length - a.length);

        // 替换每个敏感词
        sortedWords.forEach(word => {
            if (word && filteredText.includes(word)) {
                // 使用正则表达式替换所有匹配项，忽略大小写
                const regex = new RegExp(word, 'gi');
                filteredText = filteredText.replace(regex, replacement);
            }
        });

        return filteredText;
    },

    /**
     * 检测并过滤文本中的敏感词
     * @param {string} text - 待处理文本
     * @param {string} [replacement='***'] - 替换字符
     * @returns {Object} 处理结果
     */
    moderateText(text, replacement = '***') {
        const detectionResult = this.detectSensitiveWords(text);
        const filteredText = this.filterSensitiveWords(text, replacement);

        return {
            originalText: text,
            filteredText: filteredText,
            hasSensitiveWords: detectionResult.hasSensitiveWords,
            foundWords: detectionResult.foundWords
        };
    },

    /**
     * 格式化敏感词为正则表达式
     * @returns {RegExp} 敏感词正则表达式
     */
    getSensitiveWordRegex() {
        this.init();
        const sensitiveWords = this.getSensitiveWords();
        const pattern = sensitiveWords.join('|');
        return new RegExp(pattern, 'gi');
    },

    /**
     * 导出敏感词列表
     * @returns {string} JSON格式的敏感词列表
     */
    exportSensitiveWords() {
        this.init();
        return localStorage.getItem(this.STORAGE_KEY);
    },

    /**
     * 导入敏感词列表
     * @param {string} jsonStr - JSON格式的敏感词列表
     * @returns {Object} 操作结果
     */
    importSensitiveWords(jsonStr) {
        try {
            const words = JSON.parse(jsonStr);
            if (!Array.isArray(words)) {
                return { 
                    success: false, 
                    message: '导入数据格式错误，必须是数组' 
                };
            }

            // 过滤空字符串
            const validWords = words.filter(word => typeof word === 'string' && word.trim());
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validWords));

            return { 
                success: true, 
                message: `成功导入 ${validWords.length} 个敏感词` 
            };
        } catch (error) {
            return { 
                success: false, 
                message: '导入数据格式错误，无法解析JSON' 
            };
        }
    }
};

// 初始化
ContentModerationManager.init();