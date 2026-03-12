import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Link2, ImagePlus,
  Upload, Minus, AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Loader2, ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const IMAGE_SIZE_PRESETS = [
  { label: "XS", width: 150, desc: "Extra Small" },
  { label: "S", width: 250, desc: "Small" },
  { label: "M", width: 400, desc: "Medium" },
  { label: "L", width: 600, desc: "Large" },
  { label: "XL", width: 800, desc: "Extra Large" },
  { label: "Full", width: null, desc: "Original" },
] as const;

const IMAGE_ALIGN_OPTIONS = [
  { label: "Left", value: "left", icon: AlignLeft },
  { label: "Center", value: "center", icon: AlignCenter },
  { label: "Right", value: "right", icon: AlignRight },
] as const;

// Custom Image extension with resizable support
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null, parseHTML: (el) => el.getAttribute("width") || el.style.width || null, renderHTML: (attrs) => attrs.width ? { width: attrs.width, style: `width: ${typeof attrs.width === "number" ? attrs.width + "px" : attrs.width}` } : {} },
      height: { default: null, parseHTML: (el) => el.getAttribute("height") || el.style.height || null, renderHTML: (attrs) => attrs.height ? { height: attrs.height } : {} },
      "data-align": { default: "center", parseHTML: (el) => el.getAttribute("data-align") || "center", renderHTML: (attrs) => ({ "data-align": attrs["data-align"] || "center" }) },
    };
  },
});

const ToolbarButton = ({
  onClick, active, children, title, disabled,
}: {
  onClick: () => void; active?: boolean; children: React.ReactNode; title: string; disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`h-8 w-8 flex items-center justify-center rounded transition-colors disabled:opacity-40 ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-5 bg-border mx-0.5" />;

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resizing, setResizing] = useState<{ startX: number; startWidth: number; node: any; pos: number } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline cursor-pointer" } }),
      ResizableImage.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none text-foreground " +
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 " +
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 " +
          "[&_h4]:text-base [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 " +
          "[&_p]:mb-3 [&_p]:leading-relaxed " +
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 " +
          "[&_li]:mb-1 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4 " +
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono " +
          "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 " +
          "[&_img]:rounded-lg [&_img]:my-4 [&_img]:cursor-pointer [&_img]:transition-shadow [&_img]:hover:shadow-lg " +
          "[&_img[data-align='left']]:mr-auto [&_img[data-align='center']]:mx-auto [&_img[data-align='right']]:ml-auto " +
          "[&_img]:block [&_hr]:my-6 [&_hr]:border-border",
      },
      handleDOMEvents: {
        mousedown: (view, event) => {
          const target = event.target as HTMLElement;
          if (target.tagName === "IMG") {
            const pos = view.posAtDOM(target, 0);
            const img = target as HTMLImageElement;
            // Check if click is near right edge for resize
            const rect = img.getBoundingClientRect();
            if (event.clientX > rect.right - 12) {
              event.preventDefault();
              setResizing({ startX: event.clientX, startWidth: img.offsetWidth, node: target, pos });
              return true;
            }
          }
          return false;
        },
      },
    },
  });

  // Handle drag-to-resize
  useEffect(() => {
    if (!resizing || !editor) return;
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(100, resizing.startWidth + (e.clientX - resizing.startX));
      (resizing.node as HTMLImageElement).style.width = newWidth + "px";
    };
    const handleMouseUp = (e: MouseEvent) => {
      const newWidth = Math.max(100, resizing.startWidth + (e.clientX - resizing.startX));
      editor.chain().focus().setImage({
        src: (resizing.node as HTMLImageElement).src,
        width: newWidth as any,
      } as any).run();
      setResizing(null);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
  }, [resizing, editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const addLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev || "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") || !editor) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `editor-images/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("resource-files").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("resource-files").getPublicUrl(path);
      editor.chain().focus().setImage({ src: urlData.publicUrl } as any).run();
    } catch (err: any) {
      console.error("Image upload failed:", err.message);
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url } as any).run();
  }, [editor]);

  const setImageSize = useCallback((width: number | null) => {
    if (!editor) return;
    const attrs = editor.getAttributes("image");
    editor.chain().focus().setImage({ ...attrs, width: width ?? undefined } as any).run();
  }, [editor]);

  const setImageAlign = useCallback((align: string) => {
    if (!editor) return;
    const attrs = editor.getAttributes("image");
    editor.chain().focus().setImage({ ...attrs, "data-align": align } as any).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* Image Bubble Menu */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 150, maxWidth: "none" }}
        shouldShow={({ editor: ed }) => ed.isActive("image")}
      >
        <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex flex-col gap-2">
          {/* Size presets */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Size:</span>
            {IMAGE_SIZE_PRESETS.map((preset) => {
              const currentWidth = editor.getAttributes("image").width;
              const isActive = preset.width ? String(currentWidth) === String(preset.width) : !currentWidth;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageSize(preset.width)}
                  title={`${preset.desc}${preset.width ? ` (${preset.width}px)` : ""}`}
                  className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          {/* Alignment */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Align:</span>
            {IMAGE_ALIGN_OPTIONS.map((opt) => {
              const currentAlign = editor.getAttributes("image")["data-align"] || "center";
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setImageAlign(opt.value)}
                  title={opt.label}
                  className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${
                    currentAlign === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
          {/* Custom width */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1 font-medium">Custom:</span>
            <input
              type="number"
              min={50}
              max={1600}
              placeholder="Width (px)"
              className="w-24 h-7 text-xs border border-border rounded px-2 bg-background text-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt((e.target as HTMLInputElement).value);
                  if (val >= 50) setImageSize(val);
                }
              }}
            />
            <span className="text-xs text-muted-foreground">px</span>
          </div>
        </div>
      </BubbleMenu>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        {/* Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Code & Links */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Add/edit link">
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Images */}
        <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload image">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </ToolbarButton>
        <ToolbarButton onClick={addImageByUrl} title="Image from URL">
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content */}
      <div className={resizing ? "cursor-col-resize select-none" : ""}>
        <EditorContent editor={editor} />
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-border bg-muted/20 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          Click an image to resize & align
        </span>
        <span className="text-xs text-muted-foreground">
          {editor.storage.characterCount?.characters?.() ?? ""} 
        </span>
      </div>
    </div>
  );
}
