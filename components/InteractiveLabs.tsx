"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InternalLink } from "./InternalLink";

type LabId = "gradient" | "knn" | "convolution" | "attention" | "audio" | "metrics";

const labs: { id: LabId; label: string; code: string }[] = [
  { id: "gradient", label: "Gradient descent", code: "GD" },
  { id: "knn", label: "k-NN", code: "KNN" },
  { id: "convolution", label: "Convolution", code: "CNN" },
  { id: "attention", label: "Attention", code: "ATT" },
  { id: "audio", label: "Wave → DFT", code: "AUD" },
  { id: "metrics", label: "Metrics", code: "EVAL" },
];

function PredictionBox({ prompt }: { prompt: string }) {
  const [value, setValue] = useState("");
  const [locked, setLocked] = useState(false);
  return (
    <div className="prediction-box">
      <span>DỰ ĐOÁN TRƯỚC KHI CHẠY</span>
      <p>{prompt}</p>
      <div>
        <input value={value} onChange={(event) => { setValue(event.target.value); setLocked(false); }} placeholder="Viết dự đoán ngắn của bạn…" disabled={locked} />
        <button onClick={() => setLocked(Boolean(value.trim()))}>{locked ? "Đã khóa" : "Khóa dự đoán"}</button>
      </div>
    </div>
  );
}

function GradientLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [theta, setTheta] = useState(-3.5);
  const [learningRate, setLearningRate] = useState(0.15);
  const [history, setHistory] = useState<number[]>([-3.5]);
  const loss = (value: number) => (value - 2) ** 2 + 1;
  const gradient = 2 * (theta - 2);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (!context) return;
    const width = 660, height = 310, pad = 36;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#fffdf7"; context.fillRect(0, 0, width, height);
    context.strokeStyle = "#d9ddd4"; context.lineWidth = 1;
    for (let i = 0; i <= 6; i += 1) {
      const x = pad + i * ((width - pad * 2) / 6);
      context.beginPath(); context.moveTo(x, pad); context.lineTo(x, height - pad); context.stroke();
    }
    const toX = (value: number) => pad + ((value + 5) / 10) * (width - pad * 2);
    const toY = (value: number) => height - pad - (value / 52) * (height - pad * 2);
    context.strokeStyle = "#183d36"; context.lineWidth = 3; context.beginPath();
    for (let pixel = 0; pixel <= 300; pixel += 1) {
      const value = -5 + (pixel / 300) * 10;
      const x = toX(value), y = toY(loss(value));
      if (pixel === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.stroke();
    history.forEach((value, index) => {
      context.fillStyle = index === history.length - 1 ? "#ff6e50" : `rgba(127, 200, 62, ${0.25 + index / Math.max(history.length, 1) * .55})`;
      context.beginPath(); context.arc(toX(value), toY(loss(value)), index === history.length - 1 ? 7 : 4, 0, Math.PI * 2); context.fill();
    });
    context.fillStyle = "#51655f"; context.font = "12px monospace";
    context.fillText("θ = -5", pad, height - 11); context.fillText("θ = 5", width - pad - 38, height - 11); context.fillText("J(θ)", 8, 20);
  }, [history, theta]);

  const step = () => {
    const next = theta - learningRate * gradient;
    setTheta(next); setHistory((current) => [...current, next].slice(-18));
  };
  const reset = () => { setTheta(-3.5); setHistory([-3.5]); };

  return (
    <section className="lab-panel">
      <div className="lab-explainer">
        <p className="lab-code">LAB·GD</p><h2>Đi xuống bề mặt mất mát</h2>
        <p>Ta tối ưu <code>J(θ) = (θ − 2)² + 1</code>. Đạo hàm cho biết hướng dốc lên; vì vậy thuật toán đi theo hướng ngược lại.</p>
        <div className="formula">θ<sub>mới</sub> = θ − η · ∇J(θ)</div>
        <label>Tốc độ học η <strong>{learningRate.toFixed(2)}</strong><input type="range" min="0.02" max="1.05" step="0.01" value={learningRate} onChange={(event) => setLearningRate(Number(event.target.value))} /></label>
        <div className="lab-stats"><div><span>θ hiện tại</span><strong>{theta.toFixed(4)}</strong></div><div><span>Gradient</span><strong>{gradient.toFixed(4)}</strong></div><div><span>Loss</span><strong>{loss(theta).toFixed(4)}</strong></div></div>
        <div className="lab-actions"><button onClick={step}>Chạy 1 bước →</button><button className="ghost" onClick={reset}>Đặt lại</button></div>
      </div>
      <div className="lab-stage"><PredictionBox prompt="Với η hiện tại, θ sẽ tiến gần 2 hay vượt qua 2 sau bước tiếp theo?" /><canvas ref={canvas} width="660" height="310" aria-label="Đồ thị hàm mất mát và lịch sử gradient descent" /></div>
    </section>
  );
}

