import { Controller, Get, Post as PostMethod, Body, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Post as PostModel, PostType } from '@prisma/client';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @PostMethod()
  async create(@Request() req, @Body() createPostDto: CreatePostDto): Promise<PostModel> {
    return this.postService.create(createPostDto, req.user.id);
  }

  @Get()
  async findAll(@Query('type') type?: PostType): Promise<PostModel[]> {
    return this.postService.findAll(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostModel> {
    return this.postService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<PostModel> {
    return this.postService.remove(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.postService.addComment(id, createCommentDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(@Request() req, @Param('commentId') commentId: string) {
    return this.postService.deleteComment(commentId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @PostMethod(':id/likes')
  async toggleLike(@Request() req, @Param('id') id: string): Promise<{ liked: boolean }> {
    const liked = await this.postService.toggleLike(id, req.user.id);
    return { liked };
  }

  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string): Promise<PostModel[]> {
    return this.postService.getPostsByUser(userId);
  }
}
