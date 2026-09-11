-- CreateTable
CREATE TABLE "EnvironmentalReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentType" TEXT NOT NULL,
    "reportId" TEXT,
    "facilityName" TEXT,
    "location" TEXT,
    "samplingDate" DATETIME,
    "provider" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "documentUrl" TEXT NOT NULL,
    "extractedData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EnvironmentalLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyTonnage" REAL NOT NULL,
    "pm10Dust" REAL NOT NULL,
    "effluentPh" REAL NOT NULL,
    "noiseDb" REAL NOT NULL,
    "riskScore" REAL NOT NULL,
    "riskLabel" TEXT NOT NULL,
    "loggedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "environmentalReportId" TEXT,
    CONSTRAINT "EnvironmentalLog_environmentalReportId_fkey" FOREIGN KEY ("environmentalReportId") REFERENCES "EnvironmentalReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EnvironmentalLog" ("createdAt", "dailyTonnage", "date", "effluentPh", "id", "loggedBy", "noiseDb", "notes", "pm10Dust", "riskLabel", "riskScore") SELECT "createdAt", "dailyTonnage", "date", "effluentPh", "id", "loggedBy", "noiseDb", "notes", "pm10Dust", "riskLabel", "riskScore" FROM "EnvironmentalLog";
DROP TABLE "EnvironmentalLog";
ALTER TABLE "new_EnvironmentalLog" RENAME TO "EnvironmentalLog";
CREATE UNIQUE INDEX "EnvironmentalLog_environmentalReportId_key" ON "EnvironmentalLog"("environmentalReportId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
