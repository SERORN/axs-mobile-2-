"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding ToothPick database...');
    console.log('📁 Creating categories...');
    const dentalImplants = await prisma.category.create({
        data: {
            name: 'Dental Implants',
            nameI18n: {
                es: 'Implantes Dentales',
                en: 'Dental Implants',
                pt: 'Implantes Dentais',
            },
            slug: 'dental-implants',
            level: 0,
        },
    });
    const instruments = await prisma.category.create({
        data: {
            name: 'Dental Instruments',
            nameI18n: {
                es: 'Instrumentos Dentales',
                en: 'Dental Instruments',
                pt: 'Instrumentos Dentais',
            },
            slug: 'dental-instruments',
            level: 0,
        },
    });
    const consumables = await prisma.category.create({
        data: {
            name: 'Consumables',
            nameI18n: {
                es: 'Consumibles',
                en: 'Consumables',
                pt: 'Consumíveis',
            },
            slug: 'consumables',
            level: 0,
        },
    });
    const titaniumImplants = await prisma.category.create({
        data: {
            name: 'Titanium Implants',
            nameI18n: {
                es: 'Implantes de Titanio',
                en: 'Titanium Implants',
                pt: 'Implantes de Titânio',
            },
            slug: 'titanium-implants',
            parentId: dentalImplants.id,
            level: 1,
        },
    });
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@toothpick.com',
            phone: '+525512345678',
            passwordHash: adminPassword,
            role: 'ADMIN',
            verified: true,
        },
    });
    console.log('🏢 Creating provider organization...');
    const providerOrg = await prisma.organization.create({
        data: {
            name: 'Straumann Mexico',
            slug: 'straumann-mexico',
            type: 'PROVIDER',
            rfc: 'STR123456789',
            legalName: 'Straumann Mexico S.A. de C.V.',
            country: 'MX',
            currency: 'MXN',
            status: 'APPROVED',
            subscriptionPlan: 'PRO',
            billingData: {
                address: 'Av. Revolución 1425, Col. Tlacopac',
                city: 'Ciudad de México',
                state: 'CDMX',
                zipCode: '01010',
                country: 'MX',
            },
        },
    });
    const providerPassword = await bcrypt.hash('provider123', 10);
    const provider = await prisma.user.create({
        data: {
            email: 'provider@straumann.mx',
            phone: '+525512345679',
            passwordHash: providerPassword,
            role: 'PROVIDER',
            orgId: providerOrg.id,
            verified: true,
        },
    });
    console.log('🏬 Creating distributor organization...');
    const distributorOrg = await prisma.organization.create({
        data: {
            name: 'Dental Supply Co',
            slug: 'dental-supply-co',
            type: 'DISTRIBUTOR',
            rfc: 'DSC123456789',
            legalName: 'Dental Supply Co S.A. de C.V.',
            country: 'MX',
            currency: 'MXN',
            status: 'APPROVED',
            subscriptionPlan: 'FREE',
            billingData: {
                address: 'Calle de la Salud 123, Col. Centro',
                city: 'Ciudad de México',
                state: 'CDMX',
                zipCode: '06000',
                country: 'MX',
            },
        },
    });
    const distributorPassword = await bcrypt.hash('distributor123', 10);
    const distributor = await prisma.user.create({
        data: {
            email: 'distributor@dentalsupply.com',
            phone: '+525512345680',
            passwordHash: distributorPassword,
            role: 'DISTRIBUTOR',
            orgId: distributorOrg.id,
            verified: true,
        },
    });
    const clientPassword = await bcrypt.hash('client123', 10);
    const client = await prisma.user.create({
        data: {
            email: 'client@dental-clinic.com',
            phone: '+525512345681',
            passwordHash: clientPassword,
            role: 'CLIENT',
            verified: true,
        },
    });
    console.log('🦷 Creating products...');
    const implantKit = await prisma.product.create({
        data: {
            name: 'Straumann BLT Implant Kit',
            slug: 'straumann-blt-implant-kit',
            descriptionI18n: {
                es: 'Kit completo de implante BLT de Straumann con todos los componentes necesarios para la cirugía.',
                en: 'Complete Straumann BLT implant kit with all necessary components for surgery.',
                pt: 'Kit completo de implante BLT Straumann com todos os componentes necessários para cirurgia.',
            },
            categoryId: titaniumImplants.id,
            brand: 'Straumann',
            sku: 'STR-BLT-001',
            barcode: '1234567890123',
            attributes: {
                material: 'Titanium Grade 4',
                surface: 'SLActive',
                connection: 'Bone Level Tapered',
                sterilization: 'Gamma irradiated',
            },
            images: [
                'https://example.com/images/straumann-blt-1.jpg',
                'https://example.com/images/straumann-blt-2.jpg',
            ],
            providerId: providerOrg.id,
            requiresQuote: true,
        },
    });
    console.log('📦 Creating product variants...');
    const variant35mm = await prisma.variant.create({
        data: {
            productId: implantKit.id,
            options: {
                diameter: '3.3mm',
                length: '8mm',
                platform: 'NNC 3.3',
            },
            priceBase: 2500.00,
            currency: 'MXN',
            weight: 0.05,
            dimensions: {
                length: 10,
                width: 10,
                height: 15,
            },
            stock: 50,
            minQty: 1,
        },
    });
    const variant40mm = await prisma.variant.create({
        data: {
            productId: implantKit.id,
            options: {
                diameter: '4.1mm',
                length: '10mm',
                platform: 'NC 4.1',
            },
            priceBase: 2750.00,
            currency: 'MXN',
            weight: 0.06,
            dimensions: {
                length: 10,
                width: 10,
                height: 15,
            },
            stock: 30,
            minQty: 1,
        },
    });
    await prisma.priceTier.createMany({
        data: [
            {
                variantId: variant35mm.id,
                minQty: 5,
                price: 2375.00,
                currency: 'MXN',
            },
            {
                variantId: variant35mm.id,
                minQty: 10,
                price: 2250.00,
                currency: 'MXN',
            },
            {
                variantId: variant40mm.id,
                minQty: 5,
                price: 2612.50,
                currency: 'MXN',
            },
            {
                variantId: variant40mm.id,
                minQty: 10,
                price: 2475.00,
                currency: 'MXN',
            },
        ],
    });
    const instrumentsProduct = await prisma.product.create({
        data: {
            name: 'Dental Scaler Set',
            slug: 'dental-scaler-set',
            descriptionI18n: {
                es: 'Set completo de curetas dentales de acero inoxidable.',
                en: 'Complete set of stainless steel dental scalers.',
                pt: 'Conjunto completo de curetas dentais de aço inoxidável.',
            },
            categoryId: instruments.id,
            brand: 'Hu-Friedy',
            sku: 'HF-SCALER-001',
            attributes: {
                material: 'Stainless Steel',
                pieces: '12',
                sterilization: 'Autoclavable',
            },
            images: [
                'https://example.com/images/scaler-set-1.jpg',
            ],
            providerId: providerOrg.id,
            requiresQuote: false,
        },
    });
    await prisma.variant.create({
        data: {
            productId: instrumentsProduct.id,
            options: {
                set: 'Standard 12-piece',
            },
            priceBase: 450.00,
            currency: 'MXN',
            weight: 0.2,
            stock: 100,
            minQty: 1,
        },
    });
    console.log('💱 Creating exchange rates...');
    await prisma.exchangeRate.createMany({
        data: [
            { base: 'MXN', quote: 'USD', rate: 0.055 },
            { base: 'USD', quote: 'MXN', rate: 18.20 },
            { base: 'MXN', quote: 'BRL', rate: 0.29 },
            { base: 'BRL', quote: 'MXN', rate: 3.45 },
        ],
    });
    await prisma.subscription.create({
        data: {
            organizationId: providerOrg.id,
            plan: 'PRO',
            startedAt: new Date(),
            renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('✅ ToothPick database seeded successfully!');
    console.log('\n🔑 Test credentials:');
    console.log('Admin: admin@toothpick.com / admin123');
    console.log('Provider: provider@straumann.mx / provider123');
    console.log('Distributor: distributor@dentalsupply.com / distributor123');
    console.log('Client: client@dental-clinic.com / client123');
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-toothpick.js.map