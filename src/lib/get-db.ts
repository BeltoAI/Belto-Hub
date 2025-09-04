import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI as string;
  const dbName = process.env.MONGODB_DB as string;
  if (!uri) throw new Error("MONGODB_URI missing");
  if (!dbName) throw new Error("MONGODB_DB missing");

  if (!client) client = new MongoClient(uri, { maxPoolSize: 5 });
  if (!client.topology?.isConnected()) await client.connect();
  return client.db(dbName);
}
