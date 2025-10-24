import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma.js";

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  if (!id)
    return NextResponse.json(
      { success: false, message: "Invalid project ID" },
      { status: 400 }
    );

  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Error deleting project" },
      { status: 500 }
    );
  }
}
