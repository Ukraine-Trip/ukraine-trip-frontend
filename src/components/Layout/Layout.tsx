import React from 'react';
import {Header} from '../Header/Header.tsx';
import {Menu} from '../Menu/Menu.tsx';
import {Footer} from '../Footer/Footer.tsx';
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
}