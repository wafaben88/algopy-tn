"use client";

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  loadPackage?: (names: string | string[]) => Promise<void>;
}

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
    __pyodide?: PyodideInterface;
    __pyodideLoading?: Promise<PyodideInterface>;
  }
}

const PYODIDE_VERSION = "0.26.2";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let stdoutBuffer: string[] = [];
let stderrBuffer: string[] = [];

async function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-pyodide]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.pyodide = "true";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (typeof window === "undefined") {
    throw new Error("Pyodide can only run in the browser.");
  }
  if (window.__pyodide) return window.__pyodide;
  if (window.__pyodideLoading) return window.__pyodideLoading;

  window.__pyodideLoading = (async () => {
    await loadScript(`${INDEX_URL}pyodide.js`);
    if (!window.loadPyodide) {
      throw new Error("Pyodide script did not expose loadPyodide.");
    }
    const py = await window.loadPyodide({ indexURL: INDEX_URL });
    py.setStdout({ batched: (s) => stdoutBuffer.push(s) });
    py.setStderr({ batched: (s) => stderrBuffer.push(s) });
    window.__pyodide = py;
    return py;
  })();

  return window.__pyodideLoading;
}

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  error?: string;
  globals: Record<string, unknown>;
}

/**
 * Runs Python code in a fresh module-level namespace so exercises don't leak
 * state between runs. Captures stdout/stderr and returns selected globals.
 */
export async function runPython(
  code: string,
  opts: { exposeGlobals?: string[] } = {},
): Promise<RunResult> {
  const py = await getPyodide();
  stdoutBuffer = [];
  stderrBuffer = [];

  py.setStdout({ batched: (s) => stdoutBuffer.push(s) });
  py.setStderr({ batched: (s) => stderrBuffer.push(s) });

  // Use a fresh namespace dict.
  const wrapper = `
import json as _json_mod
__algopy_ns__ = {}
try:
    exec(${JSON.stringify(code)}, __algopy_ns__)
    __algopy_err__ = None
except Exception as _e:
    import traceback as _tb
    __algopy_err__ = _tb.format_exc()
`;

  try {
    await py.runPythonAsync(wrapper);
  } catch (err) {
    return {
      ok: false,
      stdout: stdoutBuffer.join(""),
      stderr: stderrBuffer.join(""),
      error: err instanceof Error ? err.message : String(err),
      globals: {},
    };
  }

  const err = py.globals.get("__algopy_err__");
  const ns = py.globals.get("__algopy_ns__") as
    | { toJs: (opts?: unknown) => Map<string, unknown> }
    | undefined;

  const globals: Record<string, unknown> = {};
  if (opts.exposeGlobals && ns && typeof ns === "object" && "toJs" in ns) {
    const map = ns.toJs({ dict_converter: Object.fromEntries });
    const obj = map as unknown as Record<string, unknown>;
    for (const key of opts.exposeGlobals) {
      if (key in obj) globals[key] = obj[key];
    }
  }

  const stdout = stdoutBuffer.join("");
  const stderr = stderrBuffer.join("");

  if (err) {
    return {
      ok: false,
      stdout,
      stderr,
      error: String(err),
      globals,
    };
  }
  return { ok: true, stdout, stderr, globals };
}

export interface TestResult {
  description: string;
  passed: boolean;
  message?: string;
}

/**
 * Runs user code + a list of assertions. Returns pass/fail for each.
 * An assertion is a Python expression evaluated in the SAME namespace as the
 * user code. A special variable `_stdout` is available containing stdout.
 */
export async function runTests(
  userCode: string,
  tests: { description: string; assertion: string; setup?: string }[],
): Promise<{ run: RunResult; results: TestResult[] }> {
  const py = await getPyodide();
  stdoutBuffer = [];
  stderrBuffer = [];
  py.setStdout({ batched: (s) => stdoutBuffer.push(s) });
  py.setStderr({ batched: (s) => stderrBuffer.push(s) });

  const header = `
__algopy_ns__ = {}
__algopy_err__ = None
try:
    exec(${JSON.stringify(userCode)}, __algopy_ns__)
except Exception as _e:
    import traceback as _tb
    __algopy_err__ = _tb.format_exc()
`;
  await py.runPythonAsync(header);

  const userStdout = stdoutBuffer.join("");
  const userStderr = stderrBuffer.join("");
  const userErr = py.globals.get("__algopy_err__");

  const results: TestResult[] = [];
  if (userErr) {
    for (const t of tests) {
      results.push({ description: t.description, passed: false, message: "Le code a planté." });
    }
    return {
      run: {
        ok: false,
        stdout: userStdout,
        stderr: userStderr,
        error: String(userErr),
        globals: {},
      },
      results,
    };
  }

  for (const t of tests) {
    stdoutBuffer = [];
    stderrBuffer = [];
    const setup = t.setup ? `exec(${JSON.stringify(t.setup)}, __algopy_ns__)` : "";
    const code = `
${setup}
__algopy_ns__["_stdout"] = ${JSON.stringify(userStdout)}
try:
    __algopy_ok__ = bool(eval(${JSON.stringify(t.assertion)}, __algopy_ns__))
    __algopy_msg__ = ""
except Exception as _e:
    __algopy_ok__ = False
    __algopy_msg__ = str(_e)
`;
    try {
      await py.runPythonAsync(code);
      const ok = !!py.globals.get("__algopy_ok__");
      const msg = String(py.globals.get("__algopy_msg__") ?? "");
      results.push({
        description: t.description,
        passed: ok,
        message: ok ? undefined : msg || "Résultat incorrect.",
      });
    } catch (e) {
      results.push({
        description: t.description,
        passed: false,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return {
    run: { ok: true, stdout: userStdout, stderr: userStderr, globals: {} },
    results,
  };
}
