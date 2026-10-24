import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";

export const IMAGE_LIMIT = 40 * 1024 * 1024;
export const imageHash = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

/** Bound the read itself, including files that grow after stat(). */
export async function readImage(file: string): Promise<Buffer> {
  const handle = await fs.open(file, "r");
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size < 1 || stat.size > IMAGE_LIMIT)
      throw Error("Image invalide ou supérieure à 40 Mo.");
    const bytes = Buffer.alloc(stat.size + 1);
    let offset = 0;
    while (offset < bytes.length) {
      const read = await handle.read(
        bytes,
        offset,
        bytes.length - offset,
        null,
      );
      if (!read.bytesRead) break;
      offset += read.bytesRead;
    }
    if (offset !== stat.size)
      throw Error("L’image a changé pendant sa lecture. Réessaie.");
    return bytes.subarray(0, offset);
  } finally {
    await handle.close();
  }
}
