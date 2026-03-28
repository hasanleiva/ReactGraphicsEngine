import React, { FC } from 'react';
import { useEditor } from 'canva-editor/hooks';
import CloseSidebarButton from './CloseButton';

const extractTextFromHtml = (html: string) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const updateTextInHtml = (html: string, newText: string) => {
  if (!html) return newText;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  
  // Find the deepest text node and replace its content
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();
  if (node) {
    node.nodeValue = newText;
    // Remove other text nodes to avoid duplicate text
    let nextNode = walker.nextNode();
    while (nextNode) {
      nextNode.nodeValue = '';
      nextNode = walker.nextNode();
    }
    return doc.body.innerHTML;
  }
  return newText;
};

const ElementsContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { layers, actions, activePage } = useEditor((state) => ({
    layers: state.pages[state.activePage] && state.pages[state.activePage].layers,
    activePage: state.activePage,
  }));

  if (!layers) return null;

  const editableLayers = Object.values(layers).filter(
    (layer) => layer.data.props.elementType && layer.data.props.elementType !== ''
  );

  const handleTextChange = (layerId: string, currentHtml: string, newText: string) => {
    actions.history.new();
    const updatedHtml = updateTextInHtml(currentHtml, newText);
    actions.setProp(activePage, layerId, { text: updatedHtml });
  };

  const handleImageChange = (layerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        actions.history.new();
        actions.setProp(activePage, layerId, {
          image: {
            url,
            thumb: url,
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        display: 'flex',
        padding: 16,
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      <CloseSidebarButton onClose={onClose} />
      <h3 css={{ marginBottom: 16, fontWeight: 'bold' }}>Elements</h3>
      <div css={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {editableLayers.map((layer) => {
          const { id } = layer;
          const { name, elementType, text } = layer.data.props;
          const displayName = name || 'Unnamed Element';
          const plainText = extractTextFromHtml(text || '');

          return (
            <div key={id} css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label css={{ fontSize: 14, fontWeight: 500 }}>{displayName}</label>
              {elementType === 'input text' && (
                <input
                  type="text"
                  value={plainText}
                  onChange={(e) => handleTextChange(id, text || '', e.target.value)}
                  css={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                  }}
                />
              )}
              {elementType === 'image' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(id, e)}
                  css={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                  }}
                />
              )}
              {elementType === 'dropdown' && (
                <select
                  value={plainText}
                  onChange={(e) => handleTextChange(id, text || '', e.target.value)}
                  css={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                  }}
                >
                  <option value="">Select an option</option>
                  <option value="Option 1">Option 1</option>
                  <option value="Option 2">Option 2</option>
                  <option value="Option 3">Option 3</option>
                </select>
              )}
            </div>
          );
        })}
        {editableLayers.length === 0 && (
          <p css={{ fontSize: 14, color: '#666' }}>No editable elements found in this template.</p>
        )}
      </div>
    </div>
  );
};

export default ElementsContent;
