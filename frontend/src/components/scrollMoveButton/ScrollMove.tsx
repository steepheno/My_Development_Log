import style from './ScrollMove.module.scss';
import { useEffect, useState } from 'react';

export function ScrollMove() {
  /* 페이지 최하단(최상단) 이동 스크롤 */

  // true면 '최상단'으로 이동, false면 '최하단'으로 이동 (화살표 모양이 변화됨)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 화살표 변경 지점: 스크롤 가능한 영역의 중간 지점
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;  // 스크롤 가능한 실제 영역
      setIsScrolled(window.scrollY > scrollableHeight / 2);
    };

    handleScroll();  // 초기 위치 반영
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToggle = () => {
    if (isScrolled) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      className={style.scrollToggle}
      onClick={handleScrollToggle}
      aria-label={isScrolled ? '맨 위로 이동' : '맨 아래로 이동'}
    >
      {isScrolled ? '↑' : '↓'}
    </button>
  );
}
