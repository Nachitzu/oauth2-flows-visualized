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
    <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
      {/* Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevStep}
          disabled={isFirst}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            isFirst
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
        >
          <span>◀</span>
          <span className="hidden sm:inline">Prev</span>
        </button>

        <button
          onClick={nextStep}
          disabled={isLast}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            isLast
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <span>▶</span>
        </button>

        <button
          onClick={toggleAutoPlay}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            autoPlay
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
        >
          <span>{autoPlay ? '⏸' : '▶'}</span>
          <span className="hidden sm:inline">Auto</span>
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 flex-1 justify-center">
        <span className="text-sm text-slate-400">
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <div className="hidden sm:flex items-center gap-1">
          {flow.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={clsx(
                'w-2 h-2 rounded-full transition-all',
                index === currentStepIndex
                  ? 'bg-blue-500 w-4'
                  : index < currentStepIndex
                  ? 'bg-slate-500 hover:bg-slate-400'
                  : 'bg-slate-700 hover:bg-slate-600'
              )}
              title={`Step ${index + 1}`}
            />
          ))}
        </div>
        <span className="hidden md:inline text-sm text-slate-300 font-medium">
          {currentStep.title}
        </span>
      </div>

      {/* Current step info */}
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs text-slate-500">
          {currentStep.actorFrom} → {currentStep.actorTo}
        </span>
      </div>
    </div>
  );
}