# oauth2-flows-visualized — Architecture Specification

## Status
Active

---

## ADRs (Architecture Decision Records)

### ADR-001: Stack Selection — SPA with Zustand + React Flow

**Status**: Accepted

**Context**
Se necesita una app interactiva que visualice flujos OAuth2 paso a paso. Los flujos son grafos directed acyclic de actores/mensajes. El usuario necesita avanzar/retroceder, inspeccionar requests, y ver alertas de vulnerabilidad contextuales.

**Decision**
- **Frontend**: React 18 + TypeScript (strict mode)
- **State**: Zustand (store único para flow stepper + UI state)
- **Diagramas**: React Flow (nodos/edges con animaciones de flechas)
- **Estilos**: Tailwind CSS + dark mode nativo
- **Build**: Vite 5
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deploy**: Vercel (static export)

**Consequences**

| Lo que ganamos | Lo que sacrificamos |
|:--|:--|
| React Flow ofrece nodos interactivos listos + animaciones de edges | Bundle ~150KB adicional vs SVG crudo |
| Zustand es más simple que Redux Toolkit para estado global | Sin middleware de persistencia out-of-the-box |
| Vite provee HMR rápido para dev | Ningún SSR posible (no necesario para static) |
| Tailwind elimina archivos CSS separados | Curva de aprendizaje si el equipo no lo conoce |

**Alternatives Considered**
- D3.js para grafos: Más flexible pero 3x más código para lograr lo mismo
- Next.js: Overkill, no hay backend ni SEO requirements
- state-management vía Context API: Zustand es más DRY para updates frequentes de step

---

### ADR-002: Arquitectura de Flujos — Domain-Driven con Flow Step como Aggregate

**Status**: Accepted

**Context**
Cada flujo OAuth (Auth Code, PKCE, Client Credentials) es una secuencia de pasos con actors, requests, responses, y vulnerabilidades asociadas. La app necesita soportar modo comparativo (2 flujos lado a lado) y un inspector de parámetros detallado.

**Decision**

```
src/
├── flows/                    # Domain: definiciones de flujo
│   ├── authorization-code/
│   │   ├── steps.ts          # FlowStep[] + payloads
│   │   ├── vulnerabilities.ts # stepId → VulnDefinition[]
│   │   └── types.ts          # types.ts compartidos por el flow
│   ├── pkce/
│   └── client-credentials/
├── domain/                   # Shared domain types
│   ├── FlowStep.ts
│   ├── Vulnerability.ts
│   ├── Actor.ts
│   └── types.ts
├── components/               # UI adapters
│   ├── FlowCanvas.tsx        # React Flow wrapper
│   ├── StepInspector.tsx     # Panel de parámetros
│   ├── VulnerabilityAlert.tsx # Badge/tooltip
│   ├── TokenDecoder.tsx      # JWT decoder
│   └── FlowSelector.tsx      # Selector de flujo
├── store/
│   └── flowStore.ts          # Zustand store
├── hooks/
│   ├── useFlowStepper.ts     # Lógica de navegación de pasos
│   └── useVulnerabilityHighlight.ts
└── data/
    ├── vulnerabilities.json  # CVE + OWASP references
    └── rfc-references.json   # Links a RFC 6749, 7636, 8252, 9700
```

**Trade-offs**
- **Duplicación de steps.ts entre flows**: Cada flujo tiene su propia secuencia; no hay shared steps abstraction porque los flujos son estructuralmente distintos
- **Vulnerabilities en archivo separado**: Permite actualizar la base de vulnerabilidades sin tocar lógica de flujo

---

### ADR-003: Modo Comparativo — Side-by-Side con Shared Step Index

**Status**: Accepted

**Context**
Se necesita comparar visualmente Auth Code sin PKCE vs con PKCE, mostrando exactamente qué paso se adiciona/protocoliza.

**Decision**
- Un `CompareMode` component que renderiza 2 `FlowCanvas` en columnas
- El stepper avanza ambos flujos sincronizadamente (step index compartido)
- Los pasos que no existen en un flujo muestran placeholder "N/A"
- Un `DiffIndicator` marca con color qué pasos difieren

**Consequences**
- Simple de implementar: 2 instancias del mismo componente
- Requiere que ambos flujos tengan steps comparables (alineados por índice)
- PKCE agrega ~3 pasos extra que se insertan en puntos específicos

---

### ADR-004: Security Mode — Toggle con Visual Layer

**Status**: Accepted

**Context**
El usuario puede activar un "Security Mode" que resalta pasos vulnerables y muestra alertas detalladas.

