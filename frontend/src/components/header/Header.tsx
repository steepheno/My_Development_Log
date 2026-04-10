import style from './Header.module.scss';
import { Link, NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/edit', label: '편집' },
  { to: '/preview', label: '미리보기' },
  { to: '/order', label: '주문' },
] as const;

export function Header() {
  const { pathname } = useLocation();

  return (
    <header className={style.header}>
      <div className={style.inner}>
        <Link
          to="/"
          className={style.logo}
        >
          개발일지
        </Link>
        <nav className={style.nav}>
          {NAV_ITEMS.map(item => {
            const isCurrent = pathname === item.to;

            if (isCurrent) {
              return (
                <span
                  key={item.to}
                  className={`${style.link} ${style.active}`}
                >
                  {item.label}
                </span>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={style.link}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
