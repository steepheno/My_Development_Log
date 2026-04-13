import type { BookSpecCatalogItem } from '@/types/bookSpec';
import { useEffect, useState } from 'react';

import { fetchBookSpecs } from '@/api/bookSpecs';
import { notify } from '@/lib/notify';

import { CatalogGallery } from '@/components/catalog/CatalogGallery';
import { BookSpecCard } from '@/components/catalog/BookSpecCard';

/**
 * 판형 카탈로그 페이지
 *
 * Sweetbook이 제공하는 포토북 판형 목록을 그리드로 보여줌.
 * 이 페이지는 조회 전용으로, 실제 주문 플로우와 연결되지 않음.
 */

export function BookSpecsPage() {
  const [items, setItems] = useState<BookSpecCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // unmount 이후 setState를 막기 위한 플래그
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchBookSpecs();
        if (!cancelled) {
          setItems(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[BookSpecsPage] fetchBookSpecs failed:', error);
          notify.bookSpecsLoadFailed(error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CatalogGallery
      title="판형 둘러보기"
      description="Sweetbook이 제공하는 포토북 판형을 한눈에 비교해보세요."
      items={items}
      isLoading={isLoading}
      getKey={item => item.bookSpecUid}
      renderCard={item => <BookSpecCard spec={item} />}
    />
  );
}
