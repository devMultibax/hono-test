-- CreateIndex
CREATE INDEX "user_log_username_idx" ON "user_log"("username");

-- CreateIndex
CREATE INDEX "user_log_actionType_idx" ON "user_log"("actionType");

-- CreateIndex
CREATE INDEX "user_log_actionAt_idx" ON "user_log"("actionAt");
