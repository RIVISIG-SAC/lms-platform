"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  ImageIcon,
  Undo2,
  Redo2,
  Strikethrough,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const lowlight = createLowlight(common);

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  const onApplyLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let href = linkUrl.trim();
      if (!/^https?:\/\//i.test(href) && !href.startsWith("mailto:")) {
        href = `https://${href}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkUrl("");
    setLinkOpen(false);
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-lg border-b bg-background/95 px-2 py-1.5 backdrop-blur">
      <ToolbarButton
        label="Negrita"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Cursiva"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Tachado"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        label="Encabezado 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Encabezado 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <ToolbarButton
        label="Lista"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Lista numerada"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Cita"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Bloque de código"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code className="size-4" />
      </ToolbarButton>

      <div className="mx-1 h-5 w-px bg-border" />

      <div className="relative">
        <ToolbarButton
          label="Enlace"
          active={editor.isActive("link")}
          onClick={() => {
            setLinkUrl(editor.getAttributes("link").href || "");
            setLinkOpen((v) => !v);
          }}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        {linkOpen && (
          <div className="absolute left-0 top-9 z-20 flex items-center gap-1 rounded-md border bg-popover p-1.5 shadow-md">
            <input
              type="url"
              autoFocus
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onApplyLink();
                }
                if (e.key === "Escape") setLinkOpen(false);
              }}
              className="h-7 w-56 rounded border bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <Button type="button" size="xs" onClick={onApplyLink}>
              Aplicar
            </Button>
          </div>
        )}
      </div>

      <CldUploadWidget
        signatureEndpoint="/api/cloudinary/sign"
        options={{
          resourceType: "image",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5_000_000,
          folder: "lms/blog/content",
          sources: ["local"],
          language: "es",
        }}
        onSuccess={(result) => {
          const info = result.info as { secure_url?: string };
          if (info?.secure_url) {
            editor.chain().focus().setImage({ src: info.secure_url, alt: "" }).run();
          }
        }}
      >
        {({ open }) => (
          <ToolbarButton label="Insertar imagen" onClick={() => open()}>
            <ImageIcon className="size-4" />
          </ToolbarButton>
        )}
      </CldUploadWidget>

      <ToolbarButton
        label="Separador"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarButton>

      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton
          label="Deshacer"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Rehacer"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [2, 3, 4] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Empieza a escribir tu historia…",
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg border my-6",
          loading: "lazy",
        },
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap prose-blog focus:outline-none min-h-[480px] px-6 py-6",
      },
    },
  });

  if (!editor) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="h-10 border-b bg-muted/30" />
        <div className="min-h-[480px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
