# Mapeamento de Campos - Tela de Detalhes do Agendamento

## 📋 Visão Geral

Este documento mapeia todos os campos que devem ser exibidos na tela de detalhes de um agendamento (appointment), organizados por seções lógicas para facilitar a implementação da interface.

---

## 🎯 Informações Principais do Agendamento

### Cabeçalho
| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Título do Agendamento** | `string` | `appointment.name` | Nome/título do agendamento | 🔴 Alta |
| **Status** | `"WAITING" \| "CONFIRMED" \| "DONE" \| "CANCELED"` | `appointment.status` | Status atual do agendamento | 🔴 Alta |
| **ID do Agendamento** | `string` | `appointment.id` | Identificador único (pode ser exibido como código) | 🟡 Média |

---

## 👤 Informações do Paciente

| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Nome do Paciente** | `string` | `appointment.patientName` | Nome completo do paciente | 🔴 Alta |
| **ID do Paciente** | `string` | `appointment.patientId` | ID para link/navegação | 🟡 Média |
| **CPF** | `string?` | `patient.cpf` | CPF do paciente (buscar separadamente) | 🟢 Baixa |
| **Email** | `string?` | `patient.email` | Email do paciente (buscar separadamente) | 🟢 Baixa |
| **Data de Nascimento** | `Date?` | `patient.birthDay` | Data de nascimento (buscar separadamente) | 🟢 Baixa |

---

## 👨‍⚕️ Informações do Profissional

| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Nome do Profissional** | `string` | `appointment.professionalName` | Nome completo do profissional | 🔴 Alta |
| **ID do Profissional** | `string` | `appointment.professionalId` | ID para link/navegação | 🟡 Média |
| **Conselho** | `string?` | `professional.council` | CRM, CRBM, etc. (buscar separadamente) | 🟡 Média |
| **Número do Conselho** | `string?` | `professional.councilNumber` | Número de registro (buscar separadamente) | 🟡 Média |
| **Estado do Conselho** | `string?` | `professional.councilState` | Estado do conselho (buscar separadamente) | 🟡 Média |
| **Profissão** | `string?` | `professional.profession` | Médico ou Biomédico (buscar separadamente) | 🟡 Média |

---

## 🏥 Informações da Unidade/Franquia

| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Nome da Unidade** | `string` | `franchise.name` | Nome da franquia/unidade (buscar separadamente) | 🔴 Alta |
| **ID da Unidade** | `string` | `appointment.franchiseId` | ID para link/navegação | 🟡 Média |
| **Endereço** | `string?` | `franchise.address` | Endereço completo (buscar separadamente) | 🟢 Baixa |
| **CEP** | `string?` | `franchise.zipCode` | CEP da unidade (buscar separadamente) | 🟢 Baixa |

---

## 📅 Informações de Data e Hora

| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Data** | `Date` | `appointment.startAt` | Data do agendamento (formato: DD/MM/YYYY) | 🔴 Alta |
| **Dia da Semana** | `string` | Calculado de `startAt` | Ex: "Segunda-feira", "Terça-feira" | 🟡 Média |
| **Horário de Início** | `string` | `appointment.startAt` | Hora de início (formato: HH:MM) | 🔴 Alta |
| **Horário de Término** | `string` | `appointment.endAt` | Hora de término (formato: HH:MM) | 🔴 Alta |
| **Duração** | `string` | Calculado de `durationInMinutes` | Ex: "1h 30min", "30min" | 🔴 Alta |
| **Duração em Minutos** | `number` | `appointment.durationInMinutes` | Duração total em minutos | 🟡 Média |

---

## 💰 Procedimentos e Valores

### Lista de Procedimentos
| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Nome do Procedimento** | `string` | `procedure.name` | Nome do procedimento (buscar por `procedureId`) | 🔴 Alta |
| **Preço** | `number` | `appointmentItem.price` | Preço do procedimento neste agendamento | 🔴 Alta |
| **Preço Original** | `number?` | `procedure.price` | Preço padrão do procedimento (buscar separadamente) | 🟡 Média |
| **Observações** | `string?` | `appointmentItem.notes` | Observações específicas do procedimento | 🟡 Média |
| **ID do Procedimento** | `string` | `appointmentItem.procedureId` | ID para link/navegação | 🟢 Baixa |

### Resumo Financeiro
| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Total de Procedimentos** | `number` | Calculado | Quantidade de procedimentos | 🟡 Média |
| **Valor Total** | `number` | Calculado | Soma de todos os `appointmentItem.price` | 🔴 Alta |
| **Consulta de Retorno** | `boolean` | Calculado | Se todos os preços são 0 | 🟡 Média |

