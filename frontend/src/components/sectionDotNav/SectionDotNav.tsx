import style from './SectionDotNav.module.scss';
import { useEffect, useState } from 'react';

/**
 * <섹션 dot 네비게이션>
 *
 * 뷰포트 우측 세로 가운데에 고정되는 dot 형태 네비게이션 (범용 컴포넌트)
 * 각 dot 클릭 시 해당 id를 가진 섹션으로 스무스 스크롤.
 * IntersectionObserver로 현재 보이는 섹션을 감지해 active dot을 표시.
 *
 * <주의>
 *  - 사용하는 페이지의 DOM에 sections[i].id 엘리먼트가 존재해야 함.
 *  - 존재하지 않는 id의 dot은 렌더링하지 않음 (방어 로직).
 */

// 고정 헤더 높이 + 여유 공간 (헤더 61px + breathing room 24px)
const HEADER_OFFSET = 88;

interface Section {
  id: string;
  label: string; // 툴팁 및 aria-label
}

interface SectionDotNavProps {
  sections: Section[];
}

export function SectionDotNav({ sections }: SectionDotNavProps) {
  // 실제 DOM에 존재하는 섹션만 필터링 (reder마다 DOM 확인)
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 마운트 시 DOM에 실제로 존재하는 섹션만 추려냄
  useEffect(() => {
    // 타겟 섹션 렌더링때까지 폴링 (최대 2초)
    let attempts = 0;
    const maxAttempts = 20;

    const checkSections = () => {
      const found = sections.filter(s => document.getElementById(s.id));
      if (found.length > 0 || attempts >= maxAttempts) {
        setAvailableSections(found);
        return;
      }
      attempts += 1;
      setTimeout(checkSections, 100);
    };

    checkSections();
  }, [sections]);

  // IntersectionObserver로 active 섹션 추적 (스크롤 위치 기반 추적)
  useEffect(() => {
    if (availableSections.length === 0) return;

    // 섹션 엘리먼트들을 순서대로 캐싱
    const elements = availableSections
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const updateActive = () => {
      // 기준선: 헤더 바로 아래의 문서 절대 Y좌표
      const scrollLine = window.scrollY + HEADER_OFFSET + 2;  // smooth 스크롤 후 서브픽셀 반올림으로 인한 오차 흡수를 위해 +2

      // 기준선보다 위에 있는 (= 이미 지나간) 섹션들 중 가장 마지막 것을 찾음
      // 섹션의 top이 scrollLine 이하인 것들 중 가장 아래
      let current: HTMLElement | null = null;
      for (const el of elements) {
        // offsetTop은 offsetParent 기준이므로, 절대 위치를 구하려면 getBoundingClientRect 사용
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        if (elTop <= scrollLine) {
          current = el;
        } else {
          break; // 섹션은 DOM 순서 = 스크롤 순서이므로 하나라도 넘으면 중단
        }
      }

      // 기준선을 지난 섹션이 하나도 없으면 (= 첫 섹션보다 위에 있음) active 해제
      setActiveId(current ? current.id : null);
    };

    // 초기 상태 1회 계산
    updateActive();

    // 스크롤 이벤트 (passive로 성능 확보)
    window.addEventListener('scroll', updateActive, { passive: true });
    // 리사이즈 시에도 재계산 (레이아웃 변경 대응)
    window.addEventListener('resize', updateActive);

    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [availableSections]);

  // dot 클릭 → 헤더 오프셋 고려한 스크롤
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  if (availableSections.length === 0) return null;

  return (
    <nav
      className={style.dotNav}
      aria-label="섹션 바로가기"
    >
      <ul className={style.list}>
        {availableSections.map(section => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <button
                type="button"
                className={`${style.dot} ${isActive ? style.active : ''}`}
                onClick={() => handleClick(section.id)}
                aria-label={`${section.label} 섹션으로 이동`}
                aria-current={isActive ? 'true' : undefined}
                title={section.label}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