type Point = { x: number; y: number; label: "A" | "B" };
const knnPoints: Point[] = [
  {x:.13,y:.25,label:"A"},{x:.22,y:.45,label:"A"},{x:.32,y:.31,label:"A"},{x:.27,y:.68,label:"A"},{x:.43,y:.55,label:"A"},
  {x:.61,y:.22,label:"B"},{x:.69,y:.42,label:"B"},{x:.81,y:.34,label:"B"},{x:.72,y:.68,label:"B"},{x:.88,y:.76,label:"B"},
];

function KnnLab() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [query, setQuery] = useState({ x: .52, y: .48 });
  const [k, setK] = useState(3);
  const nearest = useMemo(() => knnPoints.map((point) => ({...point, distance: Math.hypot(point.x-query.x, point.y-query.y)})).sort((a,b)=>a.distance-b.distance).slice(0,k), [query,k]);
  const votesA = nearest.filter((item)=>item.label==="A").length;
  const result = votesA > k / 2 ? "A" : "B";
  useEffect(() => {
    const context = canvas.current?.getContext("2d"); if (!context) return;
    const width=660,height=310,pad=25; context.fillStyle="#fffdf7";context.fillRect(0,0,width,height);
    context.strokeStyle="#e1e1d7"; for(let i=0;i<11;i++){const x=pad+i*(width-pad*2)/10;context.beginPath();context.moveTo(x,pad);context.lineTo(x,height-pad);context.stroke();}
    const xy=(x:number,y:number)=>[pad+x*(width-pad*2),height-pad-y*(height-pad*2)];
    nearest.forEach((point)=>{const [x1,y1]=xy(query.x,query.y),[x2,y2]=xy(point.x,point.y);context.strokeStyle="rgba(16,42,38,.25)";context.setLineDash([5,5]);context.beginPath();context.moveTo(x1,y1);context.lineTo(x2,y2);context.stroke();});context.setLineDash([]);
    knnPoints.forEach((point)=>{const [x,y]=xy(point.x,point.y);context.fillStyle=point.label==="A"?"#4aa8d8":"#ff795c";context.beginPath();context.arc(x,y,9,0,Math.PI*2);context.fill();context.fillStyle="#fff";context.font="700 10px sans-serif";context.textAlign="center";context.fillText(point.label,x,y+3.5);});
    const [qx,qy]=xy(query.x,query.y);context.strokeStyle="#102a26";context.lineWidth=3;context.beginPath();context.arc(qx,qy,13,0,Math.PI*2);context.stroke();context.fillStyle="#102a26";context.fillText("?",qx,qy+4);
  },[query,nearest]);
  const moveQuery = (event: React.PointerEvent<HTMLCanvasElement>) => { const rect=event.currentTarget.getBoundingClientRect();setQuery({x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,1-(event.clientY-rect.top)/rect.height))}); };
  return <section className="lab-panel"><div className="lab-explainer"><p className="lab-code">LAB·KNN</p><h2>Hàng xóm bỏ phiếu</h2><p>k-NN không “học” tham số. Nó lưu dữ liệu và phân loại điểm mới theo nhãn chiếm đa số trong <em>k</em> điểm gần nhất.</p><label>Số hàng xóm k <strong>{k}</strong><input type="range" min="1" max="9" step="2" value={k} onChange={(e)=>setK(Number(e.target.value))}/></label><div className="lab-stats"><div><span>Phiếu A</span><strong>{votesA}</strong></div><div><span>Phiếu B</span><strong>{k-votesA}</strong></div><div><span>Dự đoán</span><strong className={result==="A"?"blue":"coral"}>{result}</strong></div></div><p className="lab-note">Thử đặt điểm hỏi gần biên và tăng k. Khi nào lớp dự đoán đổi?</p></div><div className="lab-stage"><PredictionBox prompt="Nếu tăng k, quyết định ở biên sẽ ổn định hơn hay nhạy hơn với nhiễu cục bộ?"/><canvas ref={canvas} width="660" height="310" onPointerDown={moveQuery} aria-label="Mặt phẳng dữ liệu k-NN; nhấn để di chuyển điểm cần phân loại"/><small>Nhấn vào biểu đồ để di chuyển điểm “?”.</small></div></section>;
}

