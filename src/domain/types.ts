// Domain types for OAuth2 Flow Visualization

export type ActorId = 'user' | 'browser' | 'client' | 'authServer' | 'resourceServer';

export interface Actor {
  id: ActorId;
  name: string;
  icon: string; // emoji or path to icon
  color: string;
}

export const ACTORS: Record<ActorId, Actor> = {
  user: {
    id: 'user',
    name: 'User',
    icon: '👤',
    color: '#8b5cf6',
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    icon: '🌐',
    color: '#6366f1',
  },
  client: {
    id: 'client',
    name: 'Client App',
    icon: '📱',
    color: '#3b82f6',
  },
  authServer: {
    id: 'authServer',
    name: 'Auth Server',
    icon: '🔐',
    color: '#10b981',
  },
  resourceServer: {
    id: 'resourceServer',
    name: 'Resource Server',
    icon: '🖥️',
    color: '#f59e0b',
  },
};

export type Severity = 'safe' | 'risk' | 'critical';

export interface Vulnerability {
  id: string;
  cweId: string;
  severity: Severity;
  title: string;
  description: string;
  proofOfConcept: string;
  mitigation: string;
  rfcRef: string;
  references: string[];
}

export interface HttpParam {
  name: string;
  value: string;
  description: string;
  required?: boolean;
  example?: boolean;
}

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  params: HttpParam[];
  headers?: Record<string, string>;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  description: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface FlowStep {
  id: string;
  title: string;
  description: string;
  actorFrom: ActorId;
  actorTo: ActorId;
  request?: HttpRequest;
  response?: HttpResponse;
  internalAction?: {
    description: string;
    actor: ActorId;
  };
  vulnerabilities: string[]; // vulnerability IDs
  rfcRef?: string;
  securityNote?: string; // extra context for security mode
}

export type FlowId = 'authorization-code' | 'pkce' | 'client-credentials';

export interface FlowDefinition {
  id: FlowId;
  title: string;
  subtitle: string;
  description: string;
  useCase: string;
  steps: FlowStep[];
}