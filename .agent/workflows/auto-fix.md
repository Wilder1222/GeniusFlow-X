---
description: 
---

{
  "version": "1.0",
  "workflows": [
    {
      "id": "nextjs-autofix",
      "name": "Next.js 全栈自动修复",
      "description": "自动修复 Lint 错误、格式化代码并尝试通过 AI 修复 TypeScript 类型错误",
      "on_save": false, 
      "steps": [
        {
          "name": "基础语法修复",
          "run": "npx eslint --fix ${currentFile} && npx prettier --write ${currentFile}",
          "continue_on_error": true
        },
        {
          "name": "Tailwind 类名优化",
          "run": "npx tailwind-merge-check ${currentFile} --fix",
          "condition": "file_extension == 'tsx'"
        },
        {
          "name": "AI 深度修复",
          "action": "antigravity.ai.refactor",
          "params": {
            "prompt": "作为 Next.js 专家，请修复当前文件中所有标记为红色下划线的 TypeScript 类型错误或 React 逻辑错误。保持组件为 Server Component 属性除非必要，并确保符合 App Router 的数据获取规范。",
            "context": ["project_root/tailwind.config.ts", "project_root/next.config.mjs"]
          },
          "strategy": "smart_merge" 
        },
        {
          "name": "最终验证",
          "run": "npx tsc --noEmit",
          "label": "正在验证类型安全..."
        }
      ]
    }
  ]
}