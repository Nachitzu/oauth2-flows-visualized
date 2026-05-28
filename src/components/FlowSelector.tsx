import { useFlowStore, FLOWS } from '@/store/flowStore';
import clsx from 'clsx';
import { FlowId } from '@/domain/types';

const FLOW_ICONS: Record<FlowId, string> = {
  'authorization-code': '🔑',
  'pkce': '🛡️',
  'client-credentials': '🤖',
};

export function FlowSelector() {
  const { currentFlowId, setFlow } = useFlowStore();
  const flows = Object.keys(FLOWS) as FlowId[];

  return (
    <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
      {flows.map((flowId) => {
        const flow = FLOWS[flowId];
        const isActive = currentFlowId === flowId;

        return (
          <button
            key={flowId}
            onClick={() => setFlow(flowId)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            )}
            title={flow.description}
          >
            <span>{FLOW_ICONS[flowId]}</span>
            <span className="hidden sm:inline">{flow.title}</span>
          </button>
        );
      })}
    </div>
  );
}