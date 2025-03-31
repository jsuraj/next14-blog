import { Nav } from '@/components/Nav';
import { ReactNode } from 'react';

export default function HomeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
