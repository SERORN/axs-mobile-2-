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
            id: string;
            phone: string;
            email: string;
            name: string;
            verified: boolean;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        sid: string;
        userId: string;
    }>;
    getProfile(req: any): Promise<{
        passes: ({
            plaza: {
                id: string;
                name: string;
                address: string;
                city: string;
                state: string;
                zipCode: string | null;
                coordinates: string | null;
                type: import(".prisma/client").$Enums.PlazaType;
                status: import(".prisma/client").$Enums.PlazaStatus;
                capacity: number | null;
                occupied: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            type: import(".prisma/client").$Enums.PassType;
            status: import(".prisma/client").$Enums.PassStatus;
            createdAt: Date;
            updatedAt: Date;
            vin: string | null;
            userId: string;
            vehicleId: string | null;
            plazaId: string;
            qrCode: string;
            validFrom: Date;
            validUntil: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            usageCount: number;
            maxUsage: number | null;
            guestName: string | null;
            guestPhone: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            purchaseId: string | null;
        })[];
        vehicles: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            vin: string;
            plate: string | null;
            brand: string;
            model: string;
            year: number;
            color: string | null;
            userId: string | null;
            plateNumber: string | null;
        }[];
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string | null;
        phone: string;
        verified: boolean;
    }>;
}
