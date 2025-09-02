import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class OtpService {
  private twilioClient: twilio.Twilio;
  private serviceSid: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.serviceSid = this.configService.get<string>('TWILIO_SERVICE_SID', '');

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      console.warn('⚠️  Twilio credentials not configured. OTP service will use mock mode.');
    }
  }

  async sendOtp(phoneNumber: string) {
    if (!this.twilioClient) {
      // Mock mode for development
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
    } catch (error) {
      console.error('Twilio OTP send error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.twilioClient) {
      // Mock mode for development - accept 123456 as valid OTP
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
    } catch (error) {
      console.error('Twilio OTP verify error:', error);
      return false;
    }
  }
}
