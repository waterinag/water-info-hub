import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";
import { supabaseServer } from "@/lib/supabaseServer";

export async function DELETE(req, { params }) {
  const id = Number(params.id);

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Invalid project ID" },
      { status: 400 }
    );
  }

  try {
    // 1️⃣ Get project first
    const project = await prisma.project.findUnique({
      where: { id },
      select: { project_thumbnail: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Delete thumbnail from Supabase Storage (if exists)
    if (project.project_thumbnail) {
      const bucket = "project-thumbnails";

      // Example URL:
      // https://xxx.supabase.co/storage/v1/object/public/project-thumbnails/projects/file.jpg
      const pathname = new URL(project.project_thumbnail).pathname;

      // Extract path AFTER bucket name
      const filePath = pathname.split(`/project-thumbnails/`)[1];

      if (filePath) {
        const { error } = await supabaseServer.storage
          .from(bucket)
          .remove([filePath]);

        if (error) {
          console.error("Failed to delete thumbnail:", error);
          // We don't fail the request – DB cleanup should still happen
        }
      }
    }

    // 3️⃣ Delete project from DB
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete project error:", err);
    return NextResponse.json(
      { success: false, message: "Error deleting project" },
      { status: 500 }
    );
  }
}
