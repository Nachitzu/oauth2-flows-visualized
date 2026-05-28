import { useFlowStore, FLOWS } from '@/store/flowStore';
import { VulnerabilityAlert } from './VulnerabilityAlert';
import { TokenDecoder } from './TokenDecoder';
import clsx from 'clsx';

function ParamRow({ name, value, description, required, example }: {
  name: string;
  value: string;
  description: string;
  required?: boolean;
  example?: boolean;
}) {
  return (
    <div className="py-2 px-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        <code className="text-sm font-mono text-blue-400">{name}</code>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
            required
          </span>
        )}
        {example && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
            [EXAMPLE]
          </span>
        )}
      </div>
      <div className="font-mono text-xs text-slate-300 mb-1 break-all">
        {value}
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

export function StepInspector() {
  const { currentFlowId, currentStepIndex, securityMode } = useFlowStore();
  const flow = FLOWS[currentFlowId];
  const step = flow.steps[currentStepIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Step header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-500">
            Step {currentStepIndex + 1} of {flow.steps.length}
          </span>
          {step.rfcRef && (
            <a
              href={`https://datatracker.ietf.org/doc/${step.rfcRef.split(' ')[0].toLowerCase()}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 ml-auto"
            >
              {step.rfcRef}
            </a>
          )}
        </div>
        <h3 className="text-base font-semibold text-slate-100">{step.title}</h3>
        <p className="text-sm text-slate-400 mt-1">{step.description}</p>
      </div>

      {/* Request section */}
      {step.request && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {step.request.method}
            </span>
            <code className="text-sm font-mono text-slate-300">{step.request.endpoint}</code>
          </div>

          {step.request.params.length > 0 ? (
            <div className="flex flex-col gap-2">
              {step.request.params.map((param) => (
                <ParamRow
                  key={param.name}
                  name={param.name}
                  value={param.value}
                  description={param.description}
                  required={param.required}
                  example={param.example}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No parameters</p>
          )}
        </div>
      )}

      {/* Response section */}
      {step.response && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <span className={clsx(
              'text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded',
              step.response.status < 300 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            )}>
              {step.response.status} {step.response.statusText}
            </span>
          </div>

          {step.response.body && (
            <div className="bg-slate-900/50 rounded-lg border border-slate-700/50 p-3 overflow-auto max-h-40">
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">
                {JSON.stringify(step.response.body, null, 2)}
              </pre>
            </div>
          )}

          {step.request?.method === 'POST' && step.request.endpoint === '/token' && (
            <TokenDecoder token={step.response.body?.access_token as string | undefined} />
          )}
        </div>
      )}

      {/* Internal action */}
      {step.internalAction && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {step.internalAction.actor === 'client' ? '📱' :
               step.internalAction.actor === 'authServer' ? '🔐' :
               step.internalAction.actor === 'user' ? '👤' : '🖥️'}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Internal Action
            </span>
          </div>
          <p className="text-sm text-slate-300">{step.internalAction.description}</p>
        </div>
      )}

      {/* Security Note */}
      {securityMode && step.securityNote && (
        <div className="p-4 border-b border-slate-700 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Security Context
            </span>
          </div>
          <p className="text-sm text-slate-300">{step.securityNote}</p>
        </div>
      )}

      {/* Vulnerability alerts */}
      {securityMode && step.vulnerabilities.length > 0 && (
        <div className="p-4 flex-1 overflow-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔴</span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Vulnerabilities ({step.vulnerabilities.length})
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {step.vulnerabilities.map((vulnId) => (
              <VulnerabilityAlert key={vulnId} vulnerabilityId={vulnId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}