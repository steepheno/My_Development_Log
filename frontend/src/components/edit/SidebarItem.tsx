import style from './SidebarItem.module.scss';

interface SidebarItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function SidebarItem({ label, isActive, onClick }: SidebarItemProps) {
  const className = isActive
    ? `${style.item} ${style.itemActive}`
    : style.item;

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
    >
      {label}
    </button>
  );
}