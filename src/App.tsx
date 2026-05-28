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
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="text-xl">🔐</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">OAuth2 Flows Visualized</h1>
              <p className="text-xs text-slate-500">Interactive security learning tool</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <FlowSelector />
            <SecurityToggle />
            <CompareMode />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={clsx(
        'flex-1 max-w-[1800px] mx-auto w-full p-6 flex flex-col gap-6',
        compareMode ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : 'flex'
      )}>
        {compareMode ? (
          <>
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-sm font-semibold text-slate-700">Authorization Code (No PKCE)</span>
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Less Secure</span>
              </div>
              <div className="flex-1 h-[520px] bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
                <FlowCanvas flowId="authorization-code" />
              </div>
            </div>
            <div className="flex flex-col gap-4 min-h-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-slate-700">PKCE (Protected)</span>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">Recommended</span>
              </div>
              <div className="flex-1 h-[520px] bg-white rounded-2xl border border-emerald-200 shadow-sm shadow-emerald-200/50 overflow-hidden">
                <FlowCanvas flowId="pkce" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-h-0 h-[520px] bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
              <FlowCanvas />
            </div>
            <div className="w-full xl:w-[440px] xl:min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 overflow-hidden">
              <StepInspector />
            </div>
          </>
        )}
      </main>

      {/* Footer stepper */}
      {!compareMode && (
        <footer className="border-t border-slate-200 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.05)] sticky bottom-0 z-50">
          <StepControls />
        </footer>
      )}
    </div>
  );
}

export default App;