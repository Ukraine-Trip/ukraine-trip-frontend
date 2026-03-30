import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header.tsx';
import Menu from '../Menu/Menu.tsx';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <header>
        <Header />
      </header>

      <main>
        {children || <Outlet />}
      </main>

      <div>
        <Menu />
      </div>
    </>
  );
}