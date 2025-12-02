/**
 * Z+潮流社区 - 搜索管理模块
 * 纯前端localStorage实现
 */

const SearchManager = {
    /**
     * 搜索所有内容
     * @param {string} keyword - 搜索关键词
     * @returns {Object} 搜索结果，包含用户、动态和社群
     */
    searchAll(keyword) {
        const users = this.searchUsers(keyword);
        const posts = this.searchPosts(keyword);
        const communities = this.searchCommunities(keyword);
        
        return {
            users,
            posts,
            communities,
            total: users.length + posts.length + communities.length
        };
    },
    
    /**
     * 搜索用户
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 用户列表
     */
    searchUsers(keyword) {
        if (!keyword.trim()) return [];
        
        const users = JSON.parse(localStorage.getItem(UserManager.STORAGE_KEYS.USERS) || '{}');
        const userList = Object.values(users);
        
        return userList.filter(user => {
            return user.username.toLowerCase().includes(keyword.toLowerCase()) ||
                   (user.tags && user.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) ||
                   (user.signature && user.signature.toLowerCase().includes(keyword.toLowerCase()));
        });
    },
    
    /**
     * 搜索动态
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 动态列表
     */
    searchPosts(keyword) {
        if (!keyword.trim()) return [];
        
        const posts = JSON.parse(localStorage.getItem(PostsManager.STORAGE_KEY) || '[]');
        
        return posts.filter(post => {
            return post.content.toLowerCase().includes(keyword.toLowerCase()) ||
                   (post.tags && post.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))) ||
                   post.username.toLowerCase().includes(keyword.toLowerCase());
        });
    },
    
    /**
     * 搜索社群
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 社群列表
     */
    searchCommunities(keyword) {
        if (!keyword.trim()) return [];
        
        const communities = JSON.parse(localStorage.getItem(CommunityManager.STORAGE_KEY) || '[]');
        
        return communities.filter(community => {
            return community.name.toLowerCase().includes(keyword.toLowerCase()) ||
                   community.description.toLowerCase().includes(keyword.toLowerCase()) ||
                   community.category.toLowerCase().includes(keyword.toLowerCase());
        });
    }
};

/**
 * 执行搜索并显示结果
 */
function performSearch() {
    const keyword = document.getElementById('searchInput').value.trim();
    
    if (!keyword) {
        alert('请输入搜索关键词');
        return;
    }
    
    // 更新URL
    window.history.pushState({}, '', `?q=${encodeURIComponent(keyword)}`);
    
    // 执行搜索
    const results = SearchManager.searchAll(keyword);
    
    // 更新结果统计
    document.getElementById('resultCount').textContent = results.total;
    
    // 清空现有结果
    document.getElementById('userResultsList').innerHTML = '';
    document.getElementById('postResultsList').innerHTML = '';
    document.getElementById('communityResultsList').innerHTML = '';
    document.getElementById('usersResultsList').innerHTML = '';
    document.getElementById('postsResultsList').innerHTML = '';
    document.getElementById('communitiesResultsList').innerHTML = '';
    
    // 显示无结果提示或结果
    if (results.total === 0) {
        document.getElementById('searchResults').classList.add('hidden');
        document.getElementById('noResults').classList.remove('hidden');
    } else {
        document.getElementById('searchResults').classList.remove('hidden');
        document.getElementById('noResults').classList.add('hidden');
        
        // 渲染用户结果
        renderUserResults(results.users);
        
        // 渲染动态结果
        renderPostResults(results.posts);
        
        // 渲染社群结果
        renderCommunityResults(results.communities);
    }
}

/**
 * 渲染用户结果
 * @param {Array} users - 用户列表
 */
