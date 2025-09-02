import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class PassService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserPasses(userId: string): Promise<({
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
        vehicle: {
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
        };
        passEvents: {
            id: string;
            type: import(".prisma/client").$Enums.PassEventType;
            createdAt: Date;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            passId: string;
            location: string | null;
        }[];
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
    })[]>;
    getPassById(passId: string): Promise<{
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
        user: {
            id: string;
            name: string;
            phone: string;
        };
        vehicle: {
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
    }>;
    consumePass(passId: string, userId: string, consumeData?: {
        location?: string;
        metadata?: any;
    }): Promise<{
        success: boolean;
        message: string;
        pass: {
            id: string;
            type: import(".prisma/client").$Enums.PassType;
            plaza: string;
            usageCount: number;
            maxUsage: number;
            status: import(".prisma/client").$Enums.PassStatus;
            validUntil: Date;
        };
    }>;
}
