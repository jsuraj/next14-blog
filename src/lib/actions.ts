'use server';

import { auth } from '@clerk/nextjs/server';
import { CreatePostInput } from './types';
import { db } from '@/db/db';

export async function createPost(data: CreatePostInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }
    const post = await db.post.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        authorId: userId,
      },
    });
    return { success: true, data: post };
  } catch (err) {
    console.error('Error creating post', err);
    return { success: false, message: 'Failed to create post' };
  }
}

export async function getPostForEdit(postId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }
    const post = await db.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        authorId: true,
      },
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    if (post.authorId !== userId) {
      return {
        success: false,
        message: "You don't hace permissiong to edit the post",
      };
    }

    return { success: true, data: post };
  } catch (err) {
    console.error('Error fetching the post', err);
    return { success: false, message: 'Failed to fetch post' };
  }
}

export async function editPost(postId: string, data: CreatePostInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    if (post.authorId !== userId) {
      return {
        success: false,
        message: "You don't have permission to edit the post",
      };
    }

    const updatedPost = await db.post.update({
      where: {
        id: postId,
      },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || undefined,
        updatedAt: new Date(),
      },
    });
    return { success: true, data: updatedPost };
  } catch (err) {
    console.error('Error updating post', err);
    return { success: false, message: 'Failed to update post' };
  }
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return { success: true, url: data.url };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('Image upload failed', error);
    return { success: false };
  }
}
