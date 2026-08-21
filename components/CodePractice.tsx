"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InternalLink } from "./InternalLink";
import { sitePath } from "../lib/site-path";
import { readJson, writeJson } from "../lib/local-storage";
import { useDraftWriter } from "../lib/draft-storage";
import {
  describeLearningProgressWriteResult,
  markSessionCompleted,
  mergeLearningProgress,
} from "../lib/learning-progress";

type TestCase = { name: string; code: string };
type Exercise = {
  id: string; domain: string; title: string; level: string; prompt: string;
  signature: string; starter: string; constraints: string[]; examples: string[];
  visible: TestCase[]; blind: TestCase[];
};

const exercises: Exercise[] = [
  {
    id: "vector-mean", domain: "Python nền tảng", title: "Trung bình an toàn", level: "Nền tảng",
    prompt: "Cài hàm trả về trung bình của danh sách số mà không dùng sum(), statistics hoặc NumPy. Danh sách rỗng phải phát sinh ValueError.",
    signature: "safe_mean(values)", starter: "def safe_mean(values):\n    # SOLO-90: tự viết phần thân hàm\n    pass\n",
    constraints: ["Không dùng sum()", "O(n) thời gian", "O(1) bộ nhớ phụ", "Xử lý số âm và float"],
    examples: ["safe_mean([2, 4, 6]) → 4.0", "safe_mean([-2, 1]) → -0.5"],
    visible: [{name:"Ba số nguyên",code:"assert safe_mean([2, 4, 6]) == 4"},{name:"Số âm",code:"assert abs(safe_mean([-2, 1]) + 0.5) < 1e-9"}],
    blind: [{name:"Một phần tử",code:"assert safe_mean([8.25]) == 8.25"},{name:"Danh sách rỗng",code:"\ntry:\n    safe_mean([])\n    assert False\nexcept ValueError:\n    pass"},{name:"Số thực",code:"assert abs(safe_mean([0.1, 0.2, 0.3]) - 0.2) < 1e-9"}],
  },
  {
    id:"linear-predict",domain:"Machine Learning",title:"Linear Regression — predict",level:"Cơ bản",
    prompt:"Cài phép dự đoán y = Xw + b cho X là danh sách các hàng. Không dùng NumPy; kiểm tra số chiều và phát sinh ValueError nếu không khớp.",
    signature:"linear_predict(X, weights, bias)",starter:"def linear_predict(X, weights, bias):\n    # Trả về list dự đoán, mỗi hàng một giá trị\n    pass\n",
    constraints:["Không NumPy", "Không sửa dữ liệu đầu vào", "Kiểm tra mọi hàng", "O(n·d)"],examples:["linear_predict([[1,2]], [3,4], 1) → [12]"],
    visible:[{name:"Một hàng",code:"assert linear_predict([[1,2]], [3,4], 1) == [12]"},{name:"Hai hàng",code:"assert linear_predict([[0,0],[2,-1]], [2,3], .5) == [.5, 1.5]"}],
    blind:[{name:"Không sửa đầu vào",code:"X=[[1,2]]; w=[3,4]; linear_predict(X,w,0); assert X==[[1,2]] and w==[3,4]"},{name:"Sai số chiều",code:"\ntry:\n linear_predict([[1]], [1,2], 0)\n assert False\nexcept ValueError: pass"},{name:"X rỗng",code:"assert linear_predict([], [1,2], 0) == []"}],
  },
  {
    id:"knn-vote",domain:"Machine Learning",title:"k-NN — bỏ phiếu có quy tắc",level:"Cơ bản",
    prompt:"Từ danh sách (khoảng_cách, nhãn), chọn k điểm gần nhất và trả nhãn đa số. Nếu hòa, trả nhãn có tổng khoảng cách nhỏ hơn; nếu vẫn hòa, chọn nhãn theo thứ tự từ điển.",
    signature:"knn_vote(neighbors, k)",starter:"def knn_vote(neighbors, k):\n    # neighbors: list[tuple[float, str]]\n    pass\n",
    constraints:["1 ≤ k ≤ len(neighbors)", "Không giả định đầu vào đã sắp", "Giải quyết hòa xác định"],examples:["knn_vote([(0.4,'A'),(0.1,'B'),(0.2,'B')], 3) → 'B'"],
    visible:[{name:"Đa số B",code:"assert knn_vote([(0.4,'A'),(0.1,'B'),(0.2,'B')],3)=='B'"},{name:"Chỉ lấy k gần nhất",code:"assert knn_vote([(9,'B'),(.2,'A'),(.1,'A')],2)=='A'"}],
    blind:[{name:"Hòa theo khoảng cách",code:"assert knn_vote([(.1,'Z'),(.9,'A')],2)=='Z'"},{name:"k không hợp lệ",code:"\ntry:\n knn_vote([],1)\n assert False\nexcept ValueError: pass"},{name:"Hòa theo thứ tự từ điển",code:"assert knn_vote([(.5,'B'),(.5,'A')],2)=='A'"}],
  },
  {
    id:"binary-metrics",domain:"Đánh giá mô hình",title:"Precision, Recall và F1",level:"Cơ bản",
    prompt:"Nhận y_true và y_pred chỉ gồm 0/1; trả dictionary accuracy, precision, recall, f1. Khi mẫu số bằng 0, metric tương ứng bằng 0.0.",
    signature:"binary_metrics(y_true, y_pred)",starter:"def binary_metrics(y_true, y_pred):\n    # Trả dict có 4 khóa: accuracy, precision, recall, f1\n    pass\n",
    constraints:["Không sklearn", "Không chia cho 0", "Hai list phải cùng độ dài và không rỗng"],examples:["binary_metrics([1,1,0],[1,0,0])['recall'] → 0.5"],
    visible:[{name:"Ví dụ cân bằng",code:"m=binary_metrics([1,1,0,0],[1,0,1,0]); assert m=={'accuracy':.5,'precision':.5,'recall':.5,'f1':.5}"}],
    blind:[{name:"Không dự đoán dương",code:"m=binary_metrics([1,0],[0,0]); assert m['precision']==0 and m['f1']==0"},{name:"Input rỗng",code:"\ntry:\n binary_metrics([],[])\n assert False\nexcept ValueError: pass"},{name:"Dự đoán hoàn hảo",code:"m=binary_metrics([1,0,1],[1,0,1]); assert m['f1']==1.0"}],
  },
  {
    id:"conv-valid",domain:"Computer Vision",title:"Convolution 2D valid",level:"Trung bình",
    prompt:"Cài cross-correlation 2D stride 1, không padding cho ma trận và kernel là list lồng nhau. Đây là phép mà thư viện DL thường gọi là convolution.",
    signature:"conv2d_valid(image, kernel)",starter:"def conv2d_valid(image, kernel):\n    # Không dùng scipy, numpy hoặc thư viện xử lý ảnh\n    pass\n",
    constraints:["Kernel không lớn hơn ảnh", "Hàng phải cùng độ dài", "Không lật kernel", "O(H·W·Kh·Kw)"],examples:["conv2d_valid([[1,2],[3,4]], [[1]]) → [[1,2],[3,4]]"],
    visible:[{name:"Kernel 1×1",code:"assert conv2d_valid([[1,2],[3,4]],[[2]])==[[2,4],[6,8]]"},{name:"Tổng vùng",code:"assert conv2d_valid([[1,2,3],[4,5,6],[7,8,9]],[[1,1],[1,1]])==[[12,16],[24,28]]"}],
    blind:[{name:"Kernel chữ nhật",code:"assert conv2d_valid([[1,2,3],[4,5,6]],[[1,0]])==[[1,2],[4,5]]"},{name:"Kernel quá lớn",code:"\ntry:\n conv2d_valid([[1]],[[1,2]])\n assert False\nexcept ValueError: pass"},{name:"Kernel bằng đúng ảnh",code:"assert conv2d_valid([[1,2],[3,4]],[[1,1],[1,1]])==[[10]]"}],
  },
];

