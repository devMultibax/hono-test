/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[departmentId,name]` on the table `section` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "section_departmentId_name_key" ON "section"("departmentId", "name");
