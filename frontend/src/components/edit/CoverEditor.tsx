import style from './CoverEditor.module.scss';
import { TagInput } from '@/components/edit/TagInput';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { PortfolioCover } from '@/types/portfolio';

export function CoverEditor() {
  const cover = usePortfolioStore(state => state.cover);
  const updateCover = usePortfolioStore(state => state.updateCover);

  /**
   * input/textarea의 onChange 핸들러를 만드는 헬퍼.
   * 필드명을 클로저로 고정해서 각 input에 바로 꽂아 쓸 수 있게 한다.
   */
  const handleChange =
    <K extends keyof PortfolioCover>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateCover({ [field]: e.target.value } as Partial<PortfolioCover>);
    };

  return (
    <div className={style.editor}>
      <header className={style.header}>
        <h2 className={style.title}>표지 편집</h2>
        <p className={style.subtitle}>책의 첫 페이지에 표시될 정보를 입력하세요.</p>
      </header>

      {/* --- 기본 정보 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>기본 정보</h3>

        {/* 이름 */}
        <div className={style.field}>
          <label
            htmlFor="cover-developerName"
            className={style.label}
          >
            이름
          </label>
          <input
            id="cover-developerName"
            type="text"
            className={style.input}
            value={cover.developerName}
            onChange={handleChange('developerName')}
            placeholder="ex) 홍길동"
          />
        </div>

        {/* 직무 */}
        <div className={style.field}>
          <label
            htmlFor="cover-jobTitle"
            className={style.label}
          >
            직무
          </label>
          <input
            id="cover-jobTitle"
            type="text"
            className={style.input}
            value={cover.jobTitle}
            onChange={handleChange('jobTitle')}
            placeholder="ex) Frontend Developer"
          />
        </div>

        {/* 권 표시 */}
        <div className={style.field}>
          <label
            htmlFor="cover-volumeLabel"
            className={style.label}
          >
            권 표시
          </label>
          <input
            id="cover-volumeLabel"
            type="text"
            className={style.input}
            value={cover.volumeLabel}
            onChange={handleChange('volumeLabel')}
            placeholder="ex) Vol.1"
          />
        </div>

        {/* 활동 기간 */}
        <div className={style.field}>
          <label
            htmlFor="cover-periodText"
            className={style.label}
          >
            활동 기간
          </label>
          <input
            id="cover-periodText"
            type="text"
            className={style.input}
            value={cover.periodText}
            onChange={handleChange('periodText')}
            placeholder="ex) 2025.02 ~ 2026.04"
          />
        </div>
      </section>

      {/* --- 소개 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>소개</h3>

        {/* 1줄 소개 */}
        <div className={style.field}>
          <label
            htmlFor="cover-bio"
            className={style.label}
          >
            1줄 소개
          </label>
          <textarea
            id="cover-bio"
            className={style.textarea}
            value={cover.bio}
            onChange={handleChange('bio')}
            placeholder="자신을 한 문장으로 소개해보세요"
            rows={2}
          />
        </div>

        {/* 표지 이미지 */}
        <div className={style.field}>
          <label
            htmlFor="cover-coverPhoto"
            className={style.label}
          >
            표지 이미지 URL
          </label>
          <input
            id="cover-coverPhoto"
            type="url"
            className={style.input}
            value={cover.coverPhoto}
            onChange={handleChange('coverPhoto')}
            placeholder="https://..."
          />
          {cover.coverPhoto && (
            <div className={style.imagePreview}>
              <img
                src={cover.coverPhoto}
                alt="표지 미리보기"
                className={style.previewImage}
                onError={e => {
                  // 유효하지 않은 URL이면 숨김 처리
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                onLoad={e => {
                  // 다시 유효해지면 보이도록 복구
                  (e.target as HTMLImageElement).style.display = 'block';
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* --- 기술 스택 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>기술 스택</h3>

        <div className={style.field}>
          <label
            htmlFor="cover-techStack"
            className={style.label}
          >
            주요 기술
          </label>
          <TagInput
            value={cover.techStack}
            onChange={next => updateCover({ techStack: next })}
            placeholder="기술 입력 후 Enter (ex. React)"
          />
        </div>
      </section>

      {/* --- 외부 링크 --- */}
      <section className={style.section}>
        <h3 className={style.sectionTitle}>외부 링크</h3>

        {/* GitHub */}
        <div className={style.field}>
          <label
            htmlFor="cover-githubUrl"
            className={style.label}
          >
            GitHub
          </label>
          <input
            id="cover-githubUrl"
            type="url"
            className={style.input}
            value={cover.githubUrl}
            onChange={handleChange('githubUrl')}
            placeholder="https://github.com/..."
          />
        </div>

        {/* 블로그 */}
        <div className={style.field}>
          <label
            htmlFor="cover-blogUrl"
            className={style.label}
          >
            블로그 (선택)
          </label>
          <input
            id="cover-blogUrl"
            type="url"
            className={style.input}
            value={cover.blogUrl ?? ''}
            onChange={handleChange('blogUrl')}
            placeholder="https://..."
          />
        </div>
      </section>
    </div>
  );
}
