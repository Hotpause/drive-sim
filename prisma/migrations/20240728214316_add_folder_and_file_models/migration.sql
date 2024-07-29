/*
  Warnings:

  - You are about to drop the column `uploadTime` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.
  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "uploadTime",
DROP COLUMN "url",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
