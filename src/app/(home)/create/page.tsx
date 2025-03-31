'use client';

import PageContainer from '@/components/PageContainer';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPost } from '@/lib/actions';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!userId) {
        throw new Error('User is not authenticated');
      }
      const result = await createPost({ title, content });
      if (result.success) {
        toast('Post created successfully.');
        router.push('/');
      } else {
        toast('Failed to create post.');
      }
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className='mb-6'>
        <Link href={`/`}>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </Link>
      </div>
      <h1 className='text-3xl font-bold'>Create New Post</h1>
      <form className='max-w-3xl space-y-6' onSubmit={handleSubmit}>
        <div className='space-y-2'>
          <Label htmlFor='title'>Title</Label>
          <Input
            id='title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter post title'
            className='bg-slate-50'
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='content'>Content</Label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </Button>
      </form>
    </PageContainer>
  );
}
