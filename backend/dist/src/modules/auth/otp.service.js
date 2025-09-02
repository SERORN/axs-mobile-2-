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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const twilio = require("twilio");
let OtpService = class OtpService {
    constructor(configService) {
        this.configService = configService;
        const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
        this.serviceSid = this.configService.get('TWILIO_SERVICE_SID', '');
        if (accountSid && authToken) {
            this.twilioClient = twilio(accountSid, authToken);
        }
        else {
            console.warn('⚠️  Twilio credentials not configured. OTP service will use mock mode.');
        }
    }
    async sendOtp(phoneNumber) {
        if (!this.twilioClient) {
            console.log(`📱 Mock OTP sent to ${phoneNumber}: 123456`);
            return {
                sid: `mock_${Date.now()}`,
                status: 'pending',
            };
        }
        try {
            const verification = await this.twilioClient.verify.v2
                .services(this.serviceSid)
                .verifications.create({
                to: phoneNumber,
                channel: 'sms',
            });
            return {
                sid: verification.sid,
                status: verification.status,
            };
        }
        catch (error) {
            console.error('Twilio OTP send error:', error);
            throw new Error('Failed to send OTP');
        }
    }
    async verifyOtp(phoneNumber, code) {
        if (!this.twilioClient) {
            const isValid = code === '123456';
            console.log(`📱 Mock OTP verification for ${phoneNumber}: ${code} - ${isValid ? 'Valid' : 'Invalid'}`);
            return isValid;
        }
        try {
            const verificationCheck = await this.twilioClient.verify.v2
                .services(this.serviceSid)
                .verificationChecks.create({
                to: phoneNumber,
                code: code,
            });
            return verificationCheck.status === 'approved';
        }
        catch (error) {
            console.error('Twilio OTP verify error:', error);
            return false;
        }
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OtpService);
//# sourceMappingURL=otp.service.js.map