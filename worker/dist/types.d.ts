import { ObjectId } from "mongodb";
export interface IEmail {
    _id?: ObjectId;
    product: string;
    customer: string;
    subject: string;
    body: string;
    date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ElasticsearchEmailPayload {
    product: string;
    subject: string;
    body: string;
}
export interface ChangeStreamDocument<T> {
    _id: {
        _data: string;
    };
    operationType: "insert" | "update" | "delete" | "replace";
    clusterTime: any;
    fullDocument?: T;
    ns: {
        db: string;
        coll: string;
    };
    documentKey: {
        _id: ObjectId;
    };
}
//# sourceMappingURL=types.d.ts.map