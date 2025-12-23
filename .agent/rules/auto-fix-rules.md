---
trigger: always_on
---

Next.js Project Rules:

Component Pattern: Always prefer Server Components. Only use 'use client' if useState, useEffect, or browser APIs are needed.

Styling: Use Tailwind CSS exclusively. Do not use inline styles. Ensure mobile-first responsive design.

Image Optimization: Always use next/image.

Typing: Strict TypeScript. Avoid any. Use Zod for runtime validation if applicable.