function renderUserResults(users) {
    const userResultsList = document.getElementById('userResultsList');
    const usersResultsList = document.getElementById('usersResultsList');
    
    if (users.length === 0) {
        userResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center col-span-full">暂无用户结果</p>';
        usersResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center col-span-full">暂无用户结果</p>';
        return;
    }
    
    const userHtml = users.map(user => `
        <a href="/profile.html?username=${encodeURIComponent(user.username)}" class="block bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
            <div class="p-6">
                <div class="flex items-center space-x-4">
                    <img src="${user.avatar}" alt="${user.username}" class="w-16 h-16 rounded-full border-2 border-primary">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold dark:text-white">${user.username}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">${user.signature || '暂无签名'}</p>
                        <div class="mt-2 flex flex-wrap gap-2">
                            ${user.tags.map(tag => `<span class="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </a>
    `).join('');
    
    userResultsList.innerHTML = userHtml;
    usersResultsList.innerHTML = userHtml;
}

/**
 * 渲染动态结果
 * @param {Array} posts - 动态列表
 */
function renderPostResults(posts) {
    const postResultsList = document.getElementById('postResultsList');
    const postsResultsList = document.getElementById('postsResultsList');
    
    if (posts.length === 0) {
        postResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">暂无动态结果</p>';
        postsResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-8">暂无动态结果</p>';
        return;
    }
    
    const postHtml = posts.map(post => {
        // 获取发布者信息
        const users = JSON.parse(localStorage.getItem(UserManager.STORAGE_KEYS.USERS) || '{}');
        const user = users[post.username] || { username: post.username, avatar: 'https://picsum.photos/200/200?random=default' };
        
        return `
            <div class="bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
                <div class="p-6">
                    <div class="flex items-center space-x-4 mb-4">
                        <a href="profile.html?username=${encodeURIComponent(post.username)}" class="flex items-center space-x-2">
                            <img src="${user.avatar}" alt="${post.username}" class="w-12 h-12 rounded-full border-2 border-primary">
                            <span class="font-bold dark:text-white">${post.username}</span>
                        </a>
                        <span class="text-gray-400 dark:text-gray-500 text-sm ml-auto">${post.createTime}</span>
                    </div>
                    
                    <div class="mb-4">
                        <p class="dark:text-gray-300">${post.content}</p>
                        
                        ${post.images && post.images.length > 0 ? `
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                ${post.images.map(img => `
                                    <img src="${img}" alt="动态图片" class="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    ${post.tags && post.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${post.tags.map(tag => `<a href="#" class="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">${tag}</a>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="flex items-center justify-between text-gray-500 dark:text-gray-400">
                        <button class="flex items-center space-x-1 hover:text-primary transition-colors">
                            <i class="fa fa-heart"></i>
                            <span>${post.likes.length}</span>
                        </button>
                        <button class="flex items-center space-x-1 hover:text-primary transition-colors">
                            <i class="fa fa-comment"></i>
                            <span>${post.comments.length}</span>
                        </button>
                        <button class="flex items-center space-x-1 hover:text-primary transition-colors">
                            <i class="fa fa-star"></i>
                            <span>${post.collects.length}</span>
                        </button>
                        <button class="flex items-center space-x-1 hover:text-primary transition-colors">
                            <i class="fa fa-share"></i>
                            <span>分享</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    postResultsList.innerHTML = postHtml;
    postsResultsList.innerHTML = postHtml;
}

/**
 * 渲染社群结果
 * @param {Array} communities - 社群列表
 */
function renderCommunityResults(communities) {
    const communityResultsList = document.getElementById('communityResultsList');
    const communitiesResultsList = document.getElementById('communitiesResultsList');
    
    if (communities.length === 0) {
        communityResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center col-span-full">暂无社群结果</p>';
        communitiesResultsList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center col-span-full">暂无社群结果</p>';
        return;
    }
    
    const communityHtml = communities.map(community => `
        <div class="bg-white dark:bg-dark-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
            <div class="p-6">
                <div class="flex items-center space-x-4">
                    <img src="${community.avatar}" alt="${community.name}" class="w-16 h-16 rounded-full border-2 border-primary">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold dark:text-white">${community.name}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mb-2">${community.description}</p>
                        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span class="mr-4"><i class="fa fa-users mr-1"></i> ${community.memberCount} 成员</span>
                            <span><i class="fa fa-tags mr-1"></i> ${community.category}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    communityResultsList.innerHTML = communityHtml;
    communitiesResultsList.innerHTML = communityHtml;
}