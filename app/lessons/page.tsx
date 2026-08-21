import type { Metadata } from "next";
import { LessonsExplorer, type LessonViewModel } from "../../components/LessonsExplorer";
import { getCoreLessonsInRecommendedOrder } from "../../content/lessons-core";
import { multimodalLessons } from "../../content/lessons-multimodal";
import { assertLessonTheoryCoverage, getLessonDeepTheory } from "../../content/lesson-theory";

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
  const initialTheory=getLessonDeepTheory(lessons[0].id);
  return <main className="inner-page"><header className="page-hero compact"><p className="eyebrow">CATALOG IOAI 2026</p><h1>{lessons.length} bài giảng.<br/><em>Tự làm phần tạo ra hiểu biết.</em></h1><p>Mỗi bài đi qua trực giác, công thức, trace, độ phức tạp, failure modes, quiz và một dự án thật. Với thuật toán nhỏ, bạn tự cài phần lõi; với model pretrained lớn, bạn tự viết pipeline, evaluation, kiểm tra shape/schema, error analysis và ít nhất một ablation — không phải huấn luyện lại toàn bộ model từ đầu.</p></header><LessonsExplorer lessons={lessons} initialTheory={initialTheory}/></main>;
}
