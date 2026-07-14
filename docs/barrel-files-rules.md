# Barrel Files Guidelines

These guidelines define how barrel files (`index.ts`) should be used in this project following **Clean Architecture** and **Hexagonal Architecture**.

The goal is to improve readability and maintain a clean public API while avoiding circular dependencies and hidden imports.

---

## Principles

- A barrel file represents the **public API of a folder**.
- Use barrel files to simplify imports **across folders or layers**.
- Avoid using barrel files for internal implementation details.
- Prefer explicit imports over convenience when they improve architectural clarity.

---

# ✅ Do

## Use barrel files for folders that expose multiple public types

Good candidates include:

- `domain/entities`
- `domain/value-objects`
- `domain/events`
- `domain/exceptions`
- `application/ports/inbound`
- `application/ports/outbound`
- `application/commands`
- `application/queries`
- `presentation/dto`

Example:

```text
domain/
└── entities/
    ├── user.entity.ts
    ├── account.entity.ts
    └── index.ts
```

```ts
// index.ts
export * from "./user.entity";
export * from "./account.entity";
```

Usage:

```ts
import { User, Account } from "@/iam/domain/entities";
```

---

## Use barrel files when importing across folders

Example:

```ts
// user.entity.ts

import { Email } from "../value-objects";
import { DomainException } from "../exceptions";
```

This keeps imports concise while maintaining clear boundaries.

---

## Use barrel files from other layers

Application, Infrastructure, and Presentation should consume the Domain through its public API.

Good:

```ts
import { User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";
```

instead of

```ts
import { User } from "@/iam/domain/entities/user.entity";
```

---

## Use a barrel when a folder is expected to grow

Even if a folder currently contains only one file, a barrel is acceptable when it represents a stable public API.

Example:

```text
application/
└── ports/
    └── outbound/
        ├── iam.repository.port.ts
        └── index.ts
```

Future ports can be added without changing imports.

---

# ❌ Don't

## Don't import your own folder's barrel

Bad:

```ts
// user.entity.ts

import { Account } from "./index";
```

Good:

```ts
import { Account } from "./account.entity";
```

This avoids circular dependencies.

---

## Don't create root barrels without a reason

Avoid:

```text
domain/
├── entities/
├── value-objects/
├── events/
└── index.ts
```

unless there is a clear need to flatten the API.

Prefer:

```ts
import { User } from "@/iam/domain/entities";
import { Email } from "@/iam/domain/value-objects";
```

instead of

```ts
import { User, Email } from "@/iam/domain";
```

The folder name communicates the architectural role.

---

## Don't create project-wide barrels

Avoid:

```text
src/
└── index.ts
```

that exports everything.

This hides dependencies and increases the chance of accidental coupling.

---

## Don't expose Infrastructure through barrels

Avoid creating barrels that expose implementation details.

Example:

```text
infrastructure/
├── prisma/
├── repositories/
├── auth/
└── index.ts
```

Infrastructure should generally be imported directly.

---

## Don't create barrels for folders that will always contain a single implementation

Example:

```text
presentation/
└── controllers/
    └── iam.controller.ts
```

Creating:

```text
controllers/
└── index.ts
```

adds little value.

---

# Recommended Import Strategy

### Within the same folder

Use direct imports.

```ts
import { Account } from "./account.entity";
```

---

### Between folders in the same layer

Use the target folder's barrel.

```ts
import { Email } from "../value-objects";
import { DomainException } from "../exceptions";
```

---

### From another layer

Use the folder's public API.

```ts
import { User } from "@/iam/domain/entities";
import { HashServicePort } from "@/iam/application/ports/outbound";
```

---

# Rule of Thumb

| Scenario | Recommendation |
|----------|----------------|
| Importing within the same folder | ✅ Direct import |
| Importing another folder | ✅ Use that folder's barrel |
| Importing from another layer | ✅ Use that layer's folder barrel |
| Folder contains multiple public exports | ✅ Create a barrel |
| Folder contains one file but is expected to grow | ✅ Barrel is acceptable |
| Folder contains one file and is unlikely to grow | ❌ No barrel |
| Root `src/index.ts` | ❌ Avoid |
| Root `domain/index.ts` | ❌ Avoid unless there is a strong reason |
| Infrastructure root barrel | ❌ Avoid |
| Importing your own folder's `index.ts` | ❌ Never |

---

# Summary

- Treat every barrel file as the **public API** of a folder.
- Use barrels to simplify imports **between folders and layers**, not **within the same folder**.
- Avoid root barrels unless they provide a meaningful, stable API.
- Keep dependency directions explicit and never sacrifice architecture for shorter import paths.

### VS Code Preview

| Platform | Shortcut |
|----------|----------|
| Windows / Linux | `Ctrl + Shift +V` |
| macOS | `Cmd + Shift +V` |