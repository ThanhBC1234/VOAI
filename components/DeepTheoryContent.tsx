"use client";

import type { LessonDeepTheory } from "../content/lesson-theory/types";
import { theorySources } from "../content/lesson-theory/sources";
import { InternalLink } from "./InternalLink";
import { RichText } from "./RichText";

function TheorySectionHeading({ index, children }: { index: string; children: string }) {
  const headingId = `deep-theory-heading-${index}`;
  return <h3 id={headingId} className="content-index">{index}{" \u00b7 "}{children}</h3>;
}

export function DeepTheoryContent({ theory }: { theory: LessonDeepTheory }) {
  const sources = theory.sourceIds.map((sourceId) => theorySources[sourceId]);

  return (
    <>
      <section className="deep-theory-opening" aria-labelledby="deep-theory-heading-03">
        <TheorySectionHeading index="03">CÂU HỎI DẪN ĐƯỜNG</TheorySectionHeading>
        <p className="deep-theory-reading">Thời lượng học dự kiến (đọc, tự tính và tự kiểm tra): {theory.readingMinutes} phút.</p>
        <ol>
          {theory.openingQuestions.map((question, questionIndex) => <li key={`${questionIndex}-${question}`}>{question}</li>)}
        </ol>
      </section>

      <section aria-labelledby="deep-theory-heading-04">
        <TheorySectionHeading index="04">LÝ THUYẾT CỐT LÕI</TheorySectionHeading>
        <div className="deep-theory-sections">
          {theory.sections.map((section, sectionIndex) => (
            <article key={`${sectionIndex}-${section.title}`}>
              <span className="deep-theory-section-number">{String(sectionIndex + 1).padStart(2, "0")}</span>
              <div>
                <h4>{section.title}</h4>
                {section.paragraphs.map((paragraph, paragraphIndex) => <p key={`${paragraphIndex}-${paragraph}`}><RichText>{paragraph}</RichText></p>)}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((bullet, bulletIndex) => <li key={`${bulletIndex}-${bullet}`}><RichText>{bullet}</RichText></li>)}
                  </ul>
                )}
                {section.formulas && (
                  <div className="deep-theory-formulas" aria-label={"Công thức: " + section.title}>
                    {section.formulas.map((formula, formulaIndex) => <p key={`${formulaIndex}-${formula}`}><RichText>{formula}</RichText></p>)}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="deep-theory-heading-05">
        <TheorySectionHeading index="05">VÍ DỤ GIẢI TỪNG BƯỚC</TheorySectionHeading>
        <div className="deep-theory-examples">
          {theory.workedExamples.map((example, exampleIndex) => (
            <article key={`${exampleIndex}-${example.title}`}>
              <h4>{example.title}</h4>
              <p><strong>Đề bài:</strong> <RichText>{example.problem}</RichText></p>
              <ol className="deep-theory-trace">
                {example.steps.map((step, stepIndex) => (
                  <li key={step.state + "-" + stepIndex}>
                    <span>{String(stepIndex + 1).padStart(2, "0")}</span>
                    <div>
                      <strong><RichText>{step.state}</RichText></strong>
                      <p><RichText>{step.explanation}</RichText></p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="deep-theory-conclusion"><strong>Kết luận:</strong> <RichText>{example.conclusion}</RichText></p>
              <div className="deep-theory-sanity">
                <strong>Kiểm tra hợp lý</strong>
                <ul>{example.sanityChecks.map((check, checkIndex) => <li key={`${checkIndex}-${check}`}><RichText>{check}</RichText></li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="deep-theory-heading-06">
        <TheorySectionHeading index="06">CHECKLIST TRIỂN KHAI</TheorySectionHeading>
        <ul className="deep-theory-checklist">
          {theory.implementationChecklist.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}><span aria-hidden="true">□</span>{" "}<RichText>{item}</RichText></li>)}
        </ul>
      </section>

      <section aria-labelledby="deep-theory-heading-07">
        <TheorySectionHeading index="07">TỰ KIỂM TRA MỨC ĐỘ LÀM CHỦ</TheorySectionHeading>
        <ul className="deep-theory-checklist mastery">
          {theory.masteryChecklist.map((item, itemIndex) => <li key={`${itemIndex}-${item}`}><span aria-hidden="true">✓</span>{" "}<RichText>{item}</RichText></li>)}
        </ul>
      </section>

      <section aria-labelledby="deep-theory-heading-08">
        <TheorySectionHeading index="08">THUẬT NGỮ</TheorySectionHeading>
        <dl className="deep-theory-glossary">
          {theory.glossary.map((item, itemIndex) => (
            <div key={`${itemIndex}-${item.term}`}>
              <dt>{item.term}</dt>
              <dd><RichText>{item.definition}</RichText></dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="deep-theory-heading-09">
        <TheorySectionHeading index="09">NGUỒN ĐỌC VÀ PHẠM VI</TheorySectionHeading>
        <p className="section-note">Nội dung trên được diễn giải mới cho VOAI Lab. Các liên kết dưới đây dùng để đọc sâu và kiểm chứng, không phải lời giải đặt cạnh bài.</p>
        <ul className="deep-theory-sources">
          {sources.map((source, sourceIndex) => (
            <li key={`${sourceIndex}-${source.id}`}>
              <div className="deep-theory-source-links">
                <a href={source.url} target="_blank" rel="noreferrer">{source.title} · nguồn chính thức</a>
                {source.localPath && <InternalLink href={source.localPath} target="_blank" rel="noreferrer">PDF trong thư viện</InternalLink>}
              </div>
              <span>{source.authorsOrOwner} · {source.license}</span>
              <p>{source.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
