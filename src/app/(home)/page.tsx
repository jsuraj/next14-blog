import BlogList from '@/components/BlogList';
import PageContainer from '@/components/PageContainer';
import { db } from '@/db/db';

export const revalidate = 0;

export default async function Home() {
  const posts = await db.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
    },
  });
  console.log('HomePage: posts length', posts.length);

  return (
    <PageContainer>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Latest Blogs</h1>
      </div>
      <BlogList posts={posts} />
    </PageContainer>
  );
}
