# ShowTime 二次开发与数据大屏集成实战指南

本指南旨在帮助开发者基于 **ruoyi-vue-pro**（管理端/后端）与 **go-view**（数据大屏）源码进行高效的二次开发、本地联调与多上游版本协同。

---

## 一、 整体架构与代码拓扑

本项目采用 **单体/多模块微架构后端 + Vue3 管理后台 + GoView 大屏设计器** 的一体化仓库组织结构：

```
showTime (Project Root)
├── dependencies/            # Maven 依赖版本管理 BOM
├── framework/               # 基础设施核心框架
├── server/                  # 后端主服务入口（启动类：YudaoServerApplication）
├── module-system/           # 系统管理模块
├── module-infra/            # 基础设施模块
├── module-report/           # 报表管理模块（包含 GoView 接口）
├── ui/
│   ├── admin-vue3/          # 管理后台前端 (Vue3 + Element Plus)
│   └── goview/              # 数据大屏前端 (Vue3 + Naive UI + ECharts)
└── sql/                     # 多数据库初始化 SQL 脚本
```

---

## 二、 本地全栈开发启动指引

### 1. 环境准备
- **Java**: JDK 1.8 或 JDK 17 / 21
- **Node.js**: 16.14+ / 18+ (推荐使用 `pnpm` 包管理器: `npm i -g pnpm`)
- **Maven**: 3.8+
- **MySQL**: 5.7 / 8.0+
- **Redis**: 6.0+

### 2. 数据库初始化
1. 在 MySQL 中创建数据库，例如 `ruoyi-vue-pro-jdk8`（字符集 `utf8mb4`）。
2. 导入核心 SQL：执行 `sql/mysql/ruoyi-vue-pro.sql`。
3. 确保 GoView 项目表 `report_go_view_project` 存在。如果未包含，请执行以下建表语句：

```sql
CREATE TABLE IF NOT EXISTS `report_go_view_project` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '编号',
  `name` varchar(255) NOT NULL COMMENT '项目名称',
  `pic_url` varchar(512) DEFAULT NULL COMMENT '预览图片 URL',
  `content` longtext COMMENT '报表内容（JSON）',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '发布状态：0-已发布 1-未发布',
  `remark` varchar(512) DEFAULT NULL COMMENT '项目备注',
  `creator` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updater` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `deleted` bit(1) NOT NULL DEFAULT b'0' COMMENT '是否删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GoView 项目表';
```

### 3. 后端启动 (Spring Boot)
1. **开启 module-report 模块**：
   - 在根目录 `pom.xml` 中，取消 `<module>module-report</module>` 的注释。
   - 在 `server/pom.xml` 中，取消 `module-report` 依赖的注释：
     ```xml
     <dependency>
         <groupId>cn.iocoder.boot</groupId>
         <artifactId>module-report</artifactId>
         <version>${revision}</version>
     </dependency>
     ```
2. **配置数据库与 Redis 连接**：
   - 打开 `server/src/main/resources/application-local.yaml`，配置 MySQL 地址、用户名、密码以及 Redis 地址。
3. **启动主程序**：
   - 运行 `server/src/main/java/cn/iocoder/yudao/server/YudaoServerApplication.java`。
   - 默认端口为 `48080`，Knife4j 接口文档地址：`http://127.0.0.1:48080/doc.html`。

### 4. 管理端前端启动 (admin-vue3)
1. 进入目录：`cd ui/admin-vue3`
2. 安装依赖：`pnpm install`
3. 检查环境变量：
   - 在 `ui/admin-vue3/.env.local` 或 `.env.dev` 中确认：
     ```env
     VITE_BASE_URL='http://127.0.0.1:48080'
     VITE_GOVIEW_URL='http://127.0.0.1:3020'  # 对应 goview 启动端口
     ```
4. 启动开发服务器：`pnpm dev`（默认访问 `http://127.0.0.1:80` 或终端提示端口）。

### 5. 数据大屏前端启动 (goview)
1. 进入目录：`cd goview`
2. 安装依赖：`pnpm install`
3. 检查端口配置：
   - 在 `goview/vite.config.ts` 中已配置服务端口为 `3020`：
     ```ts
     server: {
       port: 3020,
       open: true
     }
     ```
4. 启动开发服务器：`pnpm dev`（访问 `http://127.0.0.1:3020`）。

---

## 三、 管理端与 GoView 大屏深度集成机制

### 1. 单点免登认证 (SSO & Token 传递)
- **管理端发起**：在 `ui/admin-vue3/src/views/report/goview/index.vue` 中，通过 iframe 嵌入 GoView 并传递当前登录用户的 Token：
  ```ts
  const src = ref(
    `${import.meta.env.VITE_GOVIEW_URL}?accessToken=${getAccessToken()}&refreshToken=${getRefreshToken()}`
  )
  ```
- **GoView 端接收与持久化**：
  在 `goview/src/router` 路由前置守卫或 `goview/src/main.ts` 中拦截 URL 参数：
  ```ts
  // 提取 URL 中的 token 并保存至本地 storage
  const urlParams = new URLSearchParams(window.location.search)
  const accessToken = urlParams.get('accessToken')
  if (accessToken) {
    localStorage.setItem('ACCESS_TOKEN', accessToken)
  }
  ```
- **GoView 请求携带认证头**：
  在 `goview/src/api/axios.ts` 的请求拦截器中自动加上 Bearer Token：
  ```ts
  axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ACCESS_TOKEN')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    // 租户编号支持 (如果启用了多租户)
    config.headers['tenant-id'] = '1'
    return config
  })
  ```

