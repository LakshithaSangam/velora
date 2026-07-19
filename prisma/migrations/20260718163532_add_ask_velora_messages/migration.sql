-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "AskVeloraMessage" (
    "id" TEXT NOT NULL,
    "notesDocumentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "text" TEXT NOT NULL,
    "flashcardsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AskVeloraMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AskVeloraMessage_notesDocumentId_idx" ON "AskVeloraMessage"("notesDocumentId");

-- CreateIndex
CREATE INDEX "AskVeloraMessage_userId_idx" ON "AskVeloraMessage"("userId");

-- AddForeignKey
ALTER TABLE "AskVeloraMessage" ADD CONSTRAINT "AskVeloraMessage_notesDocumentId_fkey" FOREIGN KEY ("notesDocumentId") REFERENCES "NotesDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskVeloraMessage" ADD CONSTRAINT "AskVeloraMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
