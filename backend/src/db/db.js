
import {PrismaClient} from '../generated/prisma/index.js';

// storing the instance in a variable
const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient()

if(process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma=db;
}



