-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('FEATURE', 'BUGFIX', 'IMPROVEMENT', 'SECURITY', 'OTHER');

-- CreateTable
CREATE TABLE "update_log" (
    "id" SERIAL NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "updateType" "UpdateType" NOT NULL DEFAULT 'OTHER',
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),

    CONSTRAINT "update_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "update_log_updateType_idx" ON "update_log"("updateType");

-- CreateIndex
CREATE INDEX "update_log_updatedDate_idx" ON "update_log"("updatedDate");

-- CreateIndex
CREATE INDEX "update_log_createdAt_idx" ON "update_log"("createdAt");
