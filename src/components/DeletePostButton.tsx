'use client';

import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from './ui/alert-dialog';
import { useState } from 'react';
import { Button } from './ui/button';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { deletePost } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface DeletePostButtonProps {
  id: string;
}

export default function DeletePostButton({ id }: DeletePostButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const router = useRouter();

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(id);
      if (result.success) {
        toast('Post deleted successfully');
        router.refresh();
      } else {
        throw new Error('Something went wrong');
      }
    } catch (err) {
      console.error('Failed to delete post', err);
      toast('Failed to delete post. Please try again');
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='text-destructive hover:text-destructive'
        >
          <Trash2Icon className='mr-2 w-4 h-4' />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            post.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeletePost}
            className='bg-destructive hover:bg-destructive'
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
