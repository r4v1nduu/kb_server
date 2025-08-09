import { IEmail, ChangeStreamDocument } from "./types";
import ElasticsearchService from "./elasticsearch";
import MongoDBService from "./mongodb";
declare class SyncService {
    private esService;
    private mongoService;
    constructor(esService: ElasticsearchService, mongoService: MongoDBService);
    private mapEmailToESPayload;
    handleEmailChange(change: ChangeStreamDocument<IEmail>): Promise<void>;
    performInitialSync(): Promise<void>;
    startWatching(): void;
}
export default SyncService;
//# sourceMappingURL=syncService.d.ts.map