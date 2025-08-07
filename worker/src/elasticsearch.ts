// @ts-nocheck
import { Client } from "@elastic/elasticsearch";

class ElasticsearchService {
  private client: Client;
  private indexName = "emaildb-email"; // Changed to prefixed naming

  constructor(elasticsearchUrl: string) {
    this.client = new Client({
      node: elasticsearchUrl,
      requestTimeout: 30000,
      pingTimeout: 30000,
    });
  }

  async connect() {
    try {
      const health = await this.client.cluster.health();
      console.log("[GOOD] Elasticsearch connected:", health.status);

      // Create index if it doesn't exist
      await this.createIndexIfNotExists();
    } catch (error) {
      console.error("[BAD] Elasticsearch connection failed:", error);
      throw error;
    }
  }

  private async createIndexIfNotExists() {
    try {
      const exists = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!exists) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                product: {
                  type: "text",
                  analyzer: "standard",
                },
                subject: {
                  type: "text",
                  analyzer: "standard",
                },
                body: {
                  type: "text",
                  analyzer: "standard",
                },
                customer: {
                  type: "keyword",
                },
                date: {
                  type: "date",
                },
              },
            },
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0,
            },
          },
        });
        console.log(`[GOOD] Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (error) {
      console.error("[BAD] Error creating Elasticsearch index:", error);
      throw error;
    }
  }

  async indexEmail(id: string, payload: any) {
    try {
      const response = await this.client.index({
        index: this.indexName,
        id: id,
        document: payload,
      });
      console.log(`[GOOD] Indexed email ${id}:`, response.result);
      return response;
    } catch (error) {
      console.error(`[BAD] Error indexing email ${id}:`, error);
      throw error;
    }
  }

  async deleteEmail(id: string) {
    try {
      const response = await this.client.delete({
        index: this.indexName,
        id: id,
      });
      console.log(`[GOOD] Deleted email ${id}:`, response.result);
      return response;
    } catch (error: any) {
      if (error.meta?.statusCode === 404) {
        console.log(
          `[INFO] Email ${id} not found in Elasticsearch (already deleted)`
        );
        return;
      }
      console.error(`[BAD] Error deleting email ${id}:`, error);
      throw error;
    }
  }

  async search(query: string, size: number = 50) {
    try {
      const searchQuery = {
        index: this.indexName,
        size,
        query: {
          multi_match: {
            query,
            fields: ["product^2", "subject^3", "body"],
            type: "best_fields",
            fuzziness: "AUTO",
          },
        },
        highlight: {
          fields: {
            subject: {},
            body: {},
            product: {},
          },
        },
        sort: [{ date: { order: "desc" } }],
      };

      const response = await this.client.search(searchQuery);
      return response;
    } catch (error) {
      console.error("[BAD] Error searching emails:", error);
      throw error;
    }
  }
}

export default ElasticsearchService;
