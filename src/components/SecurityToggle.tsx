import { useFlowStore } from '@/store/flowStore';
import clsx from 'clsx';

export function SecurityToggle() {
  const { securityMode, toggleSecurityMode } = useFlowStore();

  return (
    <button
      onClick={toggleSecurityMode}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
        securityMode
          ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
      )}
      title="Toggle security vulnerability highlighting"
    >
      <span className="text-lg">{securityMode ? '🔴' : '🟢'}</span>
      <span className="hidden sm:inline">
        Security Mode {securityMode ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}