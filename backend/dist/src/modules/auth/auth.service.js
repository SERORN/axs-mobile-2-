"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const otp_service_1 = require("./otp.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService, otpService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.otpService = otpService;
    }
    async sendOtp(loginDto) {
        const { phone } = loginDto;
        const result = await this.otpService.sendOtp(phone);
        return {
            success: true,
            message: 'OTP sent successfully',
            sid: result.sid,
        };
    }
    async verifyOtp(verifyOtpDto) {
        const { phone, code } = verifyOtpDto;
        const isValid = await this.otpService.verifyOtp(phone, code);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid OTP code');
        }
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
        }
        else {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { verified: true },
            });
        }
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
    async register(registerDto) {
        const { phone, email, name } = registerDto;
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { phone },
                    { email: email || undefined },
                ],
            },
        });
        if (existingUser) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        const result = await this.otpService.sendOtp(phone);
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
    async validateUser(payload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user || !user.verified) {
            throw new common_1.UnauthorizedException('User not found or not verified');
        }
        return user;
    }
    async getUserProfile(userId) {
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
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        otp_service_1.OtpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map