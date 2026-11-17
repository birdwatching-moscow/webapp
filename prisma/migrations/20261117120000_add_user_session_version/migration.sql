-- Bumped on password reset / block; JWTs carrying an older value are rejected
ALTER TABLE "User" ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
