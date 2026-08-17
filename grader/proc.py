"""Chạy tiến trình con có kiểm soát cả cây con và có hạn ngạch output.

Vì sao cần module này (GRADER-P1-02, ARENA-P2-02):

- `subprocess.run(timeout=...)` chỉ hạ đúng tiến trình trực tiếp. Bài nộp có thể
  `Popen` thêm tiến trình cháu; những tiến trình đó sống sót sau timeout, tiếp tục
  chiếm CPU và có thể giữ pipe khiến grader treo.
- POSIX: tạo session mới rồi `killpg` cả process group.
- Windows: gán tiến trình vào một Job Object có cờ KILL_ON_JOB_CLOSE, nên mọi
  tiến trình cháu bị hạ cùng lúc. Nếu không tạo được Job Object thì lùi về
  `taskkill /F /T`.
- stdout/stderr được đọc bằng luồng riêng và cắt tại hạn ngạch, nên bài in vô hạn
  không làm grader ngốn RAM tuyến tính.
"""

from __future__ import annotations

import os
import subprocess
import sys
import threading
import time
from dataclasses import dataclass, field

IS_WINDOWS = sys.platform == "win32"

#: Hạn ngạch ký tự cho mỗi luồng output của bài nộp. Vượt mức này sẽ bị cắt và
#: đánh dấu đúng một lần bằng `TRUNCATION_MARKER`.
OUTPUT_LIMIT_CHARS = 64 * 1024
TRUNCATION_MARKER = "\n[output truncated]"

#: Khoảng ân hạn sau khi hết giờ để hạ tiến trình và đóng pipe.
CLEANUP_GRACE_SECONDS = 2.0


@dataclass
class ProcessOutcome:
    status: str  # "completed" | "timeout"
    returncode: int | None
    stdout: str
    stderr: str
    stdout_truncated: bool = False
    stderr_truncated: bool = False
    elapsed: float = 0.0


@dataclass
class _Sink:
    chunks: list = field(default_factory=list)
    total: int = 0
    truncated: bool = False

    def text(self) -> str:
        value = "".join(self.chunks)
        return value + TRUNCATION_MARKER if self.truncated else value


def _drain(stream, sink: _Sink, limit: int) -> None:
    """Đọc hết stream nhưng chỉ giữ tối đa `limit` ký tự."""
    try:
        while True:
            chunk = stream.read(8192)
            if not chunk:
                break
            remaining = limit - sink.total
            if remaining > 0:
                sink.chunks.append(chunk[:remaining])
            if len(chunk) > max(remaining, 0):
                sink.truncated = True
            sink.total += len(chunk)
    except (ValueError, OSError):
        # Pipe bị đóng khi tiến trình bị hạ; không phải lỗi cần báo.
        pass
    finally:
        try:
            stream.close()
        except (ValueError, OSError):
            pass


class _WindowsJob:
    """Job Object bảo đảm hạ toàn bộ cây tiến trình trên Windows."""

    def __init__(self) -> None:
        import ctypes
        from ctypes import wintypes

        self._ctypes = ctypes
        self._kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)

        # HANDLE là con trỏ (64 bit trên Windows x64), nhưng `restype` mặc định
        # của ctypes là `c_int` 32 bit. Không khai báo rõ thì handle bị **cắt
        # cụt** khi giá trị vượt 2^31, và mọi lời gọi sau đó thao tác trên một
        # handle sai. Lỗi này chỉ lộ ra khi tiến trình đã mở nhiều handle, nên
        # nó im lặng qua được cả test.
        self._kernel32.CreateJobObjectW.restype = wintypes.HANDLE
        self._kernel32.CreateJobObjectW.argtypes = [ctypes.c_void_p, wintypes.LPCWSTR]
        self._kernel32.SetInformationJobObject.restype = wintypes.BOOL
        self._kernel32.SetInformationJobObject.argtypes = [
            wintypes.HANDLE,
            ctypes.c_int,
            ctypes.c_void_p,
            wintypes.DWORD,
        ]
        self._kernel32.OpenProcess.restype = wintypes.HANDLE
        self._kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        self._kernel32.AssignProcessToJobObject.restype = wintypes.BOOL
        self._kernel32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
        self._kernel32.TerminateJobObject.restype = wintypes.BOOL
        self._kernel32.TerminateJobObject.argtypes = [wintypes.HANDLE, wintypes.UINT]
        self._kernel32.CloseHandle.restype = wintypes.BOOL
        self._kernel32.CloseHandle.argtypes = [wintypes.HANDLE]

        self._handle = self._kernel32.CreateJobObjectW(None, None)
        if not self._handle:
            raise OSError(ctypes.get_last_error(), "CreateJobObjectW thất bại")

        # JOBOBJECT_EXTENDED_LIMIT_INFORMATION với cờ KILL_ON_JOB_CLOSE.
        class IO_COUNTERS(ctypes.Structure):
            _fields_ = [(name, ctypes.c_ulonglong) for name in
                        ("ReadOperationCount", "WriteOperationCount", "OtherOperationCount",
                         "ReadTransferCount", "WriteTransferCount", "OtherTransferCount")]

        class JOBOBJECT_BASIC_LIMIT_INFORMATION(ctypes.Structure):
            _fields_ = [
                ("PerProcessUserTimeLimit", ctypes.c_int64),
                ("PerJobUserTimeLimit", ctypes.c_int64),
                ("LimitFlags", wintypes.DWORD),
                ("MinimumWorkingSetSize", ctypes.c_size_t),
                ("MaximumWorkingSetSize", ctypes.c_size_t),
                ("ActiveProcessLimit", wintypes.DWORD),
                ("Affinity", ctypes.POINTER(ctypes.c_ulong)),
                ("PriorityClass", wintypes.DWORD),
                ("SchedulingClass", wintypes.DWORD),
            ]

        class JOBOBJECT_EXTENDED_LIMIT_INFORMATION(ctypes.Structure):
            _fields_ = [
                ("BasicLimitInformation", JOBOBJECT_BASIC_LIMIT_INFORMATION),
                ("IoInfo", IO_COUNTERS),
                ("ProcessMemoryLimit", ctypes.c_size_t),
                ("JobMemoryLimit", ctypes.c_size_t),
                ("PeakProcessMemoryUsed", ctypes.c_size_t),
                ("PeakJobMemoryUsed", ctypes.c_size_t),
            ]

        JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x00002000
        JobObjectExtendedLimitInformation = 9

        info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
        info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not self._kernel32.SetInformationJobObject(
            self._handle,
            JobObjectExtendedLimitInformation,
            ctypes.byref(info),
            ctypes.sizeof(info),
        ):
            raise OSError(ctypes.get_last_error(), "SetInformationJobObject thất bại")

    def assign(self, pid: int) -> None:
        PROCESS_SET_QUOTA = 0x0100
        PROCESS_TERMINATE = 0x0001
        handle = self._kernel32.OpenProcess(PROCESS_SET_QUOTA | PROCESS_TERMINATE, False, pid)
        if not handle:
            raise OSError(self._ctypes.get_last_error(), "OpenProcess thất bại")
        try:
            if not self._kernel32.AssignProcessToJobObject(self._handle, handle):
                raise OSError(self._ctypes.get_last_error(), "AssignProcessToJobObject thất bại")
        finally:
            self._kernel32.CloseHandle(handle)

    def terminate(self) -> None:
        self._kernel32.TerminateJobObject(self._handle, 1)

    def close(self) -> None:
        if self._handle:
            self._kernel32.CloseHandle(self._handle)
            self._handle = None