---

## 📝 Informações Adicionais

| Campo | Tipo | Fonte | Descrição | Prioridade |
|-------|------|-------|-----------|------------|
| **Data de Criação** | `Date` | `appointment.createdAt` | Quando o agendamento foi criado | 🟡 Média |
| **Última Atualização** | `Date?` | `appointment.updatedAt` | Quando foi atualizado pela última vez | 🟢 Baixa |
| **Criado por** | `string?` | Buscar separadamente | Usuário que criou o agendamento | 🟢 Baixa |

---

## 🎨 Sugestões de Layout

### Seção 1: Cabeçalho
```
┌─────────────────────────────────────────┐
│ [Status Badge]  Título do Agendamento   │
│ ID: #ABC123                             │
└─────────────────────────────────────────┘
```

### Seção 2: Informações Principais (Grid 2 colunas)
```
┌──────────────────────┬──────────────────────┐
│ 👤 Paciente          │ 👨‍⚕️ Profissional      │
│ Nome do Paciente     │ Nome do Profissional  │
│ [Link para perfil]   │ [Link para perfil]    │
├──────────────────────┼──────────────────────┤
│ 🏥 Unidade           │ 📅 Data e Hora       │
│ Nome da Unidade      │ Segunda, 19/02/2026   │
│ [Link para unidade]  │ 14:00 - 15:30 (1h30)  │
└──────────────────────┴──────────────────────┘
```

### Seção 3: Procedimentos
```
┌─────────────────────────────────────────┐
│ 💰 Procedimentos                        │
│ ─────────────────────────────────────── │
│ 1. Procedimento X - R$ 150,00           │
│    Observações: ...                      │
│                                          │
│ 2. Procedimento Y - R$ 200,00           │
│    Observações: ...                      │
│ ─────────────────────────────────────── │
│ Total: R$ 350,00                         │
└─────────────────────────────────────────┘
```

### Seção 4: Ações
```
┌─────────────────────────────────────────┐
│ [Botão: Confirmar] [Botão: Cancelar]    │
│ [Botão: Editar] [Botão: Voltar]         │
└─────────────────────────────────────────┘
```

---

## 🔄 Dados que Precisam ser Buscados Separadamente

Para uma tela completa de detalhes, será necessário buscar:

1. **Dados do Paciente** (`GET /patients/:patientId`)
   - CPF, Email, Data de Nascimento, Endereço

2. **Dados do Profissional** (`GET /professionals/:professionalId`)
   - Conselho, Número do Conselho, Estado, Profissão

3. **Dados da Franquia** (`GET /franchises/:franchiseId`)
   - Nome, Endereço, CEP, Descrição

4. **Dados dos Procedimentos** (para cada `appointmentItem.procedureId`)
   - Nome do procedimento, Preço padrão

---

## 📊 Priorização de Implementação

### Fase 1 - Essencial (MVP)
- ✅ Título do agendamento
- ✅ Status
- ✅ Nome do paciente
- ✅ Nome do profissional
- ✅ Nome da unidade
- ✅ Data e horário (início e fim)
- ✅ Duração
- ✅ Lista de procedimentos com preços
- ✅ Valor total

### Fase 2 - Melhorias
- ✅ Observações dos procedimentos
- ✅ Informações do conselho do profissional
- ✅ Endereço da unidade
- ✅ Data de criação

### Fase 3 - Extras
- ✅ CPF e email do paciente
- ✅ Data de nascimento
- ✅ Preço original vs preço aplicado
- ✅ Histórico de alterações

---

## 🎯 Endpoint Sugerido

Para otimizar, seria interessante criar um endpoint específico:

```
GET /appointments/:appointmentId/details
```

Que retorne todos os dados relacionados em uma única requisição:
- Appointment completo
- Dados do paciente
- Dados do profissional (com usuário)
- Dados da franquia
- Dados dos procedimentos (para cada item)

Isso evitaria múltiplas requisições e melhoraria a performance.

---

## 📝 Notas de Implementação

1. **Formatação de Datas**: Usar `toLocaleDateString('pt-BR')` e `toLocaleTimeString('pt-BR')`
2. **Formatação de Valores**: Usar `toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })`
3. **Status Badge**: Usar cores diferentes para cada status
4. **Links**: Tornar clicáveis os nomes para navegar aos detalhes do paciente/profissional/unidade
5. **Ações**: Botões de ação devem respeitar o status atual (ex: não permitir cancelar se já estiver cancelado)

