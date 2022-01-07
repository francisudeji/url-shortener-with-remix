-- CreateTable
CREATE TABLE "Url" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url_id" TEXT NOT NULL,
    "new_url" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_url_id_key" ON "Url"("url_id");

-- CreateIndex
CREATE UNIQUE INDEX "Url_new_url_key" ON "Url"("new_url");

-- CreateIndex
CREATE UNIQUE INDEX "Url_original_url_key" ON "Url"("original_url");
