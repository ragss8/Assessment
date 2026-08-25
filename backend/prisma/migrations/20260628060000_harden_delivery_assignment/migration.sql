-- One order can be assigned to at most one delivery partner.
CREATE UNIQUE INDEX "DeliveryAssignment_orderId_key" ON "DeliveryAssignment"("orderId");

-- Delivery assignments cannot outlive or reference a missing order.
ALTER TABLE "DeliveryAssignment"
ADD CONSTRAINT "DeliveryAssignment_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
