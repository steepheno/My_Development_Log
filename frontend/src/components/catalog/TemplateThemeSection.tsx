import style from './TemplateThemeSection.module.scss';
import type { TemplateThemeGroup } from '@/types/template';
import { TemplateBookSpecSubGroup } from '@/components/catalog/TemplateBookSpecSubGroup';

/**
 * <테마 섹션>
 *
 * 카탈로그의 최상위 그룹 단위. 하나의 테마 = 하나의 큰 섹션.
 * 헤더(테마명 + 총 개수) + 판형별 서브그룹 3개로 구성.
 *
 * variant:
 *  - 'regular': 8개 정규 테마 (기본)
 *  - 'utility': '공용' 섹션
 */

interface TemplateThemeSectionProps {
  group: TemplateThemeGroup;
  variant?: 'regular' | 'utility';
}

export function TemplateThemeSection({
  group,
  variant = 'regular',
}: TemplateThemeSectionProps) {
  const { theme, totalCount, byBookSpec } = group;

  return (
    <section
      className={`${style.themeSection} ${style[`themeSection--${variant}`]}`}
    >
      <header className={style.header}>
        <h2 className={style.title}>{theme}</h2>
        <span className={style.count}>총 {totalCount}개 템플릿</span>
        {variant === 'utility' && (
          <p className={style.utilityDescription}>
            특정 테마에 속하지 않는 빈 페이지 템플릿입니다. 어떤 주문 조합에서도 사용 가능합니다.
          </p>
        )}
      </header>

      <div className={style.subGroups}>
        {byBookSpec.map((sub) => (
          <TemplateBookSpecSubGroup
            key={sub.bookSpecUid}
            bookSpecUid={sub.bookSpecUid}
            bookSpecLabel={sub.bookSpecLabel}
            templates={sub.templates}
          />
        ))}
      </div>
    </section>
  );
}