-- CreateEnum
CREATE TYPE "Region" AS ENUM ('NA', 'EUW', 'EUNE', 'KR', 'BR', 'OCE');

-- CreateTable
CREATE TABLE "Streamer" (
    "id" SERIAL NOT NULL,
    "twitchId" INTEGER NOT NULL,
    "twitchUsername" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lolUsernames" TEXT[],

    CONSTRAINT "Streamer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "region" "Region" NOT NULL,
    "gameDuration" INTEGER NOT NULL,
    "gameCreationDatetime" TIMESTAMP(3) NOT NULL,
    "gameStartDatetime" TIMESTAMP(3) NOT NULL,
    "gameEndDatetime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "championName" TEXT NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "position" TEXT NOT NULL,
    "matchId" INTEGER NOT NULL,
    "streamerId" INTEGER,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Streamer_twitchId_key" ON "Streamer"("twitchId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_matchId_key" ON "Match"("matchId");

-- CreateIndex
CREATE INDEX "Match_matchId_idx" ON "Match"("matchId");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "Streamer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