const kernels = {
  "Dò cạnh": [[-1,-1,-1],[-1,8,-1],[-1,-1,-1]],
  "Làm sắc": [[0,-1,0],[-1,5,-1],[0,-1,0]],
  "Làm mờ": [[1/9,1/9,1/9],[1/9,1/9,1/9],[1/9,1/9,1/9]],
};

function ConvolutionLab() {
  const [image, setImage] = useState(() => Array.from({length:5},(_,row)=>Array.from({length:5},(_,col)=>(row===2||col===2)?1:0)));
  const [kernelName,setKernelName]=useState<keyof typeof kernels>("Dò cạnh"); const kernel=kernels[kernelName];
  const output=useMemo(()=>Array.from({length:3},(_,row)=>Array.from({length:3},(_,col)=>kernel.reduce((sum,line,kr)=>sum+line.reduce((inside,value,kc)=>inside+value*image[row+kr][col+kc],0),0))),[image,kernel]);
  const toggle=(row:number,col:number)=>setImage(current=>current.map((line,r)=>line.map((value,c)=>r===row&&c===col?(value?0:1):value)));
  return <section className="lab-panel"><div className="lab-explainer"><p className="lab-code">LAB·CNN</p><h2>Một kernel, nhiều đặc trưng</h2><p>Convolution trượt một ma trận nhỏ trên ảnh. Mỗi ô đầu ra là tổng tích từng phần tử giữa vùng ảnh và kernel.</p><select value={kernelName} onChange={(e)=>setKernelName(e.target.value as keyof typeof kernels)}>{Object.keys(kernels).map(name=><option key={name}>{name}</option>)}</select><div className="kernel-grid">{kernel.flat().map((v,i)=><span key={i}>{Number.isInteger(v)?v:v.toFixed(2)}</span>)}</div><div className="formula">Y[i,j] = Σₘ Σₙ X[i+m,j+n]K[m,n]</div></div><div className="lab-stage"><PredictionBox prompt="Với kernel hiện tại, vùng phẳng hay vùng thay đổi sáng–tối sẽ cho trị tuyệt đối lớn hơn?"/><div className="matrix-pair"><div><strong>Ảnh 5×5 — nhấn để đổi pixel</strong><div className="pixel-grid">{image.flatMap((line,row)=>line.map((v,col)=><button key={`${row}-${col}`} className={v?"on":""} onClick={()=>toggle(row,col)} aria-label={`Pixel hàng ${row+1} cột ${col+1}: ${v}`}>{v}</button>))}</div></div><span className="matrix-arrow">∗ →</span><div><strong>Feature map 3×3</strong><div className="output-grid">{output.flat().map((v,i)=><span key={i} style={{background:`rgba(183,243,107,${Math.min(1,Math.abs(v)/4+.08)})`}}>{v.toFixed(1)}</span>)}</div></div></div></div></section>;
}

const tokenNames=["AI","học","từ","dữ liệu"];
const tokenVectors=[[1,.2,.1],[.7,.5,.2],[.1,.8,.3],[.3,.5,1]];
function softmax(values:number[]){const max=Math.max(...values);const exps=values.map(v=>Math.exp(v-max));const total=exps.reduce((a,b)=>a+b,0);return exps.map(v=>v/total);}
function AttentionLab(){const [temperature,setTemperature]=useState(1);const matrix=useMemo(()=>tokenVectors.map(q=>softmax(tokenVectors.map(k=>q.reduce((sum,value,index)=>sum+value*k[index],0)/Math.sqrt(3)/temperature))),[temperature]);return <section className="lab-panel"><div className="lab-explainer"><p className="lab-code">LAB·ATT</p><h2>Mỗi token nhìn vào đâu?</h2><p>Attention biến độ tương đồng query–key thành phân phối trọng số. Nhiệt độ thấp làm phân phối “sắc” hơn; nhiệt độ cao dàn đều sự chú ý.</p><label>Nhiệt độ τ <strong>{temperature.toFixed(2)}</strong><input type="range" min="0.2" max="2.5" step="0.05" value={temperature} onChange={e=>setTemperature(Number(e.target.value))}/></label><div className="formula">Attention(Q,K,V) = softmax(QKᵀ / √d) V</div></div><div className="lab-stage"><PredictionBox prompt="Giảm nhiệt độ sẽ làm entropy của mỗi hàng attention tăng hay giảm?"/><div className="attention-wrap"><div className="attention-grid" style={{gridTemplateColumns:`90px repeat(${tokenNames.length}, 1fr)`}}><span></span>{tokenNames.map(t=><strong key={`h-${t}`}>{t}</strong>)}{matrix.flatMap((row,r)=>[<strong key={`r-${r}`}>{tokenNames[r]}</strong>,...row.map((value,c)=><span key={`${r}-${c}`} style={{background:`rgba(48,123,89,${.08+value*.92})`,color:value>.48?"white":"#102a26"}}>{value.toFixed(2)}</span>)])}</div><small>Mỗi hàng có tổng bằng 1. Hàng là query, cột là key.</small></div></div></section>}

