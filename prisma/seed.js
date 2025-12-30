/* prisma/seed.js */
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma.js"; // adjust if your prisma client path differs
import { createClient } from "@supabase/supabase-js";

// Supabase server client (service_role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const BUCKET = "project-thumbnails";

function sanitizeFilename(originalName) {
  const timestamp = Date.now();
  const baseName = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_]/g, "");
  const extension = path.extname(originalName).toLowerCase();
  return `${timestamp}_${baseName}${extension}`;
}

// Convert "media/x.png" to actual disk path: "<repo>/media/x.png"
function resolveLocalThumbnailPath(thumbnailValue) {
  // if your json already includes "media/...", this maps to public/media/...
  return path.join(process.cwd(), thumbnailValue);
}

async function uploadThumbnailIfLocal(thumbnailValue) {
  if (!thumbnailValue) return null;

  // If already a URL, keep it
  if (thumbnailValue.startsWith("http://") || thumbnailValue.startsWith("https://")) {
    return thumbnailValue;
  }

  const localPath = resolveLocalThumbnailPath(thumbnailValue);

  if (!fs.existsSync(localPath)) {
    console.warn(`⚠️ Thumbnail file not found: ${localPath} (skipping upload)`);
    return null;
  }

  const buffer = fs.readFileSync(localPath);
  const originalName = path.basename(localPath);
  const filename = sanitizeFilename(originalName);
  const storagePath = `projects/${filename}`;

  const contentType =
    originalName.toLowerCase().endsWith(".png") ? "image/png" :
    originalName.toLowerCase().endsWith(".jpg") || originalName.toLowerCase().endsWith(".jpeg") ? "image/jpeg" :
    "application/octet-stream";

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (uploadError) {
    // If file already exists (rare with timestamp), retry once
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {

  const raw = fs.readFileSync("./prisma/seed/projects.json", "utf-8")

  const projects = JSON.parse(raw);

  console.log(`Seeding ${projects.length} projects...`);

  for (const p of projects) {
    const name = p.project_name?.trim();
    if (!name) {
      console.warn("⚠️ Skipping item with missing project_name:", p);
      continue;
    }

    const thumbnailUrl = await uploadThumbnailIfLocal(p.project_thumbnail);

    // You can use createMany, but per-item is nicer when uploading thumbnails
    await prisma.project.create({
      data: {
        project_name: name,
        project_url: p.project_url || "",
        project_desc: p.project_desc || "",
        project_keywords: p.project_keywords || "",
        project_thumbnail: thumbnailUrl, // public URL in DB
      },
    });

    console.log(`✅ Inserted: ${name}`);
  }

  console.log("🎉 Done.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
