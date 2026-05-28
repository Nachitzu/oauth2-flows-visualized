import { useState } from 'react';

interface TokenDecoderProps {
  token: string | undefined;
}

interface DecodedPart {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJwtParts(token: string): DecodedPart | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decodeBase64Url = (str: string): string => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const padding = base64.length % 4;
      if (padding) {
        base64 += '='.repeat(4 - padding);
      }
      return atob(base64);
    };

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
}

export function TokenDecoder({ token }: TokenDecoderProps) {
  const [expanded, setExpanded] = useState(false);

  if (!token) return null;

  const decoded = decodeJwtParts(token);

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500 transition-colors"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>🔓 Decode JWT Token</span>
      </button>

      {expanded && (
        <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Header
              </span>
            </div>
            <pre className="text-xs font-mono text-slate-700 overflow-auto">
              {decoded
                ? JSON.stringify(decoded.header, null, 2)
                : '// Unable to decode'}
            </pre>
          </div>

          {/* Payload */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Payload
              </span>
              {typeof decoded?.payload?.exp === 'number' && (
                <span className="text-xs text-slate-400">
                  (expires: {new Date((decoded.payload.exp as number) * 1000).toLocaleString()})
                </span>
              )}
            </div>
            <pre className="text-xs font-mono text-slate-700 overflow-auto max-h-40">
              {decoded
                ? JSON.stringify(decoded.payload, null, 2)
                : '// Unable to decode'}
            </pre>
          </div>

          {/* Signature */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
                Signature
              </span>
              <span className="text-xs text-slate-400 italic">[EXAMPLE] — not verifiable without server key</span>
            </div>
            <p className="text-xs font-mono text-slate-500 break-all">
              {decoded?.signature || '// Unable to decode'}
            </p>
          </div>

          {/* Notice */}
          <div className="px-4 pb-4">
            <p className="text-xs text-amber-600/80 italic">
              ⚠️ This is a simulated token for educational purposes only.
              Never decode or inspect real tokens in untrusted environments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}