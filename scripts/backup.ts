import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";
import * as cron from "node-cron";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// Load environment variables manually since this is a standalone script
config();

const prisma = new PrismaClient();

const CRON_CONFIG = {
  // Every day at 05:00 AM
  BACKUP_SCHEDULE: "0 5 * * *",
  RETENTION_DAYS: 30,
  TIMEZONE: "Asia/Jakarta",
};

/**
 * Validates Google Drive environment variables
 */
const hasDriveConfig = () => {
  return (
    process.env.DRIVE_ROOT_ID &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
};

/**
 * Get authenticated Google Drive service
 */
const getDriveService = () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Default redirect URI for generic refresh tokens
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
};

/**
 * Executes a manual backup process
 */
export const performBackup = async () => {
  if (!hasDriveConfig()) {
    console.warn("Skipping backup: Google Drive credentials not fully configured in .env");
    return;
  }

  console.log(`[${new Date().toISOString()}] Running database backup process...`);
  const now = new Date();
  const dateStr = 
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "_" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

  const backupFileName = `backup_petek_expense_${dateStr}.json`;
  const tempDir = path.join(__dirname, "..", "temp_backups");
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const backupPath = path.join(tempDir, backupFileName);

  try {
    // 1. Fetch all data via Prisma
    console.log("Extracting data from database...");
    const users = await prisma.user.findMany();
    const expenses = await prisma.expense.findMany();

    const backupData = {
      exportedAt: new Date().toISOString(),
      metadata: {
        totalUsers: users.length,
        totalExpenses: expenses.length,
      },
      data: {
        users,
        expenses,
      },
    };

    // 2. Write to temp file
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log(`Saved local backup: ${backupFileName}`);

    // 3. Upload to Google Drive
    const drive = getDriveService();
    console.log(`Uploading ${backupFileName} to Google Drive...`);
    
    const fileMetadata = {
      name: backupFileName,
      parents: [process.env.DRIVE_ROOT_ID!],
    };
    
    const media = {
      mimeType: "application/json",
      body: fs.createReadStream(backupPath),
    };

    const uploadRes = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log(`Backup uploaded successfully. Drive File ID: ${uploadRes.data.id}`);

    // 4. Clean up old backups on Drive
    console.log(`Cleaning up Drive records older than ${CRON_CONFIG.RETENTION_DAYS} days...`);
    
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - CRON_CONFIG.RETENTION_DAYS);
    // Format to RFC 3339 string (e.g. 2024-01-01T00:00:00.000Z)
    const timeToCompare = retentionDate.toISOString();

    const query = `'${process.env.DRIVE_ROOT_ID}' in parents and modifiedTime < '${timeToCompare}' and trashed = false`;
    
    const oldFilesRes = await drive.files.list({
      q: query,
      fields: "files(id, name, modifiedTime)",
    });

    const filesToDelete = oldFilesRes.data.files || [];
    
    if (filesToDelete.length === 0) {
      console.log("No old backups found to delete.");
    } else {
      for (const file of filesToDelete) {
        if (file.id) {
          await drive.files.delete({ fileId: file.id });
          console.log(`Deleted old backup: ${file.name} (modified: ${file.modifiedTime})`);
        }
      }
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Backup failed:`, error);
  } finally {
    // 5. Clean up local file
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      console.log("Local temporary backup removed.");
    }
  }
};

/**
 * Initializes the backup cron job
 */
const initCron = () => {
  if (!hasDriveConfig()) {
    console.log("Google Drive credentials not found. Auto-backup service will not run.");
    return;
  }

  console.log(`Initialising Google Drive auto-backup`);
  console.log(`Schedule: ${CRON_CONFIG.BACKUP_SCHEDULE} (${CRON_CONFIG.TIMEZONE})`);
  console.log(`Retention: ${CRON_CONFIG.RETENTION_DAYS} days`);

  cron.schedule(
    CRON_CONFIG.BACKUP_SCHEDULE,
    async () => {
      await performBackup();
    },
    {
      scheduled: true,
      timezone: CRON_CONFIG.TIMEZONE,
    }
  );
};

// Start the cron service
initCron();

// Keep the process alive
console.log("Backup worker process started successfully.");
