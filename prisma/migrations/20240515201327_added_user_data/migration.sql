/*
  Warnings:

  - Added the required column `family_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `given_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cv_uploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "family_name" TEXT NOT NULL,
ADD COLUMN     "given_name" TEXT NOT NULL;
