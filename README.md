# 🚀 Encurtador de URL - Sistema Completo

Um sistema completo de encurtamento de URLs com funcionalidades avançadas, sistema de usuários, analytics detalhados e interface moderna.

## 🎯 Sobre o Projeto

Este é um sistema full-stack completo para encurtamento de URLs que vai muito além de um simples encurtador. Oferece recursos profissionais como analytics detalhados, sistema de usuários com diferentes planos, autenticação segura, e uma interface moderna e responsiva.

## 🏗️ Arquitetura

### Backend (API RESTful)

- **Framework**: Spring Boot 3+ com Java
- **Banco de Dados**: MongoDB (NoSQL)
- **Autenticação**: JWT (JSON Web Tokens)
- **Documentação**: OpenAPI 3.0/Swagger
- **Email**: Sistema integrado para verificação e notificações

### Frontend (SPA)

- **Framework**: React 19 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Componentes**: Radix UI
- **Roteamento**: React Router Dom
- **Estado**: TanStack React Query
- **Formulários**: React Hook Form + Zod

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação Completo

- **Registro de usuários** com validação de email
- **Login seguro** com JWT
- **Verificação de email** obrigatória
- **Recuperação de senha** via email
- **Perfil de usuário** editável
- **Alteração de senha** com validação

### 🔗 Gerenciamento de URLs

- **Encurtamento de URLs** com IDs únicos
- **URLs customizadas** (alias personalizados)
- **Expiração configurável** de URLs
- **URLs privadas** (vinculadas ao usuário)
- **Redirecionamento inteligente** com rastreamento
- **QR Code** automático para todas as URLs

### 📊 Analytics Avançados

- **Estatísticas em tempo real** de cliques
- **Análise geográfica** dos acessos
- **Dispositivos e navegadores** dos visitantes
- **Fontes de tráfego** (referrers)
- **Timeline de cliques** com gráficos
- **Dashboard personalizado** para cada usuário

### 👥 Sistema de Usuários e Planos

- **Plano FREE**: Limitações básicas
- **Plano PREMIUM**: Recursos avançados
- **Controle de cotas** mensais
- **Estatísticas personalizadas** por usuário
- **Gerenciamento de perfil** completo

### 🛡️ Segurança e Qualidade

- **Validação de URLs** maliciosas
- **Rate limiting** por IP
- **Headers de segurança** configurados
- **Validação de dados** robusta
- **Logs detalhados** de atividades
- **Tratamento de erros** profissional

### 🎨 Interface Moderna

- **Design responsivo** para todos os dispositivos
- **Tema claro/escuro** (implementável)
- **Animações suaves** e transições
- **Feedback visual** em tempo real
- **Navegação intuitiva** com sidebar
- **Componentes reutilizáveis**

## 🛠️ Tecnologias Principais

### Backend

```
Java 17+                 MongoDB Atlas
Spring Boot 3+           Spring Security  
Spring Data MongoDB      JWT Authentication
Spring Mail              Bean Validation
Swagger/OpenAPI 3        Lombok
```

### Frontend

```
React 19                 Tailwind CSS
TypeScript 5+            Radix UI
Vite 6+                  Lucide Icons
React Router v7          Recharts
TanStack Query           Sonner (Toast)
React Hook Form          Date-fns
Zod Validation           QRCode.js
Axios                    Class Variance Authority
```

## 📁 Estrutura do Projeto

```
encurtador-url/
├── urlshortener/                 # Backend (Spring Boot)
│   ├── src/main/java/
│   │   └── desafiourl/urlshortener/
│   │       ├── config/           # Configurações (Security, CORS, etc.)
│   │       ├── controller/       # Controllers REST
│   │       ├── service/          # Lógica de negócio
│   │       ├── entities/         # Modelos e DTOs
│   │       ├── repository/       # Acesso a dados
│   │       └── exception/        # Tratamento de exceções
│   └── src/main/resources/
│       ├── templates/            # Templates de email
│       └── application.yml       # Configurações
└── url-shortener-frontend/      # Frontend (React)
    ├── src/
    │   ├── components/           # Componentes reutilizáveis
    │   ├── pages/               # Páginas (public/private)
    │   ├── services/            # Comunicação com API
    │   ├── hooks/               # Hooks customizados
    │   ├── types/               # Definições TypeScript
    │   └── lib/                 # Utilitários
    └── public/                  # Assets estáticos
```

## 🚀 Como Executar

