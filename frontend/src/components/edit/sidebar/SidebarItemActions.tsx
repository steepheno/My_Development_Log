import style from './SidebarItemActions.module.scss';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { GripVertical } from 'lucide-react';

interface SidebarItemActionsProps {
  onDelete: () => void;
  deleteLabel: string;
  dragHandleAttributes: DraggableAttributes;
  dragHandleListeners: SyntheticListenerMap | undefined;
  className?: string;  // 외부에서 주입하는 className (부모의 hover 상태에 반응하는 CSS 훅)
}

export function SidebarItemActions({
  onDelete,
  deleteLabel,
  dragHandleAttributes,
  dragHandleListeners,
  className,
}: SidebarItemActionsProps) {
  const rootClassName = [style.actions, className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName}>
      <button
        type="button"
        className={style.dragHandle}
        aria-label="드래그하여 순서 변경"
        {...dragHandleAttributes}
        {...dragHandleListeners}
      >
        <GripVertical size={16} />
      </button>
      <button
        type="button"
        className={style.deleteButton}
        onClick={onDelete}
        aria-label={deleteLabel}
      >
        ×
      </button>
    </div>
  );
}