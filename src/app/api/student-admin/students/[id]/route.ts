
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";

import { prisma } from "@/lib/prisma";
import { getKindSession } from "@/lib/kind-session";
import { getDownloadableFile } from "@/lib/student-learning";
import { storedPath } from "@/lib/lesson-files";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    // Verify student session
    const session = await getKindSession("student");

    if (!session) {
      return NextResponse.json(
        { error: "Please log in" },
        { status: 401 }
      );
    }

    // Verify that the student is active
    const student = await prisma.student.findUnique({
      where: {
        id: session.id,
      },
      select: {
        isActive: true,
      },
    });

    if (!student?.isActive) {
      return NextResponse.json(
        { error: "Not allowed" },
        { status: 403 }
      );
    }

    // Read the dynamic route parameter: [id]
    const { id: rawFileId } = await params;
    const fileId = Number(rawFileId);

    if (
      !rawFileId ||
      !Number.isSafeInteger(fileId) ||
      fileId <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid file" },
        { status: 400 }
      );
    }

    // Retrieve a file the student is allowed to access
    const file = await getDownloadableFile(
      session.id,
      fileId
    );

    if (!file) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Read the stored file
    let data: Buffer;

    try {
      data = await readFile(
        storedPath(file.storedAs)
      );
    } catch {
      return NextResponse.json(
        {
          error: "This file is not available right now",
        },
        { status: 404 }
      );
    }

    // Display PDFs inline; download other files
    const inline =
      file.mimeType === "application/pdf";

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(data.length),
        "Content-Disposition": `${
          inline ? "inline" : "attachment"
        }; filename*=UTF-8''${encodeURIComponent(file.name)}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "Student file download error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
