'use client';

import PageContainer from '@/components/PageContainer';
import RichTextEditor from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { editPost, getPostForEdit } from '@/lib/actions';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditPostPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { userId, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const fetchPost = async () => {
      if (!isSignedIn) {
        return;
      }
      try {
        const post = await getPostForEdit(id);
        if (post.success) {
          setTitle(post.data?.title ?? '');
          setContent(post.data?.content ?? '');
          setImageUrl(post.data?.imageUrl ?? null);
        }
      } catch (err) {
        console.error('Failed to fetch post', err);
        toast('Failed to fetch post');
      } finally {
        setIsLoading(false);
      }
    };
    if (isLoaded) {
      fetchPost();
    }
  }, [isLoaded, isSignedIn, router, id]);

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-10 flex justify-center'>
        <div>Loading...</div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImageUrl(URL.createObjectURL(file)); // Show preview before upload
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!userId) {
        throw new Error('User is not authenticated');
      }

      let uploadedImageUrl = imageUrl;

      // Upload new image if selected
      if (image) {
        const formData = new FormData();
        formData.append('file', image);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error('Failed to upload image', data.err);
        uploadedImageUrl = data.url;
      }

      const result = await editPost(id, {
        title,
        content,
        imageUrl: uploadedImageUrl ?? undefined,
      });
      if (result.success) {
        toast('Post updated successfully.');
        router.push(`/posts/${id}`);
      } else {
        toast('Failed to update post.');
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
        <Link href={`/posts/${id}`}>
          <Button variant='outline' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back
          </Button>
        </Link>
      </div>
      <h1 className='text-3xl font-bold'>Edit Post</h1>
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
        <div className='space-y-2'>
          <Label htmlFor='image'>Post Image</Label>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt='Post Image'
              className='w-full h-48 object-cover rounded-lg'
            />
          )}
          <Input type='file' accept='image/*' onChange={handleImageChange} />
        </div>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </PageContainer>
  );
}
