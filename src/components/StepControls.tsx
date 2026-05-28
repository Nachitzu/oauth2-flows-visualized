import { useFlowStore, FLOWS } from '@/store/flowStore';
import clsx from 'clsx';

export function StepControls() {
  const { currentFlowId, currentStepIndex, nextStep, prevStep, setStep, autoPlay, toggleAutoPlay } = useFlowStore();
  const flow = FLOWS[currentFlowId];
  const totalSteps = flow.steps.length;
  const currentStep = flow.steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevStep}
          disabled={isFirst}
          className={clsx(
            'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
            isFirst
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
          )}
        >
          <span>←</span>
          <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          onClick={nextStep}
          disabled={isLast}
          className={clsx(
            'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
            isLast
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/30'
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <span>→</span>
        </button>

        <button
          onClick={toggleAutoPlay}
          className={clsx(
            'flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
            autoPlay
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm'
          )}
        >
          <span>{autoPlay ? '⏸' : '▶'}</span>
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        <span className="text-sm text-slate-500 font-medium">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <div className="hidden sm:flex items-center gap-1.5">
          {flow.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={clsx(
                'h-2 rounded-full transition-all duration-300',
                index === currentStepIndex
                  ? 'bg-indigo-600 w-6'
                  : index < currentStepIndex
                  ? 'bg-slate-400 hover:bg-slate-500 w-2'
                  : 'bg-slate-200 hover:bg-slate-300 w-2'
              )}
              title={`Step ${index + 1}`}
            />
          ))}
        </div>
        <span className="hidden md:inline text-sm text-slate-700 font-semibold">
          {currentStep.title}
        </span>
      </div>

      {/* Current step info */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
        <span className="text-xs text-slate-500 font-mono">
          {currentStep.actorFrom} → {currentStep.actorTo}
        </span>
      </div>
    </div>
  );
}