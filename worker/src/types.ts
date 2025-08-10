import { ObjectId } from "mongodb";

export interface IEmail {
  _id?: ObjectId;
  product: string;
  customer: string;
  subject: string;
  body: string;
  date: Date;
  submitted_by: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ElasticsearchEmailPayload {
  product: string; // ✅ Index - used for search
  subject: string; // ✅ Index - primary search field
  body: string; // ✅ Index - main content search
  // Note: customer, date, createdAt, updatedAt are NOT indexed
  // They stay only in MongoDB for full content retrieval
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
