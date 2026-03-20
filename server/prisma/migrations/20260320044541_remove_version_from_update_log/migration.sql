/*
  Warnings:

  - You are about to drop the column `version` on the `update_log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "update_log" DROP COLUMN "version";
