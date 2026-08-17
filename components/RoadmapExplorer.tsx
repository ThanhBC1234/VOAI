"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InternalLink } from "./InternalLink";
import type { CurriculumSession, SyllabusCoverageItem, WeekPlan } from "../content/curriculum";
import { WEEK_LECTURES } from "../content/week-lectures";
import { buildRoadmapGroups } from "../lib/roadmap-groups";
import { describeWriteStatus, partitionKnownIds, readJson, writeJson } from "../lib/local-storage";

const COMPLETED_STORAGE_KEY = "voai-completed-sessions";
const acceptIdList = (value: unknown): string[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === "string") ? (value as string[]) : null;

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

/** Một dòng phiên học; dùng chung cho khối tuần và khối Finale để hành vi giống hệt nhau. */
function SessionRow({session,done,onToggle}:{session:CurriculumSession;done:boolean;onToggle:()=>void}){
  return (
    <div className={done?"done":""}>
      <button onClick={onToggle} aria-label={done?`Đánh dấu chưa xong: ${session.title}`:`Đánh dấu hoàn thành: ${session.title}`} aria-pressed={done}>{done?"✓":""}</button>
      <span>{session.date}<small>{kindLabel[session.kind]} · {session.coreMinutes}/{session.deepMinutes} phút</small></span>
      <div>
        <strong>{session.title}</strong>
        <p>{session.outcome}</p>
        <details><summary>Xem kế hoạch buổi học</summary><ol>{session.corePlan.map(item=><li key={item}>{item}</li>)}</ol><p><b>Deep {session.deepMinutes}:</b> {session.deepExtension}</p><p><b>Tự kiểm:</b> {session.assessment}</p></details>
        <InternalLink className="session-assessment-link" href={`/assessments?session=${encodeURIComponent(session.id)}`}>Làm assessment phiên này →</InternalLink>
      </div>
    </div>
  );
}

