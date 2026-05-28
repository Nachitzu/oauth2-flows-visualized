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
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2',
        compareMode
          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
          : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
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