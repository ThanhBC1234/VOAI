"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RichText } from "./RichText";
import { InternalLink } from "./InternalLink";
import type { LessonDeepTheory } from "../content/lesson-theory/types";
import type { LessonPractice } from "../content/lesson-practice/types";
import { loadLessonDetails } from "../lib/lesson-theory-details";
import { DeepTheoryContent } from "./DeepTheoryContent";
import { LessonPracticalContent } from "./LessonPracticalContent";

export interface LessonViewModel {
  id:string; title:string; domain:string; category:string; syllabus:string; prerequisites:string[]; outcomes:string[];
  intuition:string; math:string[]; steps:string[]; whenToUse:string[]; failures:string[]; complexity:string[];
  quiz:{question:string;choices?:string[];answer:string;explanation:string}[];
  coding:{title:string;brief:string;signature:string;requirements:string[];acceptance:string[];aiBoundary?:string};
  hiddenCount:number; project:string;
}

// Kết xuất `$…$`, `**đậm**` và `` `mã` `` — dùng chung với trang Toán và Lý thuyết.
const MathText = RichText;

function QuizCard({item,index}:{item:LessonViewModel["quiz"][number];index:number}){
  const [choice,setChoice]=useState<string|null>(null);const [revealed,setRevealed]=useState(false);const correct=choice===item.answer;
  return <article className={`quiz-card ${revealed?(correct?"correct":"incorrect"):""}`}><span>CÂU {index+1}</span><strong>{item.question}</strong>{item.choices?<div className="quiz-choices">{item.choices.map(option=><button className={choice===option?"selected":""} onClick={()=>{setChoice(option);setRevealed(false)}} key={option}>{option}</button>)}</div>:<textarea value={choice??""} onChange={e=>{setChoice(e.target.value);setRevealed(false)}} placeholder="Tự viết câu trả lời trước khi mở đáp án…"/>}<button className="reveal-answer" disabled={!choice?.trim()} onClick={()=>setRevealed(true)}>{revealed?"Đã đối chiếu":"Đối chiếu sau khi trả lời"}</button>{revealed&&<div className="answer"><b>{item.choices?(correct?"✓ Đúng":"× Chưa đúng"):"Đáp án tham chiếu"}</b><p>{item.answer}</p><small>{item.explanation}</small></div>}</article>;
}

function TheoryLoadState({error,onRetry}:{error:string;onRetry:()=>void}){
  return (
    <section className="deep-theory-opening" aria-live="polite" aria-busy={!error}>
      <h3 className="content-index">03 · LÝ THUYẾT MỞ RỘNG</h3>
      {error ? (
        <><p className="deep-theory-reading">{error}</p><button type="button" className="reveal-answer" onClick={onRetry}>Thử tải lại</button></>
      ) : (
        <p className="deep-theory-reading">Đang tải lý thuyết chi tiết của bài này…</p>
      )}
    </section>
  );
}

function PracticeLoadState({error,onRetry}:{error:string;onRetry:()=>void}){
  return (
    <div className="lesson-content">
      <section className="practice-scenario" aria-live="polite" aria-busy={!error}>
        <span className="content-index">VÍ DỤ THỰC TẾ · CODE · MINH HỌA</span>
        {error ? (
          <><p>{error}</p><button type="button" className="reveal-answer" onClick={onRetry}>Thử tải lại</button></>
        ) : (
          <p>Đang tải tình huống, code và mini-lab của bài này…</p>
        )}
      </section>
    </div>
  );
}

