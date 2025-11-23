// Utility function for parsing environment variable text
// This is a pure function that can be used in both server and client components

export function parseEnvText(text: string): { key: string; value: string }[] {
  // returns array of { key, value }
  const lines = text.split(/\r?\n/);
  const out: { key: string; value: string }[] = [];

  for (let raw of lines) {
    let line = raw.trim();
    if (!line) continue;
    // skip shell comments
    if (line.startsWith('#')) continue;

    // handle "export KEY=VALUE" -> drop "export "
    if (/^export\s+/i.test(line)) line = line.replace(/^export\s+/i, '').trim();

    // try key=value first (split on the first '=')
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();

      // strip surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key) out.push({ key, value });
      continue;
    }

    // try key: value (YAML-ish)
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (key) out.push({ key, value });
      continue;
    }

    // fallback: whitespace-separated (KEY VALUE) -> only if there are two tokens
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      const key = parts.shift()!;
      const value = parts.join(' ');
      out.push({ key, value });
      continue;
    }

    // if single token, treat as key with empty value
    out.push({ key: line, value: '' });
  }

  return out;
}

