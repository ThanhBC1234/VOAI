"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
    blind: [{name:"Một phần tử",code:"assert safe_mean([8.25]) == 8.25"},{name:"Danh sách rỗng",code:"\ntry:\n    safe_mean([])\n    assert False\nexcept ValueError:\n    pass"},{name:"Không dùng sum",code:"import inspect\nassert 'sum(' not in inspect.getsource(safe_mean)"}],
  },
  {
    id:"linear-predict",domain:"Machine Learning",title:"Linear Regression — predict",level:"Cơ bản",
    prompt:"Cài phép dự đoán y = Xw + b cho X là danh sách các hàng. Không dùng NumPy; kiểm tra số chiều và phát sinh ValueError nếu không khớp.",
    signature:"linear_predict(X, weights, bias)",starter:"def linear_predict(X, weights, bias):\n    # Trả về list dự đoán, mỗi hàng một giá trị\n    pass\n",
    constraints:["Không NumPy", "Không sửa dữ liệu đầu vào", "Kiểm tra mọi hàng", "O(n·d)"],examples:["linear_predict([[1,2]], [3,4], 1) → [12]"],
    visible:[{name:"Một hàng",code:"assert linear_predict([[1,2]], [3,4], 1) == [12]"},{name:"Hai hàng",code:"assert linear_predict([[0,0],[2,-1]], [2,3], .5) == [.5, 1.5]"}],
    blind:[{name:"Không sửa đầu vào",code:"X=[[1,2]]; w=[3,4]; linear_predict(X,w,0); assert X==[[1,2]] and w==[3,4]"},{name:"Sai số chiều",code:"\ntry:\n linear_predict([[1]], [1,2], 0)\n assert False\nexcept ValueError: pass"}],
  },
  {
    id:"knn-vote",domain:"Machine Learning",title:"k-NN — bỏ phiếu có quy tắc",level:"Cơ bản",
    prompt:"Từ danh sách (khoảng_cách, nhãn), chọn k điểm gần nhất và trả nhãn đa số. Nếu hòa, trả nhãn có tổng khoảng cách nhỏ hơn; nếu vẫn hòa, chọn nhãn theo thứ tự từ điển.",
    signature:"knn_vote(neighbors, k)",starter:"def knn_vote(neighbors, k):\n    # neighbors: list[tuple[float, str]]\n    pass\n",
    constraints:["1 ≤ k ≤ len(neighbors)", "Không giả định đầu vào đã sắp", "Giải quyết hòa xác định"],examples:["knn_vote([(0.4,'A'),(0.1,'B'),(0.2,'B')], 3) → 'B'"],
    visible:[{name:"Đa số B",code:"assert knn_vote([(0.4,'A'),(0.1,'B'),(0.2,'B')],3)=='B'"},{name:"Chỉ lấy k gần nhất",code:"assert knn_vote([(9,'B'),(.2,'A'),(.1,'A')],2)=='A'"}],
    blind:[{name:"Hòa theo khoảng cách",code:"assert knn_vote([(.1,'Z'),(.9,'A')],2)=='Z'"},{name:"k không hợp lệ",code:"\ntry:\n knn_vote([],1)\n assert False\nexcept ValueError: pass"}],
  },
  {
    id:"binary-metrics",domain:"Đánh giá mô hình",title:"Precision, Recall và F1",level:"Cơ bản",
    prompt:"Nhận y_true và y_pred chỉ gồm 0/1; trả dictionary accuracy, precision, recall, f1. Khi mẫu số bằng 0, metric tương ứng bằng 0.0.",
    signature:"binary_metrics(y_true, y_pred)",starter:"def binary_metrics(y_true, y_pred):\n    # Trả dict có 4 khóa: accuracy, precision, recall, f1\n    pass\n",
    constraints:["Không sklearn", "Không chia cho 0", "Hai list phải cùng độ dài và không rỗng"],examples:["binary_metrics([1,1,0],[1,0,0])['recall'] → 0.5"],
    visible:[{name:"Ví dụ cân bằng",code:"m=binary_metrics([1,1,0,0],[1,0,1,0]); assert m=={'accuracy':.5,'precision':.5,'recall':.5,'f1':.5}"}],
    blind:[{name:"Không dự đoán dương",code:"m=binary_metrics([1,0],[0,0]); assert m['precision']==0 and m['f1']==0"},{name:"Input rỗng",code:"\ntry:\n binary_metrics([],[])\n assert False\nexcept ValueError: pass"}],
  },
  {
    id:"conv-valid",domain:"Computer Vision",title:"Convolution 2D valid",level:"Trung bình",
    prompt:"Cài cross-correlation 2D stride 1, không padding cho ma trận và kernel là list lồng nhau. Đây là phép mà thư viện DL thường gọi là convolution.",
    signature:"conv2d_valid(image, kernel)",starter:"def conv2d_valid(image, kernel):\n    # Không dùng scipy, numpy hoặc thư viện xử lý ảnh\n    pass\n",
    constraints:["Kernel không lớn hơn ảnh", "Hàng phải cùng độ dài", "Không lật kernel", "O(H·W·Kh·Kw)"],examples:["conv2d_valid([[1,2],[3,4]], [[1]]) → [[1,2],[3,4]]"],
    visible:[{name:"Kernel 1×1",code:"assert conv2d_valid([[1,2],[3,4]],[[2]])==[[2,4],[6,8]]"},{name:"Tổng vùng",code:"assert conv2d_valid([[1,2,3],[4,5,6],[7,8,9]],[[1,1],[1,1]])==[[12,16],[24,28]]"}],
    blind:[{name:"Kernel chữ nhật",code:"assert conv2d_valid([[1,2,3],[4,5,6]],[[1,0]])==[[1,2],[4,5]]"},{name:"Kernel quá lớn",code:"\ntry:\n conv2d_valid([[1]],[[1,2]])\n assert False\nexcept ValueError: pass"}],
  },
];