export function LessonsExplorer({lessons,initialTheory,initialPractice}:{lessons:LessonViewModel[];initialTheory:LessonDeepTheory;initialPractice:LessonPractice}){
  const [selectedId,setSelectedId]=useState(lessons[0]?.id??"");const [query,setQuery]=useState("");const [domain,setDomain]=useState("Tất cả");const [section,setSection]=useState("practice");
  const [theoryById,setTheoryById]=useState<Record<string,LessonDeepTheory>>({[initialTheory.lessonId]:initialTheory});
  const [practiceById,setPracticeById]=useState<Record<string,LessonPractice>>(()=>({[initialPractice.lessonId]:initialPractice}));
  const [theoryError,setTheoryError]=useState<{lessonId:string;message:string}|null>(null);
  const [theoryRetry,setTheoryRetry]=useState(0);
  const clearTheoryErrorFor=useCallback((id:string)=>{
    setTheoryError((current)=>current?.lessonId===id?null:current);
  },[]);

  /** Ghi `?lesson=` mà giữ nguyên base path và mọi query khác (LESSON-P2-01). */
  const syncUrl=useCallback((id:string,mode:"push"|"replace")=>{
    if(typeof window==="undefined")return;
    const url=new URL(window.location.href);
    if(url.searchParams.get("lesson")===id)return;
    url.searchParams.set("lesson",id);
    window.history[mode==="push"?"pushState":"replaceState"]({lesson:id},"",url);
  },[]);

  // Deep link lúc vào trang, và back/forward của trình duyệt.
  useEffect(()=>{
    const apply=()=>{
      const requested=new URLSearchParams(window.location.search).get("lesson");
      if(requested&&lessons.some(item=>item.id===requested)){
        clearTheoryErrorFor(requested);
        setSelectedId(requested);
      }
    };
    const timer=window.setTimeout(apply,0);
    window.addEventListener("popstate",apply);
    return()=>{window.clearTimeout(timer);window.removeEventListener("popstate",apply)};
  },[clearTheoryErrorFor,lessons]);

  const domains=["Tất cả",...Array.from(new Set(lessons.map(item=>item.domain)))];
  const filtered=useMemo(()=>lessons.filter(item=>(domain==="Tất cả"||item.domain===domain)&&`${item.title} ${item.syllabus} ${item.outcomes.join(" ")}`.toLowerCase().includes(query.toLowerCase())),[lessons,domain,query]);

  // Bài đang đọc phải luôn thuộc tập đã lọc; nếu không thì lùi về bài đầu của
  // tập đó một cách xác định. Khi bộ lọc rỗng thì không render reader.
  const lesson=filtered.find(item=>item.id===selectedId)??filtered[0]??null;
  const lessonId=lesson?.id??"";
  const deepTheory=lessonId?theoryById[lessonId]:undefined;
  const practicalLesson=lessonId?practiceById[lessonId]:undefined;

  useEffect(()=>{
    const needsTheory=section==="overview"&&!deepTheory;
    const needsPractice=section==="practice"&&!practicalLesson;
    if(!lessonId||(!needsTheory&&!needsPractice))return;
    let active=true;
    queueMicrotask(()=>{
      if(active)clearTheoryErrorFor(lessonId);
    });
    loadLessonDetails(lessonId)
      .then((details)=>{
        if(!active)return;
        setTheoryById((current)=>({...current,[lessonId]:details.theory}));
        setPracticeById((current)=>({...current,[lessonId]:details.practice}));
      })
      .catch(()=>{
        if(active){
          setTheoryError({
            lessonId,
            message:"Không tải được nội dung của bài này. Hãy kiểm tra kết nối rồi thử lại.",
          });
        }
      });
    return()=>{
      active=false;
    };
  },[clearTheoryErrorFor,deepTheory,lessonId,practicalLesson,section,theoryRetry]);


  /**
   * Đổi bộ lọc và chỉnh lựa chọn ngay trong cùng một handler, thay vì để effect
   * "sửa lại" sau khi render — nhờ đó catalog, reader và URL luôn khớp nhau.
   */
  const applyFilter=(next:{query?:string;domain?:string})=>{
    const nextQuery=next.query??query; const nextDomain=next.domain??domain;
    if(next.query!==undefined)setQuery(next.query);
    if(next.domain!==undefined)setDomain(next.domain);
    const nextFiltered=lessons.filter(item=>(nextDomain==="Tất cả"||item.domain===nextDomain)&&`${item.title} ${item.syllabus} ${item.outcomes.join(" ")}`.toLowerCase().includes(nextQuery.toLowerCase()));
    if(nextFiltered.length===0)return;
    if(!nextFiltered.some(item=>item.id===selectedId)){
      clearTheoryErrorFor(nextFiltered[0].id);
      setSelectedId(nextFiltered[0].id);
      setSection("practice");
      syncUrl(nextFiltered[0].id,"replace");
    }
  };

  const pretrainedOrLarge=/\b(?:whisper|qwen[-\s]?audio|voxtral|hubert|clip|diffusion|bert|yolo|detr|ssd)\b/i.test(`${lesson?.title??""} ${lesson?.syllabus??""}`);
  const pick=(id:string)=>{clearTheoryErrorFor(id);setSelectedId(id);setSection("practice");syncUrl(id,"push")};
  const theoryErrorMessage=theoryError?.lessonId===lessonId?theoryError.message:"";
  const retryTheory=()=>{setTheoryError(null);setTheoryRetry((value)=>value+1)};
  if(!lesson)return <section className="lessons-shell"><aside className="lesson-catalog"><div className="catalog-tools"><input value={query} onChange={e=>applyFilter({query:e.target.value})} placeholder="Tìm regression, attention…" aria-label="Tìm bài giảng"/><select value={domain} onChange={e=>applyFilter({domain:e.target.value})} aria-label="Lọc lĩnh vực">{domains.map(item=><option key={item}>{item}</option>)}</select></div><div className="catalog-count"><span>0/{lessons.length} bài</span></div></aside><article className="lesson-reader"><p className="empty-state">Không có bài giảng nào khớp bộ lọc. Hãy xoá bớt từ khoá hoặc chọn lại lĩnh vực.</p></article></section>;
  return <section className="lessons-shell"><aside className="lesson-catalog"><div className="catalog-tools"><input value={query} onChange={e=>applyFilter({query:e.target.value})} placeholder="Tìm regression, attention…" aria-label="Tìm bài giảng"/><select value={domain} onChange={e=>applyFilter({domain:e.target.value})} aria-label="Lọc theo lĩnh vực">{domains.map(item=><option key={item}>{item}</option>)}</select></div><div className="catalog-count"><span>{filtered.length}/{lessons.length} bài</span><span>Code + output + mini-lab</span></div><div className="catalog-list">{filtered.map(item=><button key={item.id} className={item.id===lesson.id?"active":""} onClick={()=>pick(item.id)}><span>{String(lessons.indexOf(item)+1).padStart(2,"0")}</span><div><strong>{item.title}</strong><small>{item.domain} · {item.category.includes("Both")?"Theory + Practice":item.category}</small></div></button>)}</div></aside><article className="lesson-reader"><header><p className="lab-code">{lesson.domain.toUpperCase()} · {lesson.category.toUpperCase()}</p><h2>{lesson.title}</h2><p>{lesson.intuition}</p><div className="lesson-outcomes">{lesson.outcomes.map(item=><span key={item}>✓ {item}</span>)}</div></header><nav className="lesson-sections" aria-label="Mục bài giảng">{[["practice","Học qua ví dụ"],["overview","Lý thuyết"],["build","Tự triển khai"],["failure","Lỗi & độ phức tạp"],["quiz","Kiểm tra"],["challenge","Bài code"]].map(([id,label])=><button key={id} onClick={()=>setSection(id)} className={section===id?"active":""}>{label}</button>)}</nav>{section==="practice"&&(practicalLesson?<LessonPracticalContent key={lessonId} practice={practicalLesson}/>:<PracticeLoadState error={theoryErrorMessage} onRetry={retryTheory}/>)}{section==="overview"&&<div className="lesson-content"><section><span className="content-index">01 · TIÊN QUYẾT</span><ul>{lesson.prerequisites.map(item=><li key={item}>{item}</li>)}</ul></section><section><span className="content-index">02 · TOÁN VÀ KÝ HIỆU</span><div className="math-stack">{lesson.math.map(item=><p key={item}><MathText>{item}</MathText></p>)}</div></section>{deepTheory?<DeepTheoryContent theory={deepTheory}/>:<TheoryLoadState error={theoryErrorMessage} onRetry={retryTheory}/>}<section><span className="content-index">10 · KHI NÀO DÙNG</span><ul>{lesson.whenToUse.map(item=><li key={item}>{item}</li>)}</ul></section><section className="project-link"><span className="content-index">KẾT NỐI DỰ ÁN</span><p>{lesson.project}</p></section></div>}{section==="build"&&<div className="lesson-content"><section><span className="content-index">{pretrainedOrLarge?"TRACE → PIPELINE, EVAL & ABLATION":"TRACE → CODE PHẦN LÕI"}</span><ol className="build-steps">{lesson.steps.map((item,index)=><li key={item}><span>{String(index+1).padStart(2,"0")}</span><p>{item}</p></li>)}</ol><div className="build-rule"><strong>Quy tắc bắt buộc</strong><p>{pretrainedOrLarge?"Được dùng model, weights và thư viện chính thức; tự viết pipeline dữ liệu/inference, metric, kiểm tra shape/schema, error analysis và ít nhất một ablation. Không nhờ AI sinh phần triển khai cốt lõi.":"Cài bản nhỏ của phần lõi trước khi gọi implementation có sẵn. Dùng seed cố định, tính tay một ví dụ toy và so output từng bước. Không xem lời giải cạnh editor."}</p></div></section></div>}{section==="failure"&&<div className="lesson-content"><section><span className="content-index">FAILURE MODES</span><div className="failure-list">{lesson.failures.map((item,index)=><article key={item}><span>F{index+1}</span><p>{item}</p></article>)}</div></section><section><span className="content-index">ĐỘ PHỨC TẠP & TÀI NGUYÊN</span><ul>{lesson.complexity.map(item=><li key={item}>{item}</li>)}</ul></section></div>}{section==="quiz"&&<div className="lesson-content"><section><span className="content-index">RETRIEVAL CHECK · KHÔNG AI</span><p className="section-note">Trả lời trước khi mở phần đối chiếu. Nếu sai, giải thích lại bằng lời và làm một biến thể; không chỉ ghi nhớ đáp án.</p><div className="quiz-grid">{lesson.quiz.map((item,index)=><QuizCard key={`${lesson.id}-${index}`} item={item} index={index}/>)}</div></section></div>}{section==="challenge"&&<div className="lesson-content"><section className="coding-brief"><div><span className="content-index">SOLO·90 CODING CHALLENGE</span><h2>{lesson.coding.title}</h2><p>{lesson.coding.brief}</p><pre>{lesson.coding.signature}</pre></div><div><h3>Yêu cầu</h3><ul>{lesson.coding.requirements.map(item=><li key={item}>{item}</li>)}</ul><h3>Điều kiện đạt</h3><ul>{lesson.coding.acceptance.map(item=><li key={item}>{item}</li>)}</ul><p className="hidden-note"><strong>{lesson.hiddenCount} nhóm tình huống kiểm tra mù</strong> dùng như checklist chấm thủ công. Đây không phải test bí mật phía máy chủ.</p><InternalLink className="primary-button" href="/practice">Mở Code Arena →</InternalLink></div></section></div>}</article></section>;
}
