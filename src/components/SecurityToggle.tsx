import { useFlowStore } from '@/store/flowStore';
import clsx from 'clsx';

export function SecurityToggle() {
  const { securityMode, toggleSecurityMode } = useFlowStore();

  return (
    <button
      onClick={toggleSecurityMode}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2',
        securityMode
          ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
      )}
      title="Toggle security vulnerability highlighting"
    >
      <span className="text-lg">{securityMode ? '🔴' : '🟢'}</span>
      <span className="hidden sm:inline">
        Security {securityMode ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}