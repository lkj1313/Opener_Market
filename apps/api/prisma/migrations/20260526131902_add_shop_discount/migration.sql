-- CreateTable
CREATE TABLE "ShopDiscount" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "value" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopDiscount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShopDiscount" ADD CONSTRAINT "ShopDiscount_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
