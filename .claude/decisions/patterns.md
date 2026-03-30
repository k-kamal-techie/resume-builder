# Code Patterns & Conventions

## API Route Pattern
Every API route follows this structure:
1. `const session = await auth()` — check authentication
2. `await dbConnect()` — ensure Mongoose connection
3. Validate input with Zod (`safeParse`)
4. Perform database operation
5. Return `NextResponse.json()`

## Component Patterns
- UI primitives in `src/components/ui/` — use `forwardRef` pattern
- Layout components in `src/components/layout/`
- Feature components organized by domain (`resume/`, `ai/`, `templates/`)
- All interactive components use `"use client"` directive

## Form Sections Pattern
- Each resume section (education, experience, etc.) is a separate component
- Takes `data` and `onChange` props
- Parent (`ResumeForm`) manages all state and passes down updaters
- Add/remove items with array manipulation
- "AI Generate" buttons on experience section for bullet point generation

## Mongoose Model Pattern
```typescript
export default mongoose.models.ModelName ||
  mongoose.model<IModelDocument>("ModelName", ModelSchema);
```

## Import Convention
- Always use `@/*` alias for `src/` imports
- Relative imports only for files in the same directory or for `auth.ts` at project root
