import { AuthService } from './auth.service';
import { LoginDto, VerifyOtpDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<any>;
}
