# PayCash Cameroon — Plateforme Backend

> Plateforme de Mobile Money pour le Cameroun (Orange Money & MTN Mobile Money).
> Architecture microservices en NestJS / TypeScript.

---

## Table des matières

- [Architecture](#architecture)
- [Services](#services)
- [Comment les services communiquent](#comment-les-services-communiquent)
- [Flow d'une transaction](#flow-dune-transaction)
- [Sécurité](#sécurité)
- [Format de réponse API](#format-de-réponse-api)
- [Endpoints](#endpoints)
- [Lancement en local](#lancement-en-local)
- [Lancement avec Docker](#lancement-avec-docker)
- [Tests](#tests)
- [Structure du projet](#structure-du-projet)
- [FAQ](#faq)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Postman / React)               │
│                           HTTP :4000                          │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │     API GATEWAY          │
              │      Port 4000           │
              │   Auth JWT + Proxy       │
              │   Swagger /api/docs      │
              └────┬──────┬──────┬───────┘
                   │      │      │
        ┌──────────┘      │      └──────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ TRANSACTION  │  │   PARTNER    │  │     FEE      │
│   SERVICE    │  │   SERVICE    │  │   SERVICE    │
│  Port 4001   │  │  Port 4002   │  │  Port 4003   │
└──────┬───────┘  └──────────────┘  └──────────────┘
       │
       │ fire-and-forget (après succès)
       ▼
┌──────────────┐
│ NOTIFICATION │
│   SERVICE    │
│  Port 4004   │
└──────────────┘
```

Le **Gateway** est le seul point d'entrée exposé (port 4000). Il route les requêtes vers les services internes via un proxy HTTP. Chaque service est un process NestJS indépendant.

---

## Services

| Service | Port | Rôle | Dépendances |
|---|---|---|---|
| **api-gateway** | 4000 | Authentification JWT, proxy HTTP, CORS, Swagger, health check | Tous les services |
| **transaction-service** | 4001 | Initiation, statut, liste des transactions. Signature HMAC. Simulation du cycle de vie (PENDING → SUCCESS après ~5s). | Partner, Fee, Notification |
| **partner-service** | 4002 | Vérification de validité des comptes Mobile Money (simulé). Détection auto de l'opérateur. | — |
| **fee-service** | 4003 | Calcul progressif des frais selon l'opérateur et le montant. Taxe 2%. | — |
| **notification-service** | 4004 | Envoi d'emails de confirmation de transaction (simulé). Template HTML. | — |
| **shared-types** | — | Interfaces, DTOs, constantes, utilitaires partagés. Pas un service, une librairie TypeScript. | — |

---

## Comment les services communiquent

### En local (dev)

Les services s'appellent via **HTTP** en utilisant les URLs locales :

```
Transaction Service ──POST──► http://localhost:4002/partners/verify   (Partner)
Transaction Service ──POST──► http://localhost:4003/fees/calculate    (Fee)
Transaction Service ──POST──► http://localhost:4004/notifications/...  (Notification)
```

### Dans Docker

Les URLs sont surchargées via variables d'environnement avec les **noms de containers Docker** :

```
Transaction Service ──POST──► http://partner-service:4002/partners/verify
Transaction Service ──POST──► http://fee-service:4003/fees/calculate
Transaction Service ──POST──► http://notification-service:4004/notifications/...
```

Les URLs sont définies dans `shared-types/src/constants/index.ts` :

```typescript
export const SERVICE_URLS = {
  PARTNER_SERVICE:     process.env.PARTNER_SERVICE_URL     || 'http://localhost:4002',
  FEE_SERVICE:         process.env.FEE_SERVICE_URL         || 'http://localhost:4003',
  NOTIFICATION_SERVICE: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:4004',
};
```

### Via le Gateway (client → services)

Le client ne parle jamais directement aux services internes. Il passe toujours par le Gateway :

```
Client ──► Gateway (:4000) ──proxy──► Service interne
```

Le Gateway extrait le nom du service depuis l'URL (`/api/transactions/...` → Transaction Service), forwarde les headers `Authorization` et `Content-Type`, et retransmet la réponse.

---

## Flow d'une transaction

```
POST /auth/login (admin / paycash2024)
  └─► JWT token stocké

POST /api/transactions/transactions/initiate
  │
  ├─ 1. Gateway vérifie le JWT (Bearer token)
  │     └─► Proxy vers Transaction Service
  │
  ├─ 2. Transaction Service : détection auto opérateur
  │     └─► 671234567 → préfixe 67 → ORANGE
  │
  ├─ 3. Transaction Service → Partner Service
  │     └─► POST /partners/verify
  │         └─► { phoneNumber, operator }
  │             └─► Réponse : { isValid: true }
  │
  ├─ 4. Transaction Service → Fee Service
  │     └─► POST /fees/calculate
  │         └─► { amount: 5000, operator: ORANGE, type: P2P }
  │             └─► Réponse : { total: 51, baseFee: 50, tax: 1 }
  │
  ├─ 5. Sauvegarde en mémoire (PENDING)
  │     └─► Génération signature HMAC-SHA256
  │
  ├─ 6. Réponse immédiate au client
  │     └─► { transactionId, status: PENDING, signature, fees, createdAt }
  │
  ├─ 7. Background : après ~4-6 secondes
  │     └─► PENDING → SUCCESS (95%) ou FAILED (5%)
  │
  └─ 8. Background : si SUCCESS + email fourni
        └─► Transaction Service → Notification Service
            └─► POST /notifications/email/transaction-success
                └─► Email HTML avec détails de la transaction
```

---

## Sécurité

### Authentification JWT

- **Endpoint** : `POST /auth/login` (public)
- **Credentials** : `admin` / `paycash2024`
- **Token** : HS256 signé avec la clé `paycash-jwt-secret-key-2024`
- **Durée de vie** : 24 heures
- **Tous les endpoints `/api/*`** sont protégés par le `JwtAuthGuard` sur le Gateway

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Signature HMAC

Chaque transaction reçoit une signature HMAC-SHA256 générée à partir de :

```
payload = transactionId:amount:phoneNumber:timestamp
signature = HMAC-SHA256(payload, secret)
```

Cela permet au client de vérifier l'intégrité de la réponse.

### Validation des entrées

Tous les DTOs utilisent `class-validator` avec des règles strictes :

| Champ | Règle |
|---|---|
| `phoneNumber` | Regex `/^6\d{8}$/` (format 6XXXXXXXX) |
| `amount` | Min 100, Max 1 000 000 XAF |
| `operator` | Enum ORANGE \| MTN (optionnel, détection auto) |
| `reference` | String 5-50 caractères |
| `email` | Format email valide (optionnel) |

---

## Format de réponse API

Toutes les réponses suivent le même format standard :

### Succès

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { /* payload spécifique */ },
  "meta": {
    "timestamp": "2026-08-05T10:27:00.000Z",
    "requestId": "req_a1b2c3d4e5f6g7h8",
    "path": "/transactions/initiate"
  }
}
```

### Erreur

```json
{
  "success": false,
  "message": "Compte Mobile Money invalide",
  "data": null,
  "meta": {
    "timestamp": "2026-08-05T10:27:00.000Z",
    "requestId": "req_x1y2z3...",
    "path": "/transactions/initiate"
  }
}
```

Le `requestId` est un identifiant unique par requête (16 caractères hex), utile pour le tracing.

### Pagination

Les endpoints de liste retournent une structure paginée :

```json
{
  "data": {
    "items": [ /* résultats */ ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## Endpoints

### Auth
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Non | Récupérer un token JWT |

### Transactions (via Gateway `/api/transactions/...`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/transactions/initiate` | JWT | Initier une transaction |
| GET | `/transactions/:id/status` | JWT | Statut d'une transaction |
| GET | `/transactions?page=1&limit=10` | JWT | Liste paginée (tous) |
| GET | `/transactions/phone/:number?page=1&limit=10` | JWT | Transactions d'un numéro |

### Partenaires (via Gateway `/api/partners/...`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/partners/verify` | JWT | Vérifier un compte Mobile Money |
| GET | `/partners/:operator` | JWT | Infos d'un opérateur |

### Frais (via Gateway `/api/fees/...`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/fees/calculate` | JWT | Calculer les frais |
| GET | `/fees/rates` | JWT | Grille tarifaire |

### Notifications (via Gateway `/api/notifications/...`)
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/notifications/email` | JWT | Envoyer un email personnalisé |
| POST | `/notifications/email/transaction-success` | JWT | Email confirmation transaction |

### Health
| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | Non | État du Gateway |
| GET | `/api/docs` | Non | Documentation Swagger |

---

## Lancement en local

### Prérequis
- Node.js ≥ 20
- npm ≥ 10

### Installation

```bash
cd backend
npm install
```

### Lancement de tous les services (mode dev)

```bash
npm run start:dev
```

Lance les 5 services en parallèle avec `concurrently`. Chaque service a un préfixe de couleur :

```
[gateway]      🚀 API Gateway running on http://localhost:4000
[transaction]  💸 Transaction Service running on http://localhost:4001
[partner]      🤝 Partner Service running on http://localhost:4002
[fee]          💰 Fee Service running on http://localhost:4003
[notification] 📧 Notification Service running on http://localhost:4004
```

### Lancement d'un seul service

```bash
npm run start:dev:gateway       # Gateway uniquement
npm run start:dev:transaction   # Transaction uniquement
npm run start:dev:partner       # Partner uniquement
npm run start:dev:fee           # Fee uniquement
npm run start:dev:notification  # Notification uniquement
```

---

## Lancement avec Docker

### Build + Lancement

```bash
docker compose up -d --build
```

Construit les 5 images et lance les containers. Seul le Gateway expose le port 4000.

### Commandes utiles

```bash
docker compose ps                 # Statut des containers
docker compose logs -f gateway    # Logs du Gateway
docker compose logs -f transaction # Logs du Transaction Service
docker compose down               # Arrêter et supprimer les containers
docker compose down -v            # Supprimer aussi les volumes
```

### Images Docker

Chaque service a son propre `Dockerfile` avec un build multi-stage :

1. **Stage builder** : copie tout le monorepo, `npm ci`, `nest build` du service cible
2. **Stage final** : image alpine minimale avec seulement `node_modules` et `dist/`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY shared-types/ shared-types/
COPY mon-service/ mon-service/
RUN npm ci --legacy-peer-deps
RUN npm run build:mon-service

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/mon-service/dist ./dist
CMD ["node", "dist/main.js"]
```

---

## Tests

```bash
npm test              # Tous les tests
npm run test:cov      # Avec couverture
npm run test:watch    # Watch mode
```

**Statut actuel** : 45 tests, 10 suites.

---

## Structure du projet

```
backend/
├── docker-compose.yml              # Orchestration Docker
├── .dockerignore
├── package.json                    # Dépendances + scripts monorepo
├── tsconfig.json                   # TS config racine
├── nest-cli.json                   # NestJS CLI config
│
├── shared-types/                   # Librairie partagée (types, DTOs, constantes, utils)
│   └── src/
│       ├── interfaces/             # Interfaces TypeScript (ITransaction, IFeeResponse, etc.)
│       ├── dtos/                   # DTOs avec validation class-validator
│       ├── constants/              # PORTS, SERVICE_URLS, JWT_CONFIG, limites
│       ├── utils/                  # generateTransactionId, generateHmacSignature, detectOperator
│       └── common/                 # Intercepteur réponse, filtre erreurs (partagés)
│
├── api-gateway/                    # API Gateway — point d'entrée unique
│   └── src/
│       ├── main.ts                 # Bootstrap (CORS, Swagger, ValidationPipe, intercepteur)
│       └── modules/
│           ├── auth/               # Login JWT, JwtStrategy, JwtAuthGuard
│           ├── proxy/              # Proxy HTTP vers les services internes
│           └── health/             # Health check
│
├── transaction-service/            # Service de gestion des transactions
│   └── src/
│       ├── main.ts
│       ├── modules/transactions/
│       │   ├── controllers/        # POST initiate, GET :id/status, GET liste, GET phone/:num
│       │   ├── services/           # Logique métier : validation, calcul frais, cycle de vie
│       │   ├── dtos/               # (réexporte depuis shared-types)
│       │   ├── entities/           # Entité Transaction
│       │   └── repositories/       # Stockage en mémoire (Map)
│       └── common/
│           ├── filters/            # (remplacé par le filtre partagé)
│           ├── guards/             # JWT Guard local
│           └── interceptors/       # Logging
│
├── partner-service/                # Service de vérification des comptes partenaires
│   └── src/modules/partners/
│       ├── controllers/            # POST verify, GET :operator
│       ├── services/               # Simulation d'appel API partenaire
│       └── dtos/
│
├── fee-service/                    # Service de calcul des frais
│   └── src/modules/fees/
│       ├── controllers/            # POST calculate, GET rates
│       ├── services/               # Calcul progressif par paliers (Orange/MTN)
│       └── dtos/
│
├── notification-service/           # Service d'envoi de notifications
│   └── src/modules/notifications/
│       ├── controllers/            # POST email, POST email/transaction-success
│       ├── services/               # Génération email HTML, simulation SMTP
│       └── dtos/
│
└── paycash_postman.json            # Collection Postman pour tester l'API
```

---

## Comment `shared-types` est partagé

Chaque service a un **symlink** dans son `src/types/` → `../../shared-types/src/` :

```
api-gateway/src/types/ → ../../shared-types/src/
transaction-service/src/types/ → ../../shared-types/src/
partner-service/src/types/ → ../../shared-types/src/
fee-service/src/types/ → ../../shared-types/src/
notification-service/src/types/ → ../../shared-types/src/
```

Les imports utilisent des chemins relatifs :

```typescript
// Dans transaction-service/src/modules/transactions/services/transaction.service.ts
import { Operator, TransactionStatus, generateHmacSignature } from '../../../types/index.js';
```

En **Docker**, le `COPY` résout automatiquement les symlinks et copie les vrais fichiers.

---

## FAQ

### Pourquoi les services ne sont pas exposés directement ?

Seul le Gateway écoute sur un port public (4000). Les services internes communiquent via un réseau Docker privé (`paycash-net`). C'est le pattern standard microservices : un seul point d'entrée, les services internes sont isolés.

### Pourquoi le statut passe de PENDING à SUCCESS après 5 secondes ?

C'est une **simulation** du traitement réel par l'opérateur Mobile Money (Orange/MTN). En production, un webhook ou un polling remplacerait ce `setTimeout`.

### Pourquoi les frais sont différents entre Orange et MTN ?

Les opérateurs ont des grilles tarifaires différentes. Le Fee Service applique la bonne grille selon l'opérateur :

| Tranche | Orange | MTN |
|---|---|---|
| 0 - 5 000 XAF | 1% | 1.2% |
| 5 001 - 50 000 XAF | 50 + 0.5% du surplus | 60 + 0.6% du surplus |
| > 50 000 XAF | 275 + 0.3% du surplus | 330 + 0.4% du surplus |

Une taxe de 2% est appliquée sur les frais de base.

### Comment la détection d'opérateur fonctionne ?

Basée sur les préfixes des numéros camerounais :

```
65, 67, 69, 70 → Orange Money
66, 68        → MTN Mobile Money
```

Si l'opérateur n'est pas fourni dans la requête, il est détecté automatiquement.

### Comment tester avec Postman ?

1. Importer `paycash_postman.json` dans Postman
2. Exécuter **LOGIN** (récupère le token JWT automatiquement)
3. Exécuter **🚀 INITIER UNE TRANSACTION**
4. Attendre ~5 secondes puis **Vérifier statut**

### Où sont stockées les transactions ?

En mémoire (Map) dans le `TransactionRepository`. En production, ce serait remplacé par PostgreSQL/MongoDB.

### Comment ajouter un vrai SMTP pour les emails ?

Modifier les variables d'environnement dans `docker-compose.yml` :

```yaml
notification-service:
  environment:
    - SMTP_HOST=smtp.gmail.com
    - SMTP_PORT=587
    - SMTP_USER=your-email@gmail.com
    - SMTP_PASS=your-app-password
```

Puis remplacer la méthode `dispatchEmail()` dans `notifications.service.ts` par un vrai appel `nodemailer`.
