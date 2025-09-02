import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OtpService } from './otp.service';
import { LoginDto, VerifyOtpDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

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
      include: {
        organization: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone,
          email: `temp+${Date.now()}@toothpick.com`, // Temporary email, will be updated
          passwordHash: '', // Will be set during registration completion
          role: 'CLIENT', // Default role
          verified: true,
        },
        include: {
          organization: true,
        },
      });
    } else {
      // Update verified status
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { verified: true },
        include: {
          organization: true,
        },
      });
    }

    // Generate JWT token
    const payload = { 
      sub: user.id, 
      phone: user.phone, 
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        organization: user.organization,
        verified: user.verified,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { phone, email, password, role = 'CLIENT', organizationName } = registerDto;
    
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { email },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('User already exists with this phone or email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create organization if user is PROVIDER or DISTRIBUTOR
    let organization = null;
    if ((role === 'PROVIDER' || role === 'DISTRIBUTOR') && organizationName) {
      organization = await this.prisma.organization.create({
        data: {
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
          type: role,
        },
      });
    }

    // Send OTP for verification
    const result = await this.otpService.sendOtp(phone);
    
    // Create unverified user
    const user = await this.prisma.user.create({
      data: {
        phone,
        email,
        passwordHash,
        role,
        orgId: organization?.id,
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
      include: {
        organization: true,
      },
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
        organization: true,
        orders: {
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
