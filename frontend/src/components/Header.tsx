import style from './Header.module.scss';
import { Link, NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className={style.header}>
      <div className={style.inner}>
        <Link to="/" className={style.logo}>
          개발일지
        </Link>
        <nav className={style.nav}>
          <NavLink
            to="/edit"
            className={({ isActive }) =>
              isActive ? `${style.link} ${style.active}` : style.link
            }
          >
            편집
          </NavLink>
          <NavLink
            to="/preview"
            className={({ isActive }) =>
              isActive ? `${style.link} ${style.active}` : style.link
            }
          >
            미리보기
          </NavLink>
          <NavLink
            to="/order"
            className={({ isActive }) =>
              isActive ? `${style.link} ${style.active}` : style.link
            }
          >
            주문
          </NavLink>
        </nav>
      </div>
    </header>
  );
};