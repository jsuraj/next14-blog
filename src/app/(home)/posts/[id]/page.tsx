import PageContainer from '@/components/PageContainer';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { db } from '@/db/db';
import { formatDate } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getPost(id: string) {
  const post = await db.post.findUnique({
    where: { id },
    include: { author: true },
  });

  return post;
}

export async function generateStaticParams() {
  const posts = await db.post.findMany({ select: { id: true } });
  return posts.map((post) => ({ id: post.id }));
}

export const revalidate = 60;

export default async function PostPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const post = await getPost(id);

  const { userId } = await auth();
  const isAuthor = post?.authorId === userId;

  if (!post) {
    return notFound();
  }

  return (
    <PageContainer>
      <div className='mb-6 flex items-center gap-4'>
        <Link href='/'>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 w-4 h-4' />
            Back
          </Button>
        </Link>
        {isAuthor && (
          <Link href={`/edit/${id}`}>
            <Button className='ml-2' variant='outline'>
              <Edit className='mr-2 w-4 h-4' />
              Edit
            </Button>
          </Link>
        )}
      </div>
      <article>
        <h1 className='text-4xl font-bold mb-4'>{post.title}</h1>
        <div className='flex items-center gap-2 text-muted-foreground mb-8'>
          <span>{`${post.author.firstName} ${post.author.lastName}`}</span>
          <time dateTime={post.createdAt.toISOString()}>
            {formatDate(post.createdAt)}
          </time>
        </div>
        <RichTextEditor content={post.content} editable={false} />
      </article>
    </PageContainer>
  );
}
