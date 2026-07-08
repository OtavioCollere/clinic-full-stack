# Cliniker — Checklist de Entrega (MVP)

> Auditoria baseada em: rotas de API consumidas pelo frontend, serviços em `src/services/`, páginas em `src/app/[tenant]/`, componentes em `src/app/[tenant]/_components/`, tipos em `src/types/`, e telas em desenvolvimento em `new_files/`.

**Legenda:**
- ✅ Feito — existe e funciona
- 🔨 Parcial — existe mas incompleto ou sem integração real
- ❌ Falta — não existe ainda

---

## Bloco 1 — Fundação

### Procedimentos

- 🔨 **Impedir exclusão se já usado em comanda**
  - O botão de deletar em `/dashboard/procedures` chama `DELETE /procedures/{id}` sem nenhuma verificação prévia.
  - **O que falta:** guard no backend que rejeita a exclusão se o procedimento estiver referenciado em um `appointmentItem`; feedback visual de erro no frontend informando o motivo da falha.

- 🔨 **Snapshot de preço na comanda (salvar preço no momento da criação)**
  - O DTO de `createAppointment` já envia `price` por item (`appointmentItems: [{ procedureId, price, notes }]`), o que permite ao backend salvar o snapshot.
  - Porém, `createServiceOrder` só envia `appointmentItemIds: string[]` — depende do backend ter persistido o preço no `appointmentItem`, não no `procedure` atual.
  - **O que falta:** confirmar (e garantir) que o backend persiste `price` na tabela `appointmentItem` e não faz `JOIN` com `procedure.price` na hora de exibir; não há validação ou exibição explícita disso no frontend.

### Anamnese

- ❌ **Estrutura de auditoria (tabela de versões/log de alterações)**
  - Os únicos endpoints de anamnese são `POST /patients/{id}/anamnesis` e `GET /patients/{id}/anamnesis` — sem versionamento.
  - A tela `PatientProfileDetail.tsx` (`new_files/`) já renderiza uma "timeline de anamnese", mas consome dados de mock (`@/data/billingMockData`).
  - **O que falta:** endpoint no backend (ex: `GET /patients/{id}/anamnesis/history`) retornando versões com `createdAt` e `changedBy`; tabela de log no banco; integrar ao componente de timeline.

---

## Bloco 2 — Fluxos de Usuário

- 🔨 **Dono: criar paciente e vincular anamnese automaticamente**
  - A página `/dashboard/patients/register` tem um formulário de 2 etapas: dados pessoais (step 1) e formulário médico via `medical-form.tsx` (step 2).
  - Ambos os serviços existem: `createPatient → POST /clinics/{id}/patients` e `createAnamnesis → POST /patients/{id}/anamnesis`.
  - **O que falta:** verificar se o step 2 é obrigatório e disparado automaticamente após o step 1 (com o `patientId` retornado); se o fluxo permitir pular a anamnese, ela não é "automática" — o dono pode criar um paciente sem anamnese vinculada.

- ❌ **Dono: enviar senha ao paciente por e-mail, forçar troca no primeiro acesso**
  - `registerUser` DTO tem `password?: string` com comentário "gerada no backend se não fornecida", mas não há nenhuma chamada no frontend para disparar e-mail.
  - A interface `User` não possui flag `mustChangePassword` ou `firstAccess`.
  - A página `/auth/change-password` aceita token via query string, mas o fluxo de geração e envio desse token não existe no frontend.
  - **O que falta:** endpoint backend para reenvio de e-mail com token de primeiro acesso; campo `mustChangePassword` no retorno de `GET /api/me`; lógica no `AuthContext` para redirecionar para `/auth/change-password` quando a flag estiver ativa.

- ✅ **Profissional: tela "meus agendamentos" filtrada pelo usuário logado**
  - Portal `/professional` chama `getAppointmentsByProfessionalId(user.professionalId)` — filtra corretamente pelo profissional autenticado.

- ✅ **Profissional: acesso a todos os agendamentos (reutilizar tela existente)**
  - `appointments-page-content.tsx` é um componente compartilhado usado tanto em `/dashboard/appointments` quanto em `/professional/appointments` — reutilização implementada.

- 🔨 **Profissional: tela de perfil com dados e troca de senha**
  - A rota `/professional/profile` existe como página, mas foi classificada como "não totalmente implementada".
  - Não há componente de formulário de troca de senha dentro do portal profissional (apenas a página genérica `/auth/change-password` via token, que depende de e-mail).
  - **O que falta:** exibir dados do profissional (conselho, especialidade, profissão) com edição; formulário de troca de senha autenticada (sem token, usando senha atual + nova senha via endpoint autenticado).

---

## Bloco 3 — Telas de Visualização

- 🔨 **Tela de Comandas: total faturado, filtro por data, busca por paciente, filtro por procedimento**
  - `new_files/comandas.tsx` tem a UI completa: filtros por data, busca por paciente e procedimento, paginação, coluna de total.
  - `create-service-order-modal.tsx` existe para criação de ordens.
  - **O que falta:** (1) nenhuma rota em `/dashboard/` aponta para essa tela — não está no roteamento do app; (2) usa mock data de `@/data/billingMockData`, sem endpoint real para listagem (`GET /clinics/{id}/service-orders`); (3) total faturado é calculado localmente sobre mock, não vem do backend.

- ❌ **Perfil do Paciente: linha do tempo de anamnese com histórico de versões**
  - `PatientProfileDetail.tsx` (`new_files/`) renderiza uma timeline, mas com dados de mock.
  - Não existe endpoint de histórico/versões de anamnese no backend (apenas GET atual).
  - **O que falta:** endpoint `GET /patients/{id}/anamnesis/history`; integrar o componente de timeline ao endpoint real; mover `PatientProfileDetail.tsx` para dentro do roteamento do app.

