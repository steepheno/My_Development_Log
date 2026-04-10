import style from './ProjectEditor.module.scss';
import { AchievementList } from '@/components/edit/AchievementList';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { PortfolioProject } from '@/types/portfolio';
import { TagInput } from '@/components/edit/TagInput';

interface ProjectEditorProps {
  project: PortfolioProject;
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  const updateProject = usePortfolioStore(state => state.updateProject);
  const removeProject = usePortfolioStore(state => state.removeProject);

  /**
   * 특정 프로젝트의 필드를 부분 업데이트하는 핸들러 팩토리.
   * project.id를 클로저로 가둬서 각 input에 바로 꽂아 쓴다.
   */
  const handleChange =
    <K extends keyof PortfolioProject>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateProject(project.id, {
        [field]: e.target.value,
      } as Partial<PortfolioProject>);
    };

  // 프로젝트 삭제 핸들러
  const handleDelete = () => {
    const confirmed = window.confirm(`"${project.projectName}" 프로젝트를 삭제하시겠습니까?`);
    if (confirmed) {
      removeProject(project.id);
    }
  };

  return (
    <div className={style.editor}>
      <header className={style.header}>
        <h2 className={style.title}>{project.projectName}</h2>
        <p className={style.subtitle}>프로젝트 정보를 입력하세요.</p>
      </header>

      {/* --- 기본 정보 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>기본 정보</h3>

        {/* 프로젝트명 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-name`}
            className={style.label}
          >
            프로젝트명
          </label>
          <input
            id={`project-${project.id}-name`}
            type="text"
            className={style.input}
            value={project.projectName}
            onChange={handleChange('projectName')}
            placeholder="ex) DOROLAW"
          />
        </div>

        {/* 1줄 요약 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-oneLiner`}
            className={style.label}
          >
            1줄 요약
          </label>
          <input
            id={`project-${project.id}-oneLiner`}
            type="text"
            className={style.input}
            value={project.oneLiner}
            onChange={handleChange('oneLiner')}
            placeholder="프로젝트를 한 문장으로 설명해주세요"
          />
        </div>

        {/* 역할 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-role`}
            className={style.label}
          >
            역할
          </label>
          <input
            id={`project-${project.id}-role`}
            type="text"
            className={style.input}
            value={project.role}
            onChange={handleChange('role')}
            placeholder="ex) 프론트엔드 리드"
          />
        </div>

        {/* 종료일 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-endDate`}
            className={style.label}
          >
            종료일
          </label>
          <input
            id={`project-${project.id}-endDate`}
            type="date"
            className={style.input}
            value={project.endDate}
            onChange={handleChange('endDate')}
          />
          <p className={style.hint}>책에는 "M.D" 형식(예: 4.11)으로 표시됩니다.</p>
        </div>

        {/* 프로젝트 기간 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-period`}
            className={style.label}
          >
            프로젝트 기간
          </label>
          <input
            id={`project-${project.id}-period`}
            type="text"
            className={style.input}
            value={project.projectPeriod}
            onChange={handleChange('projectPeriod')}
            placeholder="ex) 2025.02 ~ 2025.04"
          />
        </div>
      </section>

      {/* --- 상세 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>상세</h3>

        {/* 프로젝트 설명 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-description`}
            className={style.label}
          >
            프로젝트 설명
          </label>
          <textarea
            id={`project-${project.id}-description`}
            className={style.textarea}
            value={project.description}
            onChange={handleChange('description')}
            placeholder="프로젝트의 배경과 개요를 2~3줄로 설명해주세요"
            rows={4}
          />
        </div>

        {/* 주요 성과 */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-achievements`}
            className={style.label}
          >
            주요 성과
          </label>
          <AchievementList
            value={project.achievements}
            onChange={next => updateProject(project.id, { achievements: next })}
            placeholder="성과 입력 후 Enter (ex. API 에러 50% 감소)"
          />
        </div>

        {/* 기술 스택 */}
        <div className={style.field}>
          <label className={style.label}>기술 스택</label>
          <TagInput
            value={project.techUsed}
            onChange={next => updateProject(project.id, { techUsed: next })}
            placeholder="기술 입력 후 Enter (ex. TypeScript)"
          />
        </div>
      </section>

      {/* --- 미디어 및 링크 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>미디어 및 링크</h3>

        {/* 스크린샷 URL */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-screenshot`}
            className={style.label}
          >
            스크린샷 URL
          </label>
          <input
            id={`project-${project.id}-screenshot`}
            type="url"
            className={style.input}
            value={project.screenshotUrl}
            onChange={handleChange('screenshotUrl')}
            placeholder="https://..."
          />
          {project.screenshotUrl && (
            <div className={style.imagePreview}>
              <img
                src={project.screenshotUrl}
                alt="스크린샷 미리보기"
                className={style.previewImage}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={e => {
                  (e.target as HTMLImageElement).style.display = 'block';
                }}
              />
            </div>
          )}
        </div>

        {/* GitHub */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-github`}
            className={style.label}
          >
            GitHub (선택)
          </label>
          <input
            id={`project-${project.id}-github`}
            type="url"
            className={style.input}
            value={project.githubUrl ?? ''}
            onChange={handleChange('githubUrl')}
            placeholder="https://github.com/..."
          />
        </div>

        {/* Live URL */}
        <div className={style.field}>
          <label
            htmlFor={`project-${project.id}-live`}
            className={style.label}
          >
            Live URL (선택)
          </label>
          <input
            id={`project-${project.id}-live`}
            type="url"
            className={style.input}
            value={project.liveUrl ?? ''}
            onChange={handleChange('liveUrl')}
            placeholder="https://..."
          />
        </div>
      </section>

      {/* --- 삭제 --- */}
      <section className={style.dangerSection}>
        <button
          type="button"
          className={style.deleteButton}
          onClick={handleDelete}
        >
          프로젝트 삭제
        </button>
      </section>
    </div>
  );
}
