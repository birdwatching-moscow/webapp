ALTER TABLE "Walk" DROP CONSTRAINT "Walk_capacity_check";
ALTER TABLE "Walk" ADD CONSTRAINT "Walk_capacity_check" CHECK ("capacity" >= 0);
