declare class ElasticsearchService {
    private client;
    private indexName;
    constructor(elasticsearchUrl: string);
    connect(): Promise<void>;
    private createIndexIfNotExists;
    indexEmail(id: string, payload: any): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase>;
    deleteEmail(id: string): Promise<import("@elastic/elasticsearch/lib/api/types").WriteResponseBase | undefined>;
    bulkIndexEmails(payloads: {
        id: string;
        document: any;
    }[]): Promise<import("@elastic/elasticsearch/lib/api/types").BulkResponse | undefined>;
    search(query: string, size?: number, from?: number): Promise<import("@elastic/elasticsearch/lib/api/types").SearchResponse<unknown, Record<string, import("@elastic/elasticsearch/lib/api/types").AggregationsAggregate>>>;
}
export default ElasticsearchService;
//# sourceMappingURL=elasticsearch.d.ts.map