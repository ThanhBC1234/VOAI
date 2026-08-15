"use client";

import { useEffect, useMemo, useState } from "react";
import katex from "katex";
import { InternalLink } from "./InternalLink";

export interface LessonViewModel {
  id:string; title:string; domain:string; category:string; syllabus:string; prerequisites:string[]; outcomes:string[];
  intuition:string; math:string[]; steps:string[]; whenToUse:string[]; failures:string[]; complexity:string[];
  quiz:{question:string;choices?:string[];answer:string;explanation:string}[];
  coding:{title:string;brief:string;signature:string;requirements:string[];acceptance:string[];aiBoundary?:string};
  hiddenCount:number; project:string;
}

function MathText({ children }: { children: string }) {
  return <>{children.split(/(\$[^$]+\$)/g).filter(Boolean).map((part, index) => {
    if (!(part.startsWith("$") && part.endsWith("$"))) return <span key={`${index}-${part}`}>{part}</span>;
    const formula = part.slice(1, -1);
    return <span
      className="lesson-formula"
      aria-label={formula}
      key={`${index}-${formula}`}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(formula, {
          throwOnError: false,
          strict: "warn",
          trust: false,
        }),
      }}
    />;
  })}</>;
}

function QuizCard({item,index}:{item:LessonViewModel["quiz"][number];index:number}){
  const [choice,setChoice]=useState<string|null>(null);const [revealed,setRevealed]=useState(false);const correct=choice===item.answer;
  return <article className={`quiz-card ${revealed?(correct?"correct":"incorrect"):""}`}><span>CÂU {index+1}</span><strong>{item.question}</strong>{item.choices?<div className="quiz-choices">{item.choices.map(option=><button className={choice===option?"selected":""} onClick={()=>{setChoice(option);setRevealed(false)}} key={option}>{option}</button>)}</div>:<textarea value={choice??""} onChange={e=>{setChoice(e.target.value);setRevealed(false)}} placeholder="Tự viết câu trả lời trước khi mở đáp án…"/>}<button className="reveal-answer" disabled={!choice?.trim()} onClick={()=>setRevealed(true)}>{revealed?"Đã đối chiếu":"Đối chiếu sau khi trả lời"}</button>{revealed&&<div className="answer"><b>{item.choices?(correct?"✓ Đúng":"× Chưa đúng"):"Đáp án tham chiếu"}</b><p>{item.answer}</p><small>{item.explanation}</small></div>}</article>;
}

