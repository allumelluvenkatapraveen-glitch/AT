-- AlterEnum
ALTER TYPE "ProductStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "expiredAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Product_expiresAt_idx" ON "Product"("expiresAt");
