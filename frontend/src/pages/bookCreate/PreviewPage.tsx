import style from './PreviewPage.module.scss';
import { usePortfolioStore } from '../../store/portfolioStore';
import { projectsToContentPages } from '../../utils/portfolioMapper';
import { LinkButton } from '@/components/button/LinkButton';
import { ScrollMove } from '@/components/scrollMoveButton/ScrollMove';

export function PreviewPage() {
  const cover = usePortfolioStore(s => s.cover);
  const projects = usePortfolioStore(s => s.projects);

  // 전체 페이지 수 계산: 표지 1장 + 내지 n장
  const contentPages = projectsToContentPages(projects);
  const totalPages = 1 + contentPages.length;

  return (
    <div className={style.page}>
      {/* 페이지 헤더 */}
      <header className={style.header}>
        <h1 className={style.title}>📖 나의 개발일지</h1>
        <p className={style.subtitle}>제작 전 최종 확인</p>
      </header>

      {/* 페이지 수 요약 배너 */}
      <div className={style.summary}>
        <div className={style.summaryMain}>
          총 <strong>{totalPages}페이지</strong>로 구성됩니다.
        </div>
        <div className={style.summarySub}>표지 1장 + 내지 {contentPages.length}장</div>
      </div>

      {/* 표지 섹션 */}
      <section className={style.section}>
        <h2 className={style.sectionTitle}>표지</h2>
        <div className={style.coverCard}>
          {cover.coverPhoto && (
            <div className={style.coverPhotoWrapper}>
              <img
                src={cover.coverPhoto}
                alt="표지 사진"
                className={style.coverPhoto}
              />
            </div>
          )}
          <div className={style.coverInfo}>
            <div className={style.coverName}>{cover.developerName}</div>
            <div className={style.coverJob}>{cover.jobTitle}</div>
            <div className={style.coverMeta}>
              <span>{cover.volumeLabel}</span>
              <span className={style.dot}>·</span>
              <span>{cover.periodText}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 프로젝트 섹션 */}
      <section className={style.section}>
        <h2 className={style.sectionTitle}>
          프로젝트 <span className={style.count}>총 {projects.length}개</span>
        </h2>

        {projects.length === 0 ? (
          <div className={style.empty}>아직 등록된 프로젝트가 없어요. 편집 페이지에서 프로젝트를 추가해주세요.</div>
        ) : (
          <ul className={style.projectList}>
            {projects.map((project, index) => (
              <li
                key={project.id}
                className={style.projectCard}
              >
                {/* 프로젝트 이름, 기간 */}
                <div className={style.projectHeader}>
                  <span className={style.projectIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <div className={style.projectTitleGroup}>
                    <h3 className={style.projectName}>{project.projectName}</h3>
                    <p className={style.projectPeriod}>{project.projectPeriod}</p>
                  </div>
                </div>

                {project.screenshotUrl && (
                  <div className={style.screenshotWrapper}>
                    <img
                      src={project.screenshotUrl}
                      alt={`${project.projectName} 스크린샷`}
                      className={style.screenshot}
                    />
                  </div>
                )}

                <p className={style.oneLiner}>{project.oneLiner}</p>

                {project.techUsed.length > 0 && (
                  <ul className={style.tagList}>
                    {project.techUsed.map(tech => (
                      <li
                        key={tech}
                        className={style.tag}
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}

                <p className={style.description}>{project.description}</p>

                {project.achievements.length > 0 && (
                  <div className={style.achievements}>
                    <div className={style.achievementsTitle}>주요 성과</div>
                    <ul className={style.achievementsList}>
                      {project.achievements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 하단 액션 버튼 */}
      <div className={style.actions}>
        <LinkButton
          variant="secondary"
          to="/edit"
        >
          ← 뒤로가기
        </LinkButton>
        <LinkButton
          variant="primary"
          to="/order"
        >
          다음단계 →
        </LinkButton>
      </div>

      {/* 스크롤 최상단(최하단) 이동 버튼 */}
      <ScrollMove />
    </div>
  );
}