export function LessonsExplorer({lessons}:{lessons:LessonViewModel[]}){
  const [selectedId,setSelectedId]=useState(lessons[0]?.id??"");const [query,setQuery]=useState("");const [domain,setDomain]=useState("Tất cả");const [section,setSection]=useState("overview");
  useEffect(()=>{const timer=window.setTimeout(()=>{const requested=new URLSearchParams(window.location.search).get("lesson");if(requested&&lessons.some(item=>item.id===requested))setSelectedId(requested)},0);return()=>window.clearTimeout(timer)},[lessons]);
  const domains=["Tất cả",...Array.from(new Set(lessons.map(item=>item.domain)))];
  const filtered=useMemo(()=>lessons.filter(item=>(domain==="Tất cả"||item.domain===domain)&&`${item.title} ${item.syllabus} ${item.outcomes.join(" ")}`.toLowerCase().includes(query.toLowerCase())),[lessons,domain,query]);
  const lesson=lessons.find(item=>item.id===selectedId)??filtered[0]??lessons[0];
  const pretrainedOrLarge=/\b(?:whisper|qwen[-\s]?audio|voxtral|hubert|clip|diffusion|bert|yolo|detr|ssd)\b/i.test(`${lesson?.title??""} ${lesson?.syllabus??""}`);
  const pick=(id:string)=>{setSelectedId(id);setSection("overview")};
  if(!lesson)return null;
  return <section className="lessons-shell"><aside className="lesson-catalog"><div className="catalog-tools"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm regression, attention…"/><select value={domain} onChange={e=>setDomain(e.target.value)}>{domains.map(item=><option key={item}>{item}</option>)}</select></div><div className="catalog-count"><span>{filtered.length}/{lessons.length} bài</span><span>Không đặt lời giải cạnh bài</span></div><div className="catalog-list">{filtered.map(item=><button key={item.id} className={item.id===lesson.id?"active":""} onClick={()=>pick(item.id)}><span>{String(lessons.indexOf(item)+1).padStart(2,"0")}</span><div><strong>{item.title}</strong><small>{item.domain} · {item.category.includes("Both")?"Theory + Practice":item.category}</small></div></button>)}</div></aside><article className="lesson-reader"><header><p className="lab-code">{lesson.domain.toUpperCase()} · {lesson.category.toUpperCase()}</p><h1>{lesson.title}</h1><p>{lesson.intuition}</p><div className="lesson-outcomes">{lesson.outcomes.map(item=><span key={item}>✓ {item}</span>)}</div></header><nav className="lesson-sections" aria-label="Mục bài giảng">{[["overview","Hiểu"],["build","Tự triển khai"],["failure","Lỗi & độ phức tạp"],["quiz","Kiểm tra"],["challenge","Bài code"]].map(([id,label])=><button key={id} onClick={()=>setSection(id)} className={section===id?"active":""}>{label}</button>)}</nav>{section==="overview"&&<div className="lesson-content"><section><span className="content-index">01 · TIÊN QUYẾT</span><ul>{lesson.prerequisites.map(item=><li key={item}>{item}</li>)}</ul></section><section><span className="content-index">02 · TOÁN VÀ KÝ HIỆU</span><div className="math-stack">{lesson.math.map(item=><p key={item}><MathText>{item}</MathText></p>)}</div></section><section><span className="content-index">03 · KHI NÀO DÙNG</span><ul>{lesson.whenToUse.map(item=><li key={item}>{item}</li>)}</ul></section><section className="project-link"><span className="content-index">KẾT NỐI DỰ ÁN</span><p>{lesson.project}</p></section></div>}{section==="build"&&<div className="lesson-content"><section><span className="content-index">{pretrainedOrLarge?"TRACE → PIPELINE, EVAL & ABLATION":"TRACE → CODE PHẦN LÕI"}</span><ol className="build-steps">{lesson.steps.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol><div className="build-rule"><strong>Quy tắc bắt buộc</strong><p>{pretrainedOrLarge?"Được dùng model, weights và thư viện chính thức; tự viết pipeline dữ liệu/inference, metric, kiểm tra shape/schema, error analysis và ít nhất một ablation. Không nhờ AI sinh phần triển khai cốt lõi.":"Cài bản nhỏ của phần lõi trước khi gọi implementation có sẵn. Dùng seed cố định, tính tay một ví dụ toy và so output từng bước. Không xem lời giải cạnh editor."}</p></div></section></div>}{section==="failure"&&<div className="lesson-content"><section><span className="content-index">FAILURE MODES</span><div className="failure-list">{lesson.failures.map((item,index)=><article key={item}><span>F{index+1}</span><p>{item}</p></article>)}</div></section><section><span className="content-index">ĐỘ PHỨC TẠP & TÀI NGUYÊN</span><ul>{lesson.complexity.map(item=><li key={item}>{item}</li>)}</ul></section></div>}{section==="quiz"&&<div className="lesson-content"><section><span className="content-index">RETRIEVAL CHECK · KHÔNG AI</span><p className="section-note">Trả lời trước khi mở phần đối chiếu. Nếu sai, giải thích lại bằng lời và làm một biến thể; không chỉ ghi nhớ đáp án.</p><div className="quiz-grid">{lesson.quiz.map((item,index)=><QuizCard key={`${lesson.id}-${index}`} item={item} index={index}/>)}</div></section></div>}{section==="challenge"&&<div className="lesson-content"><section className="coding-brief"><div><span className="content-index">SOLO·90 CODING CHALLENGE</span><h2>{lesson.coding.title}</h2><p>{lesson.coding.brief}</p><pre>{lesson.coding.signature}</pre></div><div><h3>Yêu cầu</h3><ul>{lesson.coding.requirements.map(item=><li key={item}>{item}</li>)}</ul><h3>Điều kiện đạt</h3><ul>{lesson.coding.acceptance.map(item=><li key={item}>{item}</li>)}</ul><p className="hidden-note"><strong>{lesson.hiddenCount} nhóm tình huống kiểm tra mù</strong> dùng như checklist chấm thủ công. Đây không phải test bí mật phía máy chủ.</p><InternalLink className="primary-button" href="/practice">Mở Code Arena →</InternalLink></div></section></div>}</article></section>;
}
