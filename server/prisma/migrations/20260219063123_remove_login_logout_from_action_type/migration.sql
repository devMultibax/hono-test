/*
  Warnings:

  - The values [LOGIN,LOGOUT] on the enum `ActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionType_new" AS ENUM ('CREATE', 'UPDATE', 'DELETE');
ALTER TABLE "user_log" ALTER COLUMN "actionType" TYPE "ActionType_new" USING ("actionType"::text::"ActionType_new");
ALTER TYPE "ActionType" RENAME TO "ActionType_old";
ALTER TYPE "ActionType_new" RENAME TO "ActionType";
DROP TYPE "public"."ActionType_old";
COMMIT;