- 🔨 **Perfil do Paciente: seção de agendamentos e comandas confirmadas**
  - Agendamentos: `getAppointmentsByPatientId` existe e `PatientProfileDetail.tsx` já os exibe (próximos + passados).
  - Comandas: não existe endpoint `GET /patients/{id}/service-orders` — a seção de comandas confirmadas não tem backend.
  - **O que falta:** endpoint de listagem de comandas por paciente; integrar `PatientProfileDetail.tsx` ao roteamento real substituindo os mocks de appointments pelo endpoint real.

- ❌ **Perfil do Paciente: total de lucro gerado pelo paciente**
  - Não existe endpoint agregador (`GET /patients/{id}/revenue` ou similar).
  - Não há campo ou seção para isso em nenhum componente existente.
  - **O que falta:** endpoint de agregação de receita por paciente no backend; card de KPI no perfil do paciente.

---

## Bloco 4 — Faturamento

- ❌ **Endpoint de agregação de receita por mês**
  - `finantialDashboard.tsx` (`new_files/`) usa mock `@/data/financialMockData`.
  - Não existe chamada a nenhum endpoint de receita nos serviços.
  - **O que falta:** `GET /clinics/{id}/revenue?groupBy=month` no backend; `financial.service.ts` no frontend; conectar ao `finantialDashboard.tsx`.

- ❌ **Endpoint de clientes que retornaram por mês**
  - **O que falta:** `GET /clinics/{id}/patients/returning?month=X` ou agregação similar; exibição no dashboard financeiro.

- ❌ **Endpoint de procedimentos mais realizados**
  - **O que falta:** `GET /clinics/{id}/procedures/top` com contagem e receita; seção de ranking no dashboard financeiro.

- ❌ **Endpoint de total faturado mensal e clientes novos**
  - O endpoint `GET /clinics/{id}/dashboard/stats` já retorna `monthlyRevenue` e `totalPatients`, mas não discrimina clientes novos por mês nem faturamento acumulado por período.
  - **O que falta:** expandir o endpoint de stats ou criar endpoint dedicado de relatório mensal com novos clientes e faturamento por mês.

- 🔨 **Tela de dashboard com gráficos conectados aos endpoints**
  - `finantialDashboard.tsx` (`new_files/`) tem UI completa: gráfico de barras (Recharts) de faturamento mensal, KPIs de receita vs. mês anterior.
  - **O que falta:** (1) não está no roteamento — nenhuma rota aponta para ela; (2) todos os dados são mock; (3) depende dos 4 endpoints acima serem criados primeiro.

---

## Bloco 5 — Automações

- ❌ **Decisão de tecnologia documentada**
  - Nenhum documento, ADR ou comentário no código indica a tecnologia escolhida (BullMQ, Inngest, pg_cron, etc.).
  - **O que falta:** decisão registrada (ADR ou README) antes de iniciar implementação.

- ❌ **Regras de disparo definidas (timing, canal, template)**
  - Não há configuração de regras de disparo, templates de mensagem ou definição de canais (e-mail, WhatsApp, SMS).
  - **O que falta:** documento ou tabela de regras: ex. "D-1 do agendamento → WhatsApp ao paciente", "D+0 pós-consulta → e-mail de feedback".

- ❌ **Worker implementado**
  - Nenhum código de worker, queue, scheduler ou cron existe no projeto.
  - **O que falta:** implementar worker de envio após decisão de tecnologia e regras definidas.

---

## Próximas entregas (ordem sugerida de MVP)

### 1. Integrar tela de Comandas ao roteamento com dados reais
`new_files/comandas.tsx` tem a UI completa com filtros e paginação. É o único ponto do sistema onde a receita fica visível para o dono. Sem isso, o ciclo clínico está partido: o agendamento existe, a consulta acontece, mas ninguém consegue ver o faturamento. Custo baixo de integração (UI pronta), impacto alto.

### 2. Perfil do Paciente completo integrado
`new_files/PatientProfileDetail.tsx` já tem a estrutura de agendamentos e timeline. É a tela mais consultada em uma clínica — o profissional precisa ver o histórico antes de atender. Integrar aos endpoints reais (`getAppointmentsByPatientId`, anamnese atual) e adicionar à rota `/dashboard/patients/{id}` desbloqueia o fluxo clínico completo sem depender de novos endpoints.

### 3. Tela de perfil do profissional com troca de senha
Sem perfil e troca de senha própria, profissionais dependem do dono para qualquer alteração de dados. Isso inviabiliza adoção real da plataforma por equipes maiores que uma pessoa. A rota existe, falta apenas o formulário de dados e o formulário de senha autenticada (que não exige token por e-mail).

### 4. Envio de senha por e-mail + flag de primeiro acesso
O fluxo de onboarding de pacientes e profissionais hoje exige comunicação manual de senha. Isso não escala. Implementar o disparo de e-mail com token no backend e a flag `mustChangePassword` no `AuthContext` fecha o ciclo de cadastro sem intervenção manual do dono — pré-requisito para qualquer automação futura.

### 5. Dashboard financeiro com pelo menos um endpoint real (receita mensal)
O dashboard do dono hoje mostra `monthlyRevenue` de `GET /clinics/{id}/dashboard/stats`. Criar o endpoint de agregação mensal e conectá-lo ao `finantialDashboard.tsx` já transforma o produto de "sistema de agendamento" em "sistema de gestão" — argumento de retenção principal para o dono da clínica. Os outros endpoints (retorno de clientes, procedimentos top) podem vir depois.
