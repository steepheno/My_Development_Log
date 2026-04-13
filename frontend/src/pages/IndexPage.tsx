import style from './IndexPage.module.scss';
import { Link } from 'react-router-dom';
import { LinkButton } from '@/components/button/LinkButton';
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';

export function IndexPage() {
  const { ref: featuresRef, isVisible } = useRevealOnScroll<HTMLElement>();

  return (
    <div className={style.home}>
      <section className={style.hero}>
        <p className={style.badge}>For Developers</p>
        <h1 className={style.title}>
          당신의 개발 여정을
          <br />한 권의 책으로.
        </h1>
        <p className={style.description}>
          프로젝트 정보 작성, 스크린샷 및 소스코드 캡처 이미지를 업로드하면
          <br />
          <strong className={style.highlight}>나만의 개발일지 포토북</strong>을 만들 수 있습니다.
        </p>
        <LinkButton
          variant="primary"
          to="/edit"
        >
          시작하기
        </LinkButton>
      </section>

      <section
        ref={featuresRef}
        className={`${style.features} ${isVisible ? style.visible : ''}`}
      >
        <Link
          to="/book-specs"
          className={style.featureCard}
        >
          <div className={style.featureIcon}>📐</div>
          <h3 className={style.featureTitle}>판형 보기</h3>
          <p className={style.featureText}>제작 가능한 판형과 사이즈를 미리 둘러보세요.</p>
        </Link>

        <Link
          to="/templates"
          className={style.featureCard}
        >
          <div className={style.featureIcon}>🎨</div>
          <h3 className={style.featureTitle}>템플릿 보기</h3>
          <p className={style.featureText}>테마별 표지와 내지 템플릿을 확인해보세요.</p>
        </Link>

        <Link
          to="/edit"
          className={style.featureCard}
        >
          <div className={style.featureIcon}>📝</div>
          <h3 className={style.featureTitle}>프로젝트 작성</h3>
          <p className={style.featureText}>
            표지 정보와 프로젝트 내용을 입력하여 <br />
            <strong className={style.highlight}>나만의 포토북</strong>을 만들어보세요.
          </p>
        </Link>
      </section>
    </div>
  );
}
