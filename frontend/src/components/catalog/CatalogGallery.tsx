import style from './CatalogGallery.module.scss';
import type { ReactNode } from 'react';

/**
 * <카탈로그 갤러리 공용 컨테이너>
 *  - 판형, 템플릿 데이터를 렌더링하는 공용 컨테이너.
 *  - 헤더(title + description) + 로딩/빈 상태 처리만 책임지고,
 *  - 내부 콘텐츠는 2가지 모드로 위임받음.
 *
 *  1) 평탄한 그리드 모드: items + renderCard + getKey
 *    → 단일 배열을 단순 그리드로 표시 (판형)
 *
 *  2) 커스텀 콘텐츠 모드: renderContent
 *    → 중첩 그룹(테마 → 판형 → 카드) 구조를 자체 레이아웃으로 표시 (템플릿)
 *
 * "한 번에 하나의 모드만 사용"하며, 둘 다 넘기면 renderContent가 우선.
 */

interface CatalogGalleryBaseProps {
  title: string;
  description?: string;
  isLoading: boolean;
  isEmpty?: boolean;     // 커스텀 모드에서 빈 상태 판단을 외부에서 하기 위함 (컴포넌트가 내부 내용을 모름)
  emptyMessage?: string;
}

interface CatalogGalleryGridProps<T> extends CatalogGalleryBaseProps {
  items: T[];
  renderCard: (item: T) => ReactNode;
  getKey: (item: T) => string;
  renderContent?: never;
}

interface CatalogGalleryCustomProps extends CatalogGalleryBaseProps {
  renderContent: () => ReactNode;
  items?: never;
  renderCard?: never;
  getKey?: never;
}

// 재사용 컴포넌트가 2개 (판형, 템플릿)
// 서로 다른 모드끼리 섞이지 않도록 컴파일 시점에 방지 (Discriminated union Type)
type CatalogGalleryProps<T> =
  | CatalogGalleryGridProps<T>
  | CatalogGalleryCustomProps;

export function CatalogGallery<T>(props: CatalogGalleryProps<T>) {
  const {
    title,
    description,
    isLoading,
    emptyMessage = '표시할 항목이 없습니다.',
  } = props;

  // 빈 상태 판정: 그리드 모드는 items.length, 커스텀 모드는 isEmpty prop
  const isEmpty =
    'renderContent' in props && props.renderContent !== undefined
      ? props.isEmpty === true
      : (props as CatalogGalleryGridProps<T>).items.length === 0;

  return (
    <section className={style.gallery}>
      <header className={style.header}>
        <h1 className={style.title}>{title}</h1>
        {description && <p className={style.description}>{description}</p>}
      </header>

      <div className={style.body}>
        {isLoading && (
          <div className={style.state} role="status" aria-live="polite">
            불러오는 중...
          </div>
        )}

        {!isLoading && isEmpty && (
          <div className={style.state}>{emptyMessage}</div>
        )}

        {!isLoading && !isEmpty && 'renderContent' in props && props.renderContent && (
          props.renderContent()
        )}

        {!isLoading && !isEmpty && !('renderContent' in props && props.renderContent) && (
          <ul className={style.grid}>
            {(props as CatalogGalleryGridProps<T>).items.map((item) => (
              <li
                key={(props as CatalogGalleryGridProps<T>).getKey(item)}
                className={style.gridItem}
              >
                {(props as CatalogGalleryGridProps<T>).renderCard(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}