function AudioLab(){
  const canvas=useRef<HTMLCanvasElement>(null);
  const [frequency,setFrequency]=useState(6);
  const [noise,setNoise]=useState(0);
  useEffect(()=>{
    const context=canvas.current?.getContext("2d");
    if(!context)return;
    const w=660,h=330,left=28,right=20;
    const sampleRate=64,sampleCount=128,duration=sampleCount/sampleRate;
    const waveformMid=88,waveformScale=32,spectrumBase=290,spectrumHeight=92;
    const samples=Array.from({length:sampleCount},(_,index)=>
      Math.sin(2*Math.PI*frequency*index/sampleRate)+noise*Math.sin(2*Math.PI*17*index/sampleRate)
    );
    const oneSidedBins=sampleCount/2+1;
    const magnitudes=Array.from({length:oneSidedBins},(_,bin)=>{
      const real=samples.reduce((sum,value,index)=>sum+value*Math.cos(2*Math.PI*bin*index/sampleCount),0);
      const imaginary=samples.reduce((sum,value,index)=>sum-value*Math.sin(2*Math.PI*bin*index/sampleCount),0);
      const edgeBin=bin===0||bin===sampleCount/2;
      return Math.hypot(real,imaginary)*(edgeBin?1:2)/sampleCount;
    });

    context.fillStyle="#fffdf7";context.fillRect(0,0,w,h);
    context.strokeStyle="#d6dbd2";context.lineWidth=1;context.beginPath();
    context.moveTo(left,waveformMid);context.lineTo(w-right,waveformMid);
    context.moveTo(left,spectrumBase);context.lineTo(w-right,spectrumBase);context.stroke();

    context.strokeStyle="#ff795c";context.lineWidth=2;context.beginPath();
    samples.forEach((value,index)=>{
      const x=left+index/(sampleCount-1)*(w-left-right);
      const y=waveformMid-value*waveformScale;
      if(index===0)context.moveTo(x,y);else context.lineTo(x,y);
    });
    context.stroke();

    const slotWidth=(w-left-right)/oneSidedBins;
    magnitudes.forEach((magnitude,bin)=>{
      const barHeight=Math.min(magnitude/2,1)*spectrumHeight;
      context.fillStyle=bin*sampleRate/sampleCount===17?"#ff795c":"#307b59";
      context.fillRect(left+bin*slotWidth+0.5,spectrumBase-barHeight,Math.max(1,slotWidth-1),barHeight);
    });

    context.fillStyle="#536760";context.font="11px monospace";context.textAlign="left";
    context.fillText("WAVEFORM · BIÊN ĐỘ TƯƠNG ĐỐI",left,18);
    context.fillText(`0 s`,left,157);context.textAlign="right";context.fillText(`${duration.toFixed(1)} s`,w-right,157);
    context.textAlign="left";context.fillText("PHỔ BIÊN ĐỘ MỘT PHÍA (DFT)",left,181);
    [0,8,16,24,32].forEach((hz)=>{
      const x=left+(hz/(sampleRate/2))*(w-left-right);
      context.strokeStyle="#aeb9b1";context.beginPath();context.moveTo(x,spectrumBase);context.lineTo(x,spectrumBase+4);context.stroke();
      context.textAlign=hz===0?"left":hz===32?"right":"center";context.fillText(`${hz} Hz`,x,309);
    });
  },[frequency,noise]);
  return <section className="lab-panel"><div className="lab-explainer"><p className="lab-code">LAB·AUD</p><h2>Từ dao động đến tần số</h2><p>DFT hỏi: “Tín hiệu này chứa bao nhiêu của mỗi sóng sin/cos?” Đỉnh phổ xuất hiện tại tần số tạo nên waveform.</p><label>Tần số chính <strong>{frequency} Hz</strong><input type="range" min="1" max="20" step="1" value={frequency} onChange={e=>setFrequency(Number(e.target.value))}/></label><label>Biên độ nhiễu 17 Hz <strong>{noise.toFixed(1)}</strong><input type="range" min="0" max="1" step="0.1" value={noise} onChange={e=>setNoise(Number(e.target.value))}/></label><div className="formula">X[k] = Σₙ x[n]e<sup>−j2πkn/N</sup></div></div><div className="lab-stage"><PredictionBox prompt="Khi thêm nhiễu 17 Hz, phổ sẽ xuất hiện thêm đỉnh ở đâu?"/><canvas ref={canvas} width="660" height="330" aria-label="Waveform lấy mẫu ở 64 mẫu mỗi giây và phổ DFT một phía từ 0 đến 32 Hz"/><small>128 mẫu · 64 mẫu/giây · 2,0 giây · độ phân giải phổ 0,5 Hz</small></div></section>
}

