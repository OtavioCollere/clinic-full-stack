# Planejamento de Métricas (por etapas)
Foco: decisões que aumentam lucro e reduzem desperdício (ociosos, no-show, preço errado).

---

## Etapa 1 (MVP) — Só com o que você já tem hoje
Dados disponíveis: consultas, pacientes, profissionais, procedimentos, filiais.

### Dashboard (visão do dono)
1) Receita estimada do período
- Campo: soma(appointmentItems.price) de consultas DONE (ou CONFIRMED se ainda não existe DONE)
- Filtros: período, filial, profissional

2) Consultas do período
- Quantidade total de consultas (por status)
- Filtros: período, filial

3) Ticket médio
- receita / número de consultas

4) Top procedimentos (por receita)
- ranking: procedimento -> soma(preço aplicado)
- mostrar também: quantidade de vezes executado

5) Receita por filial
- ranking/colunas: filial -> receita

6) Receita por profissional
- ranking: profissional -> receita

7) Ocupação de agenda (proxy)
- total de minutos agendados / (minutos disponíveis)   // se ainda não existir "disponibilidade", mostrar apenas "minutos agendados" por profissional/filial

8) Cancelamentos (se houver status CANCELED)
- taxa de cancelamento = canceled / total

9) Novos pacientes do período
- pacientes criados no período (ou primeira consulta no período)

10) Pacientes recorrentes (proxy)
- pacientes com 2+ consultas no período

Componentes recomendados
- Cards (KPI), tabelas de ranking, gráfico de linha (receita por dia) e barras (receita por filial/profissional)

---

### Aba Financeiro (MVP)
1) Resumo do período
- Receita total (soma de prices)
- Número de consultas
- Ticket médio

2) Receita por procedimento
- tabela: procedimento | qtd | receita | ticket médio

3) Receita por profissional
- tabela: profissional | qtd consultas | receita | receita por consulta

4) Receita por filial
- tabela: filial | qtd consultas | receita | ticket médio

5) Descontos (proxy)
- diferença entre "preço padrão do procedimento" vs "preço aplicado no agendamento" (se você buscar procedure.price)
- métricas: desconto médio, desconto total no período

6) Retorno (proxy)
- consultas onde soma(preços) = 0  -> classificar como "consulta de retorno"
- mostrar % e impacto em agenda (qtd e minutos consumidos)

---

## Etapa 2 — Ajustes mínimos de dados que desbloqueiam lucro real
Adicionar 3 coisas simples no modelo:
- appointment.status incluir NO_SHOW
- paymentStatus: PAID | PENDING | REFUNDED (por consulta ou por item)
- paymentMethod: PIX | CARD | CASH | TRANSFER
(opcional) origin do paciente: Instagram | Indicação | Google | Outros

### Dashboard (Etapa 2)
1) Faturamento real (pago) vs previsto
- pago: soma onde paymentStatus=PAID
- previsto: soma de CONFIRMED

2) Inadimplência
- pendente: soma onde paymentStatus=PENDING
- taxa: pendente / total

3) No-show
- no_show / total
- ranking por profissional e por filial

4) Eficiência de agenda
- minutos perdidos (canceled + no_show) em minutos
- impacto estimado em R$ (usar ticket médio por minuto)

5) Origem que mais retorna (se tiver origin)
- origem -> pacientes recorrentes (2+ atendimentos em 90 dias)

### Aba Financeiro (Etapa 2)
1) Caixa do período
- total pago
- total pendente
- total estornado

2) Forma de pagamento
- pie/bar: PIX vs cartão vs etc
- taxa de uso por filial

3) Aging simples (contas pendentes)
- pendente há: 0-7 dias, 8-15, 16-30, 30+

4) Estornos e cancelamentos
- total estornado
- motivos (se você adicionar reason depois)

---

## Etapa 3 — Onde vira “sistema que imprime dinheiro”
Adicionar:
- Pacotes (bundle): créditos/sessões, validade, consumo
- Assinaturas: cobrança recorrente, pausa/cancelamento, inadimplência
- Comissões: regra por procedimento/pacote/assinatura e por profissional/vendedor

### Dashboard (Etapa 3)
1) MRR (receita recorrente mensal)
- total de assinaturas ativas * valor mensal

2) Churn de assinatura
- canceladas / ativas no mês

3) Utilização de pacotes
- créditos vendidos vs consumidos vs expirados
- receita reconhecida vs “passivo” (créditos pendentes)

4) Retenção 30/60/90
- % de pacientes que voltam em 30/60/90 dias

5) Receita por hora (R$/h)
- receita / horas executadas por profissional e filial

### Aba Financeiro (Etapa 3)
1) Receita recorrente (assinaturas)
- total previsto vs pago
- inadimplência de recorrência

2) Pacotes
- vendas do período
- consumo do período
- créditos a vencer (alerta)

3) Comissões
- total comissionado por período
- por profissional
- por tipo: consulta/procedimento/pacote/assinatura
- ajustes automáticos por estorno/cancelamento

---

## Regras de filtro (importante)
- Período: hoje, 7 dias, mês atual, mês anterior, personalizado
- Filial
- Profissional
- Procedimento
- Status

---

## Observação prática
Se você só puder escolher 6 cards pro Dashboard inicial, eu colocaria:
- Receita do período
- Consultas por status
- Ticket médio
- Top procedimentos por receita
- Receita por filial
- Cancelamento/no-show (quando existir)
