# AGENTS.md

## File naming

All new files use **kebab-case**: `src/lib/use-theme.ts`, `src/data/algorithms.ts`.

**Components** (`src/components/`, including `ui/`) — kebab-case filename, PascalCase export:

```tsx
// src/components/algorithm-card.tsx
export function AlgorithmCard() { ... }
```

**Routes** follow TanStack Router file-based conventions — do not rename them (`index.tsx`, `__root.tsx`, `algorithm.$id.tsx`).

## Tech stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **TanStack Router** — route tree auto-generated at `src/routeTree.gen.ts` (do not edit manually)
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **shadcn/ui** — add components with `npx shadcn@latest add <component>`; they land in `src/components/ui/`
- **Base UI** (`@base-ui/react`) — accessible primitives
- **oxlint** + **oxfmt** — linting and formatting

## Development

```bash
pnpm check        # fmt:check + typecheck + lint — run before committing
```

## Icons

Use **hugeicons**: import data from `@hugeicons/core-free-icons`, render with `HugeiconsIcon` from `@hugeicons/react`.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

<HugeiconsIcon icon={ArrowRight01Icon} size={16} aria-hidden="true" />
```

To find an icon name:

```bash
node --input-type=module <<'EOF'
import * as icons from '@hugeicons/core-free-icons';
console.log(Object.keys(icons).filter(n => /YourKeyword/i.test(n)).join('\n'));
EOF
```