type RunResult = { ok: boolean; output: string[]; details?: {name:string;passed:boolean;blind?:boolean;category?:string}[]; error?: string };

export function CodePractice() {
  const [exerciseId,setExerciseId]=useState(exercises[0].id);
  const exercise=exercises.find(item=>item.id===exerciseId) ?? exercises[0];
  const [code,setCode]=useState(exercise.starter);
  const [mode,setMode]=useState<"visible"|"blind">("visible");
  const [status,setStatus]=useState<"idle"|"loading"|"running">("idle");
  const [result,setResult]=useState<RunResult|null>(null);
  const workerRef=useRef<Worker|null>(null);
  const workerReadyRef=useRef(false);
  const timeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(()=>()=>{ workerRef.current?.terminate(); workerReadyRef.current=false; if(timeoutRef.current) clearTimeout(timeoutRef.current); },[]);

  const selectExercise=(id:string)=>{
    const next=exercises.find(item=>item.id===id)!;
    setExerciseId(id); setCode(next.starter); setResult(null); setMode("visible");
  };
  const tests=mode==="visible"
    ? exercise.visible.map(test=>({...test,blind:false}))
    : [...exercise.visible.map(test=>({...test,blind:false})),...exercise.blind.map(test=>({...test,blind:true}))];

  const run=()=>{
    setResult(null);
    if(timeoutRef.current)clearTimeout(timeoutRef.current);
    if(!workerRef.current){workerRef.current=new Worker("/pyodide-worker.js");workerReadyRef.current=false;}
    const worker=workerRef.current; const requestId=crypto.randomUUID();
    const runExerciseId=exercise.id; const runMode=mode;
    let executionStarted=false;
    const startExecution=()=>{
      if(executionStarted)return;
      executionStarted=true;setStatus("running");
      worker.postMessage({type:"run",requestId,code,tests});
      timeoutRef.current=setTimeout(()=>{
        worker.terminate();workerRef.current=null;workerReadyRef.current=false;setStatus("idle");
        setResult({ok:false,output:[],error:"Mã chạy quá 8 giây — kiểm tra vòng lặp vô hạn hoặc độ phức tạp. Thời gian tải Python không tính vào giới hạn này."});
      },8000);
    };
    worker.onmessage=(event)=>{
      if(event.data.type==="ready"){
        workerReadyRef.current=true;startExecution();return;
      }
      if(event.data.type==="runtime-error"){
        worker.terminate();workerRef.current=null;workerReadyRef.current=false;setStatus("idle");
        setResult({ok:false,output:[],error:`Không tải được Python: ${event.data.error}`});return;
      }
      if(event.data.type!=="result"||event.data.requestId!==requestId) return;
      if(timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("idle"); setResult(event.data);
      if(runMode==="blind"&&event.data.details?.every((item:{passed:boolean})=>item.passed)){
        const current=JSON.parse(localStorage.getItem("voai-progress")||"{}");
        current[runExerciseId]={passedAt:new Date().toISOString(),solo:true};
        localStorage.setItem("voai-progress",JSON.stringify(current));
      }
    };
    worker.onerror=()=>{
      if(timeoutRef.current)clearTimeout(timeoutRef.current);
      worker.terminate();workerRef.current=null;workerReadyRef.current=false;setStatus("idle");
      setResult({ok:false,output:[],error:"Web Worker gặp lỗi khi tải hoặc chạy Python."});
    };
    if(workerReadyRef.current)startExecution();else{setStatus("loading");worker.postMessage({type:"init"});}
  };

  const lines=useMemo(()=>Array.from({length:Math.max(12,code.split("\n").length)},(_,i)=>i+1),[code]);
  const passed=result?.details?.filter(item=>item.passed).length??0;
  const total=result?.details?.length??0;

  return (
    <div className="arena-shell">
      <aside className="exercise-list">
        <div><span>BỘ BÀI TẬP MẪU</span><strong>{exercises.length} bài đã mở</strong></div>
        {exercises.map((item,index)=><button className={item.id===exercise.id?"active":""} key={item.id} onClick={()=>selectExercise(item.id)} disabled={status!=="idle"}><span>{String(index+1).padStart(2,"0")}</span><div><strong>{item.title}</strong><small>{item.domain} · {item.level}</small></div></button>)}
        <a href="/roadmap">Xem bài theo lộ trình →</a>
      </aside>
      <section className="exercise-workspace">
        <div className="problem-pane">
          <p className="lab-code">{exercise.domain.toUpperCase()} · {exercise.level.toUpperCase()}</p><h2>{exercise.title}</h2><p>{exercise.prompt}</p>
          <h3>Chữ ký hàm</h3><code className="signature">{exercise.signature}</code><h3>Ràng buộc</h3><ul>{exercise.constraints.map(item=><li key={item}>{item}</li>)}</ul>
          <h3>Ví dụ</h3>{exercise.examples.map(item=><pre key={item}>{item}</pre>)}
          <div className="solo-rule"><strong>SOLO·90</strong><p>Không nhờ AI sinh code, pseudocode hay sửa dòng cụ thể. Chỉ hỏi loại lỗi sau khi đã tự chạy test.</p></div>
        </div>
        <div className="editor-pane">
          <div className="editor-toolbar"><div><button className={mode==="visible"?"active":""} onClick={()=>{setMode("visible");setResult(null)}} disabled={status!=="idle"}>Test công khai</button><button className={mode==="blind"?"active":""} onClick={()=>{setMode("blind");setResult(null)}} disabled={status!=="idle"}>Nộp kiểm tra mù</button></div><button className="reset-code" onClick={()=>{setCode(exercise.starter);setResult(null)}} disabled={status!=="idle"}>Khôi phục</button></div>
          <p className="hidden-note">Kiểm tra mù chỉ giấu ca kiểm tra khỏi giao diện trước khi chạy. Nội dung vẫn nằm trong mã phía client và có thể xem qua source/bundle; đây là công cụ luyện tập, không phải cơ chế bảo mật.</p>
          <div className="code-editor"><div className="line-numbers">{lines.map(line=><span key={line}>{line}</span>)}</div><textarea spellCheck={false} value={code} onChange={e=>setCode(e.target.value)} aria-label="Trình soạn thảo mã Python" disabled={status!=="idle"}/></div>
          <div className="runbar" aria-live="polite"><span>{status==="loading"?"Đang tải Python (~10 MB); chưa tính thời gian chạy…":status==="running"?"Đang chạy trong Web Worker…":"Python 3 · Web Worker · mã chạy tối đa 8 giây"}</span><button onClick={run} disabled={status!=="idle"}>{mode==="blind"?"Nộp bài":"Chạy test"} <b>▶</b></button></div>
          <div className={`test-result ${result?(result.ok&&passed===total?"pass":"fail"):""}`}><div className="result-heading"><strong>{!result?"KẾT QUẢ SẼ HIỆN Ở ĐÂY":result.ok?`${passed}/${total} test đạt`:"KHÔNG THỂ CHẤM"}</strong>{result&&total>0&&<span>{Math.round(passed/total*100)} điểm</span>}</div>{result?.output?.length?<pre>{result.output.join("\n")}</pre>:null}{result?.error?<p>{result.error.split("\n").slice(-3).join("\n")}</p>:null}{result?.details?.map((item,index)=><div className="test-row" key={`${item.name}-${index}`}><span>{item.passed?"✓":"×"}</span><strong>{item.blind?"Ca kiểm tra mù":item.name}</strong><small>{item.passed?"Đạt":item.category}</small></div>)}</div>
        </div>
      </section>
      <section className="ai-contract"><div><span>COACH·10</span><h2>Nếu thật sự cần kiểm chứng bằng AI</h2></div><ol><li>Tự chạy ít nhất một lần và ghi giả thuyết lỗi.</li><li>Chỉ gửi code cùng câu hỏi: “Lập luận của tôi đúng hay chưa?”</li><li>Yêu cầu AI chỉ trả: đúng / loại lỗi / một câu hỏi gợi mở.</li><li>Nếu đã xem lời giải, bài cũ không còn tính; làm biến thể mới.</li></ol><button onClick={()=>navigator.clipboard?.writeText("Chỉ kiểm tra mức đúng của lập luận hoặc code dưới đây. Không viết code, pseudocode, đáp án, không chỉ ra dòng cần thay. Nếu sai, chỉ nêu nhóm lỗi và hỏi duy nhất một câu gợi mở.")}>Sao chép prompt kiểm chứng</button></section>
    </div>
  );
}
