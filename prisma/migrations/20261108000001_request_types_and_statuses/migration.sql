-- Add new RequestType values
ALTER TYPE "RequestType" ADD VALUE 'CERTIFICATE';
ALTER TYPE "RequestType" ADD VALUE 'QUESTION';

-- Add new RequestStatus values
ALTER TYPE "RequestStatus" ADD VALUE 'OPEN';
ALTER TYPE "RequestStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "RequestStatus" ADD VALUE 'CLOSED';
