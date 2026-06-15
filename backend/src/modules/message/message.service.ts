import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { Message, Conversation, MessageType } from '@prisma/client';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    private redisService: RedisService,
  ) {}

  async getOrCreateConversation(userId: string, targetUserId: string): Promise<Conversation> {
    let conversation = await PrismaService.prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: targetUserId },
          { user1Id: targetUserId, user2Id: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await PrismaService.prisma.conversation.create({
        data: {
          user1Id: userId,
          user2Id: targetUserId,
        },
      });
    }

    return conversation;
  }

  async sendMessage(
    userId: string,
    targetUserId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const conversation = await this.getOrCreateConversation(userId, targetUserId);

    const message = await PrismaService.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content: createMessageDto.content,
        type: createMessageDto.type || MessageType.TEXT,
      },
    });

    await PrismaService.prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: createMessageDto.content,
        unreadCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });

    await this.redisService.publish(`chat:${targetUserId}`, JSON.stringify(message));

    return message;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return PrismaService.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        user2: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    const conversation = await PrismaService.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new Error('Unauthorized');
    }

    await PrismaService.prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });

    return PrismaService.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
