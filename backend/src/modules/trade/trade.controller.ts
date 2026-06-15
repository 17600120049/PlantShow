import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TradeService } from './trade.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Trade } from '@prisma/client';

@Controller('trades')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createTradeDto: CreateTradeDto): Promise<Trade> {
    return this.tradeService.create(createTradeDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req, @Query('userId') userId?: string): Promise<Trade[]> {
    return this.tradeService.findAll(userId || req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Trade> {
    return this.tradeService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateTradeDto: UpdateTradeDto): Promise<Trade> {
    return this.tradeService.update(id, updateTradeDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<Trade> {
    return this.tradeService.remove(id, req.user.id);
  }
}
