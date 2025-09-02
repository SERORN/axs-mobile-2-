import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OtpService } from './otp.service';
import { LoginDto, VerifyOtpDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}

  async sendOtp(loginDto: LoginDto) {
    const { phone } = loginDto;
    
    // Send OTP via Twilio
    const result = await this.otpService.sendOtp(phone);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      sid: result.sid,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, code } = verifyOtpDto;
    
    // Verify OTP with Twilio
    const isValid = await this.otpService.verifyOtp(phone, code);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          verified: true,
        },
      });
    } else {
      // Update verified status
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
      });
    }

    // Generate JWT token
    const payload = { sub: user.id, phone: user.phone };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        verified: user.verified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { phone, email, name } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { email: email || undefined },
        ],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Send OTP for verification
    const result = await this.otpService.sendOtp(phone);
    
    // Create unverified user
    const user = await this.prisma.user.create({
      data: {
        phone,
        email,
        name,
        verified: false,
      },
    });

    return {
      success: true,
      message: 'Registration initiated. Please verify your phone number.',
      sid: result.sid,
      userId: user.id,
    };
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.verified) {
      throw new UnauthorizedException('User not found or not verified');
    }

    return user;
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vehicles: true,
        passes: {
          include: {
            plaza: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
