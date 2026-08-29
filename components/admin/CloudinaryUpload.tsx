"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ImageIcon, X } from "lucide-react";

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  resourceType?: "image" | "raw";
  label?: string;
  folder?: string;
  compact?: boolean;
  /** "stack" (default): preview arriba, botón abajo. "row": miniatura cuadrada + botón en una sola fila, para listas repetibles. */
  layout?: "stack" | "row";
}

export function CloudinaryUpload({
  value,
  onChange,
  resourceType = "image",
  label = "Subir archivo",
  folder,
  compact = false,
  layout = "stack",
}: CloudinaryUploadProps) {
  const defaultFolder = resourceType === "image" ? "lms/thumbnails" : "lms/resources";

  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary/sign"
      options={{
        resourceType,
        clientAllowedFormats:
          resourceType === "image"
            ? ["jpg", "jpeg", "png", "webp"]
            : ["pdf", "pptx", "docx", "xlsx"],
        maxFileSize: resourceType === "image" ? 5_000_000 : 50_000_000,
        folder: folder ?? defaultFolder,
        sources: ["local"],
        language: "es",
      }}
      onSuccess={(result) => {
        const info = result.info as { secure_url: string };
        if (info?.secure_url) onChange(info.secure_url);
      }}
    >
      {({ open }) =>
        layout === "row" ? (
          <div className="flex items-center gap-3">
            <div className="relative size-16 rounded-md overflow-hidden border border-border shrink-0 bg-muted group">
              {value ? (
                <>
                  <img src={value} alt="Vista previa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Quitar imagen"
                  >
                    <X className="size-3" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="size-5 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => open()}>
              <ImageIcon className="size-4" />
              {value ? "Cambiar" : label}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {value && resourceType === "image" && (
              <div className={`relative rounded-md overflow-hidden border border-border group ${compact ? "h-32" : "h-44"}`}>
                <img src={value} alt="Vista previa" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Quitar imagen"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {value && resourceType === "raw" && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline truncate flex-1"
                >
                  Archivo subido
                </a>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  aria-label="Quitar archivo"
                >
                  <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            )}

            <Button type="button" variant="outline" size="sm" onClick={() => open()}>
              {resourceType === "image" ? (
                <ImageIcon className="size-4" />
              ) : (
                <Upload className="size-4" />
              )}
              {value ? "Cambiar archivo" : label}
            </Button>
          </div>
        )
      }
    </CldUploadWidget>
  );
}
