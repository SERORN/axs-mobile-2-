import { ConfigService } from '@nestjs/config';
export declare class OtpService {
    private configService;
    private twilioClient;
    private serviceSid;
    constructor(configService: ConfigService);
    sendOtp(phoneNumber: string): Promise<{
        sid: string;
        status: string;
    }>;
    verifyOtp(phoneNumber: string, code: string): Promise<boolean>;
}
