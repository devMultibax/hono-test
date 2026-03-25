/*
  Warnings:

  - You are about to drop the `changelog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "changelog";

-- CreateTable
CREATE TABLE "change_log" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "updateType" "UpdateType" NOT NULL DEFAULT 'OTHER',
    "gitRef" VARCHAR(100),
    "updatedDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),

    CONSTRAINT "change_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "change_log_updateType_idx" ON "change_log"("updateType");

-- CreateIndex
CREATE INDEX "change_log_updatedDate_idx" ON "change_log"("updatedDate");

-- CreateIndex
CREATE INDEX "change_log_createdAt_idx" ON "change_log"("createdAt");
