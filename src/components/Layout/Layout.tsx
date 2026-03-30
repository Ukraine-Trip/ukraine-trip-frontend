import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import Menu from '../Menu/Menu.tsx';


export const Layout = () => {
  return (
    <>
        <Header />

      <main>
        <Outlet />
      </main>

      <div>
        <Menu />
      </div>
    </>
  );
}