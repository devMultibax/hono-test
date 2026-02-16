-- AlterTable
ALTER TABLE "department" ADD COLUMN     "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
ADD COLUMN     "updatedByName" VARCHAR(200);

-- AlterTable
ALTER TABLE "section" ADD COLUMN     "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
ADD COLUMN     "updatedByName" VARCHAR(200);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
ADD COLUMN     "updatedByName" VARCHAR(200);

-- AlterTable
ALTER TABLE "user_log" ADD COLUMN     "createdByName" VARCHAR(200) NOT NULL DEFAULT '',
ADD COLUMN     "updatedByName" VARCHAR(200);

-- Populate createdByName from user table (fallback to createdBy if user not found)
UPDATE "department" d SET "createdByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = d."createdBy" LIMIT 1),
  d."createdBy"
);
UPDATE "department" d SET "updatedByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = d."updatedBy" LIMIT 1),
  d."updatedBy"
) WHERE d."updatedBy" IS NOT NULL;

UPDATE "section" s SET "createdByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = s."createdBy" LIMIT 1),
  s."createdBy"
);
UPDATE "section" s SET "updatedByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = s."updatedBy" LIMIT 1),
  s."updatedBy"
) WHERE s."updatedBy" IS NOT NULL;

UPDATE "user" t SET "createdByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = t."createdBy" LIMIT 1),
  t."createdBy"
);
UPDATE "user" t SET "updatedByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = t."updatedBy" LIMIT 1),
  t."updatedBy"
) WHERE t."updatedBy" IS NOT NULL;

UPDATE "user_log" l SET "createdByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = l."createdBy" LIMIT 1),
  l."createdBy"
);
UPDATE "user_log" l SET "updatedByName" = COALESCE(
  (SELECT u."firstName" || ' ' || u."lastName" FROM "user" u WHERE u.username = l."updatedBy" LIMIT 1),
  l."updatedBy"
) WHERE l."updatedBy" IS NOT NULL;
