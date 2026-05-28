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
    <div className="py-3 px-4 rounded-xl bg-slate-50 border border-slate-200">
      <div className="flex items-center gap-2 mb-2">
        <code className="text-sm font-mono text-indigo-600 font-semibold">{name}</code>
        {required && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
            required
          </span>
        )}
        {example && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            [EXAMPLE]
          </span>
        )}
      </div>
      <div className="font-mono text-xs text-slate-700 mb-2 break-all bg-white px-2 py-1.5 rounded border border-slate-100">
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
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-400">
            Step {currentStepIndex + 1} of {flow.steps.length}
          </span>
          {step.rfcRef && (
            <a
              href={`https://datatracker.ietf.org/doc/${step.rfcRef.split(' ')[0].toLowerCase()}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:text-indigo-500 ml-auto font-medium"
            >
              {step.rfcRef}
            </a>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{step.description}</p>
      </div>

      {/* Request section */}
      {step.request && (
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <span className={clsx(
              'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg',
              step.request.method === 'GET' ? 'bg-emerald-100 text-emerald-700' :
              step.request.method === 'POST' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-700'
            )}>
              {step.request.method}
            </span>
            <code className="text-sm font-mono text-slate-700">{step.request.endpoint}</code>
          </div>

          {step.request.params.length > 0 ? (
            <div className="flex flex-col gap-3">
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
            <p className="text-sm text-slate-400 italic">No parameters</p>
          )}
        </div>
      )}

      {/* Response section */}
      {step.response && (
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className={clsx(
              'text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg',
              step.response.status < 300 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            )}>
              {step.response.status} {step.response.statusText}
            </span>
          </div>

          {step.response.body && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 overflow-auto max-h-44">
              <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap break-all">
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
        <div className="p-5 border-b border-slate-200">
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
          <p className="text-sm text-slate-600 leading-relaxed">{step.internalAction.description}</p>
        </div>
      )}

      {/* Security Note */}
      {securityMode && step.securityNote && (
        <div className="p-5 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Security Context
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{step.securityNote}</p>
        </div>
      )}

      {/* Vulnerability alerts */}
      {securityMode && step.vulnerabilities.length > 0 && (
        <div className="p-5 flex-1 overflow-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔴</span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Vulnerabilities ({step.vulnerabilities.length})
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {step.vulnerabilities.map((vulnId) => (
              <VulnerabilityAlert key={vulnId} vulnerabilityId={vulnId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}