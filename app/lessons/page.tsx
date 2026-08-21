import type { Metadata } from "next";
import { LessonsExplorer, type LessonViewModel } from "../../components/LessonsExplorer";
import { getCoreLessonsInRecommendedOrder } from "../../content/lessons-core";
import { multimodalLessons } from "../../content/lessons-multimodal";
import { assertLessonTheoryCoverage, getLessonDeepTheory } from "../../content/lesson-theory";
import { assertLessonPracticeCoverage, getLessonPractice } from "../../content/lesson-practice";

export const metadata: Metadata = {
  title: "78 bài giảng thuật toán — VOAI Lab",
  description: "Bài giảng chi tiết từ Python, ML, DL đến CV, NLP, Audio và đa phương thức theo đề cương IOAI 2026.",
};

export const dynamic = "force-static";

function coreView(lesson: ReturnType<typeof getCoreLessonsInRecommendedOrder>[number]): LessonViewModel {
  return {
    id: lesson.id, title: lesson.title, domain: lesson.domain, category: lesson.officialCategory,
    syllabus: lesson.syllabusTopic, prerequisites: lesson.prerequisites, outcomes: lesson.outcomes,
    intuition: lesson.intuition, math: lesson.math, steps: lesson.fromScratchSteps, whenToUse: lesson.whenToUse,
    failures: lesson.failureModes.map(item=>`${item.symptom} — Nguyên nhân: ${item.cause} — Cách sửa: ${item.fix}`),
    complexity: [`Thời gian: ${lesson.complexity.time}`,`Bộ nhớ: ${lesson.complexity.space}`,lesson.complexity.notes],
    quiz: lesson.miniQuiz.map(item=>({question:item.question,choices:item.choices,answer:item.choices[item.correctIndex],explanation:item.explanation})),
    coding: {title:lesson.codingChallenge.title,brief:lesson.codingChallenge.brief,signature:lesson.codingChallenge.functionSignature,requirements:lesson.codingChallenge.constraints,acceptance:lesson.codingChallenge.acceptanceCriteria},
    hiddenCount: lesson.hiddenTestIdeas.length, project: lesson.projectConnection,
  };
}

function modalView(lesson: (typeof multimodalLessons)[number]): LessonViewModel {
  return {
    id: lesson.id, title: lesson.title, domain: lesson.domain, category: lesson.officialCategory,
    syllabus: lesson.officialCategory, prerequisites: lesson.prerequisites, outcomes: lesson.outcomes,
    intuition: lesson.intuition, math: lesson.math, steps: lesson.fromScratchSteps, whenToUse: lesson.whenToUse,
    failures: lesson.failureModes, complexity: lesson.complexity,
    quiz: lesson.miniQuiz.map(item=>({question:item.question,answer:item.expectedAnswer,explanation:`Ngộ nhận cần tránh: ${item.misconceptionToCatch}`})),
    coding: {title:`Thử thách ${lesson.codingChallenge.durationMinutes} phút`,brief:lesson.codingChallenge.task,signature:lesson.codingChallenge.starterSignature,requirements:lesson.codingChallenge.requirements,acceptance:lesson.codingChallenge.acceptanceCriteria,aiBoundary:lesson.codingChallenge.aiBoundary},
    hiddenCount: lesson.hiddenTestIdeas.length, project: lesson.projectConnection,
  };
}

export default function LessonsPage() {
  const lessons=[...getCoreLessonsInRecommendedOrder().map(coreView),...multimodalLessons.map(modalView)];
  assertLessonTheoryCoverage(lessons.map((lesson)=>lesson.id));
  assertLessonPracticeCoverage(lessons.map((lesson)=>lesson.id));
  const initialTheory=getLessonDeepTheory(lessons[0].id);
  const initialPractice=getLessonPractice(lessons[0].id);
  if(!initialPractice)throw new Error(`Thiếu nội dung thực hành cho ${lessons[0].id}.`); return <main className="inner-page"><header className="page-hero compact"><p className="eyebrow">CATALOG IOAI 2026</p><h1>{lessons.length} bài giảng.<br/><em>Học từ tình huống thật.</em></h1><p>Mỗi bài bắt đầu bằng một bài toán thực tế, dữ liệu mẫu, code Python chạy được, output để đối chiếu và một minh họa cho phép đổi tham số. Phần lý thuyết, trace, failure modes, quiz và thử thách code vẫn được giữ lại để giải thích vì sao cách làm hoạt động.</p></header><LessonsExplorer lessons={lessons} initialTheory={initialTheory} initialPractice={initialPractice}/></main>;
}
