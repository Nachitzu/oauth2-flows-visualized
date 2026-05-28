import { FlowStep } from '@/domain/types';

export const clientCredentialsSteps: FlowStep[] = [
  {
    id: 'cc-1',
    title: 'Client Sends Token Request',
    description: 'The client application (typically a backend service or daemon) sends its credentials directly to the authorization server\'s token endpoint. No user involvement.',
    actorFrom: 'client',
    actorTo: 'authServer',
    request: {
      method: 'POST',
      endpoint: '/token',
      description: 'Client credentials token request',
      params: [
        { name: 'grant_type', value: 'client_credentials', description: 'Specifies the OAuth2 grant type for client credentials flow', required: true, example: true },
        { name: 'client_id', value: 'backend-service-001', description: 'Unique identifier for the client application', required: true, example: true },
        { name: 'client_secret', value: 'c16f3b7d8e4a2f9b1c5e6d3a8f7g0h2i', description: 'Secret key known only to the client and the authorization server', required: true, example: true },
        { name: 'scope', value: 'read:data write:data', description: 'Requested scopes for the access token', required: false, example: true },
      ],
    },
    vulnerabilities: ['client-secret-exposure', 'dns-spoofing'],
    rfcRef: 'RFC 6749 §4.4',
    securityNote: 'client_secret MUST be kept confidential. Never embed it in frontend code. For M2M, it should be stored in environment variables or a secrets manager.',
  },
  {
    id: 'cc-2',
    title: 'Auth Server Validates Credentials',
    description: 'The authorization server validates the client_id and client_secret against its registered clients database.',
    actorFrom: 'authServer',
    actorTo: 'authServer',
    internalAction: {
      description: 'Auth server verifies client credentials in database',
      actor: 'authServer',
    },
    vulnerabilities: [],
    rfcRef: 'RFC 6749 §4.4.2',
  },
  {
    id: 'cc-3',
    title: 'Access Token Issued',
    description: 'The authorization server issues an access token scoped to the client\'s permissions. No refresh token is issued in client credentials flow (RFC 6749 §4.4.3).',
    actorFrom: 'authServer',
    actorTo: 'client',
    response: {
      status: 200,
      statusText: 'OK',
      description: 'Token response',
      body: {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dGguc2VydmVyLmNvbSIsImF1ZCI6WyJodHRwczovL3Jlc291cmNlLnNlcnZlci5jb20iXSwiZXhwIjoxNjA5MjQwMDAwLCJzdWIiOiJiYWNrZW5kLXNlcnZpY2UtMDAxIiwic2NvcGUiOiJyZWFkOmRhdGEgd3JpdGU6ZGF0YSJ9.SignatureHere',
        token_type: 'Bearer',
        expires_in: '3600',
      },
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    },
    vulnerabilities: ['token-not-rotated'],
    rfcRef: 'RFC 6749 §5.1',
    securityNote: 'Client credentials flow does not issue refresh tokens. The client must request a new access token when the current one expires.',
  },
  {
    id: 'cc-4',
    title: 'Call Resource Server',
    description: 'The client uses the access token to authenticate its requests to the resource server.',
    actorFrom: 'client',
    actorTo: 'resourceServer',
    request: {
      method: 'GET',
      endpoint: '/api/backend/data',
      description: 'M2M API request with Bearer token',
      params: [],
      headers: {
        Authorization: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
    vulnerabilities: ['token-in-query-string', 'token-leakage-via-referrer'],
    rfcRef: 'RFC 6749 §2.3',
    securityNote: 'Always use Authorization header for Bearer tokens, never query parameters.',
  },
  {
    id: 'cc-5',
    title: 'Protected Resource Response',
    description: 'The resource server validates the access token and returns the requested data.',
    actorFrom: 'resourceServer',
    actorTo: 'client',
    response: {
      status: 200,
      statusText: 'OK',
      description: 'Protected backend data',
      body: {
        status: 'operational',
        data: ['item1', 'item2', 'item3'],
        timestamp: '2024-01-15T10:30:00Z',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
    vulnerabilities: [],
    rfcRef: 'RFC 6749 §2.3',
  },
];