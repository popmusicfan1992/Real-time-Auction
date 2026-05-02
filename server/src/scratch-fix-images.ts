import prisma from "./config/prisma";

async function main() {
  console.log("Setting a highly reliable URL for the Porsche auction...");
  const res = await prisma.auction.updateMany({
    where: {
      title: { contains: "Porsche" }
    },
    data: {
      images: ["https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070"]
    }
  });
  console.log(`Successfully updated ${res.count} record(s).`);

  const auction = await prisma.auction.findFirst({
    where: { title: { contains: "Porsche" } }
  });
  console.log("Current data:", JSON.stringify(auction));
}

main().catch(console.error);
