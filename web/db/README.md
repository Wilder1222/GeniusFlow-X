# GeniusFlow-X 数据库 Schema

本目录包含 GeniusFlow-X 项目的所有数据库表结构和迁移脚本。

## 目录结构

```
db/
├── schema/              # 表结构定义
│   ├── 01_users.sql     # 用户相关表
│   ├── 02_decks.sql     # 卡组表
│   ├── 03_cards.sql     # 卡片表
│   ├── 04_study.sql     # 学习记录表
│   └── 05_social.sql    # 社交功能表
├── migrations/          # 增量迁移脚本
│   └── 001_add_tags_column.sql
├── rls/                 # Row Level Security 策略
│   └── policies.sql
└── seeds/               # 测试数据
    └── sample_data.sql
```

## 使用方法

### 初始化数据库
在 Supabase SQL Editor 中按顺序执行 `schema/` 目录下的文件。

### 应用迁移
按编号顺序执行 `migrations/` 目录下的文件。

## 注意事项

- 所有表都应启用 RLS (Row Level Security)
- 主键使用 UUID 类型
- 时间戳字段使用 `timestamptz` 类型
