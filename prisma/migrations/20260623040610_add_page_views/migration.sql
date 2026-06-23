-- CreateTable
CREATE TABLE "page_views" (
    "id" SERIAL NOT NULL,
    "page" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "page_views_page_key" ON "page_views"("page");
