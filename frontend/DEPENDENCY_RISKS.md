# Frontend Dependency Risks

## Angular Build Tooling and `undici`

Last checked: 2026-03-15

Current installed path:

- `@angular-devkit/build-angular@21.2.2`
- `@angular/build@21.2.2`
- `undici@7.22.0`

Status:

- `npm audit` reports high-severity advisories for `undici`.
- In this repo, `undici` is a transitive development dependency from Angular build tooling.
- It is not a direct LedgerAxis application dependency.

Decision:

- Stay on Angular 21.
- Do not run `npm audit fix --force`.
- Do not downgrade to Angular 20 build tooling just to silence the audit output.

Why:

- The current `npm audit fix --force` path proposes `@angular-devkit/build-angular@20.3.20`.
- That is a breaking downgrade from the project's Angular 21 baseline.
- The latest published Angular 21 build package currently still depends on `undici`, so this is an upstream issue to track rather than a safe local auto-fix.

Verification steps:

```bash
cd frontend
npm audit
npm ls undici @angular/build @angular-devkit/build-angular
npm view @angular/build version dependencies.undici --json
```

Trigger for action:

- Upgrade once Angular 21 publishes a compatible `@angular/build` / `@angular-devkit/build-angular` release that updates or removes the vulnerable `undici` path.
