class LazyLoadManager {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        // 检查浏览器是否支持Intersection Observer API
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            // 如果不支持，直接加载所有图片
            this.loadAllImages();
        }
    }

    setupObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.observer.unobserve(img);
                    }
                });
            },
            {
                rootMargin: '0px 0px 200px 0px', // 提前200px加载
                threshold: 0.1
            }
        );

        // 观察所有带有lazy-load类的图片
        this.observeImages();
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        lazyImages.forEach((img) => {
            this.observer.observe(img);
        });
    }

    loadImage(img) {
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
        }
        
        // 添加加载完成类
        img.onload = () => {
            img.classList.add('lazy-loaded');
        };
        
        // 处理加载失败
        img.onerror = () => {
            img.classList.add('lazy-failed');
        };
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        lazyImages.forEach((img) => {
            this.loadImage(img);
        });
    }

    // 用于动态添加图片后重新观察
    refresh() {
        if (this.observer) {
            this.observeImages();
        } else {
            this.loadAllImages();
        }
    }
}

// 初始化懒加载管理器
const lazyLoadManager = new LazyLoadManager();