export function RoadmapExplorer({weeks,sessions,milestones,coverage}:Props){
  const [domain,setDomain]=useState("Tất cả"); const [query,setQuery]=useState(""); const [openGroup,setOpenGroup]=useState<string|null>("week-1");
  const [completed,setCompleted]=useState<Set<string>>(new Set()); const [view,setView]=useState<"weeks"|"coverage">("weeks");
  const [storageNotice,setStorageNotice]=useState<string|null>(null);
  // ID không còn trong curriculum được giữ lại nguyên vẹn (archived) để đổi nội
  // dung không âm thầm xoá lịch sử; chỉ phần `active` được tính vào phần trăm.
  const archivedRef=useRef<string[]>([]);
  const sessionIds=useMemo(()=>new Set(sessions.map(session=>session.id)),[sessions]);

  useEffect(()=>{const timer=window.setTimeout(()=>{
    const stored=readJson(COMPLETED_STORAGE_KEY,acceptIdList,[] as string[]);
    const {active,archived}=partitionKnownIds(stored,sessionIds);
    archivedRef.current=archived;
    setCompleted(new Set(active));
  },0);return()=>window.clearTimeout(timer)},[sessionIds]);

  const toggle=(id:string)=>setCompleted(current=>{
    const next=new Set(current);
    if(next.has(id))next.delete(id);else next.add(id);
    setStorageNotice(describeWriteStatus(writeJson(COMPLETED_STORAGE_KEY,[...next,...archivedRef.current])));
    return next;
  });

  // Một nguồn nhóm duy nhất cho cả hiển thị lẫn bộ đếm — gồm 41 tuần và khối Finale.
  const groups=useMemo(()=>buildRoadmapGroups(weeks,sessions),[weeks,sessions]);
  const finaleSessions=useMemo(()=>sessions.filter(session=>session.week===null),[sessions]);
  const domains=useMemo(()=>["Tất cả",...Array.from(new Set([...weeks.map(week=>week.domain),...finaleSessions.map(session=>session.domain)]))],[weeks,finaleSessions]);

  const needle=query.toLowerCase();
  const visibleGroups=useMemo(()=>groups.map(group=>{
    if(group.kind==="week"){
      const matches=(domain==="Tất cả"||group.week.domain===domain)&&`${group.week.title} ${group.week.focus} ${group.week.syllabusTopics.join(" ")}`.toLowerCase().includes(needle);
      return matches?group:null;
    }
    const kept=group.sessions.filter(session=>(domain==="Tất cả"||session.domain===domain)&&`${session.title} ${session.outcome}`.toLowerCase().includes(needle));
    return kept.length>0?{...group,sessions:kept}:null;
  }).filter((group):group is NonNullable<typeof group>=>group!==null),[groups,domain,needle]);

  const progress=Math.round(completed.size/sessions.length*100); const today=vietnamCalendarDate(); const current=sessions.find(item=>item.date>=today)??sessions.at(-1);
  /**
   * Xuất tiến độ ra tệp JSON.
   *
   * Hai chi tiết bắt buộc, giống `AssessmentExplorer.exportAttempts`:
   * - thẻ `<a>` phải **nằm trong document** trước khi `click()`, vì Firefox bỏ
   *   qua click trên phần tử chưa gắn vào cây DOM;
   * - `revokeObjectURL` phải lùi sang tick sau. Thu hồi ngay sau `click()` có
   *   thể huỷ chính lần tải vừa bắt đầu.
   *
   * Đây là đường duy nhất để người học mang tiến độ sang thiết bị khác, nên hỏng
   * âm thầm ở đây là mất dữ liệu thật.
   */
  const exportProgress=()=>{const payload={format:"voai-lab-progress",version:1,exportedAt:new Date().toISOString(),completed:[...completed]};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));const link=document.createElement("a");link.href=url;link.download="voai-lab-progress.json";document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),0)};

  return (
    <section className="roadmap-app">
      <div className="progress-strip"><div className="progress-copy"><span>TIẾN ĐỘ CỤC BỘ</span><strong>{completed.size}/{sessions.length} phiên · {progress}%</strong></div><div className="progress-track"><i style={{width:`${progress}%`}}/></div><div className="progress-actions"><span>{current?`Tiếp theo: ${current.date} · ${current.title}`:"Đã hoàn thành"}</span><button onClick={exportProgress}>Xuất tiến độ</button></div></div>
      {storageNotice?<p className="storage-notice" role="status">{storageNotice}</p>:null}
      <div className="roadmap-toolbar"><div><button className={view==="weeks"?"active":""} onClick={()=>setView("weeks")}>41 tuần + tổng kết</button><button className={view==="coverage"?"active":""} onClick={()=>setView("coverage")}>Ma trận IOAI</button></div>{view==="weeks"&&<><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm thuật toán hoặc chủ đề…" aria-label="Tìm trong lộ trình"/><select value={domain} onChange={e=>setDomain(e.target.value)} aria-label="Lọc lĩnh vực">{domains.map(item=><option key={item}>{item}</option>)}</select></>}</div>
      {view==="weeks"?<div className="week-list">
        {visibleGroups.map(group=>{
          const expanded=openGroup===group.key;
          const done=group.sessions.filter(item=>completed.has(item.id)).length;
          const total=group.sessions.length;
          if(group.kind==="finale"){
            return (
              <article className="week-row dark finale-row" key={group.key} data-roadmap-group="finale">
                <button className="week-summary" onClick={()=>setOpenGroup(expanded?null:group.key)} aria-expanded={expanded}>
                  <span className="week-number">TK</span>
                  <div><small>Tổng kết · sau tuần 41</small><h2>Ba ngày tổng kết và bảo vệ</h2><p>{group.sessions[0]?.date} → {group.sessions.at(-1)?.date} · Không thuộc tuần nào</p></div>
                  <div className="week-meter"><strong>{done}/{total}</strong><i><b style={{width:`${total?done/total*100:0}%`}}/></i></div>
                  <span className="expand-mark">{expanded?"−":"+"}</span>
                </button>
                {expanded&&<div className="week-detail"><div className="week-context"><div><span>VÌ SAO TÁCH RIÊNG</span><p>Ba phiên này nằm sau tuần 41 nên không gắn với tuần nào, nhưng vẫn nằm trong tổng {sessions.length} phiên và vẫn phải đánh dấu hoàn thành như mọi phiên khác.</p></div></div><div className="session-list">{group.sessions.map(session=><SessionRow key={session.id} session={session} done={completed.has(session.id)} onToggle={()=>toggle(session.id)}/>)}</div></div>}
              </article>
            );
          }
          const week=group.week; const lectures=WEEK_LECTURES[week.week]??[];
          return (
            <article className={`week-row ${domainColors[week.domain]??"mint"}`} key={group.key}>
              <button className="week-summary" onClick={()=>setOpenGroup(expanded?null:group.key)} aria-expanded={expanded}>
                <span className="week-number">W{String(week.week).padStart(2,"0")}</span>
                <div><small>{week.phaseTitle}</small><h2>{week.title}</h2><p>{week.startDate} → {week.endDate} · {week.domain}</p></div>
                <div className="week-meter"><strong>{done}/{total}</strong><i><b style={{width:`${total?done/total*100:0}%`}}/></i></div>
                <span className="expand-mark">{expanded?"−":"+"}</span>
              </button>
              {expanded&&<div className="week-detail"><div className="week-context"><div><span>MỤC TIÊU</span><ul>{week.objectives.map(item=><li key={item}>{item}</li>)}</ul></div><div><span>ĐẦU RA TUẦN</span><p>{week.deliverable}</p><span>ĐIỀU KIỆN QUA</span><p>{week.assessment.gate}</p></div></div><div className="week-lectures"><strong>BÀI GIẢNG NÊN ĐỌC TRONG TUẦN</strong><div>{lectures.map(item=><InternalLink key={item.id} href={`/lessons?lesson=${encodeURIComponent(item.id)}`}>{item.label} →</InternalLink>)}</div></div><div className="session-list">{group.sessions.map(session=><SessionRow key={session.id} session={session} done={completed.has(session.id)} onToggle={()=>toggle(session.id)}/>)}</div></div>}
            </article>
          );
        })}
        {visibleGroups.length===0&&<p className="empty-state">Không có tuần nào khớp bộ lọc.</p>}
      </div>:<div className="coverage-view"><div className="coverage-intro"><div><strong>{coverage.length}/60</strong><span>mục được ánh xạ</span></div><p>Một mục chỉ được coi là “có kế hoạch bao phủ”, chưa phải đã thành thạo. Bằng chứng hoàn thành là checkpoint, notebook, bài kiểm tra mù dùng để luyện tập và phần giải thích của chính bạn.</p></div><div className="coverage-table"><div className="coverage-head"><span>Phần</span><span>Chủ đề chính thức</span><span>Mức</span><span>Tuần học</span></div>{coverage.map(item=><div key={item.id}><span>{item.section}</span><strong>{item.topic}</strong><em>{item.category}</em><span>{item.weeks.map(week=>`W${week}`).join(", ")}</span></div>)}</div></div>}
      <div className="milestone-band"><div><p className="eyebrow">CỔNG NĂNG LỰC</p><h2>Không chạy theo streak.<br/>Chỉ đi tiếp khi có bằng chứng.</h2></div><div>{milestones.map(item=><p key={item.week}><span>W{item.week} · {item.date}</span><strong>{item.title}</strong></p>)}</div></div>
    </section>
  );
}
