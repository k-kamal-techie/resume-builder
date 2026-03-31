# Code Patterns & Conventions

## API Route Pattern
```typescript
export async function GET/POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. DB
  await dbConnect();

  // 3. Validate (Zod)
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });

  // 4. Operate
  const result = await Model.findOne({ userId: session.user.id });

  // 5. Return
  return NextResponse.json(result);
}
```

## Mongoose Model Pattern
```typescript
const Schema = new Schema<IDocument>({ ... }, { timestamps: true });
export default mongoose.models.Name || mongoose.model<IDocument>("Name", Schema);
```

## Client Service Pattern
All API calls go through `src/lib/services/*.ts`:
```typescript
export async function fetchSomething(id: string): Promise<IType> {
  const res = await fetch(`/api/endpoint/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || `Failed (${res.status})`);
  }
  return res.json();
}
```

## Client Component Pattern
```typescript
"use client";  // required for interactive components

// Use useCallback for functions passed as props
const handleChange = useCallback((data: Type) => {
  setUndoStack((prev) => [...prev.slice(-49), currentData]);  // push before overwrite
  setData(data);
}, [currentData]);
```

## Zod Validation
- Create schemas use strict types
- Update schemas use `z.any()` for AI-generated data (AI may send extra/missing fields)
- URL fields: `.url().optional().or(z.literal(""))`

## Import Alias
Use `@/*` for all `src/` imports:
```typescript
import Button from "@/components/ui/button";
import { auth } from "../../../../auth";  // relative for root-level files
```

## Tailwind Class Order
Structure → Sizing → Spacing → Typography → Colors → Borders → Effects → State

## TypeScript
- Avoid `any` in component props — use proper interfaces
- `unknown` for catch variables when error type is uncertain
- Omit `React.FC` — use `function` declarations with typed props inline

## File Naming
- Components: PascalCase (`AppSidebar.tsx` → `app-sidebar.tsx` kebab)
- Services: kebab-case (`chat-session.ts`)
- Types: snake-case for interfaces (`IResume`, `KnowledgeBaseData`)
