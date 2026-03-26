import React from 'react';
import {Header} from '../Header/Header.tsx';
import {Menu} from '../Menu/Menu.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({children}: LayoutProps) => {
  return (
    <>
    <header>
      <Header/>
    </header>
    <main>
      {children}
    </main>
    <div>
      <Menu/>
    </div>
    </>
  );
}