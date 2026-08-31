"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  Heading2, Heading3, List, ListOrdered, Quote, Code2,
  Link2, ImagePlus, ImageIcon, Minus, Undo2, Redo2,
  AlignLeft, AlignCenter, AlignRight, Loader2, Link2Off,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// ─── Toolbar Separator ────────────────────────────────────────────────────────

const Separator = () => (
  <div className="w-px h-5 bg-border shrink-0 mx-0.5" />
);

// ─── Toolbar Button ───────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarButton = ({ onClick, active, disabled, title, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault(); // prevent editor losing focus
      onClick();
    }}
    title={title}
    disabled={disabled}
    className={cn(
      "h-7 w-7 flex items-center justify-center rounded text-sm transition-all duration-100 shrink-0",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )}
  >
    {children}
  </button>
);

// ─── Toolbar Group ────────────────────────────────────────────────────────────

const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
}: RichTextEditorProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline underline-offset-2 cursor-pointer" },
      }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // word count
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[320px] px-5 py-4 focus:outline-none",
          "text-foreground",
          // headings
          "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-foreground",
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground",
          // paragraphs & lists
          "[&_p]:mb-3 [&_p]:leading-relaxed",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3",
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
          "[&_li]:mb-1",
          // blockquote
          "[&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4",
          // code
          "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.8em] [&_code]:font-mono [&_code]:text-foreground",
          "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4",
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
          // images & hr
          "[&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-4",
          "[&_hr]:border-border [&_hr]:my-6",
        ),
      },
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content]); // eslint-disable-line

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAddLink = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", existing ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") || !editor) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `editor-images/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("resource-files").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("resource-files").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    } catch (err: unknown) {
      console.error("Image upload failed:", err instanceof Error ? err.message : err);
    } finally {
      setUploading(false);
    }
  }, [editor, supabase]);

  const handleImageUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  if (!editor) return null;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden bg-background flex flex-col", className)}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/30 flex-wrap">

        {/* History */}
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (⌘Z)">
            <Undo2 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (⌘⇧Z)">
            <Redo2 size={14} />
          </ToolbarButton>
        </ToolbarGroup>

        <Separator />

        {/* Text style */}
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (⌘B)">
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (⌘I)">
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (⌘U)">
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
            <Strikethrough size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">
            <Code2 size={14} />
          </ToolbarButton>
        </ToolbarGroup>

        <Separator />

        {/* Headings */}
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
            <Heading2 size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
            <Heading3 size={15} />
          </ToolbarButton>
        </ToolbarGroup>

        <Separator />

        {/* Lists & blocks */}
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
            <ListOrdered size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
            <Quote size={15} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">
            <Code2 size={15} />
          </ToolbarButton>
        </ToolbarGroup>

        <Separator />

        {/* Alignment */}
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
            <AlignRight size={14} />
          </ToolbarButton>
        </ToolbarGroup>

        <Separator />

        {/* Links & images */}
        <ToolbarGroup>
          <ToolbarButton onClick={handleAddLink} active={editor.isActive("link")} title="Add / edit link (⌘K)">
            <Link2 size={14} />
          </ToolbarButton>
          {editor.isActive("link") && (
            <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
              <Link2Off size={14} />
            </ToolbarButton>
          )}
          <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload image">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          </ToolbarButton>
          <ToolbarButton onClick={handleImageUrl} title="Image from URL">
            <ImageIcon size={14} />
          </ToolbarButton>
        </ToolbarGroup>

        <Separator />

        {/* Divider */}
        <ToolbarGroup>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
            <Minus size={14} />
          </ToolbarButton>
        </ToolbarGroup>
      </div>

      {/* ── Bubble menu (appears on text selection) ── */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 bg-popover border border-border rounded-lg shadow-lg px-1.5 py-1"
      >
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold size={13} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic size={13} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon size={13} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike">
          <Strikethrough size={13} />
        </ToolbarButton>
        <Separator />
        <ToolbarButton onClick={handleAddLink} active={editor.isActive("link")} title="Link">
          <Link2 size={13} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
            <Link2Off size={13} />
          </ToolbarButton>
        )}
      </BubbleMenu>

      {/* ── Editor content ── */}
      <EditorContent editor={editor} className="flex-1" />

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-border bg-muted/20">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {editor.isActive("heading", { level: 2 }) && <span>Heading 2</span>}
          {editor.isActive("heading", { level: 3 }) && <span>Heading 3</span>}
          {editor.isActive("bulletList") && <span>Bullet list</span>}
          {editor.isActive("orderedList") && <span>Ordered list</span>}
          {editor.isActive("blockquote") && <span>Blockquote</span>}
          {editor.isActive("codeBlock") && <span>Code block</span>}
          {!editor.isActive("heading", { level: 2 }) &&
           !editor.isActive("heading", { level: 3 }) &&
           !editor.isActive("bulletList") &&
           !editor.isActive("orderedList") &&
           !editor.isActive("blockquote") &&
           !editor.isActive("codeBlock") && <span>Paragraph</span>}
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
      </div>
    </div>
  );
}