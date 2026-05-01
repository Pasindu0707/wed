import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseConn?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalForMongoose.__mongooseConn) {
  globalForMongoose.__mongooseConn = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Set it in Vercel Environment Variables.");
  }

  const cached = globalForMongoose.__mongooseConn!;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

