-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");
