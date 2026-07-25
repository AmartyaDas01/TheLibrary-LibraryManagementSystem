import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// A single PrismaClient instance is reused across hot reloads in development
// to avoid exhausting database connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// node-postgres does not negotiate SCRAM channel binding and hangs when a
// connection string requires it (Neon adds `channel_binding=require`). Strip
// that parameter while keeping TLS (`sslmode=require`) intact.
function sanitize(connectionString: string | undefined): string | undefined {
  if (!connectionString) return connectionString;
  return connectionString
    .replace(/([?&])channel_binding=require/, "$1")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");
}

function createClient() {
  const adapter = new PrismaPg({
    connectionString: sanitize(process.env.DATABASE_URL),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
