/*
  Warnings:

  - A unique constraint covering the columns `[vin]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[plate]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vin` to the `vehicles` table without a default value. This is not possible if the table is not empty.
  - Made the column `brand` on table `vehicles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `model` on table `vehicles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `vehicles` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."FinancingType" AS ENUM ('CASH', 'CREDIT', 'LEASE', 'FINANCED');

-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('MAINTENANCE', 'WARRANTY', 'CLAIM');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."vehicles" DROP CONSTRAINT "vehicles_userId_fkey";

-- AlterTable
ALTER TABLE "public"."passes" ADD COLUMN     "purchaseId" TEXT,
ADD COLUMN     "vin" TEXT;

-- AlterTable
ALTER TABLE "public"."vehicles" ADD COLUMN     "plate" TEXT,
ADD COLUMN     "vin" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "plateNumber" DROP NOT NULL,
ALTER COLUMN "brand" SET NOT NULL,
ALTER COLUMN "model" SET NOT NULL,
ALTER COLUMN "year" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."dealerships" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "oem" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."salespersons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dealershipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salespersons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "rfc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchases" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "dealershipId" TEXT NOT NULL,
    "salespersonId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "financingType" "public"."FinancingType" NOT NULL,
    "warrantyStart" TIMESTAMP(3) NOT NULL,
    "warrantyEnd" TIMESTAMP(3) NOT NULL,
    "dmsExternalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ownership_history" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ownership_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_orders" (
    "id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "passId" TEXT,
    "type" "public"."ServiceType" NOT NULL,
    "status" "public"."ServiceStatus" NOT NULL DEFAULT 'PENDING',
    "insurer" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "closedAt" TIMESTAMP(3),
    "purchaseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salespersons_email_key" ON "public"."salespersons"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "public"."customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "public"."customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_rfc_key" ON "public"."customers"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "public"."vehicles"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "public"."vehicles"("plate");

-- AddForeignKey
ALTER TABLE "public"."vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."passes" ADD CONSTRAINT "passes_vin_fkey" FOREIGN KEY ("vin") REFERENCES "public"."vehicles"("vin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."passes" ADD CONSTRAINT "passes_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."salespersons" ADD CONSTRAINT "salespersons_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "public"."dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_vin_fkey" FOREIGN KEY ("vin") REFERENCES "public"."vehicles"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "public"."dealerships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "public"."salespersons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ownership_history" ADD CONSTRAINT "ownership_history_vin_fkey" FOREIGN KEY ("vin") REFERENCES "public"."vehicles"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ownership_history" ADD CONSTRAINT "ownership_history_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_orders" ADD CONSTRAINT "service_orders_vin_fkey" FOREIGN KEY ("vin") REFERENCES "public"."vehicles"("vin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_orders" ADD CONSTRAINT "service_orders_passId_fkey" FOREIGN KEY ("passId") REFERENCES "public"."passes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_orders" ADD CONSTRAINT "service_orders_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
