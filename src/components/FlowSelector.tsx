import { useFlowStore, FLOWS } from '@/store/flowStore';
import clsx from 'clsx';
import { FlowId } from '@/domain/types';

const FLOW_ICONS: Record<FlowId, string> = {
  'authorization-code': '🔑',
  'pkce': '🛡️',
  'client-credentials': '🤖',
};

const FLOW_COLORS: Record<FlowId, { active: string; inactive: string }> = {
  'authorization-code': {
    active: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30',
    inactive: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  },
  'pkce': {
    active: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
    inactive: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  },
  'client-credentials': {
    active: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
    inactive: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  },
};

export function FlowSelector() {
  const { currentFlowId, setFlow } = useFlowStore();
  const flows = Object.keys(FLOWS) as FlowId[];

  return (
    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      {flows.map((flowId) => {
        const flow = FLOWS[flowId];
        const isActive = currentFlowId === flowId;
        const colors = FLOW_COLORS[flowId];

        return (
          <button
            key={flowId}
            onClick={() => setFlow(flowId)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? colors.active
                : colors.inactive
            )}
            title={flow.description}
          >
            <span>{FLOW_ICONS[flowId]}</span>
            <span className="hidden sm:inline font-medium">{flow.title}</span>
          </button>
        );
      })}
    </div>
  );
}