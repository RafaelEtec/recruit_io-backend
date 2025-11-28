import { defineConfig, env } from "prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    engine: "classic",
    datasource: {
        url: "postgresql://neondb_owner:npg_vcILfil4Zu7C@ep-aged-mountain-ac04bqq5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
});