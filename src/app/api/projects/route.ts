import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import fs from "fs";
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
    .replace(/[^a-zA-Z0-9-_]/g, ""); // remove everything except letters, numbers, - and _
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

    // ✅ Ensure upload folder exists
    const uploadDir = path.join(process.cwd(),  "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let thumbnailPath = null;
    if (thumbnailFile && typeof thumbnailFile === "object") {
      const bytes = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
     const filename = sanitizeFilename(thumbnailFile.name);

      
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);
      // thumbnailPath = `/upload/${filename}`; // ✅ public path
      thumbnailPath = `/api/media/${filename}`;
      // thumbnailPath = `/api/uploads/${Date.now()}_${thumbnailFile.name}`;

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
