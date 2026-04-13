import style from './BookSpecCard.module.scss';
import type { BookSpecCatalogItem } from '@/types/bookSpec';

/**
 * 판형 카탈로그 카드
 *
 * Sweetbook BookSpecs API에 이미지 필드가 없음.
 * 응답에 포함된 innerTrimWidthMm/innerTrimHeightMm를 사용하여
 * 판형의 실제 비율과 절대 크기를 SVG로 시각화함.
 */

interface BookSpecCardProps {
  spec: BookSpecCatalogItem;
}

// 시각화 영역 크기 (220px)
const SVG_BOX_SIZE = 220;

// 가장 긴 변(A4)을 기준으로 스케일링
const MAX_DIMENSION_MM = 297;

// 박스 안에서 책이 차지할 최대 비율 (여백 확보)
const BOOK_FIT_RATIO = 0.85;

export function BookSpecCard({ spec }: BookSpecCardProps) {
  // mm → px 변환 비율
  const mmToPx = (SVG_BOX_SIZE * BOOK_FIT_RATIO) / MAX_DIMENSION_MM;

  const bookWidthPx = spec.innerTrimWidthMm * mmToPx;
  const bookHeightPx = spec.innerTrimHeightMm * mmToPx;

  // 박스 중앙에 배치하기 위한 좌표
  const x = (SVG_BOX_SIZE - bookWidthPx) / 2;
  const y = (SVG_BOX_SIZE - bookHeightPx) / 2;

  return (
    <article className={style.card}>
      <div className={style.visual}>
        <svg
          width={SVG_BOX_SIZE}
          height={SVG_BOX_SIZE}
          viewBox={`0 0 ${SVG_BOX_SIZE} ${SVG_BOX_SIZE}`}
          role="img"
          aria-label={`${spec.name} 비율 시각화: ${spec.sizeLabel}`}
        >
          {/* 책 본체 */}
          <rect
            x={x}
            y={y}
            width={bookWidthPx}
            height={bookHeightPx}
            rx={2}
            className={style.book}
          />
          {/* 제본부 (왼쪽 세로선) */}
          <line
            x1={x + 4}
            y1={y + 4}
            x2={x + 4}
            y2={y + bookHeightPx - 4}
            className={style.spine}
          />
        </svg>
      </div>

      <header className={style.header}>
        <h2 className={style.name}>{spec.name}</h2>
        <p className={style.sizeLabel}>{spec.sizeLabel}</p>
      </header>

      <dl className={style.specs}>
        <div className={style.specRow}>
          <dt className={style.specLabel}>표지</dt>
          <dd className={style.specValue}>{spec.coverType}</dd>
        </div>
        <div className={style.specRow}>
          <dt className={style.specLabel}>제본</dt>
          <dd className={style.specValue}>{spec.bindingType}</dd>
        </div>
        <div className={style.specRow}>
          <dt className={style.specLabel}>코팅</dt>
          <dd className={style.specValue}>{spec.lamination}</dd>
        </div>
        <div className={style.specRow}>
          <dt className={style.specLabel}>내지 용지</dt>
          <dd className={style.specValue}>{spec.innerPaper}</dd>
        </div>
        <div className={style.specRow}>
          <dt className={style.specLabel}>페이지</dt>
          <dd className={style.specValue}>{spec.pageLabel}</dd>
        </div>
      </dl>

      <footer className={style.footer}>
        <code className={style.uid}>{spec.bookSpecUid}</code>
      </footer>
    </article>
  );
}