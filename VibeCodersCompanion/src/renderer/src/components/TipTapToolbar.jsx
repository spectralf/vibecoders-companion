import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * TipTapToolbar component for formatting controls
 *
 * @param {Object} props - Component props
 * @param {Object} props.editor - TipTap editor instance
 */
const TipTapToolbar = ({ editor }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = {
    textColor: useRef(null),
    bgColor: useRef(null)
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown &&
          dropdownRefs[openDropdown] &&
          !dropdownRefs[openDropdown].current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-0.5 p-0.5 border-b border-gray-200 bg-gray-50 dark:bg-dark-bg-tertiary dark:border-dark-border">
      {/* Bold */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('bold')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Bold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('italic')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Italic"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('underline')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
          <line x1="4" y1="21" x2="20" y2="21"></line>
        </svg>
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('strike')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Strikethrough"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <path d="M16 6c-.5-1.8-2.1-3-4-3-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.5"></path>
          <path d="M8 18c.5 1.8 2.1 3 4 3 2.2 0 4-1.8 4-4 0-1.5-.8-2.8-2-3.5"></path>
        </svg>
      </button>

      {/* Subscript */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('subscript')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Subscript"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 5l8 8"></path>
          <path d="M12 5l-8 8"></path>
          <path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"></path>
        </svg>
      </button>

      {/* Superscript */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('superscript')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Superscript"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19l8-8"></path>
          <path d="M12 19l-8-8"></path>
          <path d="M20 8h-4c0-1.5.44-2 1.5-2.5S20 4.33 20 3c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"></path>
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

      {/* Bullet List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('bulletList')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Bullet List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>

      {/* Ordered List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('orderedList')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Ordered List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
        </svg>
      </button>

      {/* Task List */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('taskList')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Task List"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="6" height="6" rx="1"></rect>
          <path d="M7 8h0"></path>
          <line x1="12" y1="8" x2="21" y2="8"></line>
          <rect x="3" y="14" width="6" height="6" rx="1"></rect>
          <line x1="12" y1="17" x2="21" y2="17"></line>
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

      {/* Heading Buttons */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Heading 1"
      >
        <span className="font-bold text-sm">H1</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Heading 2"
      >
        <span className="font-bold text-sm">H2</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Heading 3"
      >
        <span className="font-bold text-sm">H3</span>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('heading', { level: 4 })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Heading 4"
      >
        <span className="font-bold text-sm">H4</span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

      {/* Blockquote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('blockquote')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Blockquote"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zm14-4h-4"></path>
          <path d="M7 8v2"></path>
          <path d="M11 8v2"></path>
        </svg>
      </button>

      {/* Code Block */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('codeBlock')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Code Block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      </button>

      {/* Link */}
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive('link')
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>

      {/* Text Color */}
      <div className="relative inline-block" ref={dropdownRefs.textColor}>
        <button
          type="button"
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary flex items-center ${
            openDropdown === 'textColor' ? 'bg-gray-200 dark:bg-dark-bg-primary' : ''
          }`}
          title="Text Color"
          onClick={() => toggleDropdown('textColor')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 7h6l-3 10z"></path>
            <line x1="4" y1="20" x2="20" y2="20"></line>
          </svg>
          <span className="ml-0.5 w-2 h-2 border border-gray-400 dark:border-dark-border" style={{ backgroundColor: 'currentColor' }}></span>
        </button>
        {openDropdown === 'textColor' && (
          <div className="absolute z-10 mt-1 bg-white dark:bg-dark-bg-tertiary border border-gray-300 dark:border-dark-border rounded shadow-lg p-1">
            <div className="grid grid-cols-5 gap-1">
              {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setOpenDropdown(null);
                  }}
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Color */}
      <div className="relative inline-block" ref={dropdownRefs.bgColor}>
        <button
          type="button"
          className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary flex items-center ${
            openDropdown === 'bgColor' ? 'bg-gray-200 dark:bg-dark-bg-primary' : ''
          }`}
          title="Highlight Color"
          onClick={() => toggleDropdown('bgColor')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
            <path d="M2 2l7.586 7.586"></path>
            <circle cx="11" cy="11" r="2"></circle>
          </svg>
          <span className="ml-0.5 w-2 h-2 border border-gray-400 dark:border-dark-border" style={{ backgroundColor: 'yellow' }}></span>
        </button>
        {openDropdown === 'bgColor' && (
          <div className="absolute z-10 mt-1 bg-white dark:bg-dark-bg-tertiary border border-gray-300 dark:border-dark-border rounded shadow-lg p-1">
            <div className="grid grid-cols-5 gap-1">
              {['#FFFF00', '#FFCC00', '#FF9900', '#FF6600', '#FF3300', '#99FF00', '#00FF00', '#00FFFF', '#00CCFF', '#0099FF'].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().toggleHighlight({ color }).run();
                    setOpenDropdown(null);
                  }}
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400"
                  style={{ backgroundColor: color }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

      {/* Text Alignment */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive({ textAlign: 'left' })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Align Left"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="15" y2="12"></line>
          <line x1="3" y1="18" x2="18" y2="18"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive({ textAlign: 'center' })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Align Center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="6" y1="12" x2="18" y2="12"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive({ textAlign: 'right' })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Align Right"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="9" y1="12" x2="21" y2="12"></line>
          <line x1="6" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary ${
          editor.isActive({ textAlign: 'justify' })
            ? 'bg-gray-200 text-primary dark:bg-dark-bg-primary dark:text-primary-light'
            : 'text-gray-700 dark:text-dark-text-primary'
        }`}
        title="Justify"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

      {/* Indentation */}
      <button
        type="button"
        onClick={() => editor.chain().focus().outdent().run()}
        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary"
        title="Decrease Indent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="8" x2="21" y2="8"></line>
          <line x1="3" y1="16" x2="21" y2="16"></line>
          <line x1="9" y1="12" x2="3" y2="12"></line>
          <polyline points="8 9 3 12 8 15"></polyline>
        </svg>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().indent().run()}
        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary"
        title="Increase Indent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="8" x2="21" y2="8"></line>
          <line x1="3" y1="16" x2="21" y2="16"></line>
          <line x1="15" y1="12" x2="21" y2="12"></line>
          <polyline points="16 9 21 12 16 15"></polyline>
        </svg>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-300 dark:bg-dark-border mx-0.5"></div>

      {/* Horizontal Rule */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary"
        title="Horizontal Rule"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      {/* Clear Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-dark-bg-primary text-gray-700 dark:text-dark-text-primary"
        title="Clear Formatting"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
      </button>
    </div>
  );
};

TipTapToolbar.propTypes = {
  editor: PropTypes.object
};

export default TipTapToolbar;