**Decision**
- El `flowStore` tiene un `securityMode: boolean`
- `useVulnerabilityHighlight` hook lee el paso actual + flow + securityMode y retorna `{ isVulnerable, severity, alerts }`
- Componente `VulnerabilityAlert` renders un Badge con color según severidad
- Las alertas incluyen: nombre del ataque, descripción, PoC simplificado, mitigación, link RFC

**Severity Mapping**

| Level | Color | Threshold |
|:--|:--|:-- |
| 🟢 Seguro | `#22c55e` | Sin vectores de ataque conocidos |
| 🟡 Riesgo | `#f59e0b` | Configuración insegura posible pero mitigable |
| 🔴 Crítico | `#ef4444` | Vulnerabilidad si no se implementa correctamente |

---

### ADR-005: JWT Decoder — Decodificación Client-Side Only

**Status**: Accepted

**Context**
Al llegar al paso de issuance de token, se debe poder expandir y decodificar el JWT para ver header/payload/signature.

**Decision**
- Librería `jwt-decode` (轻量, ~2KB)
- No se hace ninguna llamada HTTP — todo client-side
- Los payloads son `[EXAMPLE]` — nunca tokens reales
- Se muestra el JWT completo con colores por sección

---

## Bounded Contexts

### 1. Flow Engine (Dominio Core)
- **Entity**: `FlowStep` — id, title, actor (from/to), request (method, endpoint, params), response (status, body), vulnerabilities[], rfcRef
- **Value Objects**: `Actor`, `HttpRequest`, `HttpResponse`, `VulnerabilityRef`
- **Service**: `FlowNavigator` — next(), prev(), goTo(stepId), getStepAt(index)

### 2. Security Analysis (Dominio Supporting)
- **Entity**: `Vulnerability` — id, cweId, severity, title, description, proofOfConcept, mitigation, rfcRef
- **Service**: `VulnerabilityMatcher` — dado un flowId + stepId, retorna vulnerabilidad applicable

### 3. UI Components (Dominio de Presentación)
- **React Flow nodes**: ActorNode (avatar del actor), MessageNode (request/response)
- **Zustand slices**: currentFlow, currentStepIndex, securityMode, compareMode

---

## Vulnerability Data Model

```typescript
// src/domain/Vulnerability.ts
interface Vulnerability {
  id: string;              // e.g. "open-redirect"
  cweId: string;           // e.g. "CWE-601"
  severity: "safe" | "risk" | "critical";
  title: string;           // e.g. "Open Redirect via URI Manipulation"
  description: string;
  proofOfConcept: string; // Explicación simplificada del ataque
  mitigation: string;     // Cómo prevenirlo
  rfcRef: string;         // e.g. "RFC 6749 §4.1.2"
  references: string[];    // Links a recursos externos
}

// src/flows/pkce/vulnerabilities.ts
export const pkceVulnerabilities: Record<string, Vulnerability[]> = {
  "pkce-step-2": [
    {
      id: "plain-code-challenge",
      cweId: "CWE-345",
      severity: "critical",
      title: "Plain Text code_challenge Method",
      description: "Using `code_challenge_method=plain` exposes the code_verifier...",
      proofOfConcept: "Attacker intercepts authorization code, then brute-forces...",
      mitigation: "Always use S256 (SHA-256) for code_challenge_method",
      rfcRef: "RFC 7636 §4.6",
      references: ["https://oauth.net/2/pkce/"]
    }
  ]
}
```

---

## Requerimientos Funcionales (Priorizados)

| ID | Descripción | Prioridad | Estimación |
|:--|:--|:--|:--|
| RF-01 | Flow selector con 3 flujos + descripciones | P0 | 1d |
| RF-02 | Stepper interactivo con prev/next/auto-play | P0 | 2d |
| RF-03 | FlowCanvas con React Flow (nodos actores + edges animados) | P0 | 2d |
| RF-04 | StepInspector: request/response params con tooltips | P0 | 1d |
| RF-05 | Security Mode toggle + VulnerabilityAlert badges | P0 | 2d |
| RF-06 | Auth Code Flow completo (9 pasos) | P0 | 2d |
| RF-07 | PKCE Flow completo (12 pasos) | P1 | 2d |
| RF-08 | Client Credentials Flow (5 pasos) | P1 | 1d |
| RF-09 | JWT Decoder inline | P1 | 1d |
| RF-10 | Compare Mode (Auth Code vs PKCE lado a lado) | P2 | 2d |
| RF-11 | Export PNG + Mermaid | P2 | 1d |
| RF-12 | i18n EN/ES | P2 | 1d |
| RF-13 | PWA + offline | P3 | 1d |

---

## Requerimientos No Funcionales

