-- CreateTable
CREATE TABLE "system_setting" (
    "id" SERIAL NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL DEFAULT 'false',
    "description" VARCHAR(500),
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_setting_key_key" ON "system_setting"("key");

-- CreateIndex
CREATE INDEX "system_setting_key_idx" ON "system_setting"("key");
