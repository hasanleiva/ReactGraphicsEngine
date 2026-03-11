import { CanvaEditor } from './components/editor';
import type { EditorConfig } from './types/editor';
import React, { useState } from 'react';
import { data } from './devData';
import { useAuth } from './contexts/AuthContext';

const Editor = () => {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const name = 'My Design';

  const editorConfig: EditorConfig = {
    apis: {
      url: '',
      userToken: '',
      searchFonts: '/search-fonts',
      searchTemplates: '/search-templates',
      searchTexts: '/search-texts',
      searchImages: '/search-images',
      searchShapes: '/search-shapes',
      searchFrames: '/search-frames',

      // Backend endpoints
      fetchUserImages: '/api/images/list', // Need to implement this
      uploadUserImage: '/api/images/upload',
      removeUserImage: '/api/images/remove', // Need to implement this

      templateKeywordSuggestion: '/template-suggestion',
      textKeywordSuggestion: '/text-suggestion',
      imageKeywordSuggestion: '/image-suggestion',
      shapeKeywordSuggestion: '/shape-suggestion',
      frameKeywordSuggestion: '/frame-suggestion',
    },
    unsplash: {
      accessKey: 'YOUR_UNSPLASH_ACCESS_KEY',
      pageSize: 30,
    },
    editorAssetsUrl: '',
    imageKeywordSuggestions: 'animal,sport,love,scene,dog,cat,whale',
    templateKeywordSuggestions: 'sale,discount,fashion,motivation,quote',
  };

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
      // Pass role to the component if it supports it
      userRole={user?.role}
    />
  );
};

export default Editor;