### Pré-requisitos

- Java 17+
- Node.js 18+
- MongoDB (local ou Atlas)
- Git

### Backend

```bash
cd urlshortener
./mvnw spring-boot:run
```

A API estará disponível em `http://localhost:8080`

### Frontend

```bash
cd url-shortener-frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📋 Configuração

### Variáveis de Ambiente (Backend)

```yaml
# application.yml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/urlshortener
  mail:
    host: smtp.gmail.com
    username: ${EMAIL_USERNAME}
    password: ${EMAIL_PASSWORD}

app:
  jwt:
    secret: ${JWT_SECRET}
  url:
    base-url: http://localhost:8080
```

### Configuração do Frontend

```typescript
// src/config/api.ts
export const API_BASE_URL = 'http://localhost:8080/api';
```

## 📚 API Endpoints

### Autenticação

```
POST   /api/auth/register          # Registrar usuário
POST   /api/auth/login             # Login
POST   /api/auth/verify-email      # Verificar email
POST   /api/auth/forgot-password   # Esqueci a senha
POST   /api/auth/reset-password    # Redefinir senha
```

### URLs

```
POST   /url/shorten               # Encurtar URL
GET    /{id}                      # Redirecionar
GET    /api/urls/my-urls          # Listar minhas URLs
GET    /api/urls/{id}/stats       # Estatísticas da URL
PUT    /api/urls/{id}             # Atualizar metadados
DELETE /api/urls/{id}             # Deletar URL
```

### Analytics

```
GET    /api/analytics/url/{id}              # Analytics completos
GET    /api/analytics/url/{id}/clicks       # Lista de cliques
GET    /api/analytics/url/{id}/stats/geo    # Estatísticas geográficas
GET    /api/analytics/url/{id}/stats/devices # Estatísticas de dispositivos
```

### Usuário

```
GET    /api/user/profile          # Perfil do usuário
PUT    /api/user/profile          # Atualizar perfil
PUT    /api/user/change-password  # Alterar senha
GET    /api/user/stats            # Estatísticas do usuário
```

## 📊 Funcionalidades de Analytics

- **Cliques em tempo real**: Contagem instantânea de acessos
- **Localização geográfica**: Mapa mundial de origem dos cliques
- **Análise temporal**: Gráficos de cliques por hora/dia/mês
- **Dispositivos**: Desktop, mobile, tablet
- **Navegadores**: Chrome, Firefox, Safari, Edge, etc.
- **Sistemas operacionais**: Windows, macOS, Linux, iOS, Android
- **Fontes de tráfego**: Redes sociais, busca orgânica, direto

## 🔒 Segurança Implementada

- **CORS configurado** para permitir apenas origens autorizadas
- **Validação de entrada** em todos os endpoints
- **Rate limiting** para prevenir abuse
- **Sanitização de dados** contra XSS
- **JWT com expiração** configurável
- **Senhas criptografadas** com BCrypt
- **Headers de segurança** (CSP, HSTS, etc.)

## 🎨 UI/UX Features

- **Design System** consistente com componentes reutilizáveis
- **Responsividade** completa (mobile-first)
- **Loading states** em todas as operações
- **Error boundaries** para captura de erros
- **Toast notifications** para feedback
- **Formulários inteligentes** com validação em tempo real
- **Navegação fluida** sem recarregamento de página

## 🔄 Estado Atual vs Próximos Passos

### ✅ Implementado

- [x] Sistema completo de autenticação
- [x] CRUD completo de URLs
- [x] Analytics detalhados e gráficos
- [x] Sistema de usuários e planos
- [x] Interface moderna e responsiva
- [x] API documentada com Swagger
- [x] Validações robustas
- [x] Sistema de emails

### 🔮 Próximas Melhorias

- [ ] **Cache avançado** com Redis
- [ ] **API Rate Limiting** mais sofisticado
- [ ] **Testes automatizados** (Jest + JUnit) 
- [ ] **CI/CD Pipeline** com GitHub Actions
- [ ] **Monitoramento** com métricas e logs
- [ ] **API de integração** para terceiros
- [ ] **Bulk URL operations** (importação/exportação)

## 🤝 Contribuição

Este projeto demonstra uma implementação completa e profissional de um sistema de encurtamento de URLs, servindo como referência para arquiteturas full-stack modernas.

## 📄 Licença

Este projeto é open source e está disponível sob a [MIT License](LICENSE).

-----
 