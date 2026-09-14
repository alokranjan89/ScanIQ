-- CreateTable
CREATE TABLE "ProductSource" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductSource_productId_idx" ON "ProductSource"("productId");

-- CreateIndex
CREATE INDEX "ProductSource_provider_idx" ON "ProductSource"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSource_productId_provider_key" ON "ProductSource"("productId", "provider");

-- AddForeignKey
ALTER TABLE "ProductSource" ADD CONSTRAINT "ProductSource_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