function MetricsLab(){const [values,setValues]=useState({tp:32,fp:8,fn:12,tn:48});const set=(key:keyof typeof values,value:number)=>setValues(current=>({...current,[key]:Math.max(0,value||0)}));const total=Object.values(values).reduce((a,b)=>a+b,0)||1;const precision=values.tp/(values.tp+values.fp||1),recall=values.tp/(values.tp+values.fn||1),accuracy=(values.tp+values.tn)/total,f1=2*precision*recall/(precision+recall||1);return <section className="lab-panel"><div className="lab-explainer"><p className="lab-code">LAB·EVAL</p><h2>Một ma trận, bốn góc nhìn</h2><p>Accuracy có thể đánh lừa khi lớp mất cân bằng. Precision hỏi dự đoán dương có đáng tin; recall hỏi ta tìm được bao nhiêu ca dương thật.</p><div className="lab-stats metric-stats"><div><span>Accuracy</span><strong>{(accuracy*100).toFixed(1)}%</strong></div><div><span>Precision</span><strong>{(precision*100).toFixed(1)}%</strong></div><div><span>Recall</span><strong>{(recall*100).toFixed(1)}%</strong></div><div><span>F1</span><strong>{(f1*100).toFixed(1)}%</strong></div></div></div><div className="lab-stage"><PredictionBox prompt="Nếu giữ TP nhưng tăng FN, precision hay recall sẽ giảm?"/><div className="confusion"><span></span><strong>Dự đoán +</strong><strong>Dự đoán −</strong><strong>Thật +</strong>{(["tp","fn"] as const).map(key=><label key={key} className={key==="tp"?"good":"warn"}><small>{key.toUpperCase()}</small><input type="number" value={values[key]} onChange={e=>set(key,Number(e.target.value))}/></label>)}<strong>Thật −</strong>{(["fp","tn"] as const).map(key=><label key={key} className={key==="tn"?"good":"warn"}><small>{key.toUpperCase()}</small><input type="number" value={values[key]} onChange={e=>set(key,Number(e.target.value))}/></label>)}</div></div></section>}

export function InteractiveLabs() {
  const [active, setActive] = useState<LabId>("gradient");
  return (
    <div className="labs-shell">
      <div className="lab-tabs" role="tablist" aria-label="Chọn mô phỏng">
        {labs.map((lab) => <button key={lab.id} className={active===lab.id?"active":""} onClick={()=>setActive(lab.id)} role="tab" aria-selected={active===lab.id}><span>{lab.code}</span>{lab.label}</button>)}
      </div>
      {active === "gradient" && <GradientLab />}
      {active === "knn" && <KnnLab />}
      {active === "convolution" && <ConvolutionLab />}
      {active === "attention" && <AttentionLab />}
      {active === "audio" && <AudioLab />}
      {active === "metrics" && <MetricsLab />}
      <div className="lab-challenge"><span>SAU KHI THỬ</span><strong>Viết lại quy tắc cập nhật bằng lời của bạn, rồi tự code phiên bản NumPy trong khu Chấm bài.</strong><InternalLink href="/practice">Mở bài tự code →</InternalLink></div>
    </div>
  );
}
