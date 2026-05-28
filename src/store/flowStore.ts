import { create } from 'zustand';
import { FlowId, FlowStep } from '@/domain/types';
import { authorizationCodeSteps } from '@/flows/authorization-code/steps';
import { pkceSteps } from '@/flows/pkce/steps';
import { clientCredentialsSteps } from '@/flows/client-credentials/steps';

export const FLOWS: Record<FlowId, { title: string; subtitle: string; description: string; useCase: string; steps: FlowStep[] }> = {
  'authorization-code': {
    title: 'Authorization Code',
    subtitle: 'Web App Flow',
    description: 'Standard OAuth2 flow for server-side applications. Uses an intermediate authorization code instead of passing tokens through the browser.',
    useCase: 'Traditional web applications with a backend server that can securely store secrets.',
    steps: authorizationCodeSteps,
  },
  'pkce': {
    title: 'PKCE',
    subtitle: 'Enhanced Authorization Code',
    description: 'Authorization Code flow with Proof Key for Code Exchange (RFC 7636). Adds cryptographic verifier to protect public clients against code interception.',
    useCase: 'Single-page apps (SPAs), mobile apps, and any application where client secrets cannot be safely stored.',
    steps: pkceSteps,
  },
  'client-credentials': {
    title: 'Client Credentials',
    subtitle: 'Machine-to-Machine',
    description: 'Machine-to-machine flow where the client application authenticates directly with the authorization server using its own credentials (no user involvement).',
    useCase: 'Backend services, microservices, or any M2M communication where the client is also the resource owner.',
    steps: clientCredentialsSteps,
  },
};

interface FlowState {
  // Current selection
  currentFlowId: FlowId;
  currentStepIndex: number;
  securityMode: boolean;
  compareMode: boolean;
  compareFlowId: FlowId | null;
  autoPlay: boolean;
  autoPlaySpeed: number; // ms per step

  // Actions
  setFlow: (flowId: FlowId) => void;
  setStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleSecurityMode: () => void;
  toggleCompareMode: () => void;
  setCompareFlow: (flowId: FlowId | null) => void;
  toggleAutoPlay: () => void;
  setAutoPlaySpeed: (speed: number) => void;

  // Computed helpers
  getCurrentStep: () => FlowStep;
  getCurrentFlow: () => typeof FLOWS['authorization-code'];
  getCompareFlow: () => typeof FLOWS['authorization-code'] | null;
  getTotalSteps: () => number;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  currentFlowId: 'authorization-code',
  currentStepIndex: 0,
  securityMode: false,
  compareMode: false,
  compareFlowId: null,
  autoPlay: false,
  autoPlaySpeed: 2000,

  setFlow: (flowId) => set({ currentFlowId: flowId, currentStepIndex: 0, compareFlowId: null, compareMode: false }),

  setStep: (index) => {
    const { currentFlowId } = get();
    const maxIndex = FLOWS[currentFlowId].steps.length - 1;
    set({ currentStepIndex: Math.max(0, Math.min(index, maxIndex)) });
  },

  nextStep: () => {
    const { currentFlowId, currentStepIndex } = get();
    const maxIndex = FLOWS[currentFlowId].steps.length - 1;
    if (currentStepIndex < maxIndex) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  toggleSecurityMode: () => set((state) => ({ securityMode: !state.securityMode })),

  toggleCompareMode: () => set((state) => ({
    compareMode: !state.compareMode,
    compareFlowId: !state.compareMode && !state.compareFlowId ? 'pkce' : state.compareFlowId,
  })),

  setCompareFlow: (flowId) => set({ compareFlowId: flowId }),

  toggleAutoPlay: () => set((state) => ({ autoPlay: !state.autoPlay })),

  setAutoPlaySpeed: (speed) => set({ autoPlaySpeed: speed }),

  getCurrentStep: () => {
    const { currentFlowId, currentStepIndex } = get();
    return FLOWS[currentFlowId].steps[currentStepIndex];
  },

  getCurrentFlow: () => FLOWS[get().currentFlowId],

  getCompareFlow: () => {
    const { compareFlowId } = get();
    return compareFlowId ? FLOWS[compareFlowId] : null;
  },

  getTotalSteps: () => {
    const { currentFlowId } = get();
    return FLOWS[currentFlowId].steps.length;
  },
}));