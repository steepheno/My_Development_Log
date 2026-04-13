import style from './TemplateCard.module.scss';
import type { TemplateCatalogItem } from '@/types/template';

/**
 * <템플릿 카드>
 *
 * 카탈로그 그리드의 최소 단위. 썸네일 + displayName + kindLabel 뱃지로 구성.
 * 조회 전용 카탈로그 페이지로 클릭 불가
 * 썸네일 URL이 없는 경우(147개 중 4개)는 텍스트 fallback으로 대체.
 */

interface TemplateCardProps {
  template: TemplateCatalogItem;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const { displayName, kindLabel, thumbnailUrl, templateKind } = template;

  return (
    <article className={style.card}>
      <div className={style.thumbnail}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`${displayName} 템플릿 미리보기`}
            loading="lazy"  // lazy loading 적용
            className={style.thumbnailImage}
          />
        ) : (
          <div className={style.thumbnailFallback} aria-hidden="true">
            <span className={style.fallbackText}>{displayName}</span>
          </div>
        )}
      </div>

      <div className={style.meta}>
        <span className={`${style.badge} ${style[`badge--${templateKind}`]}`}>
          {kindLabel}
        </span>
        <span className={style.name}>{displayName}</span>
      </div>
    </article>
  );
}