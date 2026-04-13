import style from './TemplateBookSpecSubGroup.module.scss';
import type { TemplateCatalogItem } from '@/types/template';
import { TemplateCard } from './TemplateCard';

/**
 * <판형별 서브 그룹>
 *
 * 한 테마 안의 '같은 판형' 카드들을 묶어서 보여주는 중간 계층.
 * 서브헤더(판형 라벨) + 카드 그리드로 구성.
 */

interface TemplateBookSpecSubGroupProps {
  bookSpecUid: string;
  bookSpecLabel: string;
  templates: TemplateCatalogItem[];
}

export function TemplateBookSpecSubGroup({
  bookSpecLabel,
  templates,
}: TemplateBookSpecSubGroupProps) {
  return (
    <div className={style.subGroup}>
      <h3 className={style.subHeader}>
        <span className={style.subLabel}>{bookSpecLabel}</span>
        <span className={style.subCount}>{templates.length}개</span>
      </h3>

      <ul className={style.grid}>
        {templates.map((template) => (
          <li key={template.templateUid} className={style.gridItem}>
            <TemplateCard template={template} />
          </li>
        ))}
      </ul>
    </div>
  );
}