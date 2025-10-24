import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Read the JSON file
  const projectsData = JSON.parse(
    fs.readFileSync("./prisma/seed/projects.json", "utf-8")
  );

  // Optional: clear existing data
  await prisma.project.deleteMany();
  console.log("🗑️  Cleared existing projects.");

  // Insert new data
  await prisma.project.createMany({
    data: projectsData,
  });

  console.log(`✅ Inserted ${projectsData.length} projects.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding data:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
