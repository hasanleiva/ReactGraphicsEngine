import { CanvaEditor } from './components/editor';
import type { EditorConfig } from './types/editor';
import React, { useState } from 'react';
import { data } from './devData';

// ─────────────────────────────────────────────────────────────────────────────
// Image uploads are handled entirely in the browser via a Vite dev-server
// middleware (see vite.config.ts). No backend needed.
//
// To connect a real backend later, set `apis.url` to your API base URL
// and keep the endpoint paths as-is.
// ─────────────────────────────────────────────────────────────────────────────
const editorConfig: EditorConfig = {
  apis: {
    url: '',                                          // same-origin (Vite mock)
    userToken: '',                                    // no auth needed for local dev
    searchFonts: '/search-fonts',
    searchTemplates: '/search-templates',
    searchTexts: '/search-texts',
    searchImages: '/search-images',
    searchShapes: '/search-shapes',
    searchFrames: '/search-frames',

    // ↓ These three are handled in-memory by the Vite plugin ↓
    fetchUserImages: '/your-uploads/get-user-images',
    uploadUserImage: '/your-uploads/upload',
    removeUserImage: '/your-uploads/remove',

    templateKeywordSuggestion: '/template-suggestion',
    textKeywordSuggestion: '/text-suggestion',
    imageKeywordSuggestion: '/image-suggestion',
    shapeKeywordSuggestion: '/shape-suggestion',
    frameKeywordSuggestion: '/frame-suggestion',
  },
  unsplash: {
    accessKey: 'YOUR_UNSPLASH_ACCESS_KEY', // replace with real key for Unsplash stock photos
    pageSize: 30,
  },
  editorAssetsUrl: '',
  imageKeywordSuggestions: 'animal,sport,love,scene,dog,cat,whale',
  templateKeywordSuggestions: 'sale,discount,fashion,motivation,quote',
};

const Editor = () => {
  const [saving, setSaving] = useState(false);
  const name = 'My Design';

  const handleOnChanges = (changes: unknown) => {
    console.log('Design changed:', changes);
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleOnDesignNameChanges = (newName: string) => {
    console.log('Design renamed to:', newName);
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const handleOnRemove = () => {
    console.log('Design removed');
  };

  return (
    <CanvaEditor
      data={{ name, editorConfig: data }}
      config={editorConfig}
      saving={saving}
      onRemove={handleOnRemove}
      onChanges={handleOnChanges}
      onDesignNameChanges={handleOnDesignNameChanges}
    />
  );
};

export default Editor;
