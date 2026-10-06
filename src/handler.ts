import { SQSBatchResponse, SQSEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import ngeohash from "ngeohash";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME || "resq-emergency-reports";

export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const batchItemFailures: { itemIdentifier: string }[] = [];

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      const { latitude, longitude, severity, description, contact } = payload;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        throw new Error("Coordenadas geográficas inválidas");
      }

      // Geohash de precisión 6 (~1.2 km x 0.6 km) para deduplicación zonal
      const zoneHash = ngeohash.encode(latitude, longitude, 6);
      const timestamp = Math.floor(Date.now() / 1000);
      const ttl = timestamp + 7 * 24 * 60 * 60; // Expira en 7 días (FinOps)

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `GEO#${zoneHash}`,
            SK: `TIME#${timestamp}#${record.messageId}`,
            latitude,
            longitude,
            severity: severity || "MEDIUM",
            description: description || "Sin descripción provista",
            contact: contact || null,
            ttl,
          },
        })
      );
    } catch (err) {
      console.error(`Fallo al procesar mensaje ${record.messageId}:`, err);
      // Notificamos a SQS únicamente el ID del mensaje que falló
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
