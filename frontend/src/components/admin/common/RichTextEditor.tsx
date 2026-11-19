'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { AdminMediaPickerModal } from '@/components/admin/common/AdminMediaPickerModal';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Code2,
  Eye,
  RemoveFormatting,
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung bài viết theo chuẩn WordPress...',
  minHeight = '320px',
  className = '',
}) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value || '');
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-medium hover:text-blue-700',
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-md mx-auto',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `focus:outline-none max-w-none text-slate-800 p-4 leading-relaxed text-sm ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      onChange(html);
    },
  });

  // Synchronize when value changes externally (e.g. language tab switch)
  useEffect(() => {
    setRawHtml(value || '');
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập địa chỉ liên kết (URL):', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    setIsMediaModalOpen(true);
  }, []);

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setRawHtml(newHtml);
    onChange(newHtml);
    if (editor) {
      editor.commands.setContent(newHtml, { emitUpdate: false });
    }
  };

  if (!editor) {
    return (
      <div className="w-full border border-slate-200 rounded-xl p-4 min-h-[200px] flex items-center justify-center text-slate-400 text-xs">
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div className={`w-full rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden ${className}`}>
      {/* WordPress-style Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Tiêu đề H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Tiêu đề H3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            editor.isActive('heading', { level: 4 }) ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Tiêu đề H4"
        >
          <Heading4 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Text styling */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('strike') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Gạch ngang chữ"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('code') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Đoạn mã code inline"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Danh sách gạch đầu dòng"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Danh sách số thứ tự"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Trích dẫn blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Media & Links */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
            editor.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-slate-200 text-slate-700'
          }`}
          title="Chèn liên kết URL"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200 text-rose-600 transition-colors"
            title="Bỏ liên kết"
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded-lg text-xs font-semibold hover:bg-slate-200 text-slate-700 transition-colors"
          title="Chèn ảnh theo URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Clear formatting & Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-1.5 rounded-lg text-xs hover:bg-slate-200 text-slate-500 transition-colors"
          title="Xóa định dạng"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg text-xs hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg text-xs hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition-colors"
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>

        {/* Switch HTML Code / Visual Mode */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isHtmlMode ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Chuyển đổi giữa chế độ biên tập trực quan (WordPress) và mã nguồn HTML"
          >
            {isHtmlMode ? <Eye className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
            <span>{isHtmlMode ? 'Xem Visual' : 'Sửa HTML'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isHtmlMode ? (
        <div className="p-3 bg-slate-900">
          <textarea
            value={rawHtml}
            onChange={handleRawHtmlChange}
            placeholder={placeholder}
            rows={14}
            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed p-2 focus:outline-none resize-y"
          />
        </div>
      ) : (
        <div className="prose prose-slate max-w-none bg-white min-h-[300px]">
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Central Media Library Picker Modal */}
      <AdminMediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
          }
          setIsMediaModalOpen(false);
        }}
        title="Chèn Hình Ảnh Vào Bài Viết"
      />
    </div>
  );
};

export default RichTextEditor;
