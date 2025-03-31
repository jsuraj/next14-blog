import { Post, User } from '@prisma/client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { formatDate } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';

interface PostWithAuthor extends Post {
  author: User;
}

interface BlogListProps {
  posts: PostWithAuthor[];
}

export default function BlogList({ posts }: BlogListProps) {
  return (
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
            <CardFooter className='text-sm text-muted-foreground'>
              <div className='flex gap-2 items-center'>
                <span>{`${post.author.firstName} ${post.author.lastName}`}</span>
                <time dateTime={post.createdAt.toISOString()}>
                  {formatDate(post.createdAt)}
                </time>
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
