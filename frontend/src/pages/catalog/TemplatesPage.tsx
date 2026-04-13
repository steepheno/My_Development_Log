import styles from './TemplatesPage.module.scss';
import type { TemplateCatalog } from '@/types/template';
import { useEffect, useState } from 'react';

import { fetchTemplates } from '@/api/templates';
import { notify } from '@/lib/notify';

import { CatalogGallery } from '@/components/catalog/CatalogGallery';
import { TemplateThemeSection } from '@/components/catalog/TemplateThemeSection';
import { ScrollMove } from '@/components/scrollMoveButton/ScrollMove';

/**
 * 템플릿 카탈로그 페이지
 *
 * Sweetbook이 제공하는 포토북 템플릿을 테마별로 그룹핑하여 렌더링.
 * 조회 전용으로, 실제 주문 플로우와 연결되지 않음.
 */

export function TemplatesPage() {
  const [catalog, setCatalog] = useState<TemplateCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // unmount 이후 setState를 막기 위한 플래그
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchTemplates();
        if (!cancelled) {
          setCatalog(data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('[TemplatesPage] fetchTemplates failed:', error);
          notify.templatesLoadFailed(error);
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

  // 빈 상태 판정: 정규 테마, 공용 그룹 모두 없을 때
  const isEmpty = !catalog || (catalog.regularThemes.length === 0 && catalog.utilityGroup === null);

  return (
    <>
      <CatalogGallery
        title="템플릿 둘러보기"
        description={
          catalog
            ? `총 ${catalog.totalTemplates}개의 템플릿을 테마별로 살펴볼 수 있어요.`
            : 'Sweetbook이 제공하는 다양한 디자인 템플릿을 살펴보세요.'
        }
        isLoading={isLoading}
        isEmpty={isEmpty}
        renderContent={() => (
          <div className={styles.content}>
            {/* 정규 테마 8개 */}
            {catalog!.regularThemes.map(group => (
              <TemplateThemeSection
                key={group.theme}
                group={group}
              />
            ))}

            {/* 공용 유틸리티 섹션 (옵션 A) */}
            {catalog!.utilityGroup && (
              <>
                <hr
                  className={styles.divider}
                  aria-hidden="true"
                />
                <TemplateThemeSection
                  group={catalog!.utilityGroup}
                  variant="utility"
                />
              </>
            )}
          </div>
        )}
      />
      <ScrollMove />
    </>
  );
}
