import React, { FC, useEffect, useState } from 'react';
import { useEditor } from 'canva-editor/hooks';
import CloseSidebarButton from './CloseButton';
import axios from 'axios';

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

interface DropdownItem {
  id: string;
  logo: string;
  text: string;
}

const ElementsContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { layers, actions, activePage } = useEditor((state) => ({
    layers: state.pages[state.activePage] && state.pages[state.activePage].layers,
    activePage: state.activePage,
  }));

  const [dropdownDataCache, setDropdownDataCache] = useState<Record<string, DropdownItem[]>>({});

  useEffect(() => {
    if (!layers) return;

    const fetchDropdownData = async () => {
      const dropdownFiles = new Set<string>();
      Object.values(layers).forEach(layer => {
        if (layer.data.props.elementType === 'dropdown' && layer.data.props.dropdownData) {
          dropdownFiles.add(layer.data.props.dropdownData);
        }
      });

      for (const file of dropdownFiles) {
        if (!dropdownDataCache[file]) {
          try {
            // Assuming the JSON files are accessible via this path
            const response = await axios.get(`https://pub-286821d3f9664551a82643725b87198e.r2.dev/${file}`);
            setDropdownDataCache(prev => ({ ...prev, [file]: response.data }));
          } catch (error) {
            console.error(`Failed to fetch dropdown data from ${file}:`, error);
          }
        }
      }
    };

    fetchDropdownData();
  }, [layers]);

  if (!layers) return null;

  const editableLayers = Object.values(layers).filter(
    (layer) => layer.data.props.elementType && layer.data.props.elementType !== ''
  );

  // Group dropdown layers by their dropdownData file
  const dropdownGroups: Record<string, typeof editableLayers> = {};
  editableLayers.forEach(layer => {
    if (layer.data.props.elementType === 'dropdown' && layer.data.props.dropdownData) {
      const file = layer.data.props.dropdownData;
      if (!dropdownGroups[file]) dropdownGroups[file] = [];
      dropdownGroups[file].push(layer);
    }
  });

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

  const handleDropdownChange = (file: string, selectedId: string) => {
    const data = dropdownDataCache[file];
    if (!data) return;

    const selectedItem = data.find(item => item.id === selectedId);
    if (!selectedItem) return;

    actions.history.new();
    
    // Update all layers associated with this dropdown file
    dropdownGroups[file].forEach(layer => {
      if (layer.data.type === 'Text') {
        const updatedHtml = updateTextInHtml(layer.data.props.text || '', selectedItem.text);
        actions.setProp(activePage, layer.id, { text: updatedHtml });
      } else if (layer.data.type === 'Image') {
        actions.setProp(activePage, layer.id, {
          image: {
            url: selectedItem.logo,
            thumb: selectedItem.logo,
          },
        });
      }
    });
  };

  // Keep track of rendered dropdown groups to avoid rendering multiple dropdowns for the same file
  const renderedDropdownGroups = new Set<string>();

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
          const { name, elementType, text, dropdownData } = layer.data.props;
          const displayName = name || 'Unnamed Element';
          const plainText = extractTextFromHtml(text || '');

          if (elementType === 'dropdown' && dropdownData) {
            if (renderedDropdownGroups.has(dropdownData)) {
              return null; // Already rendered a dropdown for this file
            }
            renderedDropdownGroups.add(dropdownData);
            
            const data = dropdownDataCache[dropdownData] || [];
            
            // Try to find the currently selected value based on the first text layer or image layer in the group
            let currentValue = '';
            const firstTextLayer = dropdownGroups[dropdownData].find(l => l.data.type === 'Text');
            if (firstTextLayer) {
               const currentText = extractTextFromHtml(firstTextLayer.data.props.text || '');
               const matchedItem = data.find(item => item.text === currentText);
               if (matchedItem) currentValue = matchedItem.id;
            } else {
               const firstImageLayer = dropdownGroups[dropdownData].find(l => l.data.type === 'Image');
               if (firstImageLayer) {
                  const currentImage = firstImageLayer.data.props.image?.url;
                  const matchedItem = data.find(item => item.logo === currentImage);
                  if (matchedItem) currentValue = matchedItem.id;
               }
            }

            return (
              <div key={`dropdown-group-${dropdownData}`} css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label css={{ fontSize: 14, fontWeight: 500 }}>{displayName} (Dropdown)</label>
                <select
                  value={currentValue}
                  onChange={(e) => handleDropdownChange(dropdownData, e.target.value)}
                  css={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                  }}
                >
                  <option value="">Select an option</option>
                  {data.map(item => (
                    <option key={item.id} value={item.id}>{item.text}</option>
                  ))}
                </select>
              </div>
            );
          }

          if (elementType === 'input text') {
            return (
              <div key={id} css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label css={{ fontSize: 14, fontWeight: 500 }}>{displayName}</label>
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
              </div>
            );
          }

          if (elementType === 'image') {
            return (
              <div key={id} css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label css={{ fontSize: 14, fontWeight: 500 }}>{displayName}</label>
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
              </div>
            );
          }

          return null;
        })}
        {editableLayers.length === 0 && (
          <p css={{ fontSize: 14, color: '#666' }}>No editable elements found in this template.</p>
        )}
      </div>
    </div>
  );
};

export default ElementsContent;
