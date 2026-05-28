<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Genera el diseño y los requerimientos paar este proyeto:

oauth2-flows-visualized — App web interactiva que visualiza los flujos de OAuth2/OIDC paso a paso (authorization code, PKCE, client credentials), mostrando dónde pueden surgir vulnerabilidades.

Aquí tienes el diseño completo y los requerimientos del proyecto **oauth2-flows-visualized**:

***

# oauth2-flows-visualized

## Visión General del Proyecto

App web interactiva que visualiza paso a paso los flujos de OAuth2/OIDC, destacando en tiempo real los puntos donde pueden surgir vulnerabilidades de seguridad. El usuario puede avanzar el flujo manualmente, inspeccionar cada mensaje HTTP y ver alertas de riesgo contextuales.

***

## Stack Tecnológico

| Capa | Tecnología | Justificación |
| :-- | :-- | :-- |
| Frontend | React + TypeScript | Componentes reutilizables para cada "actor" del flujo |
| Visualización | React Flow / D3.js | Grafos interactivos con nodos y aristas animadas |
| Diagramas | Mermaid.js | Renderizado de secuencias como fallback/exportación |
| Estilos | Tailwind CSS | Utilidades rápidas + modo oscuro |
| Estado | Zustand | Estado global liviano para pasos del flujo |
| Build | Vite | Dev server rápido, ideal para SPA |
| Testing | Vitest + Playwright | Unit + E2E |
| Deploy | Vercel / GitHub Pages | Hosting estático gratuito |


***

## Arquitectura de la Aplicación

```
src/
├── flows/
│   ├── authorization-code/
│   │   ├── steps.ts          # Definición de pasos + payloads
│   │   ├── vulnerabilities.ts # Mapeo paso → vulnerabilidad
│   │   └── FlowDiagram.tsx
│   ├── pkce/
│   │   ├── steps.ts
│   │   ├── vulnerabilities.ts
│   │   └── FlowDiagram.tsx
│   └── client-credentials/
│       ├── steps.ts
│       ├── vulnerabilities.ts
│       └── FlowDiagram.tsx
├── components/
│   ├── FlowCanvas.tsx        # Canvas principal con nodos/actores
│   ├── StepInspector.tsx     # Panel lateral: headers, body, params
│   ├── VulnerabilityAlert.tsx # Badge/tooltip de riesgo
│   ├── TokenDecoder.tsx      # Decodificador JWT inline
│   ├── FlowSelector.tsx      # Selector de flujo
│   └── CompareMode.tsx       # Vista lado a lado (ej. con/sin PKCE)
├── data/
│   ├── vulnerabilities.json  # Base de datos de CVEs y patrones
│   └── rfc-references.json   # Referencias a RFC 6749, 7636, 9700
├── hooks/
│   ├── useFlowStepper.ts
│   └── useVulnerabilityHighlight.ts
└── store/
    └── flowStore.ts
```


***

## Flujos a Implementar

### 1. Authorization Code Flow

Los actores son: **User → Browser → Client App → Auth Server → Resource Server**. Cada paso muestra el request/response HTTP con parámetros reales (`response_type=code`, `state`, `redirect_uri`).[^1]

### 2. Authorization Code + PKCE

Extiende el flujo anterior introduciendo `code_verifier` y `code_challenge`. El diagrama muestra explícitamente cómo PKCE neutraliza el ataque de intercepción del authorization code, comparando el flujo con y sin PKCE activado.[^2][^3]

### 3. Client Credentials Flow

Flujo máquina-a-máquina sin intervención del usuario: **Client → Auth Server → Resource Server**. Enfocado en la gestión segura del `client_secret` y los riesgos de exposición.[^4]

***

## Mapa de Vulnerabilidades por Paso

Cada paso del flujo tendrá un indicador de riesgo (🟢 Seguro / 🟡 Riesgo / 🔴 Crítico):[^5][^6]


