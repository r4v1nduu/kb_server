"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class MongoDBService {
    constructor(mongoUri) {
        this.client = new mongodb_1.MongoClient(mongoUri);
    }
    async connect() {
        try {
            await this.client.connect();
            console.log("[INFO] MongoDB connected");
            this.db = this.client.db("emaildb");
            this.emailCollection = this.db.collection("emails");
            // Create indexes for better performance
            await this.createIndexes();
        }
        catch (error) {
            console.error("[BAD] MongoDB connection failed:", error);
            throw error;
        }
    }
    async createIndexes() {
        try {
            // Create indexes for common query patterns
            await this.emailCollection.createIndex({ product: 1 });
            await this.emailCollection.createIndex({ customer: 1 });
            await this.emailCollection.createIndex({ date: -1 });
            console.log("[INFO] MongoDB indexes created");
        }
        catch (error) {
            console.error("[BAD] Error creating MongoDB indexes:", error);
        }
    }
    watchEmails(changeHandler) {
        const changeStream = this.emailCollection.watch([], {
            fullDocument: "updateLookup",
        });
        changeStream.on("change", (change) => {
            console.log(`[INFO] Email change detected: ${change.operationType} for ${change.documentKey?._id}`);
            changeHandler(change);
        });
        changeStream.on("error", (error) => {
            console.error("[BAD] Change stream error:", error);
        });
        changeStream.on("close", () => {
            console.log("[INFO] Change stream closed");
        });
        return changeStream;
    }
    async getAllEmails() {
        return await this.emailCollection.find({}).toArray();
    }
    async getEmailCollection() {
        return this.emailCollection;
    }
    async close() {
        await this.client.close();
        console.log("[INFO] MongoDB connection closed");
    }
}
exports.default = MongoDBService;
//# sourceMappingURL=mongodb.js.map