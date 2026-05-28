import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowStore, FLOWS } from '@/store/flowStore';
import { FlowId, ActorId, ACTORS, Severity } from '@/domain/types';
import { vulnerabilities } from '@/data/vulnerabilities';
import clsx from 'clsx';

const SEVERITY_COLORS: Record<Severity, string> = {
  safe: '#22c55e',
  risk: '#f59e0b',
  critical: '#ef4444',
};

interface ActorNodeData {
  actor: ActorId;
  label: string;
  icon: string;
  color: string;
  isHighlighted: boolean;
  severity: Severity;
}

interface LoginNodeData {
  title: string;
  subtitle: string;
}

function ActorNode({ data }: { data: ActorNodeData }) {
  const borderColor = data.isHighlighted
    ? SEVERITY_COLORS[data.severity]
    : data.color;

  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[100px]',
        data.isHighlighted
          ? 'bg-slate-800 shadow-lg shadow-slate-900/50 scale-105'
          : 'bg-slate-800/80'
      )}
      style={{
        borderColor,
        boxShadow: data.isHighlighted ? `0 0 20px ${SEVERITY_COLORS[data.severity]}40` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#64748b', width: 8, height: 8, border: 'none' }} />
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <span className="text-xs font-medium text-slate-200">{data.label}</span>
      </div>
      {data.isHighlighted && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider mt-1"
          style={{ color: SEVERITY_COLORS[data.severity] }}
        >
          {data.severity}
        </span>
      )}
      <Handle type="source" position={Position.Right} style={{ background: '#64748b', width: 8, height: 8, border: 'none' }} />
    </div>
  );
}

function LoginNode({ data }: { data: LoginNodeData }) {
  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 w-[220px] shadow-lg">
      <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">{data.subtitle}</div>
      <div className="text-sm font-semibold text-slate-100 mb-3">{data.title}</div>
      <div className="flex flex-col gap-2">
        <div className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-400">
          email
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-400">
          password
        </div>
        <div className="bg-blue-600/80 text-white text-xs font-medium text-center rounded-md py-1.5">
          Sign in
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  actor: ActorNode,
  login: LoginNode,
};

interface FlowCanvasProps {
  flowId?: FlowId;
}

export function FlowCanvas({ flowId }: FlowCanvasProps) {
  const { currentFlowId, currentStepIndex, securityMode } = useFlowStore();
  const activeFlowId = flowId || currentFlowId;
  const flow = FLOWS[activeFlowId];
  const currentStep = flow.steps[currentStepIndex];

  // Determine which actors are involved in the current step
  const involvedActors = useMemo(() => {
    if (!currentStep) return new Set<ActorId>();
    const actors = new Set<ActorId>([currentStep.actorFrom, currentStep.actorTo]);
    if (currentStep.internalAction) {
      actors.add(currentStep.internalAction.actor);
    }
    return actors;
  }, [currentStep]);

  // Determine severity of current step
  const stepSeverity = useMemo((): Severity => {
    if (!securityMode || !currentStep) return 'safe';
    if (currentStep.vulnerabilities.length === 0) return 'safe';

    // Check if any vulnerability is critical
    const hasCritical = currentStep.vulnerabilities.some(
      (vulnId) => vulnerabilities[vulnId]?.severity === 'critical'
    );
    if (hasCritical) return 'critical';

    const hasRisk = currentStep.vulnerabilities.some(
      (vulnId) => vulnerabilities[vulnId]?.severity === 'risk'
    );
    if (hasRisk) return 'risk';

    return 'safe';
  }, [currentStep, securityMode]);

  // Create nodes for actors - horizontal layout
  const actors: ActorId[] = useMemo(() => {
    if (activeFlowId === 'client-credentials') {
      return ['client', 'authServer', 'resourceServer'];
    }

    return ['user', 'client', 'authServer', 'resourceServer'];
  }, [activeFlowId]);

  const memoNodes: Node[] = useMemo(() => {
    const baseNodes = actors.map((actorId, index) => {
      const actor = ACTORS[actorId];
      const isHighlighted = involvedActors.has(actorId);

      return {
        id: actorId,
        type: 'actor',
        position: { x: index * 280 + 80, y: 120 },
        data: {
          actor: actorId,
          label: actor.name,
          icon: actor.icon,
          color: actor.color,
          isHighlighted,
          severity: stepSeverity,
        } as ActorNodeData,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    const isLoginStep = currentStep?.id === 'authcode-3' || currentStep?.id === 'pkce-5';
    if (!isLoginStep) {
      return baseNodes;
    }

    const loginNode: Node = {
      id: `login-${currentStep?.id ?? 'auth'}`,
      type: 'login',
      position: { x: 420, y: 220 },
      data: {
        title: 'Authorization Server Login',
        subtitle: 'Login Screen',
      } as LoginNodeData,
      draggable: false,
      selectable: false,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    return [...baseNodes, loginNode];
  }, [actors, involvedActors, stepSeverity, currentStep]);

  // Create edges for the current step
  const memoEdges: Edge[] = useMemo(() => {
    return [
      {
        id: `${currentStep?.actorFrom}-${currentStep?.actorTo}`,
        source: currentStep?.actorFrom || 'user',
        target: currentStep?.actorTo || 'client',
        animated: true,
        style: {
          stroke: stepSeverity === 'critical' ? SEVERITY_COLORS.critical
            : stepSeverity === 'risk' ? SEVERITY_COLORS.risk
            : '#3b82f6',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stepSeverity === 'critical' ? SEVERITY_COLORS.critical
            : stepSeverity === 'risk' ? SEVERITY_COLORS.risk
            : '#3b82f6',
        },
        label: currentStep?.title,
        labelStyle: {
          fill: '#94a3b8',
          fontWeight: 500,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: '#1e293b',
          fillOpacity: 0.9,
        },
      },
    ];
  }, [currentStep, stepSeverity]);

  const [nodes, setNodes, onNodesChange] = useNodesState(memoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(memoEdges);

  // Sync React Flow state when step/flow changes
  useEffect(() => {
    setNodes(memoNodes);
  }, [memoNodes, setNodes]);

  useEffect(() => {
    setEdges(memoEdges);
  }, [memoEdges, setEdges]);

  return (
    <div style={{ width: '100%', height: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls
          className="bg-slate-800 border border-slate-700 rounded-lg"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}