import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | undefined;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri) throw new Error("Missing MONGODB_URI");
  if (!dbName) throw new Error("Missing MONGODB_DB");

  if (!clientPromise) clientPromise = new MongoClient(uri).connect();
  const client = await clientPromise;
  return client.db(dbName);
}
