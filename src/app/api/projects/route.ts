import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { supabaseServer } from "@/lib/supabaseServer";
import path from "path";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, projects });
  } catch (err) {
    console.error("Error fetching projects:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching projects" },
      { status: 500 }
    );
  }
}

function sanitizeFilename(originalName) {
  const timestamp = Date.now();
  const baseName = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9-_]/g, "");
  const extension = path.extname(originalName).toLowerCase();
  return `${timestamp}_${baseName}${extension}`;
}

export async function POST(req) {
  try {
    const form = await req.formData();

    const name = form.get("project_name")?.toString();
    const desc = form.get("project_desc")?.toString() || "";
    const keywords = form.get("project_keywords")?.toString() || "";
    const url = form.get("project_url")?.toString() || "";
    const thumbnailFile = form.get("project_thumbnail");

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Project name is required" },
        { status: 400 }
      );
    }

    let thumbnailPath = null;

    // Upload to Supabase Storage
    if (thumbnailFile && typeof thumbnailFile === "object") {
      const filename = sanitizeFilename(thumbnailFile.name);

      // Convert File -> ArrayBuffer -> Buffer
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const bucket = "project-thumbnails";
      const storagePath = `projects/${filename}`;

      const { error: uploadError } = await supabaseServer.storage
        .from(bucket)
        .upload(storagePath, buffer, {
          contentType: thumbnailFile.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { success: false, message: "Thumbnail upload failed" },
          { status: 500 }
        );
      }

      // Public URL (works if bucket is public)
      const { data } = supabaseServer.storage.from(bucket).getPublicUrl(storagePath);
      thumbnailPath = data.publicUrl;
    }

    const project = await prisma.project.create({
      data: {
        project_name: name,
        project_desc: desc,
        project_keywords: keywords,
        project_url: url,
        project_thumbnail: thumbnailPath,
      },
    });

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error("Error creating project:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create project" },
      { status: 500 }
    );
  }
}
