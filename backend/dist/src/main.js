"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: [
            'http://localhost:19006',
            'http://localhost:19000',
            'exp://192.168.1.100:19000',
            'exp://localhost:19000',
            configService.get('FRONTEND_URL', 'http://localhost:3000'),
        ],
        credentials: true,
    });
    app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AXS Mobile API')
        .setDescription('Backend API for AXS Mobile Application')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.setGlobalPrefix('api');
    const port = parseInt(process.env.PORT ?? '', 10) || 3001;
    await app.listen(port);
    console.log(`AXS Backend API running on http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`� Development Mode - Local endpoints only`);
    console.log(`🎯 Webhook endpoint: http://localhost:${port}/api/webhooks/stripe`);
}
bootstrap();
//# sourceMappingURL=main.js.map