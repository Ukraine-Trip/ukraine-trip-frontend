import { Header } from '../Header';
import { Menu } from '../Menu';
import { Footer } from '../Footer';
import { Outlet } from 'react-router-dom';

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

      <Footer />
    </>
  );
};
