/**
 * Z+潮流社区 - 移动端手势管理模块
 * 实现滑动返回、下拉刷新等手势功能
 */

const GestureManager = {
    // 配置参数
    config: {
        // 滑动返回配置
        swipeBack: {
            threshold: 50, // 触发返回的最小滑动距离
            maxWidth: 50, // 允许滑动的最大左侧距离
            speed: 0.5, // 滑动速度系数
            enabled: true // 是否启用
        },
        // 下拉刷新配置
        pullRefresh: {
            threshold: 80, // 触发刷新的最小下拉距离
            resistance: 0.5, // 下拉阻力系数
            enabled: true // 是否启用
        }
    },

    // 状态变量
    state: {
        // 滑动返回状态
        swipeBack: {
            startX: 0,
            startY: 0,
            currentX: 0,
            isSwiping: false,
            isProcessing: false
        },
        // 下拉刷新状态
        pullRefresh: {
            startY: 0,
            currentY: 0,
            isPulling: false,
            isRefreshing: false,
            progress: 0
        }
    },

    // 初始化所有手势
    init() {
        if (this.config.swipeBack.enabled) {
            this.initSwipeBack();
        }
        if (this.config.pullRefresh.enabled) {
            this.initPullRefresh();
        }
    },

    // 初始化滑动返回
    initSwipeBack() {
        const self = this;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', function(e) {
            // 只处理单指触摸
            if (e.touches.length !== 1) return;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            // 只有在屏幕左侧边缘才触发滑动返回
            if (touchStartX <= self.config.swipeBack.maxWidth) {
                self.state.swipeBack.isSwiping = true;
                self.state.swipeBack.startX = touchStartX;
                self.state.swipeBack.startY = touchStartY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            if (!self.state.swipeBack.isSwiping || self.state.swipeBack.isProcessing) return;
            
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
            
            // 计算水平和垂直滑动距离
            const deltaX = touchEndX - touchStartX;
            const deltaY = Math.abs(touchEndY - touchStartY);
            
            // 如果垂直滑动距离大于水平滑动距离，不触发返回（避免与下拉刷新冲突）
            if (deltaY > deltaX) {
                self.state.swipeBack.isSwiping = false;
                return;
            }
            
            // 阻止默认滚动行为
            e.preventDefault();
            
            // 更新当前滑动位置
            self.state.swipeBack.currentX = touchEndX;
        }, { passive: false });

        document.addEventListener('touchend', function(e) {
            if (!self.state.swipeBack.isSwiping || self.state.swipeBack.isProcessing) {
                self.state.swipeBack.isSwiping = false;
                return;
            }
            
            touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;
            
            // 检查是否达到滑动返回阈值
            if (deltaX >= self.config.swipeBack.threshold) {
                self.triggerSwipeBack();
            }
            
            // 重置状态
            self.state.swipeBack.isSwiping = false;
        }, { passive: true });
    },

    // 触发滑动返回
    triggerSwipeBack() {
        if (this.state.swipeBack.isProcessing) return;
        
        this.state.swipeBack.isProcessing = true;
        
        // 添加页面退出动画
        document.body.style.transition = `transform ${this.config.swipeBack.speed}s ease`;
        document.body.style.transform = `translateX(100%)`;
        
        // 延迟执行返回操作
        setTimeout(() => {
            // 优先使用浏览器历史返回
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // 如果没有历史记录，返回首页
                window.location.href = 'index.html';
            }
            
            // 重置状态
            setTimeout(() => {
                document.body.style.transition = '';
                document.body.style.transform = '';
                this.state.swipeBack.isProcessing = false;
            }, 100);
        }, this.config.swipeBack.speed * 1000);
    },

    // 初始化下拉刷新
    initPullRefresh() {
        const self = this;
        let touchStartY = 0;
        let touchEndY = 0;
        let startScrollTop = 0;
        
        // 创建刷新指示器元素
        const refreshIndicator = this.createRefreshIndicator();
        document.body.insertBefore(refreshIndicator, document.body.firstChild);

        document.addEventListener('touchstart', function(e) {
            // 只处理单指触摸
            if (e.touches.length !== 1) return;
            
            // 只有在页面顶部才触发下拉刷新
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 0) return;
            
            touchStartY = e.touches[0].clientY;
            startScrollTop = scrollTop;
            
            self.state.pullRefresh.startY = touchStartY;
            self.state.pullRefresh.isPulling = true;
        }, { passive: true });

        document.addEventListener('touchmove', function(e) {
            if (!self.state.pullRefresh.isPulling || self.state.pullRefresh.isRefreshing) return;
            
            touchEndY = e.touches[0].clientY;
            const deltaY = touchEndY - touchStartY;
            
            // 只处理向下拉动
            if (deltaY <= 0) return;
            
            // 计算下拉距离和进度
            const pullDistance = deltaY * self.config.pullRefresh.resistance;
            const progress = Math.min(pullDistance / self.config.pullRefresh.threshold, 1);
            
            // 更新状态
            self.state.pullRefresh.currentY = touchEndY;
            self.state.pullRefresh.progress = progress;
            
            // 更新刷新指示器
            self.updateRefreshIndicator(pullDistance, progress);
            
            // 阻止默认滚动行为
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', function(e) {
            if (!self.state.pullRefresh.isPulling || self.state.pullRefresh.isRefreshing) {
                self.resetRefreshIndicator();
                self.state.pullRefresh.isPulling = false;
                return;
            }
            
            touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchEndY - touchStartY;
            const pullDistance = deltaY * self.config.pullRefresh.resistance;
            
            // 检查是否达到刷新阈值
            if (pullDistance >= self.config.pullRefresh.threshold) {
                self.triggerPullRefresh();
            } else {
                // 未达到阈值，重置指示器
                self.resetRefreshIndicator();
            }
            
            // 重置状态
            self.state.pullRefresh.isPulling = false;
        }, { passive: true });
    },

    // 创建刷新指示器
    createRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'pullRefreshIndicator';
        indicator.style.cssText = `
            position: fixed;
            top: -80px;
            left: 0;
            width: 100%;
            height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: top 0.3s ease;
            z-index: 9999;
            pointer-events: none;
        `;
        
        indicator.innerHTML = `
            <div class="refresh-icon" style="
                width: 32px;
                height: 32px;
                border: 2px solid #FF6B35;
                border-top-color: transparent;
                border-radius: 50%;
                margin-bottom: 8px;
                transition: transform 0.3s ease;
            "></div>
            <div class="refresh-text" style="
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            ">下拉刷新</div>
        `;
        
        return indicator;
    },

    // 更新刷新指示器
    updateRefreshIndicator(distance, progress) {
        const indicator = document.getElementById('pullRefreshIndicator');
        if (!indicator) return;
        
        // 更新位置
        indicator.style.top = `${Math.min(distance - 80, 0)}px`;
        
        // 更新图标旋转角度
        const icon = indicator.querySelector('.refresh-icon');
        icon.style.transform = `rotate(${progress * 360}deg)`;
        
        // 更新文字
        const text = indicator.querySelector('.refresh-text');
        if (progress >= 1) {
            text.textContent = '释放刷新';
        } else {
            text.textContent = '下拉刷新';
        }
    },

    // 重置刷新指示器
    resetRefreshIndicator() {
        const indicator = document.getElementById('pullRefreshIndicator');
        if (!indicator) return;
        
        // 重置位置
        indicator.style.top = '-80px';
        
        // 重置图标
        const icon = indicator.querySelector('.refresh-icon');
        icon.style.transform = 'rotate(0deg)';
        
        // 重置文字
        const text = indicator.querySelector('.refresh-text');
        text.textContent = '下拉刷新';
        
        // 重置状态
        this.state.pullRefresh.progress = 0;
    },

    // 触发下拉刷新
    triggerPullRefresh() {
        if (this.state.pullRefresh.isRefreshing) return;
        
        this.state.pullRefresh.isRefreshing = true;
        
        const indicator = document.getElementById('pullRefreshIndicator');
        const icon = indicator.querySelector('.refresh-icon');
        const text = indicator.querySelector('.refresh-text');
        
        // 更新指示器状态
        indicator.style.top = '0px';
        icon.style.animation = 'spin 1s linear infinite';
        text.textContent = '刷新中...';
        
        // 添加旋转动画
        if (!document.getElementById('refreshAnimationStyle')) {
            const style = document.createElement('style');
            style.id = 'refreshAnimationStyle';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // 触发刷新事件
        this.emit('refresh');
        
        // 模拟刷新完成（实际使用时应替换为真实的刷新逻辑）
        setTimeout(() => {
            this.completePullRefresh();
        }, 1500);
    },

    // 完成下拉刷新
    completePullRefresh() {
        const indicator = document.getElementById('pullRefreshIndicator');
        const icon = indicator.querySelector('.refresh-icon');
        const text = indicator.querySelector('.refresh-text');
        
        // 更新指示器状态
        text.textContent = '刷新完成';
        icon.style.animation = '';
        icon.style.transform = 'rotate(360deg)';
        
        // 延迟隐藏指示器
        setTimeout(() => {
            this.resetRefreshIndicator();
            this.state.pullRefresh.isRefreshing = false;
        }, 500);
    },

    // 事件系统
    events: {},
    
    // 绑定事件
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },
    
    // 触发事件
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                callback(data);
            });
        }
    },
    
    // 解绑事件
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    },

    // 启用/禁用手势功能
    enable(type, enabled) {
        if (type === 'swipeBack') {
            this.config.swipeBack.enabled = enabled;
        } else if (type === 'pullRefresh') {
            this.config.pullRefresh.enabled = enabled;
        }
    },

    // 获取手势状态
    getState(type) {
        return this.state[type] || null;
    }
};

// 初始化手势管理器
if (typeof window !== 'undefined') {
    // 只在移动端设备上初始化
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // 延迟初始化，确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                GestureManager.init();
            });
        } else {
            GestureManager.init();
        }
    }
}
