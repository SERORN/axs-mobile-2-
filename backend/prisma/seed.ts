import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample plazas
  const parkingPlaza = await prisma.plaza.upsert({
    where: { id: 'plaza-parking-001' },
    update: {},
    create: {
      id: 'plaza-parking-001',
      name: 'Downtown Parking Center',
      address: '123 Main Street',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      type: 'PARKING',
      capacity: 500,
      occupied: 45,
      coordinates: JSON.stringify({ lat: 25.7617, lng: -80.1918 }),
    },
  });

  const residentialPlaza = await prisma.plaza.upsert({
    where: { id: 'plaza-residential-001' },
    update: {},
    create: {
      id: 'plaza-residential-001',
      name: 'Bay Vista Residential',
      address: '456 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      type: 'RESIDENTIAL',
      capacity: 200,
      occupied: 125,
      coordinates: JSON.stringify({ lat: 25.7907, lng: -80.1300 }),
    },
  });

  const loungePlaza = await prisma.plaza.upsert({
    where: { id: 'plaza-lounge-001' },
    update: {},
    create: {
      id: 'plaza-lounge-001',
      name: 'Executive Lounge Miami',
      address: '789 Biscayne Blvd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33132',
      type: 'LOUNGE',
      capacity: 50,
      occupied: 12,
      coordinates: JSON.stringify({ lat: 25.7753, lng: -80.1901 }),
    },
  });

  console.log('✅ Sample plazas created:', {
    parking: parkingPlaza.name,
    residential: residentialPlaza.name,
    lounge: loungePlaza.name,
  });

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { phone: '+1234567890' },
    update: {},
    create: {
      phone: '+1234567890',
      email: 'test@axsmobile.com',
      name: 'Test User',
      verified: true,
    },
  });

  console.log('✅ Test user created:', testUser.email);

  // Create a test vehicle
  const testVehicle = await prisma.vehicle.upsert({
    where: { 
      vin: 'VIN1234567890ABC123'
    },
    update: {},
    create: {
      vin: 'VIN1234567890ABC123',
      plate: 'ABC123',
      plateNumber: 'ABC123', // Keep for backward compatibility
      brand: 'Toyota',
      model: 'Camry',
      color: 'Blue',
      year: 2022,
      user: { connect: { id: testUser.id } },
    },
  });

  console.log('✅ Test vehicle created:', testVehicle.plateNumber);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