/** Mỗi bài Arena xác nhận đúng phiên thực hành tương ứng trong lộ trình. */
const ROADMAP_SESSION_BY_EXERCISE: Readonly<Record<string,string>>={
  "vector-mean":"w01-lesson-3",
  "linear-predict":"w05-lesson-1",
  "knn-vote":"w08-lesson-2",
  "binary-metrics":"w06-lesson-3",
  "conv-valid":"w23-lesson-2",
};

type RunResult = { ok: boolean; output: string[]; details?: {name:string;passed:boolean;blind?:boolean;category?:string}[]; error?: string };

/**
 * Hạn thời gian **khởi động** Pyodide, tách hẳn khỏi hạn 8 giây thực thi. Lần
 * tải đầu phải kéo runtime từ CDN nên cần rộng rãi, nhưng không được vô hạn:
 * nếu `importScripts`/`loadPyodide` treo thì trước đây UI kẹt mãi ở trạng thái
 * tải và nút bị khoá (ARENA-P2-01).
 */
const BOOT_TIMEOUT_MS = 60_000;

/** Kho bản nháp code của Code Arena, tách theo từng bài. */
const ARENA_DRAFTS_KEY="voai-arena-drafts-v1";
const LEGACY_ARENA_PROGRESS_KEY="voai-progress";

/**
 * Chỉ nhận đúng dấu vết pass do Code Arena phiên bản cũ ghi ra. Timestamp phải
 * là ISO thật; object thêm/thiếu trường hoặc `solo` khác true đều bị bỏ qua.
 */
function isLegacyArenaPass(value:unknown):boolean{
  if(typeof value!=="object"||value===null||Array.isArray(value)) return false;
  const record=value as Record<string,unknown>;
  if(Object.keys(record).length!==2||record.solo!==true||typeof record.passedAt!=="string") return false;
  const timestamp=Date.parse(record.passedAt);
  return Number.isFinite(timestamp)&&new Date(timestamp).toISOString()===record.passedAt;
}

export function legacyArenaPassedSessionIds(value:unknown):string[]{
  if(typeof value!=="object"||value===null||Array.isArray(value)) return [];
  const records=value as Record<string,unknown>;
  const sessionIds:string[]=[];
  for(const [exerciseId,sessionId] of Object.entries(ROADMAP_SESSION_BY_EXERCISE)){
    if(isLegacyArenaPass(records[exerciseId])) sessionIds.push(sessionId);
  }
  return sessionIds;
}

/** Đọc kho nháp; dữ liệu hỏng trả về rỗng chứ không ném. */
function readArenaDrafts():Record<string,string>{
  return readJson<Record<string,string>>(ARENA_DRAFTS_KEY,value=>{
    if(typeof value!=="object"||value===null||Array.isArray(value)) return null;
    const record=value as {version?:unknown;drafts?:unknown};
    if(record.version!==1) return null;
    if(typeof record.drafts!=="object"||record.drafts===null) return null;
    const drafts=record.drafts as Record<string,unknown>;
    const clean:Record<string,string>={};
    for(const [key,text] of Object.entries(drafts)) if(typeof text==="string") clean[key]=text;
    return clean;
  },{});
}

