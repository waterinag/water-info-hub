import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Streams files safely from your /uploads directory
 * Example: /api/uploads/example.png
 */
export async function GET(req, context) {
  try {
    // ✅ You must await the params in App Router
    const { filename } = await context.params;

    // ✅ Base directory where your uploads are saved
    // You said files are stored in project-root/uploads/
    const uploadDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadDir, filename);

    // 🧱 Security check
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // 🔍 Check existence
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 🧠 Infer content type
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".csv": "text/csv",
      ".txt": "text/plain",
      ".json": "application/json",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    // 🌀 Stream the file
    const fileStream = fs.createReadStream(filePath);
    return new Response(fileStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error serving upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
