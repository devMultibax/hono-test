-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isDefaultPassword" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;
