/* global loadPyodide */

/**
 * SUPPLY-P3-01: CDN không còn là điểm tin cậy duy nhất.
 *
 * Runtime Pyodide rất lớn (hàng chục MB) nên dự án không nhúng sẵn vào kho mã.
 * Thay vào đó worker ưu tiên bản **cùng origin** nếu người vận hành đã đặt vào
 * `public/pyodide/`, và chỉ lùi về jsDelivr khi không có. Trong cả hai trường
 * hợp, script được **tải rồi băm kiểm tra trước khi thực thi**: không có
 * `importScripts` thẳng từ mạng nữa, và không bao giờ im lặng chạy một script
 * chưa xác minh.
 *
 * Cập nhật phiên bản: đổi `PYODIDE_VERSION`, tải `pyodide.js` mới, tính
 * `sha384` của nó rồi thay vào `PYODIDE_LOADER_SHA384`.
 */
const PYODIDE_VERSION = "0.27.7";
const CDN_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
/**
 * CDN dự phòng. Băm dưới đây đã được đối chiếu trên chính hai nguồn này, nên
 * lùi sang unpkg **không** hạ thấp mức kiểm tra: script vẫn phải khớp băm mới
 * được chạy. Có nguồn thứ hai vì `public/pyodide/` thường không được đặt sẵn,
 * và khi đó một mình jsDelivr hỏng hoặc bị chặn là mất hẳn Code Arena.
 */
const FALLBACK_CDN_BASE = `https://unpkg.com/pyodide@${PYODIDE_VERSION}/`;
const SELF_HOSTED_BASE = new URL(`pyodide/v${PYODIDE_VERSION}/`, self.location.href).href;
/**
 * Băm SRI của `pyodide.js` cho đúng `PYODIDE_VERSION` ở trên.
 *
 * Giá trị này đã được đối chiếu trên **hai CDN độc lập** — jsDelivr và unpkg —
 * cả hai trả về cùng 14 913 byte và cùng một băm, nên một mình jsDelivr không
 * còn là điểm tin cậy duy nhất.
 *
 * Khi đổi `PYODIDE_VERSION`, phải tính lại:
 *
 *     node -e "const {createHash}=require('node:crypto');fetch('https://cdn.jsdelivr.net/pyodide/v<VER>/full/pyodide.js').then(r=>r.arrayBuffer()).then(b=>console.log('sha384-'+createHash('sha384').update(Buffer.from(b)).digest('base64')))"
 *
 * Để chuỗi rỗng sẽ tắt kiểm tra (worker vẫn chạy nhưng chỉ ghi cảnh báo). Đừng
 * làm vậy trên bản phát hành: đó chính là lỗ hổng SUPPLY-P3-01 đã sửa.
 */
const PYODIDE_LOADER_SHA384 =
  "sha384-90so5tCKvl0xs9agU29IMKlAVzhfzFX7QO//YxQkRhJG58bBZrFN+2ZTRB026X5X";

async function sha384(buffer) {
  const digest = await crypto.subtle.digest("SHA-384", buffer);
  let binary = "";
  for (const byte of new Uint8Array(digest)) binary += String.fromCharCode(byte);
  return `sha384-${btoa(binary)}`;
}

async function fetchVerifiedLoader(base) {
  const response = await fetch(new URL("pyodide.js", base).href, { credentials: "omit" });
  if (!response.ok) throw new Error(`HTTP ${response.status} khi tải pyodide.js từ ${base}`);
  const buffer = await response.arrayBuffer();
  if (PYODIDE_LOADER_SHA384) {
    const actual = await sha384(buffer);
    if (actual !== PYODIDE_LOADER_SHA384) {
      // Không fallback âm thầm: script sai băm bị từ chối hẳn.
      throw new Error(`Băm pyodide.js không khớp (${actual}). Từ chối thực thi script chưa xác minh.`);
    }
  } else {
    console.warn("PYODIDE_LOADER_SHA384 chưa được pin; chưa xác minh được tính toàn vẹn của runtime.");
  }
  return new TextDecoder().decode(buffer);
}

let runtimePromise;

function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const bases = [SELF_HOSTED_BASE, CDN_BASE, FALLBACK_CDN_BASE];
      const failures = [];
      for (const base of bases) {
        try {
          const source = await fetchVerifiedLoader(base);
          new Function(source)();
          return await loadPyodide({ indexURL: base });
        } catch (error) {
          failures.push(`${base}: ${error}`);
        }
      }
      throw new Error(`Không nạp được Pyodide từ nguồn nào.\n${failures.join("\n")}`);
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
  // ARENA-P2-02: hạn ngạch output. Bài in vô hạn từng làm worker phình bộ nhớ
  // rồi gửi một message khổng lồ về main thread trước khi kịp timeout.
  const OUTPUT_LIMIT_CHARS = 64 * 1024;
  const output = [];
  let outputChars = 0;
  let outputTruncated = false;
  const collect = (text) => {
    if (outputTruncated) return;
    const remaining = OUTPUT_LIMIT_CHARS - outputChars;
    if (remaining <= 0) {
      outputTruncated = true;
      output.push("[output truncated]");
      return;
    }
    if (text.length > remaining) {
      output.push(text.slice(0, remaining));
      output.push("[output truncated]");
      outputTruncated = true;
      outputChars = OUTPUT_LIMIT_CHARS;
      return;
    }
    output.push(text);
    outputChars += text.length;
  };
  let globals;
  try {
    const pyodide = await getRuntime();
    pyodide.setStdout({ batched: collect });
    pyodide.setStderr({ batched: collect });
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
