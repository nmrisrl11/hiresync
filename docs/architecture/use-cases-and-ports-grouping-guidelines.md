# Use Cases and Ports Grouping Guidelines

These guidelines define how to structure and group `use-cases` and `ports` within the Application layer of this project. Following **Clean Architecture** and **Hexagonal Architecture**, the goal is to balance flat, readable folder structures with scalable sub-domain organization as features grow.

---

## Principles

- The Application layer should clearly communicate the **business capabilities** of the system.
- Prefer a **Flat Feature Structure** by default to minimize cognitive load and directory diving.
- Group files by **Sub-Domain Concept** only when a module scales beyond a manageable threshold.
- Folder names must remain objective and professional (e.g., `account`, never `my-account`).

---

## ⚖️ The Threshold: "The Rule of 15"

Do not introduce sub-folders into your `use-cases` or `inbound`/`outbound` port directories until a single folder reaches approximately **12 to 15 files**. 

Below this threshold, alphabetical sorting in your IDE provides faster navigation than clicking through nested folders.

---

## ✅ Do

### Keep it flat for small-to-medium modules

When a module (like IAM) is first being developed or has fewer than 15 use cases, keep all use cases and ports in a flat list. 

**Good:**
```text
application/
├── ports/
│   └── inbound/
│       ├── login.in-port.ts
│       ├── logout.in-port.ts
│       ├── register-user.in-port.ts
│       └── verify-email.in-port.ts
└── use-cases/
    ├── login.use-case.ts
    ├── logout.use-case.ts
    ├── register-user.use-case.ts
    └── verify-email.use-case.ts
```

### Group by Sub-Domain Concept when scaling

Once the threshold is crossed, group files by the **business workflow** they belong to, rather than their technical implementation.

**Good:**
```text
application/
└── use-cases/
    ├── authentication/
    │   ├── login.use-case.ts
    │   ├── logout.use-case.ts
    │   └── refresh-token.use-case.ts
    ├── password-recovery/
    │   ├── forgot-password.use-case.ts
    │   └── reset-password.use-case.ts
    └── registration/
        ├── register-user.use-case.ts
        └── verify-email.use-case.ts
```

### Mirror Port groupings with Use Case groupings

If you group your `use-cases` by sub-domain, your `application/ports/inbound` must mirror that exact same folder structure to maintain architectural predictability.

**Good:**
```text
application/
├── ports/
│   └── inbound/
│       ├── authentication/
│       │   └── login.in-port.ts
│       └── registration/
│           └── register-user.in-port.ts
└── use-cases/
    ├── authentication/
    │   └── login.use-case.ts
    └── registration/
        └── register-user.use-case.ts
```

### Use objective, domain-driven naming conventions

Folders should represent the business entity or concept objectively without personal pronouns.

**Good:**
```text
use-cases/
└── account/
    ├── delete-account.use-case.ts
    └── update-email.use-case.ts
```

---

## ❌ Don't

### Don't group prematurely (Avoid Java-itis)

Do not create folders for just one or two files. This adds unnecessary nesting and slows down developer velocity.

**Bad:**
```text
use-cases/
└── auth/
    └── login/
        ├── login.use-case.ts
        └── login.in-port.ts
```

### Don't group by technical pattern inside the Application Layer

You are already inside the `application` layer. Grouping by patterns like "commands" or "handlers" obfuscates what the system actually *does*. Group by *business feature*.

**Bad:**
```text
application/
└── use-cases/
    ├── commands/         <-- Obscures business intent
    │   ├── register.ts
    │   └── login.ts
    └── queries/
        └── get-user.ts
```

### Don't use personalized folder names

Clean code requires strict, professional naming conventions. Personal pronouns do not belong in architectural structures.

**Bad:**
```text
use-cases/
└── my-account/           <-- Violates objective naming
    └── update-profile.use-case.ts
```

---

## 📏 Rule of Thumb

| Scenario | Recommendation |
|----------|----------------|
| The module has 8 Use Cases | ✅ Keep `use-cases/` flat |
| The module has 16 Use Cases | ✅ Group by Sub-Domain |
| Grouping by business workflow (e.g., `registration`) | ✅ Recommended |
| Grouping by technical pattern (e.g., `commands`) | ❌ Avoid |
| Naming a sub-domain folder `account` | ✅ Recommended |
| Naming a sub-domain folder `my-account` | ❌ Never |
| Grouping ports to perfectly mirror use case folders | ✅ Required when scaling |
| Creating a folder for a single use case | ❌ Avoid (Premature abstraction) |

---

## 📝 Summary

- Start flat. Let the IDE's alphabetical sorting do the heavy lifting for small modules.
- Scale by **Sub-Domain Concept** (e.g., `authentication`, `account`) when hitting the "Rule of 15" threshold.
- Keep folder names strictly objective and domain-driven.
- Ensure your `inbound` ports structure is an exact reflection of your `use-cases` structure.