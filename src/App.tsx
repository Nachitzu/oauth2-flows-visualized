import { useEffect } from 'react';
import { FlowSelector } from '@/components/FlowSelector';
import { FlowCanvas } from '@/components/FlowCanvas';
import { StepInspector } from '@/components/StepInspector';
import { StepControls } from '@/components/StepControls';
import { SecurityToggle } from '@/components/SecurityToggle';
import { CompareMode } from '@/components/CompareMode';
import { useFlowStore } from '@/store/flowStore';
import clsx from 'clsx';

function App() {
  const { compareMode } = useFlowStore();

  useEffect(() => {
    // Apply dark mode class on mount
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <h1 className="text-lg font-bold text-white">OAuth2 Flows Visualized</h1>
              <p className="text-xs text-slate-400">Interactive security learning tool</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <FlowSelector />
            <SecurityToggle />
            <CompareMode />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={clsx(
        'flex-1 max-w-[1800px] mx-auto w-full p-4 flex flex-col gap-4',
        compareMode ? 'grid grid-cols-1 xl:grid-cols-2 gap-4' : 'flex'
      )}>
        {compareMode ? (
          <>
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Authorization Code (No PKCE)</span>
              </div>
              <div className="flex-1 min-h-0 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <FlowCanvas flowId="authorization-code" />
              </div>
            </div>
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-400">PKCE (Protected)</span>
              </div>
              <div className="flex-1 min-h-0 bg-slate-800 rounded-lg border border-emerald-900/50 overflow-hidden">
                <FlowCanvas flowId="pkce" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <FlowCanvas />
            </div>
            <div className="w-full xl:w-[420px] xl:min-h-0 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <StepInspector />
            </div>
          </>
        )}
      </main>

      {/* Footer stepper */}
      {!compareMode && (
        <footer className="border-t border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky bottom-0 z-50">
          <StepControls />
        </footer>
      )}
    </div>
  );
}

export default App;