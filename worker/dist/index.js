"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = __importDefault(require("./mongodb"));
const elasticsearch_1 = __importDefault(require("./elasticsearch"));
const syncService_1 = __importDefault(require("./syncService"));
dotenv_1.default.config();
// Validate required environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL;
if (!MONGODB_URI) {
    console.error("[BAD] MONGODB_URI environment variable is required");
    process.exit(1);
}
if (!ELASTICSEARCH_URL) {
    console.error("[BAD] ELASTICSEARCH_URL environment variable is required");
    process.exit(1);
}
async function main() {
    console.log("[INFO] Starting Data Sync");
    let mongoService;
    let esService;
    let syncService;
    try {
        // Initialize services
        mongoService = new mongodb_1.default(MONGODB_URI);
        esService = new elasticsearch_1.default(ELASTICSEARCH_URL);
        syncService = new syncService_1.default(esService, mongoService);
        // Connect to databases
        await mongoService.connect();
        await esService.connect();
        // Perform initial sync
        await syncService.performInitialSync();
        // Start watching for changes
        syncService.startWatching();
        console.log("[INFO] Data Sync Worker is running and watching for changes");
        // Graceful shutdown handling
        process.on("SIGINT", async () => {
            console.log("\n[INFO] Received SIGINT, shutting down gracefully");
            await cleanup();
            process.exit(0);
        });
        process.on("SIGTERM", async () => {
            console.log("\n[INFO] Received SIGTERM, shutting down gracefully");
            await cleanup();
            process.exit(0);
        });
        async function cleanup() {
            try {
                if (mongoService) {
                    await mongoService.close();
                }
                console.log("[INFO] Cleanup completed");
            }
            catch (error) {
                console.error("[BAD] Error during cleanup:", error);
            }
        }
    }
    catch (error) {
        console.error("[BAD] Failed to start Data Sync Worker:", error);
        process.exit(1);
    }
}
// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("[BAD] Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    console.error("[BAD] Uncaught Exception:", error);
    process.exit(1);
});
main().catch((error) => {
    console.error("[BAD] Main function failed:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map