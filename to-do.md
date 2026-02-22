[] - Seção de appointments
   [x] - Criar appointment
      [x] - opcao appointment de retorno, zera o valor do procedimento
   [x] - Editar appointment
   [x] - Listar appointment
   [] - Criar Calendário -> verificar biblioteca -> painel admin listar todos horários
   [] - PENSAR EM REGRA DE NEGOCIO, EM QUE MOMENTO O AGENDAMENTO FICA CONFIRMADO? AUTOMATICO?
         - opcao para cancelar agendamento


Fluxo patient
[OK] - Criar senha no primeiro acesso
[ ] - Criar tela de agendamentos que ele tem -> tbm vai ter seção de histórico -> HOME
[ ] - Tela Meu perfil 
    - aqui vai ter todos os dados, incluindo conta, paciente, anmese 
[] - Um user, pode também se registrar como paciente automaticamente 

Fluxo profissional
[OK] -  Criar senha no primeiro acesso
[] - Liberar acesso para criar agendamento
[] - Criar tela de meus agendamentos + histórico
[] - Home do barbeiro -> dashboardzinho
[] - admin pode criar uma conta profissional para ele mesmo

Fluxo Procedure

[] - quando profissional clicar em confirmar agendamento, vai ter a opção de alterar o valor de procedimento/adicionar procedimento

Segurança
[] - Criar permissoes backend
[] - Criar permissoes frontend

Automações
[] -> O Sistema vai enviar notificação para o profissional e para o paciente 
[] -> O paciente vai conseguir agendar pelo whatsapp



Seção Faturamento 
- pensar em regras

Otimizacoes
- cache na tela de pacientes
- cache na tela de agendamentos
- cache em profissionais
- cache em procedimentos
- chaves de invalidacao, no momento de CRUD

Feature futura
- admin solicitar a mudanca de senha do user
- Pacotes
  1 franquia -> 3 profissional ()
- plano pacote de promoção 
- integracao whatsapp