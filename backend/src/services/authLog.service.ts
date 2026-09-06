import fs from "fs";
import path from "path";

export interface AuthEventRecord {
  id: string;
  type: "REGISTRATION" | "LOGIN";
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyName?: string | null;
    taskType?: string | null;
    phone?: string | null;
  };
  clientIp?: string;
  userAgent?: string;
}

const LOGS_DIR = path.resolve(__dirname, "../../logs");
const JSON_LOG_FILE = path.join(LOGS_DIR, "user_auth_records.json");
const TEXT_LOG_FILE = path.join(LOGS_DIR, "user_auth_records.log");

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export class AuthLogService {
  /**
   * Appends an authentication event (registration or login) to both JSON and text log files
   */
  public static async recordAuthEvent(
    type: "REGISTRATION" | "LOGIN",
    userData: AuthEventRecord["user"],
    clientIp?: string,
    userAgent?: string
  ): Promise<AuthEventRecord> {
    const record: AuthEventRecord = {
      id: `AUTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      timestamp: new Date().toISOString(),
      user: userData,
      clientIp: clientIp || "unknown",
      userAgent: userAgent || "unknown",
    };

    try {
      // 1. Append to Human-Readable Text Log
      const textLine = `[${record.timestamp}] [${record.type}] User: "${record.user.name}" (${record.user.email}) | Role: ${record.user.role}${
        record.user.companyName ? ` | Company: "${record.user.companyName}"` : ""
      }${record.user.taskType ? ` | TaskType: ${record.user.taskType}` : ""} | IP: ${record.clientIp}\n`;

      fs.appendFileSync(TEXT_LOG_FILE, textLine, "utf8");

      // 2. Append to JSON records file
      let records: AuthEventRecord[] = [];
      if (fs.existsSync(JSON_LOG_FILE)) {
        try {
          const raw = fs.readFileSync(JSON_LOG_FILE, "utf8");
          records = JSON.parse(raw);
          if (!Array.isArray(records)) records = [];
        } catch {
          records = [];
        }
      }

      records.unshift(record); // newest first
      fs.writeFileSync(JSON_LOG_FILE, JSON.stringify(records, null, 2), "utf8");

      console.log(`📝 [AuthLog] Recorded ${type} event for ${userData.email} in ${JSON_LOG_FILE}`);
    } catch (err) {
      console.error("Failed to write auth record to file:", err);
    }

    return record;
  }

  /**
   * Retrieves all recorded auth history from the file
   */
  public static getAuthRecords(): AuthEventRecord[] {
    if (!fs.existsSync(JSON_LOG_FILE)) {
      return [];
    }
    try {
      const raw = fs.readFileSync(JSON_LOG_FILE, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      console.error("Failed to read auth records file:", err);
      return [];
    }
  }

  public static getFilePath(): { json: string; text: string } {
    return {
      json: JSON_LOG_FILE,
      text: TEXT_LOG_FILE,
    };
  }
}

