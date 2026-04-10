import style from './RootLayout.module.scss';
import { Header } from '@/components/header/Header';
import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className={style.layout}>
      <Header />
      <main className={style.main}>
        <Outlet />
      </main>
    </div>
  );
}
