import { ReactNode } from 'react';

export default function PageContainer({
  children,
}: {
  children: Readonly<ReactNode>;
}) {
  return <div className='container mx-auto py-10 px-4 md:px-6'>{children}</div>;
}
