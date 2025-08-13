import {
  IEmail,
  ChangeStreamDocument,
  ElasticsearchEmailPayload,
} from "./types";
import ElasticsearchService from "./elasticsearch";
import MongoDBService from "./mongodb";

class SyncService {
  private esService: ElasticsearchService;
  private mongoService: MongoDBService;

  constructor(esService: ElasticsearchService, mongoService: MongoDBService) {
    this.esService = esService;
    this.mongoService = mongoService;
  }

  private mapEmailToESPayload(email: IEmail): ElasticsearchEmailPayload {
    return {
      product: email.product, // ✅ Searchable
      subject: email.subject, // ✅ Primary search field
      body: email.body, // ✅ Main content search
      // customer, date, createdAt, updatedAt stay only in MongoDB
    };
  }

  async handleEmailChange(change: ChangeStreamDocument<IEmail>) {
    const documentId = change.documentKey._id.toString();
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        switch (change.operationType) {
          case "insert":
          case "update":
          case "replace":
            if (change.fullDocument) {
              const esPayload = this.mapEmailToESPayload(change.fullDocument);
              await this.esService.indexEmail(documentId, esPayload);
              console.log(
                `[INFO] Synced ${change.operationType} for email ${documentId}`
              );
            }
            break;

          case "delete":
            await this.esService.deleteEmail(documentId);
            console.log(`[INFO] Synced delete for email ${documentId}`);
            break;

          default:
            console.log(
              `[INFO] Unhandled operation type: ${change.operationType}`
            );
        }
        return; // Success, exit the function
      } catch (error) {
        console.error(
          `[BAD] Attempt ${attempt}/${MAX_RETRIES}: Error syncing email ${documentId}:`,
          error
        );
        if (attempt === MAX_RETRIES) {
          console.error(
            `[FATAL] Failed to sync email ${documentId} after ${MAX_RETRIES} attempts.`
          );
        } else {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }
  }

  async performInitialSync() {
    console.log("[INFO] Starting initial sync...");
    const BATCH_SIZE = 1000;

    try {
      const emails = await this.mongoService.getAllEmails();
      console.log(`[INFO] Found ${emails.length} emails to sync`);

      let synced = 0;
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);
        const esPayloads = batch.map((email) => ({
          id: email._id!.toString(),
          document: this.mapEmailToESPayload(email),
        }));

        try {
          await this.esService.bulkIndexEmails(esPayloads);
          synced += batch.length;
          console.log(`[INFO] Synced ${synced}/${emails.length} emails`);
        } catch (error) {
          console.error(
            `[BAD] Error syncing batch starting at index ${i}:`,
            error
          );
        }
      }

      console.log(
        `[INFO] Initial sync completed: ${synced}/${emails.length} emails synced`
      );
    } catch (error) {
      console.error("[BAD] Initial sync failed:", error);
      throw error;
    }
  }

  startWatching() {
    console.log("[INFO] Starting to watch for email changes...");
    this.mongoService.watchEmails((change) => {
      this.handleEmailChange(change);
    });
  }
}

export default SyncService;
