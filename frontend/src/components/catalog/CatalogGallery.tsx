import type { ReactNode } from 'react';
import styles from './CatalogGallery.module.scss';

/**
 * <카탈로그 갤러리 공용 컨테이너>
 *
 * 판형/템플릿 등 카탈로그 성격의 데이터를 그리드로 렌더링하는 컨테이너.
 * 실제 카드의 모양은 renderCard prop으로 위임받음.
 *
 * 제네릭 T로 어떤 데이터 타입에든 대응 가능.
 * 데이터 fetching은 호출하는 페이지에서 수행.
 */

interface CatalogGalleryProps<T> {
  title: string;
  description?: string;
  items: T[];
  isLoading: boolean;
  renderCard: (item: T) => ReactNode;  // 각 항목을 어떻게 렌더링할 지 위임받는 렌더 함수
  getKey: (item: T) => string;         // items에서 React key로 사용할 값 추출하는 함수
  emptyMessage?: string;               // 빈 상태일 때 렌더링 될 메시지
}

export function CatalogGallery<T>({
  title,
  description,
  items,
  isLoading,
  renderCard,
  getKey,
  emptyMessage = '표시할 항목이 없습니다.',
}: CatalogGalleryProps<T>) {
  return (
    <section className={styles.gallery}>
      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>

      <div className={styles.body}>
        {isLoading && (
          <div className={styles.state} role="status" aria-live="polite">
            불러오는 중...
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className={styles.state}>{emptyMessage}</div>
        )}

        {!isLoading && items.length > 0 && (
          <ul className={styles.grid}>
            {items.map((item) => (
              <li key={getKey(item)} className={styles.gridItem}>
                {renderCard(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}