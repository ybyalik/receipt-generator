import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FiBold, FiItalic, FiUnderline, FiLink, FiImage, FiList, FiCode } from 'react-icons/fi';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual');
  const [htmlContent, setHtmlContent] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange(html);
    },
  });

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    if (editor) {
      editor.commands.setContent(newHtml);
    }
    onChange(newHtml);
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* View Mode Toggle */}
      <div className="bg-gray-100 border-b border-gray-300 px-3 py-2 flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode('visual')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            viewMode === 'visual'
              ? 'bg-navy-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Visual
        </button>
        <button
          type="button"
          onClick={() => setViewMode('html')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            viewMode === 'html'
              ? 'bg-navy-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          HTML
        </button>
      </div>

      {viewMode === 'visual' && (
        <>
          {/* Toolbar */}
          <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bold') ? 'bg-gray-300' : ''
              }`}
              title="Bold"
            >
              <FiBold size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('italic') ? 'bg-gray-300' : ''
              }`}
              title="Italic"
            >
              <FiItalic size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('underline') ? 'bg-gray-300' : ''
              }`}
              title="Underline"
            >
              <FiUnderline size={18} />
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`px-3 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
              }`}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`px-3 py-2 rounded hover:bg-gray-200 transition-colors text-sm font-semibold ${
                editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
              }`}
              title="Heading 3"
            >
              H3
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('bulletList') ? 'bg-gray-300' : ''
              }`}
              title="Bullet List"
            >
              <FiList size={18} />
            </button>
            <button
              type="button"
              onClick={addLink}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('link') ? 'bg-gray-300' : ''
              }`}
              title="Add Link"
            >
              <FiLink size={18} />
            </button>
            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Add Image"
            >
              <FiImage size={18} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive('codeBlock') ? 'bg-gray-300' : ''
              }`}
              title="Code Block"
            >
              <FiCode size={18} />
            </button>
          </div>

          {/* Editor Content */}
          <div className="p-4 min-h-[400px] prose prose-sm max-w-none">
            <EditorContent editor={editor} />
          </div>
        </>
      )}

      {viewMode === 'html' && (
        <div className="p-4">
          <textarea
            value={htmlContent}
            onChange={(e) => handleHtmlChange(e.target.value)}
            className="w-full min-h-[400px] font-mono text-sm border border-gray-300 rounded p-3"
            placeholder="Enter HTML content..."
          />
        </div>
      )}
    </div>
  );
};

export default TiptapEditor;
