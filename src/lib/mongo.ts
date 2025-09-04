import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "belto_hub";
declare global { var _mongoClientPromise: Promise<MongoClient> | undefined; }
let client: MongoClient; let clientPromise: Promise<MongoClient>;
if (!uri) throw new Error("Missing MONGODB_URI");
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) { client = new MongoClient(uri); global._mongoClientPromise = client.connect(); }
  clientPromise = global._mongoClientPromise;
} else { client = new MongoClient(uri); clientPromise = client.connect(); }
export async function getDb() { const c = await clientPromise; return c.db(dbName); }
