import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Post, PostType } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostService {

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    return PrismaService.prisma.post.create({
      data: {
        ...createPostDto,
        userId,
      },
    });
  }

  async findAll(type?: PostType): Promise<Post[]> {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    return PrismaService.prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        plant: {
          select: {
            id: true,
            name: true,
            plantCode: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Post | null> {
    return PrismaService.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        plant: {
          select: {
            id: true,
            name: true,
            plantCode: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        likes: true,
      },
    });
  }

  async remove(id: string, userId: string): Promise<Post> {
    const post = await PrismaService.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return PrismaService.prisma.post.delete({
      where: { id },
    });
  }

  async addComment(postId: string, createCommentDto: CreateCommentDto, userId: string) {
    return PrismaService.prisma.comment.create({
      data: {
        postId,
        userId,
        content: createCommentDto.content,
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await PrismaService.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return PrismaService.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const existingLike = await PrismaService.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      await PrismaService.prisma.like.delete({
        where: { id: existingLike.id },
      });
      return false;
    } else {
      await PrismaService.prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      return true;
    }
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return PrismaService.prisma.post.findMany({
      where: { userId },
      include: {
        plant: true,
        comments: true,
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
