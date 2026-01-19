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
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_departmentId_idx" ON "user"("departmentId");

-- CreateIndex
CREATE INDEX "user_sectionId_idx" ON "user"("sectionId");

-- CreateIndex
CREATE INDEX "user_status_idx" ON "user"("status");

-- CreateIndex
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");
