export declare class LoginDto {
    phone: string;
}
export declare class VerifyOtpDto {
    phone: string;
    code: string;
}
export declare class RegisterDto {
    phone: string;
    email: string;
    password: string;
    role?: string;
    organizationName?: string;
}
