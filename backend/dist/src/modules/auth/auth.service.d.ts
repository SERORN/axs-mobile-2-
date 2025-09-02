import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { OtpService } from './otp.service';
import { LoginDto, VerifyOtpDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private otpService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, otpService: OtpService);
    sendOtp(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        sid: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        access_token: string;
        user: {
            id: any;
            phone: any;
            email: any;
            role: any;
            orgId: any;
            organization: any;
            verified: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        sid: string;
        userId: any;
    }>;
    validateUser(payload: any): Promise<any>;
    getUserProfile(userId: string): Promise<any>;
}
