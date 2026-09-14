/*
  Warnings:

  - A unique constraint covering the columns `[productId,key]` on the table `ProductAttribute` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "ProductAttribute_productId_idx" ON "ProductAttribute"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAttribute_productId_key_key" ON "ProductAttribute"("productId", "key");
