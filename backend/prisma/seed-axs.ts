import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with AXS sample data...');

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-automotriz' },
    update: {},
    create: {
      name: 'Demo Automotriz',
      slug: 'demo-automotriz',
      country: 'MX',
      currency: 'MXN',
      locales: ['es-MX'],
      plan: 'PRO',
      billingStatus: 'ACTIVE',
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create demo site
  const site = await prisma.site.upsert({
    where: { id: 'demo-site-1' },
    update: {},
    create: {
      id: 'demo-site-1',
      tenantId: tenant.id,
      name: 'Agencia Lomas',
      address: 'Av. Lomas de Chapultepec 123, CDMX',
      lat: 19.4326,
      lng: -99.1332,
      timezone: 'America/Mexico_City',
    },
  });

  console.log('✅ Created site:', site.name);

  // Create sample flow
  const flow = await prisma.flow.upsert({
    where: { id: 'agencia-flow-1' },
    update: {},
    create: {
      id: 'agencia-flow-1',
      tenantId: tenant.id,
      name: 'Flujo Agencia Automotriz',
      version: '1.0',
      definitionJson: {
        screens: [
          {
            id: 'vehicle-info',
            type: 'form',
            title: 'Información del Vehículo',
            fields: [
              { 
                id: 'vin', 
                type: 'text', 
                label: 'VIN', 
                required: true,
                placeholder: 'Ej: 3VW2B7AJ9EM123456'
              },
              { 
                id: 'plate', 
                type: 'text', 
                label: 'Placas', 
                required: false,
                placeholder: 'Ej: ABC-123'
              },
              { 
                id: 'km', 
                type: 'number', 
                label: 'Kilometraje', 
                required: true,
                placeholder: 'Ej: 45678'
              },
              { 
                id: 'reason', 
                type: 'select', 
                label: 'Motivo de visita', 
                required: true,
                options: [
                  { value: 'service', label: 'Servicio' },
                  { value: 'warranty', label: 'Garantía' },
                  { value: 'claim', label: 'Siniestro' }
                ]
              },
              { 
                id: 'photo', 
                type: 'photo', 
                label: 'Foto del vehículo', 
                required: true
              }
            ]
          }
        ],
        rules: [
          {
            if: { field: 'reason', equals: 'claim' },
            then: { requireMinPhotos: 3 }
          }
        ],
        payment: null
      },
    },
  });

  console.log('✅ Created flow:', flow.name);

  // Create access points
  const accessPointVehicular = await prisma.accessPoint.upsert({
    where: { publicId: 'agencia-lomas-vehicular-1' },
    update: {},
    create: {
      publicId: 'agencia-lomas-vehicular-1',
      siteId: site.id,
      name: 'Entrada Vehicular Principal',
      type: 'VEHICULAR',
      flowId: flow.id,
    },
  });

  const accessPointPeatonal = await prisma.accessPoint.upsert({
    where: { publicId: 'agencia-lomas-peatonal-1' },
    update: {},
    create: {
      publicId: 'agencia-lomas-peatonal-1',
      siteId: site.id,
      name: 'Entrada Peatonal',
      type: 'PEDESTRIAN',
      flowId: flow.id,
    },
  });

  console.log('✅ Created access points:', accessPointVehicular.name, accessPointPeatonal.name);

  // Create QR tags
  await prisma.qrTag.upsert({
    where: { printedCode: 'QR-VEHICULAR-001' },
    update: {},
    create: {
      accessPointId: accessPointVehicular.id,
      printedCode: 'QR-VEHICULAR-001',
      status: 'ACTIVE',
      notes: 'QR impreso en placa metálica - Entrada principal vehicular',
    },
  });

  await prisma.qrTag.upsert({
    where: { printedCode: 'QR-PEATONAL-001' },
    update: {},
    create: {
      accessPointId: accessPointPeatonal.id,
      printedCode: 'QR-PEATONAL-001',
      status: 'ACTIVE',
      notes: 'QR impreso en placa metálica - Entrada peatonal',
    },
  });

  console.log('✅ Created QR tags');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { phoneE164: '+525512345678' },
    update: {},
    create: {
      phoneE164: '+525512345678',
      email: 'demo@axs.com',
      name: 'Usuario Demo',
      verified: true,
      preferredLocale: 'es-MX',
    },
  });

  console.log('✅ Created demo user:', user.name);

  // Link user to tenant
  await prisma.tenantUser.upsert({
    where: { 
      tenantId_userId: {
        tenantId: tenant.id,
        userId: user.id
      }
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: user.id,
      role: 'END_USER',
    },
  });

  // Create demo vehicle
  await prisma.vehicle.upsert({
    where: { id: 'demo-vehicle-1' },
    update: {},
    create: {
      id: 'demo-vehicle-1',
      userId: user.id,
      plate: 'ABC-123',
      vin: '3VW2B7AJ9EM123456',
      brand: 'Volkswagen',
      model: 'Jetta',
      year: 2023,
      color: 'Blanco',
    },
  });

  console.log('✅ Created demo vehicle');

  // Create operator
  const operator = await prisma.operator.upsert({
    where: { 
      userId_tenantId: {
        userId: user.id,
        tenantId: tenant.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      tenantId: tenant.id,
      roles: ['OPERATOR', 'SUPERVISOR'],
      permissions: {
        canApproveVisits: true,
        canDenyVisits: true,
        canViewQueue: true,
        canExportData: true,
      },
    },
  });

  console.log('✅ Created operator');

  // ========================================
  // HOTEL/PARKING DEMO DATA
  // ========================================

  const hotelTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-hotel' },
    update: {},
    create: {
      name: 'Hotel Presidente',
      slug: 'demo-hotel',
      country: 'MX',
      currency: 'MXN',
      locales: ['es-MX'],
      plan: 'STARTER',
      billingStatus: 'ACTIVE',
    },
  });

  const hotelSite = await prisma.site.upsert({
    where: { id: 'hotel-site-1' },
    update: {},
    create: {
      id: 'hotel-site-1',
      tenantId: hotelTenant.id,
      name: 'Hotel Presidente Centro',
      address: 'Av. Juárez 70, Centro, CDMX',
      lat: 19.4355,
      lng: -99.1419,
      timezone: 'America/Mexico_City',
    },
  });

  const hotelFlow = await prisma.flow.upsert({
    where: { id: 'hotel-parking-flow-1' },
    update: {},
    create: {
      id: 'hotel-parking-flow-1',
      tenantId: hotelTenant.id,
      name: 'Flujo Estacionamiento Hotel',
      version: '1.0',
      definitionJson: {
        screens: [
          {
            id: 'parking-info',
            type: 'form',
            title: 'Información de Estacionamiento',
            fields: [
              { 
                id: 'plate', 
                type: 'text', 
                label: 'Placas del vehículo', 
                required: true,
                placeholder: 'Ej: ABC-123'
              },
              { 
                id: 'roomNumber', 
                type: 'text', 
                label: 'Número de habitación (opcional)', 
                required: false,
                placeholder: 'Ej: 501'
              },
              { 
                id: 'stayType', 
                type: 'select', 
                label: 'Tipo de estancia', 
                required: true,
                options: [
                  { value: 'guest', label: 'Huésped' },
                  { value: 'visitor', label: 'Visitante' },
                  { value: 'event', label: 'Evento' }
                ]
              },
              { 
                id: 'photo', 
                type: 'photo', 
                label: 'Foto del vehículo', 
                required: true
              }
            ]
          }
        ],
        rules: [
          {
            if: { field: 'stayType', equals: 'visitor' },
            then: { requirePayment: { amount: 5000, currency: 'MXN' } }
          }
        ],
        payment: {
          type: 'conditional',
          rules: [
            {
              if: { field: 'stayType', equals: 'visitor' },
              amount: 5000,
              currency: 'MXN',
              description: 'Tarifa de visitante por día'
            }
          ]
        }
      },
    },
  });

  const hotelAccessPoint = await prisma.accessPoint.upsert({
    where: { publicId: 'hotel-presidente-parking-1' },
    update: {},
    create: {
      publicId: 'hotel-presidente-parking-1',
      siteId: hotelSite.id,
      name: 'Estacionamiento Principal',
      type: 'VEHICULAR',
      flowId: hotelFlow.id,
    },
  });

  console.log('✅ Created hotel demo data');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Demo Access Points created:');
  console.log('   🚗 agencia-lomas-vehicular-1 (Agencia Automotriz)');
  console.log('   🚶 agencia-lomas-peatonal-1 (Agencia Automotriz)');
  console.log('   🏨 hotel-presidente-parking-1 (Hotel)');
  console.log('\n🔗 QR Content examples:');
  console.log('   axs://ap/agencia-lomas-vehicular-1');
  console.log('   axs://ap/agencia-lomas-peatonal-1');
  console.log('   axs://ap/hotel-presidente-parking-1');
  console.log('\n📱 Demo user: +525512345678 (OTP: any code)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });