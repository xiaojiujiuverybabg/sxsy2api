# Sub2Api Frontend V2

这是 Sub2Api 的并行新前端项目，目标是在不改变任何后端接口和业务行为的前提下，重新实现 UI、布局和页面交互。

## 约束

- 不修改 `backend/`
- 不修改原项目功能参考 `frontend/`
- 保持现有业务路由语义
- API 兼容现有后端

## 开发

```bash
npm install
npm run dev
```

默认开发端口：`5174`

## 目录

- `src/app`: 应用壳层
- `src/api`: 后端 API 客户端边界
- `src/design`: 设计 token 与主题
- `src/layouts`: 公共、认证、用户端、管理端布局
- `src/router`: 路由与页面清单
- `src/stores`: Pinia 状态
- `src/views`: 页面与占位视图

## 当前状态

当前只完成新项目骨架和完整路由占位，页面级业务重构需要按 `docs/sxsy2Api前端UI重构进度.md` 逐页推进。
