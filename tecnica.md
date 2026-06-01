1) Como são utilizados os types no TypeScript? Qual a vantagem?

Types no TypeScript servem para definir o formato dos dados e garantir tipagem estática em tempo de desenvolvimento. Eles ajudam a evitar erros antes da execução, melhoram autocomplete e deixam o código mais previsível e seguro.

---

2) Qual a diferença entre interface e type?

Interface é mais usada para definir contratos de objetos e pode ser estendida ou mesclada automaticamente. 
Type é mais flexível, permite união, interseção e tipos primitivos. 
No dia a dia, uso interface para contratos de objetos e type para composições mais complexas.

---

3) O que é generics no TypeScript?

Generics permitem criar funções e classes reutilizáveis mantendo tipagem forte. 
Exemplo: function identity<T>(value: T): T { return value }
Isso garante flexibilidade sem perder segurança de tipo.

---

4) Diferença entre map, forEach e filter?

map: retorna um novo array transformado.
forEach: apenas percorre o array, não retorna nada.
filter: retorna um novo array com base em uma condição.                      

---

5) O que é event loop no Node.js?                     

É o mecanismo que permite que o Node seja não-bloqueante. 
Ele gerencia chamadas assíncronas colocando callbacks em filas e executando quando a stack principal está livre.

---

6) Para que servem os módulos no NestJS?

Módulos organizam a aplicação em blocos coesos. 
Eles agrupam controllers, providers e serviços relacionados, facilitando organização e escalabilidade.

---

7) O que é Dependency Injection e como o Nest usa isso?

Dependency Injection é um padrão onde dependências são injetadas ao invés de criadas internamente.
O Nest usa isso através do sistema de providers, permitindo baixo acoplamento e melhor testabilidade.

---

8) Qual a diferença entre provider, service e controller?

Controller: recebe requisições HTTP.
Service: contém regra de negócio.
Provider: qualquer classe registrada para injeção de dependência (services são providers).

---

9) O que são interceptors no NestJS?

Interceptores permitem interceptar requisições/respostas para aplicar lógica como logging, transformação de resposta ou tratamento global.

---

10) O que é middleware e quando usar?

Middleware executa antes da rota ser processada.
É usado para autenticação simples, logs, validação ou manipulação de request.

---

11) Como funciona autenticação com JWT?

O usuário faz login, o servidor gera um token assinado.
Esse token é enviado no header Authorization nas próximas requisições.
O backend valida a assinatura e extrai as informações do usuário.

---

12) O que é OAuth e quando usar?

OAuth é um protocolo de autorização.
É usado quando queremos permitir login com terceiros (Google, GitHub) sem compartilhar senha.

---

13) Como você protegeria uma API contra ataques comuns?

Validação de entrada.
Rate limiting.
Sanitização contra injection.
Autenticação e autorização adequadas.
HTTPS.
Monitoramento e logs.

---

14) O que é CORS?

CORS é uma política de segurança do navegador que controla quais domínios podem acessar recursos da API.

---

15) Como versionar uma API REST?

Via prefixo de rota (/v1/users).
Ou header customizado.
Ou subdomínio.
O mais comum é versionamento por rota.

---

16) O que é Clean Architecture?

É um padrão onde as regras de negócio ficam independentes de frameworks.
Separa camadas como domínio, aplicação e infraestrutura, reduzindo acoplamento.

---

19) Como você lidaria com erro 500 retornando no front?

Primeiro analiso logs e stack trace.
Identifico causa raiz.
Aplico correção.
Adiciono tratamento adequado e monitoramento para evitar recorrência.

---

20) O que é idempotência?

É a garantia de que uma operação pode ser executada várias vezes sem alterar o resultado final.
Muito importante em APIs e mensageria para evitar efeitos duplicados.