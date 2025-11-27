/**
 * Z+ 潮流社区 - 核心主题引擎
 * 包含：Tailwind配置、主题切换、3D Tilt、视差滚动
 */

// 1. Tailwind 配置
// 在页面加载前配置，确保样式正确应用
window.tailwindConfig = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#FF6B35',    // 活力橙
                secondary: '#40BFFF',  // 天空蓝
                accent: '#FF7DAB',     // 嫩粉
                yellow: '#FFD166',     // 亮黄
                dark: '#0F172A',       // 深色背景 (Slate 900)
                'dark-card': '#1E293B', // 深色卡片 (Slate 800)
                light: '#F8FAFC',       // 浅色
            },
            fontFamily: {
                inter: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 3s infinite',
                'blob': 'blob 7s infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                }
            }
        },
    }
};

// 注入 Tailwind 配置
if (window.tailwind) {
    tailwind.config = window.tailwindConfig;
} else {
    // 如果 Tailwind 尚未加载，等待加载后注入（简单的轮询）
    const checkTailwind = setInterval(() => {
        if (window.tailwind) {
            tailwind.config = window.tailwindConfig;
            clearInterval(checkTailwind);
        }
    }, 50);
}

// 2. 主题管理模块
const ThemeManager = {
    init() {
        // 避免闪烁：立即执行
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // DOM 加载完成后更新 UI
        window.addEventListener('DOMContentLoaded', () => {
            this.updateToggleIcons();
            this.bindEvents();
        });
    },

    toggle() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        }
        this.updateToggleIcons();
    },

    updateToggleIcons() {
        const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
        const themeToggleMobile = document.getElementById('theme-toggle-mobile');
        const isDark = document.documentElement.classList.contains('dark');
        const iconClass = isDark ? 'fa-sun-o' : 'fa-moon-o';
        
        // 桌面端
        if (themeToggleDesktop) {
            const icon = themeToggleDesktop.querySelector('i');
            if (icon) icon.className = `fa ${iconClass} text-lg`;
            if (isDark) {
                themeToggleDesktop.classList.add('bg-slate-700', 'text-yellow');
                themeToggleDesktop.classList.remove('bg-gray-100', 'text-dark');
            } else {
                themeToggleDesktop.classList.add('bg-gray-100', 'text-dark');
                themeToggleDesktop.classList.remove('bg-slate-700', 'text-yellow');
            }
        }
        
        // 移动端
        if (themeToggleMobile) {
            const icon = themeToggleMobile.querySelector('i');
            if (icon) icon.className = `fa ${iconClass} text-xl`;
            themeToggleMobile.className = `md:hidden transition-custom mr-2 ${isDark ? 'text-yellow' : 'text-dark'}`;
        }
    },

    bindEvents() {
        const desktopBtn = document.getElementById('theme-toggle-desktop');
        const mobileBtn = document.getElementById('theme-toggle-mobile');
        
        if (desktopBtn) desktopBtn.addEventListener('click', () => this.toggle());
        if (mobileBtn) mobileBtn.addEventListener('click', () => this.toggle());
    }
};

// 立即初始化主题（防止白屏闪烁）
ThemeManager.init();

// 3. 3D Tilt 引擎
const TiltEngine = {
    init() {
        if (window.innerWidth > 768) {
            const cards = document.querySelectorAll('.card-hover, .tilt-element, .community-card');
            cards.forEach(card => {
                card.removeEventListener('mousemove', this.handleTilt); // 防止重复绑定
                card.removeEventListener('mouseleave', this.resetTilt);
                
                card.addEventListener('mousemove', this.handleTilt);
                card.addEventListener('mouseleave', this.resetTilt);
                
                // 标记已绑定
                card.classList.add('tilt-enabled');
            });
        }
    },

    handleTilt(e) {
        // 使用 currentTarget 确保获取的是绑定事件的元素
        const card = e.currentTarget; 
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -5; 
        const rotateY = ((x - centerX) / centerX) * 5;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = 'none';
    },

    resetTilt(e) {
        const card = e.currentTarget;
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.5s ease';
    }
};

// 4. 视差滚动引擎
const ParallaxEngine = {
    init() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.update();
                    ticking = false;
                });
                ticking = true;
            }
        });
    },

    update() {
        const blobs = document.querySelectorAll('.animate-blob');
        if (blobs.length === 0) return;
        
        const scrolled = window.scrollY;
        blobs.forEach((blob, index) => {
            const speed = 0.05 * (index + 1);
            const yPos = scrolled * speed;
            blob.style.transform = `translateY(${yPos}px)`;
        });
    }
};

// 5. 动画增强 (交错显示)
const AnimationEnhancer = {
    initStagger() {
        const staggerItems = document.querySelectorAll('.grid > div, .grid > a, .community-card');
        staggerItems.forEach((item, index) => {
            const colCount = window.innerWidth > 1024 ? 3 : (window.innerWidth > 768 ? 2 : 1);
            const delay = (index % colCount) * 150; 
            item.style.transitionDelay = `${delay}ms`;
            item.classList.add('scroll-animate');
        });
        
        this.observeScroll();
    },

    observeScroll() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px'
            });

            document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
        } else {
            // 降级处理
            document.querySelectorAll('.scroll-animate').forEach(el => el.classList.add('visible'));
        }
    }
};

// 全局初始化入口
window.addEventListener('DOMContentLoaded', () => {
    // 延迟加载动效，优先首屏内容
    setTimeout(() => {
        TiltEngine.init();
        ParallaxEngine.init();
        AnimationEnhancer.initStagger();
    }, 500);
});

// 暴露给全局以便手动调用 (例如在动态加载内容后)
window.ZPlus = {
    ThemeManager,
    TiltEngine,
    ParallaxEngine,
    AnimationEnhancer
};