export function CodePractice() {
  const [exerciseId,setExerciseId]=useState(exercises[0].id);
  const exercise=exercises.find(item=>item.id===exerciseId) ?? exercises[0];
  const [code,setCode]=useState(exercise.starter);
  const [mode,setMode]=useState<"visible"|"blind">("visible");
  const [status,setStatus]=useState<"idle"|"loading"|"running">("idle");
  const [result,setResult]=useState<RunResult|null>(null);
  const [progressNotice,setProgressNotice]=useState<string|null>(null);
  const workerRef=useRef<Worker|null>(null);
  const timeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const bootTimeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  /**
   * Bản nháp theo từng bài. Trước đây code chỉ nằm trong React state nên đổi
   * bài, bấm "Khôi phục" hay tải lại trang là **mất trắng** phần đang gõ — đây
   * là mất bài làm thật của người học, không phải phiền toái nhỏ.
   */
  const draftsRef=useRef<Record<string,string>>({});
  const draftWriter=useDraftWriter(ARENA_DRAFTS_KEY);

  useEffect(()=>()=>{ workerRef.current?.terminate(); if(timeoutRef.current) clearTimeout(timeoutRef.current); if(bootTimeoutRef.current) clearTimeout(bootTimeoutRef.current); },[]);

  // Khôi phục bản nháp sau khi tải lại trang.
  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      draftsRef.current=readArenaDrafts();
      const saved=draftsRef.current[exercises[0].id];
      if(typeof saved==="string"&&saved!==exercises[0].starter) setCode(saved);
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);

  // PROGRESS-MIGRATION-ARENA-START
  // Nối các lần pass hợp lệ từ kho `voai-progress` cũ sang kho canonical.
  // Không xoá/ghi lại kho cũ để người học vẫn có đường lui khi hạ phiên bản.
  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      const legacyRecords=readJson<unknown>(LEGACY_ARENA_PROGRESS_KEY,value=>value,{});
      const passedSessionIds=legacyArenaPassedSessionIds(legacyRecords);
      if(passedSessionIds.length===0) return;
      const progressResult=mergeLearningProgress(passedSessionIds);
      const warning=describeLearningProgressWriteResult(progressResult);
      if(warning){
        setProgressNotice(`Đã tìm thấy bài Code Arena đạt từ phiên bản cũ, nhưng tiến độ Lộ trình chưa được lưu. ${warning}`);
      }
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);
  // PROGRESS-MIGRATION-ARENA-END

  /**
   * Ghi nháp của bài hiện tại; giữ nguyên nháp của các bài khác.
   *
   * `immediate` dành cho các mốc dứt khoát — đổi bài, xoá về đề gốc — nơi người
   * học coi như đã "chốt" một trạng thái. Lúc gõ thì để `useDraftWriter` gộp
   * nhịp, vì ghi đồng bộ trên từng ký tự làm khựng cả trình soạn thảo.
   */
  const persistDraft=(id:string,text:string,immediate=false)=>{
    draftsRef.current={...draftsRef.current,[id]:text};
    draftWriter.schedule({version:1,drafts:draftsRef.current});
    if(immediate) draftWriter.flush();
  };

  const updateCode=(text:string)=>{ setCode(text); persistDraft(exerciseId,text); };

  const selectExercise=(id:string)=>{
    const next=exercises.find(item=>item.id===id)!;
    // Cất nháp bài đang mở trước khi rời đi, rồi nạp lại nháp của bài đích.
    persistDraft(exerciseId,code,true);
    setExerciseId(id);
    setCode(draftsRef.current[id] ?? next.starter);
    setResult(null); setMode("visible");
    setProgressNotice(null);
  };

  /** Xoá về starter — thao tác phá huỷ nên phải hỏi trước. */
  const resetCode=()=>{
    const untouched=code.trim()===exercise.starter.trim();
    if(!untouched&&!window.confirm("Xoá toàn bộ code bạn đang viết và quay về đề gốc? Thao tác này không hoàn tác được.")) return;
    setCode(exercise.starter); persistDraft(exerciseId,exercise.starter,true); setResult(null);
  };
  const tests=mode==="visible"
    ? exercise.visible.map(test=>({...test,blind:false}))
    : [...exercise.visible.map(test=>({...test,blind:false})),...exercise.blind.map(test=>({...test,blind:true}))];

  const run=()=>{
    setResult(null);
    setProgressNotice(null);
    if(timeoutRef.current)clearTimeout(timeoutRef.current);
    workerRef.current?.terminate();
    if(bootTimeoutRef.current)clearTimeout(bootTimeoutRef.current);
    const worker=new Worker(sitePath("/pyodide-worker.js"));workerRef.current=worker;
    const requestId=crypto.randomUUID();
    const runExerciseId=exercise.id; const runMode=mode;
    const disposeWorker=()=>{
      worker.onmessage=null;worker.onerror=null;   // response của worker cũ không được cập nhật lần chạy mới
      worker.terminate();
      if(workerRef.current===worker)workerRef.current=null;
      if(bootTimeoutRef.current){clearTimeout(bootTimeoutRef.current);bootTimeoutRef.current=null;}
      if(timeoutRef.current){clearTimeout(timeoutRef.current);timeoutRef.current=null;}
    };
    let executionStarted=false;
    // ARENA-P2-01: boot timeout riêng, bắt đầu ngay khi tạo worker. Nếu
    // importScripts/loadPyodide treo thì UI không kẹt ở trạng thái tải vĩnh viễn.
    bootTimeoutRef.current=setTimeout(()=>{
      if(executionStarted)return;
      disposeWorker();setStatus("idle");
      setResult({ok:false,output:[],error:`Không tải được Python trong ${BOOT_TIMEOUT_MS/1000} giây. Kiểm tra kết nối mạng hoặc trình chặn quảng cáo, rồi bấm chạy lại.`});
    },BOOT_TIMEOUT_MS);
    const startExecution=()=>{
      if(executionStarted)return;
      executionStarted=true;
      if(bootTimeoutRef.current){clearTimeout(bootTimeoutRef.current);bootTimeoutRef.current=null;}
      setStatus("running");
      worker.postMessage({type:"run",requestId,code,tests});
      timeoutRef.current=setTimeout(()=>{
        disposeWorker();setStatus("idle");
        setResult({ok:false,output:[],error:"Mã chạy quá 8 giây — kiểm tra vòng lặp vô hạn hoặc độ phức tạp. Thời gian tải Python không tính vào giới hạn này."});
      },8000);
    };
    worker.onmessage=(event)=>{
      if(event.data.type==="ready"){
        startExecution();return;
      }
      if(event.data.type==="runtime-error"){
        disposeWorker();setStatus("idle");
        setResult({ok:false,output:[],error:`Không tải được Python: ${event.data.error}`});return;
      }
      if(event.data.type!=="result"||event.data.requestId!==requestId) return;
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
      disposeWorker();setStatus("idle");setResult(event.data);
      if(runMode==="blind"&&event.data.details?.every((item:{passed:boolean})=>item.passed)){
        const roadmapSessionId=ROADMAP_SESSION_BY_EXERCISE[runExerciseId];
        if(roadmapSessionId){
          const progressResult=markSessionCompleted(roadmapSessionId);
          const warning=describeLearningProgressWriteResult(progressResult);
          if(warning) setProgressNotice(`Bài code vẫn đạt toàn bộ test mù, nhưng tiến độ Lộ trình chưa được lưu. ${warning}`);
        }
        const current=readJson<Record<string,unknown>>("voai-progress",value=>(typeof value==="object"&&value!==null&&!Array.isArray(value)?value as Record<string,unknown>:null),{});
        current[runExerciseId]={passedAt:new Date().toISOString(),solo:true};
        writeJson("voai-progress",current);
      }
    };
    worker.onerror=()=>{
      if(timeoutRef.current)clearTimeout(timeoutRef.current);
      disposeWorker();setStatus("idle");
      setResult({ok:false,output:[],error:"Web Worker gặp lỗi khi tải hoặc chạy Python."});
    };
    setStatus("loading");worker.postMessage({type:"init"});
  };

  const lines=useMemo(()=>Array.from({length:Math.max(12,code.split("\n").length)},(_,i)=>i+1),[code]);
  const passed=result?.details?.filter(item=>item.passed).length??0;
  const total=result?.details?.length??0;

  return (
    <div className="arena-shell">
      <aside className="exercise-list">
        <div><span>BỘ BÀI TẬP MẪU</span><strong>{exercises.length} bài đã mở</strong></div>
        {exercises.map((item,index)=><button className={item.id===exercise.id?"active":""} key={item.id} onClick={()=>selectExercise(item.id)} disabled={status!=="idle"}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{item.title}</strong><small>{item.domain} · {item.level}</small></div></button>)}
        <InternalLink href="/roadmap">Xem bài theo lộ trình →</InternalLink>
      </aside>
      <section className="exercise-workspace">
        <div className="problem-pane">
          <p className="lab-code">{exercise.domain.toUpperCase()} · {exercise.level.toUpperCase()}</p><h2>{exercise.title}</h2><p>{exercise.prompt}</p>
          <h3>Chữ ký hàm</h3><code className="signature">{exercise.signature}</code><h3>Ràng buộc</h3><ul>{exercise.constraints.map(item=><li key={item}>{item}</li>)}</ul>
          <h3>Ví dụ</h3>{exercise.examples.map(item=><pre key={item}>{item}</pre>)}
          <div className="solo-rule"><strong>SOLO·90</strong><p>Không nhờ AI sinh code, pseudocode hay sửa dòng cụ thể. Chỉ hỏi loại lỗi sau khi đã tự chạy test.</p></div>
        </div>
        <div className="editor-pane">
          <div className="editor-toolbar"><div><button className={mode==="visible"?"active":""} onClick={()=>{setMode("visible");setResult(null)}} disabled={status!=="idle"}>Test công khai</button><button className={mode==="blind"?"active":""} onClick={()=>{setMode("blind");setResult(null)}} disabled={status!=="idle"}>Nộp kiểm tra mù</button></div><button className="reset-code" onClick={resetCode} disabled={status!=="idle"}>Khôi phục</button></div>
          {draftWriter.notice?<p className="storage-notice" role="status">{draftWriter.notice} Hãy sao chép code ra nơi khác trước khi rời trang.</p>:null}
          {progressNotice?<p className="storage-notice" role="status" aria-live="polite">{progressNotice}</p>:null}
          <p className="hidden-note">Kiểm tra mù chỉ giấu ca kiểm tra khỏi giao diện trước khi chạy. Nội dung vẫn nằm trong mã phía client và có thể xem qua source/bundle; đây là công cụ luyện tập, không phải cơ chế bảo mật.</p>
          <div className="code-editor"><div className="line-numbers">{lines.map(line=><span key={line}>{line}</span>)}</div><textarea spellCheck={false} value={code} onChange={e=>updateCode(e.target.value)} aria-label="Trình soạn thảo mã Python" disabled={status!=="idle"}/></div>
          <div className="runbar" aria-live="polite"><span>{status==="loading"?"Đang tải Python (~10 MB); chưa tính thời gian chạy…":status==="running"?"Đang chạy trong Web Worker…":"Python 3 · Web Worker · mã chạy tối đa 8 giây"}</span><button onClick={run} disabled={status!=="idle"}>{mode==="blind"?"Nộp bài":"Chạy test"} <b>▶</b></button></div>
          <div className={`test-result ${result?(result.ok&&passed===total?"pass":"fail"):""}`}><div className="result-heading"><strong>{!result?"KẾT QUẢ SẼ HIỆN Ở ĐÂY":result.ok?`${passed}/${total} test đạt`:"KHÔNG THỂ CHẤM"}</strong>{result&&total>0&&<span>{Math.round(passed/total*100)} điểm</span>}</div>{result?.output?.length?<pre>{result.output.join("\n")}</pre>:null}{result?.error?<p>{result.error.split("\n").slice(-3).join("\n")}</p>:null}{result?.details?.map((item,index)=><div className="test-row" key={`${item.name}-${index}`}><span>{item.passed?"✓":"×"}</span><strong>{item.blind?"Ca kiểm tra mù":item.name}</strong><small>{item.passed?"Đạt":item.category}</small></div>)}</div>
        </div>
      </section>
      <section className="ai-contract"><div><span>COACH·10</span><h2>Nếu thật sự cần kiểm chứng bằng AI</h2></div><ol><li>Tự chạy ít nhất một lần và ghi giả thuyết lỗi.</li><li>Chỉ gửi code cùng câu hỏi: “Lập luận của tôi đúng hay chưa?”</li><li>Yêu cầu AI chỉ trả: đúng / loại lỗi / một câu hỏi gợi mở.</li><li>Nếu đã xem lời giải, bài cũ không còn tính; làm biến thể mới.</li></ol><button onClick={()=>navigator.clipboard?.writeText("Chỉ kiểm tra mức đúng của lập luận hoặc code dưới đây. Không viết code, pseudocode, đáp án, không chỉ ra dòng cần thay. Nếu sai, chỉ nêu nhóm lỗi và hỏi duy nhất một câu gợi mở.")}>Sao chép prompt kiểm chứng</button></section>
    </div>
  );
}
