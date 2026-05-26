/*
  Warnings:

  - Added the required column `businessAddress` to the `SellerApplication` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SellerApplication" ADD COLUMN     "businessAddress" TEXT NOT NULL,
ADD COLUMN     "returnAddress" TEXT;
