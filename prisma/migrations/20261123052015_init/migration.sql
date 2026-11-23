-- CreateTable
CREATE TABLE "GameCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "rarity" INTEGER NOT NULL,
    "element" TEXT NOT NULL,
    "weaponType" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "releaseVersion" TEXT,
    "baseHp" INTEGER,
    "baseAtk" INTEGER,
    "baseDef" INTEGER,
    "iconUrl" TEXT,
    "splashUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "travelerName" TEXT NOT NULL DEFAULT 'Traveler',
    "adventureRank" INTEGER NOT NULL DEFAULT 1,
    "worldLevel" INTEGER NOT NULL DEFAULT 1,
    "signature" TEXT,
    "primogems" INTEGER NOT NULL DEFAULT 0,
    "intertwinedFates" INTEGER NOT NULL DEFAULT 0,
    "acquaintFates" INTEGER NOT NULL DEFAULT 0,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayerCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "ascension" INTEGER NOT NULL DEFAULT 0,
    "constellation" INTEGER NOT NULL DEFAULT 0,
    "friendshipLevel" INTEGER NOT NULL DEFAULT 1,
    "talentNormal" INTEGER NOT NULL DEFAULT 1,
    "talentSkill" INTEGER NOT NULL DEFAULT 1,
    "talentBurst" INTEGER NOT NULL DEFAULT 1,
    "isTarget" BOOLEAN NOT NULL DEFAULT false,
    "acquiredAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerCharacter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlayerCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "GameCharacter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "targetQuantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerResource_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PityTracker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "bannerType" TEXT NOT NULL,
    "currentPity" INTEGER NOT NULL DEFAULT 0,
    "maxPity" INTEGER NOT NULL DEFAULT 90,
    "isGuaranteed" BOOLEAN NOT NULL DEFAULT false,
    "targetCharacterId" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PityTracker_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "PlayerProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GameCharacter_element_idx" ON "GameCharacter"("element");

-- CreateIndex
CREATE INDEX "GameCharacter_rarity_idx" ON "GameCharacter"("rarity");

-- CreateIndex
CREATE INDEX "PlayerCharacter_profileId_idx" ON "PlayerCharacter"("profileId");

-- CreateIndex
CREATE INDEX "PlayerCharacter_characterId_idx" ON "PlayerCharacter"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerCharacter_profileId_characterId_key" ON "PlayerCharacter"("profileId", "characterId");

-- CreateIndex
CREATE INDEX "PlayerResource_profileId_idx" ON "PlayerResource"("profileId");

-- CreateIndex
CREATE INDEX "PityTracker_profileId_idx" ON "PityTracker"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PityTracker_profileId_bannerType_key" ON "PityTracker"("profileId", "bannerType");
