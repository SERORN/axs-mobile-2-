import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto, ConfirmPaymentDto } from './dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-intent')
  @ApiOperation({ summary: 'Create payment intent for a pass purchase' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  async createPaymentIntent(
    @Request() req: any,
    @Body() createPaymentDto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(req.user.id, createPaymentDto);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm payment and create pass' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto, @Request() req: any) {
    return this.paymentService.confirmPayment(confirmPaymentDto, req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history for current user' })
  @ApiResponse({ status: 200, description: 'Payment history retrieved' })
  async getPaymentHistory(@Request() req: any) {
    return this.paymentService.getPaymentHistory(req.user.id, req.user.role);
  }
}
