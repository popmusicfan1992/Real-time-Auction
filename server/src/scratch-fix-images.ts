import prisma from "./config/prisma";

async function main() {
  const auction = await prisma.auction.findFirst({
    where: { title: { contains: "Porsche" } }
  });
  console.log("Current Porsche image in DB:", auction ? auction.images : "Not found");
}

main().catch(console.error);