### 2. 大屏项目后端接口交互
后端 `module-report` 已提供完整 RESTful 接口：
| 接口描述 | 请求方式 | 路径 | 控制器 |
| :--- | :--- | :--- | :--- |
| 创建大屏项目 | POST | `/admin-api/report/go-view/project/create` | `GoViewProjectController` |
| 更新大屏项目 | PUT | `/admin-api/report/go-view/project/update` | `GoViewProjectController` |
| 删除大屏项目 | DELETE | `/admin-api/report/go-view/project/delete?id=xxx` | `GoViewProjectController` |
| 获取大屏详情 | GET | `/admin-api/report/go-view/project/get?id=xxx` | `GoViewProjectController` |
| 我的大屏分页列表 | GET | `/admin-api/report/go-view/project/my-page` | `GoViewProjectController` |
| SQL 数据查询 | POST | `/admin-api/report/go-view/data/get-by-sql` | `GoViewDataController` |
| HTTP 动态数据接口 | ANY | `/admin-api/report/go-view/data/get-by-http` | `GoViewDataController` |

---

## 四、 GoView 二次开发常见场景

### 场景 1：新增自定义大屏组件
1. 进入 `goview/src/packages/components/` 对应的分类目录（如 `Charts`、`Informations`、`Decorates`）。
2. 创建组件包：包含 `index.vue`（展示渲染）、`config.vue`（右侧属性配置面板）、`config.ts`（组件默认数据与配置定义）、`index.ts`（导出元数据）。
3. 在 `goview/src/packages/components/index.ts` 中注册新组件。

### 场景 2：扩展业务自定义数据源
1. 后端编写数据接口：在对应的业务模块（如 `module-iot`、`module-mall`）或 `module-report` 的 `GoViewDataController` 中编写专有数据汇总 API。
2. 大屏组件绑定：在 GoView 编辑器选中组件 -> 右侧「数据」Tab -> 选择「动态数据 / HTTP」-> 输入后端接口 URL（如 `/admin-api/report/go-view/data/get-by-http`）。

---

## 五、 双上游（Multi-Remote）Git 协同工作流

本仓库配置了以下 Remote 关联：
- **`origin`**: 你的项目远程仓库 (`git@github.com:robbinsz/showTime.git`)
- **`source-backend`**: `ruoyi-vue-pro` 官方源 (`https://gitee.com/zhijiantianya/ruoyi-vue-pro.git`)
- **`source-admin-ui`**: `yudao-ui-admin-vue3` 官方源 (`https://gitee.com/yudaocode/yudao-ui-admin-vue3.git`)
- **`source-goview`**: `go-view` 官方源 (`https://gitee.com/dromara/go-view.git`)

### 推荐的日常开发与同步策略：

1. **自己的定制开发**：
   - 保持在 `main` 或自己创建的特性分支 `feat/xxx` 上开发。
   - 所有业务定制代码正常 commit 并 push 到 `origin`。

2. **拉取上游官方修复或更新**：
   ```bash
   # 获取上游最新分支
   git fetch source-backend
   git fetch source-goview
   
   # 对比官方主干与当前代码的差异
   git log HEAD..source-backend/master --oneline
   
   # 按需挑选（Cherry-pick）特定 bugfix 提交，或选择性合并
   git cherry-pick <commit-hash>
   ```

## 六、 Docker Compose 一键全栈启动（统一单端口架构）

项目已采用 **同服务单端口聚合架构**，统一通过 **80 端口** 对外提供全部前端能力（管理后台 + 内置数据大屏），彻底省去了独立的 GoView 容器和端口。

### 1. 架构拓扑 (4 个容器)
- **`showtime-admin`**（端口 `80`）：统一入口，Nginx 托管管理后台（`/`）、内置大屏设计器（`/goview/`），并反向代理后端 API（`/admin-api/`）；
- **`showtime-server`**（端口 `48080`）：Spring Boot 后端服务；
- **`showtime-mysql`**（端口 `3306`）：MySQL 8 数据库（自动初始化 `sql/mysql/ruoyi-vue-pro-slim.sql`）；
- **`showtime-redis`**（端口 `6379`）：Redis 缓存。

### 2. 一键构建与启动命令
```bash
# 1. 编译并生成后端 jar 包
mvn clean package -DskipTests

# 2. 构建大屏前端与管理端前端
cd goview && npx vite build && cd ..
cd ui/admin-vue3 && npx vite build --mode env.local && cd ../..
rm -rf ui/admin-vue3/dist/goview && cp -r goview/dist ui/admin-vue3/dist/goview

# 3. 启动所有服务
docker compose up -d --build

# 4. 查看状态与日志
docker compose ps
docker compose logs -f server
```

### 3. 服务访问入口
| 服务 | 宿主机端口 / 访问地址 | 说明 |
| :--- | :--- | :--- |
| **管理后台** | `http://localhost` | 主管理平台 (默认: admin / admin123) |
| **数据大屏** | `http://localhost/goview/` | 内置大屏设计器 (同源免登) |
| **后端 API 文档** | `http://localhost:48080/doc.html` | Knife4j 接口文档 |
| **MySQL 数据库** | `localhost:3306` | 用户: root / 密码: 123456 |
| **Redis 缓存** | `localhost:6379` | 无密码 |

