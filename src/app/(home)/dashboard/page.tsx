import PageContainer from '@/components/PageContainer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { db } from '@/db/db';
import { formatDate } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { EditIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const posts = await db.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
    include: { author: true },
  });

  return (
    <PageContainer>
      <div className='flex justify-between items-center mb-8'>
        <h1 className='text-3xl font-bold'>My Posts</h1>
        <Link href='/create'>
          <Button>
            <PlusIcon className='mr-2 h-4 w-4' />
            New Post
          </Button>
        </Link>
      </div>
      {posts.length === 0 ? (
        <div className='text-center py-10'>
          <h3 className='text-xl font-medium'>
            You have not created any posts yet
          </h3>
          <p className='text-muted-foreground mt-2 mb-6'>
            Get started by creating first post
          </p>
          <Link href='/create'>
            <Button>
              <PlusIcon />
              Create First Post
            </Button>
          </Link>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`}>
              <Card className='h-full transition-all hover:shadow-md'>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-muted-foreground line-clamp-2'>
                    {DOMPurify.sanitize(post.content, { ALLOWED_TAGS: [] })}
                  </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                  <div className='text-sm text-muted-foreground'>
                    <time dateTime={post.createdAt.toISOString()}>
                      {formatDate(post.createdAt)}
                    </time>
                  </div>
                  <div className='flex gap-2'>
                    <Link href={`/posts/${post.id}`}>
                      <Button variant='outline' size='sm'>
                        View
                      </Button>
                    </Link>
                    <Link href={`/edit/${post.id}`}>
                      <Button variant='outline' size='sm'>
                        <EditIcon className='mr-2 h-4 w-4' />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
