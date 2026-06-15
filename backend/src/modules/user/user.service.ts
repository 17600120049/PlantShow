import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { User, Follow } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {

  async findOne(id: string): Promise<User | null> {
    return PrismaService.prisma.user.findUnique({
      where: { id },
      include: {
        plants: true,
        posts: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return PrismaService.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async follow(followerId: string, followingId: string): Promise<Follow> {
    return PrismaService.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await PrismaService.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
  }

  async getFollowing(userId: string): Promise<User[]> {
    const follows = await PrismaService.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });
    return follows.map((f) => f.following);
  }

  async getFollowers(userId: string): Promise<User[]> {
    const follows = await PrismaService.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });
    return follows.map((f) => f.follower);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await PrismaService.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return !!follow;
  }
}
