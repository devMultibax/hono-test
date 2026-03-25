-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESET_PASSWORD', 'CHANGE_PASSWORD');

-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('FEATURE', 'BUGFIX', 'IMPROVEMENT', 'SECURITY', 'OTHER');

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section" (
    "id" SERIAL NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" CHAR(6) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "tel" CHAR(10),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),
    "lastLoginAt" TIMESTAMP(3),
    "isDefaultPassword" BOOLEAN NOT NULL DEFAULT false,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_department" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "sectionId" INTEGER,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_log" (
    "id" SERIAL NOT NULL,
    "username" CHAR(6) NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "section" VARCHAR(100) NOT NULL,
    "additionalDepartments" VARCHAR(500),
    "email" VARCHAR(255),
    "tel" CHAR(10),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "Status" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3),
    "updatedBy" VARCHAR(100),
    "updatedByName" VARCHAR(200),
    "actionType" "ActionType" NOT NULL,
    "actionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelog" (
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

    CONSTRAINT "changelog_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");

-- CreateIndex
CREATE INDEX "department_status_idx" ON "department"("status");

-- CreateIndex
CREATE INDEX "department_createdAt_idx" ON "department"("createdAt");

-- CreateIndex
CREATE INDEX "section_departmentId_idx" ON "section"("departmentId");

-- CreateIndex
CREATE INDEX "section_status_idx" ON "section"("status");

-- CreateIndex
CREATE INDEX "section_createdAt_idx" ON "section"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "section_departmentId_name_key" ON "section"("departmentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");

-- CreateIndex
CREATE INDEX "user_department_userId_idx" ON "user_department"("userId");

-- CreateIndex
CREATE INDEX "user_department_departmentId_idx" ON "user_department"("departmentId");

-- CreateIndex
CREATE INDEX "user_department_sectionId_idx" ON "user_department"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_department_userId_departmentId_key" ON "user_department"("userId", "departmentId");

-- CreateIndex
CREATE INDEX "user_log_username_idx" ON "user_log"("username");

-- CreateIndex
CREATE INDEX "user_log_actionType_idx" ON "user_log"("actionType");

-- CreateIndex
CREATE INDEX "user_log_actionAt_idx" ON "user_log"("actionAt");

-- CreateIndex
CREATE INDEX "changelog_updateType_idx" ON "changelog"("updateType");

-- CreateIndex
CREATE INDEX "changelog_updatedDate_idx" ON "changelog"("updatedDate");

-- CreateIndex
CREATE INDEX "changelog_createdAt_idx" ON "changelog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_setting_key_key" ON "system_setting"("key");

-- CreateIndex
CREATE INDEX "system_setting_key_idx" ON "system_setting"("key");

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_department" ADD CONSTRAINT "user_department_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
