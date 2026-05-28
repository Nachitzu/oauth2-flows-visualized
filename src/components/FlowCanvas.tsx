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
      <span className="text-3xl">{data.icon}</span>
      <span className="text-xs font-medium text-slate-200">{data.label}</span>
      {data.isHighlighted && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: SEVERITY_COLORS[data.severity] }}
        >
          {data.severity}
        </span>
      )}
    </div>
  );
}

const nodeTypes = {
  actor: ActorNode,
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
    return actors.map((actorId, index) => {
      const actor = ACTORS[actorId];
      const isHighlighted = involvedActors.has(actorId);

      return {
        id: actorId,
        type: 'actor',
        position: { x: index * 200 + 50, y: 100 },
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
  }, [actors, involvedActors, stepSeverity]);

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
    <div className="w-full h-full min-h-[300px]">
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