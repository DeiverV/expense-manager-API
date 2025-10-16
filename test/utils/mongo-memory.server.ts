import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer | null = null;

export async function startMongo(): Promise<string> {
  mongo = await MongoMemoryServer.create();
  return mongo.getUri();
}

export async function stopMongo(): Promise<void> {
  if (mongo) {
    await mongo.stop();
    mongo = null;
  }
}


