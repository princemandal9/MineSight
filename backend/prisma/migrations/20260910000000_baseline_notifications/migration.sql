-- AlterTable
ALTER TABLE "User" ADD COLUMN "assignedMine" TEXT;

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientRefId" TEXT,
    "mineId" TEXT,
    "zone" TEXT,
    "inspectorId" TEXT NOT NULL,
    "contractorId" TEXT,
    "taskType" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "locationAccuracy" REAL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inspection_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "contractorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observationId" TEXT,
    "obligationId" TEXT,
    "contractorId" TEXT,
    "action" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "StatutoryObligation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "actorName", "actorRole", "details", "id", "obligationId", "observationId", "timestamp") SELECT "action", "actorName", "actorRole", "details", "id", "obligationId", "observationId", "timestamp" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE TABLE "new_Contractor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contractorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "taskType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'LOW',
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "activeWorkers" INTEGER NOT NULL DEFAULT 0,
    "activeMachinery" INTEGER NOT NULL DEFAULT 0,
    "complianceRate" REAL NOT NULL DEFAULT 100.0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedMine" TEXT,
    "assignedMine" TEXT,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Contractor" ("activeMachinery", "activeWorkers", "complianceRate", "contractorCode", "createdAt", "email", "id", "isRestricted", "name", "phone", "riskLevel", "status", "taskType", "updatedAt", "violationCount") SELECT "activeMachinery", "activeWorkers", "complianceRate", "contractorCode", "createdAt", "email", "id", "isRestricted", "name", "phone", "riskLevel", "status", "taskType", "updatedAt", "violationCount" FROM "Contractor";
DROP TABLE "Contractor";
ALTER TABLE "new_Contractor" RENAME TO "Contractor";
CREATE UNIQUE INDEX "Contractor_contractorCode_key" ON "Contractor"("contractorCode");
CREATE TABLE "new_Observation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observationCode" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "supervisorName" TEXT NOT NULL,
    "supervisorId" TEXT,
    "zone" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "gpsCoordinates" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "evidenceUrl" TEXT,
    "evidenceNotes" TEXT,
    "correctiveAction" TEXT,
    "submittedAt" DATETIME,
    "resolvedAt" DATETIME,
    "resolutionNotes" TEXT,
    "verifiedBy" TEXT,
    "inspectionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Observation_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Observation_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Observation" ("category", "contractorId", "createdAt", "description", "evidenceNotes", "evidenceUrl", "gpsCoordinates", "id", "observationCode", "photoUrl", "resolutionNotes", "resolvedAt", "severity", "status", "submittedAt", "supervisorName", "updatedAt", "verifiedBy", "zone") SELECT "category", "contractorId", "createdAt", "description", "evidenceNotes", "evidenceUrl", "gpsCoordinates", "id", "observationCode", "photoUrl", "resolutionNotes", "resolvedAt", "severity", "status", "submittedAt", "supervisorName", "updatedAt", "verifiedBy", "zone" FROM "Observation";
DROP TABLE "Observation";
ALTER TABLE "new_Observation" RENAME TO "Observation";
CREATE UNIQUE INDEX "Observation_observationCode_key" ON "Observation"("observationCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_clientRefId_key" ON "Inspection"("clientRefId");

