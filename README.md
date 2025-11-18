# Z+ 潮流社区 - GenZ Trend Hub

🔥 **「潮玩 + 社交」聚集地，用年轻的视觉语言，做无压力的潮流分享平台！**

**纯前端原生实现** | **活力撞色设计** | **丝滑交互体验**

不搞复杂规则，只给 Z 世代最对味的潮流社交感～

## 📦 项目结构

```
z/
├── index.html          # 首页（潮流展示、社区入口）
├── login.html          # 登录页（真实验证、忘记密码）
├── register.html       # 注册页（动画反馈、标签选择）
├── profile.html        # 用户详情页（资料展示、编辑功能）
├── trend-detail.html   # 潮流详情页
├── love/               # Love特色模块
│   └── index.html
├── js/
│   ├── userManager.js  # 用户数据管理模块
│   └── postsManager.js # 动态数据管理模块
└── README.md
```

## 🎨 核心功能

### 1. 用户系统
- ✅ 注册（支持用户名/邮箱，动画反馈）
- ✅ 登录（真实验证，记住登录状态）
- ✅ 个人主页（资料展示、编辑签名）
- ✅ 退出登录

### 2. 数据管理
- ✅ 用户数据（localStorage存储）
- ✅ 动态发布（点赞/评论/收藏）
- ✅ 登录状态持久化

### 3. 特色体验
- ✅ 注册成功动画（渐变圆环→粒子炸开→标签卡片）
- ✅ 00后潮流风格（活力橙/天空蓝/嫩粉配色）
- ✅ 响应式设计（移动端适配）

## 💾 数据结构

### 用户数据 (localStorage: `z_users`)
```javascript
{
  username: 'xxx',           // 用户名（6-20位，支持@._-）
  password: 'Base64加密',     // 密码（8-20位，字母+数字）
  avatar: 'URL',             // 头像
  tags: ['潮流新星'],         // 个性标签
  signature: '签名',         // 个性签名
  cover: 'URL',              // 主页封面
  points: 0,                 // 积分
  createTime: 'ISO时间',
  updateTime: 'ISO时间'
}
```

### 动态数据 (localStorage: `allPosts`)
```javascript
{
  id: 时间戳+随机数,
  username: '发布者',
  content: '动态内容',
  images: ['图片URL'],       // 最多3张
  tags: ['#标签'],           // 最多3个
  createTime: '发布时间',
  likes: ['用户名'],         // 点赞列表
  comments: [],              // 评论列表
  collects: ['用户名']       // 收藏列表
}
```

### 登录状态
```javascript
localStorage.setItem('isLogin', 'true');
localStorage.setItem('currentUser', 'username');
```

## 🚀 快速开始

1. **克隆项目**
```bash
git clone <repository-url>
cd z
```

2. **直接打开**
```bash
# 使用浏览器打开 index.html
open index.html
```

3. **或使用本地服务器**
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```

4. **访问**
```
http://localhost:8000
```

## 📝 使用说明

### 注册新用户
1. 点击"注册"按钮
2. 输入用户名（支持邮箱格式）和密码
3. 选择个性标签（或等待自动确认）
4. 自动登录并跳转首页

### 发布动态
```javascript
// 引入模块后调用
PostsManager.createPost({
  content: '今天的穿搭分享～',
  images: ['图片URL1', '图片URL2'],
  tags: ['#街头穿搭', '#潮流']
});
```

### 用户操作
```javascript
// 点赞动态
PostsManager.toggleLike(postId);

// 评论动态
PostsManager.addComment(postId, '评论内容');

// 收藏动态
PostsManager.toggleCollect(postId);
```

## 🔧 技术栈

- **前端框架**: 原生HTML/CSS/JavaScript
- **UI库**: Tailwind CSS
- **图标**: Font Awesome
- **数据存储**: localStorage（纯前端）
- **密码加密**: Base64（演示用，生产环境需bcrypt）

## 📋 后续计划

### 待实现功能
- [ ] 动态发布页面
- [ ] 动态列表展示
- [ ] 图片上传（base64）
- [ ] 搜索功能
- [ ] 消息通知

### 后端对接准备
- ✅ 数据结构已对齐标准格式
- ✅ 易于迁移到RESTful API
- 🔄 需要时移除前端密码存储
- 🔄 改用Token/Session管理登录状态

## 🎯 设计理念

**00后潮流风格**
- 活力橙 `#FF6B35`
- 天空蓝 `#40BFFF`
- 嫩粉 `#FF7DAB`
- 亮黄 `#FFD166`

**交互原则**
- 简洁直观，无冗余操作
- 动画流畅，2秒内完成
- 强反馈，用户感知明确
- 低门槛，可选不强制

## 📄 License

MIT

---

**注意**: 当前为纯前端演示版本，数据存储在浏览器localStorage中，清除浏览器数据会丢失所有信息。生产环境需要对接后端服务。

