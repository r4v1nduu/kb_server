import { Collection, ChangeStream } from "mongodb";
import { IEmail, ChangeStreamDocument } from "./types";
declare class MongoDBService {
    private client;
    private db;
    private emailCollection;
    constructor(mongoUri: string);
    connect(): Promise<void>;
    private createIndexes;
    watchEmails(changeHandler: (change: ChangeStreamDocument<IEmail>) => void): ChangeStream;
    getAllEmails(): Promise<IEmail[]>;
    getEmailCollection(): Promise<Collection<IEmail>>;
    close(): Promise<void>;
}
export default MongoDBService;
//# sourceMappingURL=mongodb.d.ts.map