import style from './SidebarItem.module.scss';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SidebarItemActions } from './SidebarItemActions';

interface SidebarItemProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  sortable?: boolean;
}

export function SidebarItem({ id, label, isActive, onClick, onDelete, sortable = false }: SidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !sortable,
  });

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const rootClassName = [style.item, isActive ? style.itemActive : ''].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={rootClassName}
    >
      <button
        type="button"
        className={style.labelButton}
        onClick={onClick}
      >
        {label}
      </button>
      {onDelete && sortable && (
        <SidebarItemActions
          className={style.actionsOnHover}
          onDelete={onDelete}
          deleteLabel={`${label} 삭제`}
          dragHandleAttributes={attributes}
          dragHandleListeners={listeners}
        />
      )}
      {onDelete && !sortable && (
        <button
          type="button"
          className={style.deleteButton}
          onClick={onDelete}
          aria-label={`${label} 삭제`}
        >
          ×
        </button>
      )}
    </div>
  );
}
