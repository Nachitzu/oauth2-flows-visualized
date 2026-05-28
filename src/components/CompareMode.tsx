import { useFlowStore } from '@/store/flowStore';
import clsx from 'clsx';

export function CompareMode() {
  const { compareMode, toggleCompareMode, currentFlowId } = useFlowStore();

  // Only show compare option when on authorization-code flow
  const canCompare = currentFlowId === 'authorization-code';

  if (!canCompare) return null;

  return (
    <button
      onClick={toggleCompareMode}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
        compareMode
          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30'
          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
      )}
      title="Compare Auth Code vs PKCE side by side"
    >
      <span className="text-lg">{compareMode ? '⊞' : '⊟'}</span>
      <span className="hidden sm:inline">
        {compareMode ? 'Exit Compare' : 'Compare'}
      </span>
    </button>
  );
}