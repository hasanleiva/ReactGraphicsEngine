import Editor from './Editor';
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthPopup } from './components/AuthPopup';
import { SettingsPopup } from './components/SettingsPopup';

function App() {
  return (
    <AuthProvider>
      <Editor />
      <AuthPopup />
      <SettingsPopup />
    </AuthProvider>
  );
}

export default App;