| ID | Descripción | Target |
|:--|:--|:--|
| RNF-01 | First Contentful Paint | < 1.5s |
| RNF-02 | Accesibilidad WCAG 2.1 AA + navegación por teclado | 100% |
| RNF-03 | Responsive: desktop (≥1024px) y tablet (≥768px); mobile vista simplificada | ≥768px full |
| RNF-04 | Bundle size total (gzip) | < 300KB |
| RNF-05 | Lighthouse score (performance) | ≥ 95 |

---

## Flujos: Paso a Paso

### Authorization Code Flow (9 pasos)

```
1. User clicks "Login"              → Browser → Client App
2. Redirect to /authorize           → Client → Auth Server (GET /authorize)
3. User authenticates              → Auth Server → User
4. Consent screen                  → Auth Server → User
5. Redirect to redirect_uri + code  → Auth Server → Browser → Client
6. Exchange code for tokens        → Client → Auth Server (POST /token)
7. Receive access_token + id_token → Auth Server → Client
8. Call resource with access_token  → Client → Resource Server
9. Return protected data           → Resource Server → Client
```

### PKCE Flow (12 pasos)
```
Pasos 1-4: Igual que Auth Code hasta consentimiento
5.  Client genera code_verifier
6.  Client calcula code_challenge (S256)
7.  Redirect con code_challenge   → Auth Server recibe code_challenge
8.  Redirect a redirect_uri + code
9.  Exchange code + code_verifier → Auth Server valida
10. Receive tokens
11-12: Llamadas a resource server
```

### Client Credentials Flow (5 pasos)
```
1. Client → Auth Server: POST /token (client_id + client_secret + grant_type=client_credentials)
2. Auth Server valida credenciales
3. Auth Server → Client: access_token
4. Client → Resource Server: GET /resource (Bearer token)
5. Resource Server → Client: protected data
```

---

## Arquitectura de Datos — Vulnerabilidades por Flow/Paso

### Auth Code Flow

| Paso | Vulnerabilidad | Severidad |
|:--|:--|:--|
| Step 2 (Redirect to /authorize) | open-redirect, state-omission | 🔴 Crítico |
| Step 5 (code in URL) | code-interception, log-leakage | 🔴 Crítico |
| Step 6 (token exchange) | redirect-uri-mismatch, code-replay | 🔴 Crítico |
| Step 8 (API call) | token-leakage-via-referrer | 🟡 Alto |

### PKCE Flow

| Paso | Vulnerabilidad | Severidad |
|:--|:--|:--|
| Step 6 (code_challenge) | plain-code-challenge-method | 🔴 Crítico |
| Step 9 (code exchange) | code-verifier-guessable | 🔴 Crítico |
| Todos los demás | Mitigados por PKCE | 🟢 Seguro |

### Client Credentials Flow

| Paso | Vulnerabilidad | Severidad |
|:--|:--|:--|
| Step 1 (token request) | client-secret-exposure, hardcoded-credentials | 🔴 Crítico |
| Step 3 (token response) | token-not-rotated | 🟡 Alto |
| Step 4 (API call) | token-leakage-via-logs | 🟡 Alto |

---

## Dependencias (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "reactflow": "^11.11.0",
    "zustand": "^4.5.0",
    "jwt-decode": "^4.0.0",
    "i18next": "^23.11.0",
    "react-i18next": "^14.1.0",
    "react-hot-toast": "^2.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.4.0",
    "@playwright/test": "^1.42.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## Roadmap de Implementación

```
Semana 1:
  Día 1:   Scaffolding Vite + React + TS + Tailwind
  Día 2:   Zustand store + FlowCanvas (React Flow básico)
  Día 3:   Stepper + FlowSelector
  Día 4:   StepInspector + tooltips
  Día 5:   Auth Code Flow completo (9 pasos) — MVP

Semana 2:
  Día 6-7: Security Mode + VulnerabilityAlert + vulnerabilities.json
  Día 8:   JWT Decoder inline
  Día 9-10: PKCE Flow (12 pasos) + Compare Mode

Semana 3:
  Día 11:  Client Credentials Flow
  Día 12:  i18n EN/ES + polish UI
  Día 13:  Export PNG (html-to-image) + Mermaid
  Día 14:  PWA + Service Worker + deploy Vercel
```

---

## Security Notes

- **No real OAuth calls**: Todos los requests son simulaciones con payloads `[EXAMPLE]`
- **No tokens persited**: Session storage únicamente, se limpia al cerrar
- **CSP headers**: Configurados en el deploy de Vercel
- **External links**: Todos los links a RFCs y recursos externos se abren en `target="_blank" rel="noopener noreferrer"`

---

## Open Questions (Pendientes)

1. ¿Mobile: full feature set o solo vista read-only del flujo?
2. ¿Auto-play: velocidad fija o configurable por el usuario?
3. ¿Animaciones de edges: timing linear o ease-in-out?
4. ¿Storage de preferencia de idioma: localStorage o browser lang detection?