def _kill_tree(process: subprocess.Popen, job: "_WindowsJob | None") -> None:
    if process.poll() is not None and job is None:
        return
    if IS_WINDOWS:
        if job is not None:
            job.terminate()
            return
        # Lùi về taskkill khi không tạo được Job Object.
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(process.pid)],
            capture_output=True,
            check=False,
        )
        return
    try:
        os.killpg(os.getpgid(process.pid), 9)
    except (ProcessLookupError, PermissionError, OSError):
        try:
            process.kill()
        except OSError:
            pass


def run_guarded(
    command: list[str],
    stdin_text: str,
    timeout: float,
    output_limit: int = OUTPUT_LIMIT_CHARS,
) -> ProcessOutcome:
    """Chạy `command`, hạ cả cây tiến trình khi quá giờ, cắt output theo hạn ngạch."""
    popen_kwargs: dict = {
        "stdin": subprocess.PIPE,
        "stdout": subprocess.PIPE,
        "stderr": subprocess.PIPE,
        "text": True,
        "encoding": "utf-8",
        "errors": "replace",
        "bufsize": 8192,
    }
    job: _WindowsJob | None = None
    if IS_WINDOWS:
        popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
        try:
            job = _WindowsJob()
        except OSError:
            job = None
    else:
        popen_kwargs["start_new_session"] = True

    started = time.monotonic()
    process = subprocess.Popen(command, **popen_kwargs)
    if job is not None:
        try:
            job.assign(process.pid)
        except OSError:
            job.close()
            job = None

    out_sink, err_sink = _Sink(), _Sink()
    readers = [
        threading.Thread(target=_drain, args=(process.stdout, out_sink, output_limit), daemon=True),
        threading.Thread(target=_drain, args=(process.stderr, err_sink, output_limit), daemon=True),
    ]
    for reader in readers:
        reader.start()

    def feed_stdin() -> None:
        try:
            process.stdin.write(stdin_text)
            process.stdin.close()
        except (BrokenPipeError, ValueError, OSError):
            pass

    writer = threading.Thread(target=feed_stdin, daemon=True)
    writer.start()

    status = "completed"
    try:
        process.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        status = "timeout"
        _kill_tree(process, job)
        try:
            process.wait(timeout=CLEANUP_GRACE_SECONDS)
        except subprocess.TimeoutExpired:
            pass
    finally:
        for reader in readers:
            reader.join(timeout=CLEANUP_GRACE_SECONDS)
        writer.join(timeout=CLEANUP_GRACE_SECONDS)
        if job is not None:
            # Đóng job cũng hạ mọi tiến trình còn sót nhờ KILL_ON_JOB_CLOSE.
            job.terminate()
            job.close()

    return ProcessOutcome(
        status=status,
        returncode=process.returncode,
        stdout=out_sink.text(),
        stderr=err_sink.text(),
        stdout_truncated=out_sink.truncated,
        stderr_truncated=err_sink.truncated,
        elapsed=time.monotonic() - started,
    )
