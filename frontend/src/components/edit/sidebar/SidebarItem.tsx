import style from './SidebarItem.module.scss';

interface SidebarItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export function SidebarItem({ label, isActive, onClick, onDelete }: SidebarItemProps) {
  const rootClassName = isActive ? `${style.item} ${style.itemActive}` : style.item;

  return (
    <div className={rootClassName}>
      <button
        type="button"
        className={style.labelButton}
        onClick={onClick}
      >
        {label}
      </button>
      {onDelete && (
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
