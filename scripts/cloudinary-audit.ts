/**
 * Audita los assets de Cloudinary que NO están dentro de una carpeta "lms/*".
 * Uso: pnpm cloudinary:audit
 */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Resource = {
  public_id: string;
  asset_folder?: string;
  resource_type: string;
  secure_url: string;
  bytes: number;
  created_at: string;
};

async function fetchAllResources(resourceType: "image" | "raw" | "video") {
  const resources: Resource[] = [];
  let next_cursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      type: "upload",
      max_results: 500,
      next_cursor,
    });
    resources.push(...result.resources);
    next_cursor = result.next_cursor;
  } while (next_cursor);

  return resources;
}

async function main() {
  const types: Array<"image" | "raw" | "video"> = ["image", "raw", "video"];
  const orphans: Resource[] = [];

  for (const type of types) {
    const resources = await fetchAllResources(type);
    for (const r of resources) {
      const inLmsFolder = r.asset_folder?.startsWith("lms/") ?? r.public_id.startsWith("lms/");
      if (!inLmsFolder) orphans.push(r);
    }
  }

  if (orphans.length === 0) {
    console.log("No se encontraron assets fuera de lms/*. Todo ordenado.");
    return;
  }

  console.log(`\n${orphans.length} asset(s) fuera de una carpeta lms/*:\n`);
  for (const r of orphans) {
    const sizeKb = (r.bytes / 1024).toFixed(0);
    console.log(`- [${r.resource_type}] ${r.public_id}  (${sizeKb} KB, ${r.created_at})`);
    console.log(`  ${r.secure_url}`);
  }
  console.log(`\nTotal: ${orphans.length}`);
}

main().catch((err) => {
  console.error("Error al auditar Cloudinary:", err);
  process.exit(1);
});
