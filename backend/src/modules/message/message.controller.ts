import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Message, Conversation } from '@prisma/client';

@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':targetUserId')
  async sendMessage(
    @Request() req,
    @Param('targetUserId') targetUserId: string,
    @Body() createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    return this.messageService.sendMessage(req.user.id, targetUserId, createMessageDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req): Promise<Conversation[]> {
    return this.messageService.getConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id')
  async getMessages(@Request() req, @Param('id') id: string): Promise<Message[]> {
    return this.messageService.getMessages(id, req.user.id);
  }
}