| Paso del Flujo | Vulnerabilidad Asociada | Severidad |
| :-- | :-- | :-- |
| Redirect URI enviada | Open Redirect / URI Manipulation | 🔴 Crítico |
| `state` param omitido | CSRF Attack | 🔴 Crítico |
| Authorization Code en URL | Code Interception | 🔴 Crítico |
| Sin PKCE en public client | Code Injection Attack | 🔴 Crítico |
| `redirect_uri` sin validación exacta | Token Hijacking | 🔴 Crítico |
| Auth page en iframe/webview | Clickjacking / Phishing | 🟡 Alto |
| Token en query string / URL | Token Leakage via Logs | 🟡 Alto |
| `client_secret` en frontend | Secret Exposure | 🟡 Alto |
| HTTP (no HTTPS) en redirect | DNS Spoofing | 🟡 Alto |
| Refresh token sin rotación | Token Replay Attack | 🟡 Medio |


***

## Requerimientos Funcionales

**RF-01 — Selección de flujo**
El usuario puede elegir entre los 3 flujos desde un selector visual con descripción de casos de uso (web app, SPA/mobile, M2M).

**RF-02 — Stepper interactivo**
Avance paso a paso (anterior/siguiente/auto-play) con animación de mensajes entre actores. Cada mensaje muestra el HTTP request/response completo.

**RF-03 — Inspector de parámetros**
Panel lateral que muestra cada parámetro del request/response con tooltip explicativo (qué es, para qué sirve, qué pasa si falta).

**RF-04 — Modo vulnerabilidades**
Toggle "Security Mode" que resalta en rojo los pasos riesgosos y despliega una alerta con: nombre del ataque, descripción, cómo explotarlo, cómo mitigarlo, referencia RFC.[^7][^5]

**RF-05 — Decodificador JWT inline**
Al llegar al paso de emisión de token, el usuario puede expandir y decodificar el JWT (header, payload, signature) directamente en el diagrama.

**RF-06 — Modo comparativo**
Vista lado a lado: Authorization Code sin PKCE vs. con PKCE, mostrando visualmente qué paso se protege.[^3][^2]

**RF-07 — Exportar diagrama**
Exportar el flujo actual como imagen PNG o como diagrama Mermaid copiable.

**RF-08 — Referencias normativas**
Cada vulnerabilidad y cada parámetro enlaza a la sección correspondiente del RFC (6749, 7636, 8252, 9700).[^7]

***

## Requerimientos No Funcionales

- **RNF-01 — Performance:** First Contentful Paint < 1.5s (app 100% estática, sin backend)
- **RNF-02 — Accesibilidad:** Cumplir WCAG 2.1 AA; navegación por teclado en el stepper
- **RNF-03 — Responsivo:** Funcional en desktop y tablet (≥768px); en mobile mostrar vista simplificada
- **RNF-04 — Offline:** Funciona sin conexión tras primera carga (PWA con Service Worker)
- **RNF-05 — Internacionalización:** Soporte i18n EN/ES desde v1.0
- **RNF-06 — Sin datos reales:** La app nunca realiza llamadas OAuth reales; todos los payloads son simulados y etiquetados como `[EXAMPLE]`

***

## Diseño de UI/UX

### Layout Principal

```
┌─────────────────────────────────────────────────────┐
│  [FlowSelector]  Auth Code │ PKCE │ Client Creds    │
│  ─────────────────────── [Security Mode 🔴 ON/OFF] │
├──────────────────────────────┬──────────────────────┤
│                              │                      │
│   FLOW CANVAS (70%)          │  STEP INSPECTOR      │
│   ┌──────┐    ┌──────┐       │  (30%)               │
│   │ User │───▶│Client│       │  ┌──────────────┐   │
│   └──────┘    └──────┘       │  │ Request:     │   │
│                  │           │  │ GET /auth?   │   │
│              ┌───▼────┐      │  │ client_id=.. │   │
│              │Auth Srv│      │  │ redirect_uri │   │
│              └───┬────┘      │  └──────────────┘   │
│                  │           │  ⚠️ Vulnerability:   │
│              ┌───▼────┐      │  Open Redirect Risk  │
│              │Res Srv │      │  [Ver mitigación]    │
│              └────────┘      │                      │
├──────────────────────────────┴──────────────────────┤
│  ◀ Prev  [Paso 3 de 9: Authorization Request]  Next ▶│
│  ▶ Auto-Play  [────────●──────────] Export          │
└─────────────────────────────────────────────────────┘
```


