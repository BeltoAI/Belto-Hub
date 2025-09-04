import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  const name = process.env.MONGODB_DB || "belto_hub";

  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) {
    throw new Error('MONGODB_URI missing or invalid (needs "mongodb://" or "mongodb+srv://")');
  }

  if (db && client) return db;

  client = new MongoClient(uri, { });
  await client.connect();
  db = client.db(name);
  return db!;
}
