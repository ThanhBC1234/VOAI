/* global loadPyodide */

let runtimePromise;

function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js");
      return loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/" });
    })();
  }
  return runtimePromise;
}

self.onmessage = async (event) => {
  if (event.data.type === "init") {
    try {
      await getRuntime();
      self.postMessage({ type: "ready" });
    } catch (error) {
      runtimePromise = undefined;
      self.postMessage({ type: "runtime-error", error: String(error) });
    }
    return;
  }

  if (event.data.type !== "run") return;
  const { requestId, code, tests } = event.data;
  const output = [];
  let globals;
  try {
    const pyodide = await getRuntime();
    pyodide.setStdout({ batched: (text) => output.push(text) });
    pyodide.setStderr({ batched: (text) => output.push(text) });
    globals = pyodide.runPython("dict()");
    await pyodide.runPythonAsync(code, { globals });
    const details = [];
    for (const test of tests) {
      try {
        await pyodide.runPythonAsync(test.code, { globals });
        details.push({ name: test.name, blind: Boolean(test.blind), passed: true });
      } catch (error) {
        details.push({ name: test.name, blind: Boolean(test.blind), passed: false, category: String(error).includes("AssertionError") ? "Kết quả chưa đúng" : "Lỗi khi chạy" });
      }
    }
    self.postMessage({ type: "result", requestId, ok: true, output, details });
  } catch (error) {
    self.postMessage({ type: "result", requestId, ok: false, output, error: String(error) });
  } finally {
    globals?.destroy();
  }
};
