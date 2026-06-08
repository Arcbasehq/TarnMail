-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'DEEP', 'FATHOM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "ConnectedMailbox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "scope" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConnectedMailbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConnectedMailbox_userId_idx" ON "ConnectedMailbox"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedMailbox_userId_provider_providerAccountId_key" ON "ConnectedMailbox"("userId", "provider", "providerAccountId");

-- AddForeignKey
ALTER TABLE "ConnectedMailbox" ADD CONSTRAINT "ConnectedMailbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
