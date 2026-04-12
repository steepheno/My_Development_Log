import style from './ProgressChecklist.module.scss';
import type { ChecklistState } from './checklistState';

interface StepRow {
  key: keyof Pick<ChecklistState, 'bookCreate' | 'coverCreate' | 'contentsInsert' | 'finalize' | 'orderCreate'>;
  icon: string;
  label: string;
}

const STEPS: StepRow[] = [
  { key: 'bookCreate', icon: '📚', label: '책 생성' },
  { key: 'coverCreate', icon: '🎨', label: '표지 만들기' },
  { key: 'contentsInsert', icon: '📄', label: '내지 만들기' },
  { key: 'finalize', icon: '✨', label: '책 마무리' },
  { key: 'orderCreate', icon: '📦', label: '주문 등록' },
];

interface Props {
  state: ChecklistState;
}

export function ProgressChecklist({ state }: Props) {
  return (
    <div className={style.container}>
      <h2 className={style.title}>주문을 처리하고 있어요...</h2>
      <p className={style.subtitle}>완료될 때까지 새로고침 하거나 페이지를 닫지 말아주세요.</p>

      <ul className={style.list}>
        {STEPS.map(step => {
          const status = state[step.key];
          const isContents = step.key === 'contentsInsert';

          return (
            <li
              key={step.key}
              className={`${style.row} ${style[status]}`}
              data-status={status}
            >
              <span className={style.icon}>{status === 'done' ? '✅' : status === 'active' ? '⏳' : step.icon}</span>
              <span className={style.label}>
                {step.label}
                {isContents && status === 'active' && state.contentsTotal > 0 && (
                  <span className={style.counter}>
                    {' '}
                    ({state.contentsCurrent} / {state.contentsTotal})
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
