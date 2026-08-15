"use client";

import { useEffect, useMemo, useState } from "react";
import { InternalLink } from "./InternalLink";
import type { CurriculumSession, SyllabusCoverageItem, WeekPlan } from "../content/curriculum";
import { WEEK_LECTURES } from "../content/week-lectures";

type Milestone = { week: number; date: string; title: string };
type Props = { weeks: readonly WeekPlan[]; sessions: readonly CurriculumSession[]; milestones: readonly Milestone[]; coverage: readonly SyllabusCoverageItem[] };
const domainColors: Record<string,string> = { Python:"mint",Math:"mint",Data:"sky",ML:"sky",DL:"violet",CV:"coral",NLP:"gold",Audio:"gold",Multimodal:"coral",VOAI:"dark",Project:"dark" };
const kindLabel = {lesson:"Bài",lab:"Lab",checkpoint:"Kiểm tra",finale:"Tổng kết"};
const VIETNAM_TIME_ZONE="Asia/Ho_Chi_Minh";

function vietnamCalendarDate(date=new Date()){
  const parts=new Intl.DateTimeFormat("en",{timeZone:VIETNAM_TIME_ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
  const value=(type:"year"|"month"|"day")=>parts.find(part=>part.type===type)?.value??"";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function RoadmapExplorer({weeks,sessions,milestones,coverage}:Props){
  const [domain,setDomain]=useState("Tất cả"); const [query,setQuery]=useState(""); const [openWeek,setOpenWeek]=useState<number|null>(1);
  const [completed,setCompleted]=useState<Set<string>>(new Set()); const [view,setView]=useState<"weeks"|"coverage">("weeks");
  useEffect(()=>{const timer=window.setTimeout(()=>{try{setCompleted(new Set(JSON.parse(localStorage.getItem("voai-completed-sessions")||"[]")))}catch{setCompleted(new Set())}},0);return()=>window.clearTimeout(timer)},[]);
  const toggle=(id:string)=>setCompleted(current=>{const next=new Set(current);if(next.has(id))next.delete(id);else next.add(id);localStorage.setItem("voai-completed-sessions",JSON.stringify([...next]));return next});
  const domains=["Tất cả",...Array.from(new Set(weeks.map(week=>week.domain)))];
  const filtered=useMemo(()=>weeks.filter(week=>(domain==="Tất cả"||week.domain===domain)&&(`${week.title} ${week.focus} ${week.syllabusTopics.join(" ")}`.toLowerCase().includes(query.toLowerCase()))),[weeks,domain,query]);
  const progress=Math.round(completed.size/sessions.length*100); const today=vietnamCalendarDate(); const current=sessions.find(item=>item.date>=today)??sessions.at(-1);
  const exportProgress=()=>{const payload={format:"voai-lab-progress",version:1,exportedAt:new Date().toISOString(),completed:[...completed]};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const link=document.createElement("a");link.href=url;link.download="voai-lab-progress.json";link.click();URL.revokeObjectURL(url)};
  return (
    <section className="roadmap-app">
      <div className="progress-strip"><div className="progress-copy"><span>TIẾN ĐỘ CỤC BỘ</span><strong>{completed.size}/{sessions.length} phiên · {progress}%</strong></div><div className="progress-track"><i style={{width:`${progress}%`}}/></div><div className="progress-actions"><span>{current?`Tiếp theo: ${current.date} · ${current.title}`:"Đã hoàn thành"}</span><button onClick={exportProgress}>Xuất tiến độ</button></div></div>
      <div className="roadmap-toolbar"><div><button className={view==="weeks"?"active":""} onClick={()=>setView("weeks")}>41 tuần</button><button className={view==="coverage"?"active":""} onClick={()=>setView("coverage")}>Ma trận IOAI</button></div>{view==="weeks"&&<><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm thuật toán hoặc chủ đề…" aria-label="Tìm trong lộ trình"/><select value={domain} onChange={e=>setDomain(e.target.value)} aria-label="Lọc lĩnh vực">{domains.map(item=><option key={item}>{item}</option>)}</select></>}</div>
      {view==="weeks"?<div className="week-list">{filtered.map(week=>{const weekSessions=sessions.filter(item=>item.week===week.week);const done=weekSessions.filter(item=>completed.has(item.id)).length;const expanded=openWeek===week.week;const lectures=WEEK_LECTURES[week.week]??[];return <article className={`week-row ${domainColors[week.domain]??"mint"}`} key={week.week}><button className="week-summary" onClick={()=>setOpenWeek(expanded?null:week.week)} aria-expanded={expanded}><span className="week-number">W{String(week.week).padStart(2,"0")}</span><div><small>{week.phaseTitle}</small><h2>{week.title}</h2><p>{week.startDate} → {week.endDate} · {week.domain}</p></div><div className="week-meter"><strong>{done}/7</strong><i><b style={{width:`${done/7*100}%`}}/></i></div><span className="expand-mark">{expanded?"−":"+"}</span></button>{expanded&&<div className="week-detail"><div className="week-context"><div><span>MỤC TIÊU</span><ul>{week.objectives.map(item=><li key={item}>{item}</li>)}</ul></div><div><span>ĐẦU RA TUẦN</span><p>{week.deliverable}</p><span>ĐIỀU KIỆN QUA</span><p>{week.assessment.gate}</p></div></div><div className="week-lectures"><strong>BÀI GIẢNG NÊN ĐỌC TRONG TUẦN</strong><div>{lectures.map(item=><InternalLink key={item.id} href={`/lessons?lesson=${encodeURIComponent(item.id)}`}>{item.label} →</InternalLink>)}</div></div><div className="session-list">{weekSessions.map(session=><div className={completed.has(session.id)?"done":""} key={session.id}><button onClick={()=>toggle(session.id)} aria-label={completed.has(session.id)?"Đánh dấu chưa xong":"Đánh dấu hoàn thành"}>{completed.has(session.id)?"✓":""}</button><span>{session.date}<small>{kindLabel[session.kind]} · {session.coreMinutes}/{session.deepMinutes} phút</small></span><div><strong>{session.title}</strong><p>{session.outcome}</p><details><summary>Xem kế hoạch buổi học</summary><ol>{session.corePlan.map(item=><li key={item}>{item}</li>)}</ol><p><b>Deep {session.deepMinutes}:</b> {session.deepExtension}</p><p><b>Tự kiểm:</b> {session.assessment}</p></details><InternalLink className="session-assessment-link" href={`/assessments?session=${encodeURIComponent(session.id)}`}>Làm assessment phiên này →</InternalLink></div></div>)}</div></div>}</article>})}{filtered.length===0&&<p className="empty-state">Không có tuần nào khớp bộ lọc.</p>}</div>:<div className="coverage-view"><div className="coverage-intro"><div><strong>{coverage.length}/60</strong><span>mục được ánh xạ</span></div><p>Một mục chỉ được coi là “có kế hoạch bao phủ”, chưa phải đã thành thạo. Bằng chứng hoàn thành là checkpoint, notebook, bài kiểm tra mù dùng để luyện tập và phần giải thích của chính bạn.</p></div><div className="coverage-table"><div className="coverage-head"><span>Phần</span><span>Chủ đề chính thức</span><span>Mức</span><span>Tuần học</span></div>{coverage.map(item=><div key={item.id}><span>{item.section}</span><strong>{item.topic}</strong><em>{item.category}</em><span>{item.weeks.map(week=>`W${week}`).join(", ")}</span></div>)}</div></div>}
      <div className="milestone-band"><div><p className="eyebrow">CỔNG NĂNG LỰC</p><h2>Không chạy theo streak.<br/>Chỉ đi tiếp khi có bằng chứng.</h2></div><div>{milestones.map(item=><p key={item.week}><span>W{item.week} · {item.date}</span><strong>{item.title}</strong></p>)}</div></div>
    </section>
  );
}
