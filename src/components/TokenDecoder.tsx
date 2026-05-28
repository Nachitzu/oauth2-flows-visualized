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
      // Replace URL-safe characters
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // Pad with = if necessary
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
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
      >
        <span>{expanded ? '▼' : '▶'}</span>
        <span>🔓 Decode JWT Token</span>
      </button>

      {expanded && (
        <div className="mt-2 rounded-lg bg-slate-900/80 border border-slate-700/50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Header
              </span>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-auto">
              {decoded
                ? JSON.stringify(decoded.header, null, 2)
                : '// Unable to decode'}
            </pre>
          </div>

          {/* Payload */}
          <div className="p-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Payload
              </span>
              {typeof decoded?.payload?.exp === 'number' && (
                <span className="text-xs text-slate-500">
                  (expires: {new Date((decoded.payload.exp as number) * 1000).toLocaleString()})
                </span>
              )}
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-auto max-h-40">
              {decoded
                ? JSON.stringify(decoded.payload, null, 2)
                : '// Unable to decode'}
            </pre>
          </div>

          {/* Signature */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Signature
              </span>
              <span className="text-xs text-slate-500 italic">[EXAMPLE] — not verifiable without server key</span>
            </div>
            <p className="text-xs font-mono text-slate-400 break-all">
              {decoded?.signature || '// Unable to decode'}
            </p>
          </div>

          {/* Notice */}
          <div className="px-3 pb-3">
            <p className="text-xs text-amber-400/80 italic">
              ⚠️ This is a simulated token for educational purposes only.
              Never decode or inspect real tokens in untrusted environments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}