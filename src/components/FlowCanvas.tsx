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
  safe: '#10b981',
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
        'flex flex-col items-center gap-1 px-5 py-4 rounded-2xl border-2 transition-all duration-300 min-w-[120px]',
        data.isHighlighted
          ? 'bg-white shadow-lg shadow-slate-200/80 scale-105'
          : 'bg-white shadow-sm shadow-slate-200/60'
      )}
      style={{
        borderColor,
        boxShadow: data.isHighlighted
          ? `0 8px 30px ${SEVERITY_COLORS[data.severity]}25`
          : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#94a3b8', width: 10, height: 10, border: 'none', borderRadius: '50%' }}
      />
      <div className="flex items-center gap-2.5 mb-1">
        <span className="text-2xl">{data.icon}</span>
        <span className="text-sm font-semibold text-slate-700">{data.label}</span>
      </div>
      {data.isHighlighted && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider mt-1"
          style={{ color: SEVERITY_COLORS[data.severity] }}
        >
          {data.severity}
        </span>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#94a3b8', width: 10, height: 10, border: 'none', borderRadius: '50%' }}
      />
    </div>
  );
}

function LoginNode({ data }: { data: LoginNodeData }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 w-[240px] shadow-md shadow-slate-200/50">
      <div className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-medium">{data.subtitle}</div>
      <div className="text-sm font-bold text-slate-800 mb-3">{data.title}</div>
      <div className="flex flex-col gap-2">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono">
          email
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono">
          password
        </div>
        <div className="bg-indigo-600 text-white text-xs font-semibold text-center rounded-lg py-2.5 shadow-md shadow-indigo-500/30">
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

  const involvedActors = useMemo(() => {
    if (!currentStep) return new Set<ActorId>();
    const actors = new Set<ActorId>([currentStep.actorFrom, currentStep.actorTo]);
    if (currentStep.internalAction) {
      actors.add(currentStep.internalAction.actor);
    }
    return actors;
  }, [currentStep]);

  const stepSeverity = useMemo((): Severity => {
    if (!securityMode || !currentStep) return 'safe';
    if (currentStep.vulnerabilities.length === 0) return 'safe';

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
        position: { x: index * 280 + 80, y: 140 },
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
      position: { x: 420, y: 260 },
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
            : '#6366f1',
          strokeWidth: 2.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: stepSeverity === 'critical' ? SEVERITY_COLORS.critical
            : stepSeverity === 'risk' ? SEVERITY_COLORS.risk
            : '#6366f1',
        },
        label: currentStep?.title,
        labelStyle: {
          fill: '#475569',
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: '#f8fafc',
          fillOpacity: 0.95,
        },
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 6,
      },
    ];
  }, [currentStep, stepSeverity]);

  const [nodes, setNodes, onNodesChange] = useNodesState(memoNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(memoEdges);

  useEffect(() => {
    setNodes(memoNodes);
  }, [memoNodes, setNodes]);

  useEffect(() => {
    setEdges(memoEdges);
  }, [memoEdges, setEdges]);

  return (
    <div style={{ width: '100%', height: 520 }}>
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
        <Background color="#e2e8f0" gap={24} size={1.5} />
        <Controls
          className="bg-white border border-slate-200 rounded-xl shadow-lg [&>button]:bg-white [&>button]:border-slate-200 [&>button]:text-slate-600 [&>button:hover]:bg-slate-50"
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}