# Plano de commits – clinic-full-stack

Execute na ordem (a partir da raiz do repo). Use `git status` entre os blocos para confirmar.

---

## 1. chore: docs e arquivos de apoio
```bash
git add to-do.md stats.md appointment-details-mapping.md
git commit -m "chore: add to-do, stats and appointment mapping docs"
```

## 2. chore: dependências
```bash
git add package.json pnpm-lock.yaml
# opcional: git add package-lock.json se for usado
git commit -m "chore: update dependencies"
```

## 3. style: tema e cores (primary/sidebar)
```bash
git add src/app/globals.css
git commit -m "style: set primary and sidebar color to #0B1220"
```

## 4. feat: portal e home (tenant + home page)
```bash
git add src/lib/portal.ts
git add src/app/[tenant]/home/
git commit -m "feat: add portal config and home redirect page"
```

## 5. feat: auth – logo e change password
```bash
git add src/app/[tenant]/auth/login/page.tsx
git add src/app/[tenant]/auth/register/page.tsx
git add src/app/[tenant]/auth/change-password/
git add src/services/auth/change-password.service.ts
git commit -m "feat(auth): primary logo on login/register and change-password flow"
```

## 6. feat: appointments – serviços, componentes e páginas
```bash
git add src/services/appointments/
git add src/components/appointments/
git add src/app/[tenant]/_components/appointments-page-content.tsx
git add src/app/[tenant]/dashboard/_components/view-appointment-details-modal.tsx
git add src/app/[tenant]/dashboard/_components/edit-appointment-modal.tsx
git add src/app/[tenant]/dashboard/_components/create-appointment-modal.tsx
git add src/app/[tenant]/dashboard/appointments/page.tsx
git commit -m "feat(appointments): appointment service, cards, list and detail/edit modals"
```

## 7. feat: procedures – serviços e páginas
```bash
git add src/services/procedures/
git add src/app/[tenant]/dashboard/procedures/page.tsx
git add src/app/[tenant]/dashboard/procedures/create/page.tsx
git add src/app/[tenant]/dashboard/procedures/[procedureId]/
git commit -m "feat(procedures): procedure service and CRUD pages"
```

## 8. feat: professionals – policy e páginas
```bash
git add src/lib/professionals-policy.ts
git add src/app/[tenant]/dashboard/professionals/page.tsx
git add src/app/[tenant]/dashboard/professionals/register/page.tsx
git add src/services/professional/professional.service.ts
git commit -m "feat(professionals): ProfessionalsPolicy and professionals list/register"
```

## 9. feat: portais patient e professional
```bash
git add src/app/[tenant]/patient/
git add src/app/[tenant]/professional/
git commit -m "feat: add patient and professional portal routes"
```

## 10. feat: layout e UI compartilhados
```bash
git add src/components/layout/
git add src/components/ui/badge.tsx
git add src/components/ui/checkbox.tsx
git add src/components/ui/separator.tsx
git commit -m "feat(ui): shared layout and badge, checkbox, separator components"
```

## 11. fix: middleware e redirecionamentos
```bash
git add middleware.ts
git add src/lib/api.ts
git add src/app/[tenant]/home/page.tsx
git add src/components/layout/protected-route.tsx
git commit -m "fix: middleware auth check and redirects to login"
```

## 12. fix: sidebar – Painel não selecionado
```bash
git add src/app/[tenant]/dashboard/_components/dashboard-layout.tsx
git commit -m "fix(dashboard): do not highlight Painel in sidebar"
```

## 13. chore: tenant, context e navegação
```bash
git add src/lib/tenant-navigation.ts
git add src/lib/tenant.ts
git add src/hooks/use-tenant.ts
git add src/context/AuthContext.tsx
git commit -m "chore: tenant and auth context updates"
```

## 14. chore: dashboard layout e páginas restantes
```bash
git add src/app/[tenant]/dashboard/layout.tsx
git add src/app/[tenant]/dashboard/page.tsx
git add src/app/[tenant]/dashboard/patients/page.tsx
git commit -m "chore: dashboard layout and page updates"
```

---

Se sobrar arquivo modificado, verifique com `git status` e inclua no commit mais relacionado ou crie um commit final `chore: misc updates` com o restante.
