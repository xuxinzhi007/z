/**
 * Z+潮流社区 - 数据统计管理模块
 * 纯前端localStorage实现
 */

const StatsManager = {
    /**
     * 获取系统总用户数
     * @returns {number} 总用户数
     */
    getTotalUsers() {
        const users = JSON.parse(localStorage.getItem('z_users') || '{}');
        return Object.keys(users).length;
    },

    /**
     * 获取系统总动态数
     * @returns {number} 总动态数
     */
    getTotalPosts() {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        return posts.length;
    },

    /**
     * 获取系统总社群数
     * @returns {number} 总社群数
     */
    getTotalCommunities() {
        const communities = JSON.parse(localStorage.getItem('z_communities') || '[]');
        return communities.length;
    },

    /**
     * 获取系统总点赞数
     * @returns {number} 总点赞数
     */
    getTotalLikes() {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        return posts.reduce((total, post) => total + post.likes.length, 0);
    },

    /**
     * 获取系统总收藏数
     * @returns {number} 总收藏数
     */
    getTotalCollects() {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        return posts.reduce((total, post) => total + post.collects.length, 0);
    },

    /**
     * 获取用户发布的动态数
     * @param {string} username - 用户名
     * @returns {number} 用户发布的动态数
     */
    getUserPostCount(username) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        return posts.filter(post => post.username === username).length;
    },

    /**
     * 获取用户获得的点赞数
     * @param {string} username - 用户名
     * @returns {number} 用户获得的点赞数
     */
    getUserLikeCount(username) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const userPosts = posts.filter(post => post.username === username);
        return userPosts.reduce((total, post) => total + post.likes.length, 0);
    },

    /**
     * 获取用户获得的收藏数
     * @param {string} username - 用户名
     * @returns {number} 用户获得的收藏数
     */
    getUserCollectCount(username) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const userPosts = posts.filter(post => post.username === username);
        return userPosts.reduce((total, post) => total + post.collects.length, 0);
    },

    /**
     * 获取用户加入的社群数
     * @param {string} username - 用户名
     * @returns {number} 用户加入的社群数
     */
    getUserCommunityCount(username) {
        const communities = JSON.parse(localStorage.getItem('z_communities') || '[]');
        return communities.filter(community => community.members.includes(username)).length;
    },

    /**
     * 获取用户的关注数
     * @param {string} username - 用户名
     * @returns {number} 用户的关注数
     */
    getUserFollowingCount(username) {
        // 关注功能待实现，暂时返回0
        return 0;
    },

    /**
     * 获取用户的粉丝数
     * @param {string} username - 用户名
     * @returns {number} 用户的粉丝数
     */
    getUserFollowersCount(username) {
        // 粉丝功能待实现，暂时返回0
        return 0;
    },

    /**
     * 获取最近7天的动态发布趋势
     * @returns {Object} 最近7天的动态发布趋势
     */
    getRecentPostTrend() {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const now = new Date();
        const trend = {};

        // 初始化最近7天的日期
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trend[dateStr] = 0;
        }

        // 统计每天的动态数
        posts.forEach(post => {
            const postDate = post.createTime.split(' ')[0];
            if (trend[postDate] !== undefined) {
                trend[postDate]++;
            }
        });

        return trend;
    },

    /**
     * 获取热门标签排名
     * @param {number} limit - 返回的标签数量
     * @returns {Array} 热门标签排名
     */
    getHotTags(limit = 10) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const tagCount = {};

        // 统计标签出现次数
        posts.forEach(post => {
            if (post.tags && post.tags.length > 0) {
                post.tags.forEach(tag => {
                    tagCount[tag] = (tagCount[tag] || 0) + 1;
                });
            }
        });

        // 排序并返回前limit个标签
        return Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    },

    /**
     * 获取活跃用户排名
     * @param {number} limit - 返回的用户数量
     * @returns {Array} 活跃用户排名
     */
    getActiveUsers(limit = 10) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const userActivity = {};

        // 统计每个用户的动态数
        posts.forEach(post => {
            userActivity[post.username] = (userActivity[post.username] || 0) + 1;
        });

        // 排序并返回前limit个用户
        return Object.entries(userActivity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([username, count]) => ({ username, count }));
    },

    /**
     * 获取热门社群排名
     * @param {number} limit - 返回的社群数量
     * @returns {Array} 热门社群排名
     */
    getHotCommunities(limit = 10) {
        const communities = JSON.parse(localStorage.getItem('z_communities') || '[]');

        // 按成员数量排序并返回前limit个社群
        return communities
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, limit);
    },

    /**
     * 获取用户的动态发布趋势
     * @param {string} username - 用户名
     * @returns {Object} 用户的动态发布趋势
     */
    getUserPostTrend(username) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const userPosts = posts.filter(post => post.username === username);
        const now = new Date();
        const trend = {};

        // 初始化最近7天的日期
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trend[dateStr] = 0;
        }

        // 统计每天的动态数
        userPosts.forEach(post => {
            const postDate = post.createTime.split(' ')[0];
            if (trend[postDate] !== undefined) {
                trend[postDate]++;
            }
        });

        return trend;
    },

    /**
     * 获取用户的互动统计
     * @param {string} username - 用户名
     * @returns {Object} 用户的互动统计
     */
    getUserInteractionStats(username) {
        const posts = JSON.parse(localStorage.getItem('allPosts') || '[]');
        const userPosts = posts.filter(post => post.username === username);

        const totalLikes = userPosts.reduce((total, post) => total + post.likes.length, 0);
        const totalCollects = userPosts.reduce((total, post) => total + post.collects.length, 0);
        const totalComments = userPosts.reduce((total, post) => total + post.comments.length, 0);

        return {
            likes: totalLikes,
            collects: totalCollects,
            comments: totalComments,
            total: totalLikes + totalCollects + totalComments
        };
    },

    /**
     * 获取系统整体统计数据
     * @returns {Object} 系统整体统计数据
     */
    getSystemStats() {
        return {
            totalUsers: this.getTotalUsers(),
            totalPosts: this.getTotalPosts(),
            totalCommunities: this.getTotalCommunities(),
            totalLikes: this.getTotalLikes(),
            totalCollects: this.getTotalCollects(),
            hotTags: this.getHotTags(5),
            activeUsers: this.getActiveUsers(5),
            recentPostTrend: this.getRecentPostTrend()
        };
    },

    /**
     * 获取用户个人统计数据
     * @param {string} username - 用户名
     * @returns {Object} 用户个人统计数据
     */
    getUserStats(username) {
        return {
            postCount: this.getUserPostCount(username),
            likeCount: this.getUserLikeCount(username),
            collectCount: this.getUserCollectCount(username),
            communityCount: this.getUserCommunityCount(username),
            followingCount: this.getUserFollowingCount(username),
            followersCount: this.getUserFollowersCount(username),
            postTrend: this.getUserPostTrend(username),
            interactionStats: this.getUserInteractionStats(username)
        };
    },

    /**
     * 初始化统计数据（创建测试数据）
     */
    initTestData() {
        // 检查是否已有数据，没有则创建测试数据
        if (this.getTotalUsers() === 0) {
            // 创建测试用户
            const testUsers = {
                'test1': {
                    username: 'test1',
                    password: 'test123',
                    avatar: 'https://picsum.photos/100/100?random=1',
                    tags: ['潮流达人', '时尚博主'],
                    signature: '追求时尚，热爱生活',
                    points: 100
                },
                'test2': {
                    username: 'test2',
                    password: 'test123',
                    avatar: 'https://picsum.photos/100/100?random=2',
                    tags: ['游戏玩家', '科技爱好者'],
                    signature: '游戏人生，科技改变世界',
                    points: 200
                }
            };
            localStorage.setItem('z_users', JSON.stringify(testUsers));

            // 创建测试动态
            const testPosts = [
                {
                    id: '1',
                    username: 'test1',
                    content: '今天的穿搭分享～',
                    images: [],
                    tags: ['#穿搭', '#时尚'],
                    createTime: new Date().toLocaleString(),
                    likes: ['test2'],
                    comments: [],
                    collects: ['test2']
                },
                {
                    id: '2',
                    username: 'test2',
                    content: '最新游戏测评！',
                    images: [],
                    tags: ['#游戏', '#测评'],
                    createTime: new Date().toLocaleString(),
                    likes: ['test1'],
                    comments: [],
                    collects: []
                }
            ];
            localStorage.setItem('allPosts', JSON.stringify(testPosts));

            // 创建测试社群
            const testCommunities = [
                {
                    id: '1',
                    name: '时尚穿搭',
                    description: '分享时尚穿搭技巧',
                    category: '穿搭',
                    creator: 'test1',
                    members: ['test1', 'test2'],
                    memberCount: 2,
                    posts: 0,
                    avatar: 'https://picsum.photos/100/100?random=10',
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    name: '游戏爱好者',
                    description: '讨论游戏攻略和资讯',
                    category: '游戏',
                    creator: 'test2',
                    members: ['test1', 'test2'],
                    memberCount: 2,
                    posts: 0,
                    avatar: 'https://picsum.photos/100/100?random=11',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('z_communities', JSON.stringify(testCommunities));
        }
    }
};

// 初始化测试数据
// StatsManager.initTestData();