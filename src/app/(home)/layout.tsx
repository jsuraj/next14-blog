import { Nav, NavLink } from '@/components/Nav';
import { ReactNode } from 'react';

export default function HomeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Nav>
        <NavLink href='/'>Home</NavLink>
      </Nav>
      <div className='container my-6'>{children}</div>
    </>
  );
}
