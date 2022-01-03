import { PrismaClient } from "@prisma/client";
declare global {
  var db: PrismaClient | undefined;
}

const db = global.db || new PrismaClient({ log: ["query"] });

if (process.env.NODE_ENV !== "production") global.db = db;

export { db };

//////////////////////////////
// import { PrismaClient } from "@prisma/client";

// let db: PrismaClient;

// declare global {
//   var __db: PrismaClient | undefined;
// }

// if (process.env.NODE_ENV === "production") {
//   db = new PrismaClient();
//   db.$connect();
// } else {
//   if (!global.__db) {
//     global.__db = new PrismaClient();
//     global.__db.$connect();
//   }
//   db = global.__db;
// }

// export { db };