### Sistema de Colores de Riesgo

- **Verde** `#22c55e`: Paso sin vectores de ataque conocidos
- **Amarillo** `#f59e0b`: Riesgo presente pero mitigable con configuración
- **Rojo** `#ef4444`: Vulnerabilidad crítica si el paso no se implementa correctamente

***

## Roadmap de Desarrollo

**Fase 1 — MVP (4 semanas)**

- [ ] Scaffolding con Vite + React + TypeScript
- [ ] Flujo Authorization Code completo con stepper
- [ ] Inspector de parámetros básico
- [ ] Deploy en Vercel

**Fase 2 — Seguridad (3 semanas)**

- [ ] Flujo PKCE + modo comparativo
- [ ] Base de datos de vulnerabilidades con alertas
- [ ] Decodificador JWT inline

**Fase 3 — Polish (2 semanas)**

- [ ] Flujo Client Credentials
- [ ] Export PNG/Mermaid
- [ ] i18n EN/ES
- [ ] PWA + modo offline

***

## Datos de Ejemplo (Estructura)

```typescript
// flows/pkce/steps.ts
export const pkceSteps: FlowStep[] = [
  {
    id: "pkce-1",
    title: "Generate code_verifier",
    actor: { from: "client", to: "client" },
    request: {
      description: "Client generates a cryptographically random string",
      params: {
        code_verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk" // [EXAMPLE]
      }
    },
    vulnerabilities: [], // paso interno, no expuesto
    rfcRef: "RFC 7636 §4.1"
  },
  {
    id: "pkce-2",
    title: "Send code_challenge",
    actor: { from: "client", to: "authServer" },
    request: {
      method: "GET",
      endpoint: "/authorize",
      params: {
        response_type: "code",
        code_challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM", // [EXAMPLE]
        code_challenge_method: "S256"
      }
    },
    vulnerabilities: ["plain-code-challenge-method"], // si usan plain en vez de S256
    rfcRef: "RFC 7636 §4.3"
  }
  // ...
]
```


***

Este diseño te da una base sólida para comenzar el desarrollo de forma incremental. ¿Quieres que profundice en algún componente específico, como el schema completo de `vulnerabilities.json` o el diseño detallado del `FlowCanvas` con React Flow?
<span style="display:none">[^10][^11][^12][^13][^14][^15][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow

[^2]: https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce

[^3]: https://oauth.net/2/pkce/

[^4]: https://aws.amazon.com/blogs/security/how-to-use-oauth-2-0-in-amazon-cognito-learn-about-the-different-oauth-2-0-grants/

[^5]: https://www.oauth.com/oauth2-servers/authorization/security-considerations/

[^6]: https://portswigger.net/web-security/oauth

[^7]: https://datatracker.ietf.org/doc/rfc9700/

[^8]: https://curity.io/resources/learn/spa-best-practices/

[^9]: https://frontegg.com/guides/oidc-vs-oauth2

[^10]: https://fusionauth.io/blog/best-practices-for-oauth-in-mobile-apps

[^11]: https://www.spletzer.com/2025/11/oidc-oauth-spec-graph/

[^12]: https://www.descope.com/learn/post/pkce

[^13]: https://www.vaadata.com/en/blog/understanding-oauth-2-0-and-its-common-vulnerabilities/

[^14]: https://medium.com/@isinghprince/oauth-2-0-and-openid-connect-simplified-guide-uncovering-insights-and-emerging-trends-3b3baa1baafc

[^15]: https://curity.io/resources/learn/oauth-pkce/

