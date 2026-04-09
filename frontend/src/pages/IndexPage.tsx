import style from './IndexPage.module.scss';
import { Link } from 'react-router-dom';

export function IndexPage() {
  return (
    <div className={style.home}>
      <section className={style.hero}>
        <p className={style.badge}>For Developers</p>
        <h1 className={style.title}>
          당신의 개발 여정을
          <br />한 권의 책으로.
        </h1>
        <p className={style.description}>
          프로젝트 스크린샷과 소스코드 캡처 이미지를 업로드하면,
          <br />
          나만의 개발일지 포토북으로 만들어 드립니다.
        </p>
        <Link
          to="/edit"
          className={style.startButton}
        >
          시작하기
        </Link>
      </section>

      <section className={style.features}>
        <div className={style.featureCard}>
          <div className={style.featureIcon}>📝</div>
          <h3 className={style.featureTitle}>간편한 편집</h3>
          <p className={style.featureText}>표지 정보와 프로젝트를 폼에 입력하기만 하면 끝납니다.</p>
        </div>
        <div className={style.featureCard}>
          <div className={style.featureIcon}>👀</div>
          <h3 className={style.featureTitle}>실시간 미리보기</h3>
          <p className={style.featureText}>주문 전에 포토북이 어떻게 만들어질지 미리 확인할 수 있습니다.</p>
        </div>
        <div className={style.featureCard}>
          <div className={style.featureIcon}>📚</div>
          <h3 className={style.featureTitle}>실물 포토북</h3>
          <p className={style.featureText}>Sweetbook을 통해 실제 책으로 제작해 받아볼 수 있습니다.</p>
        </div>
      </section>
    </div>
  );
}
