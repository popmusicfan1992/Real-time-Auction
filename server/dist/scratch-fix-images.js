"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./config/prisma"));
async function main() {
    const auction = await prisma_1.default.auction.findFirst({
        where: { title: { contains: "Porsche" } }
    });
    console.log("Current Porsche image in DB:", auction ? auction.images : "Not found");
}
main().catch(console.error);
