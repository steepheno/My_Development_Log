import style from './CoverEditor.module.scss';
import { Button } from '@/components/button/Button';
import { usePortfolioStore } from '@/store/portfolioStore';
import type { PortfolioCover } from '@/types/portfolio';

export function CoverEditor() {
  const cover = usePortfolioStore(state => state.cover);
  const updateCover = usePortfolioStore(state => state.updateCover);
  const projects = usePortfolioStore(state => state.projects);
  const selectItem = usePortfolioStore(state => state.selectItem);

  // 프로젝트 정보 입력으로 이동
  const goToProjectsInfo = () => {
    if (projects.length > 0) {
      selectItem(projects[0].id);
    }
  };

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

        {/* 버전 표시 */}
        <div className={style.field}>
          <label
            htmlFor="cover-volumeLabel"
            className={style.label}
          >
            버전 표시
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

      {/* 하단 버튼 */}
      <div className={style.actions}>
        <Button
          variant="primary"
          onClick={goToProjectsInfo}
          disabled={projects.length === 0}
        >
          프로젝트 편집
        </Button>
      </div>
    </div>
  );
}
