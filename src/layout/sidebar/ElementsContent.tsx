import React, { FC, useEffect, useState } from 'react';
import { useEditor } from 'canva-editor/hooks';
import CloseSidebarButton from './CloseButton';
import axios from 'axios';
import ArrowDownIcon from '../../icons/ArrowDownIcon';
import ArrowUpIcon from '../../icons/ArrowUpIcon';
import ImageIcon from '../../icons/ImageIcon';
import useMobileDetect from 'canva-editor/hooks/useMobileDetect';

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

const CollapsibleSection: FC<{
  title: string;
  dotColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, dotColor, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div css={{ marginBottom: 16 }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '8px 0',
          userSelect: 'none',
        }}
      >
        <div css={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            css={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dotColor,
            }}
          />
          <span css={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            {title.toUpperCase()}
          </span>
        </div>
        <div css={{ color: '#8a8a98' }}>
          {isOpen ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </div>
      </div>
      {isOpen && (
        <div css={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
};

const TextInputItem: FC<{
  label: string;
  value: string;
  fontName?: string;
  onChange: (val: string) => void;
}> = ({ label, value, fontName, onChange }) => {
  const isMultiline = value.includes('\n');

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label css={{ fontSize: 10, fontWeight: 600, color: '#8a8a98', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </label>
      {isMultiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          css={{
            padding: '8px 12px',
            backgroundColor: '#25262b',
            border: '1px solid #37383f',
            borderRadius: 6,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            resize: 'vertical',
            '&:focus': {
              borderColor: '#4d4e56',
            }
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          css={{
            padding: '8px 12px',
            backgroundColor: '#25262b',
            border: '1px solid #37383f',
            borderRadius: 6,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            '&:focus': {
              borderColor: '#4d4e56',
            }
          }}
        />
      )}
      {fontName && (
        <div css={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          backgroundColor: '#18191b',
          border: '1px solid #25262b',
          borderRadius: 6,
          marginTop: 2,
        }}>
          <div css={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#8a8a98' }} />
          <span css={{ fontSize: 11, color: '#8a8a98' }}>{fontName}</span>
        </div>
      )}
    </div>
  );
};

const ImageUploadItem: FC<{
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, onChange }) => {
  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label css={{ fontSize: 10, fontWeight: 600, color: '#8a8a98', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </label>
      )}
      <label
        css={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          backgroundColor: '#25262b',
          border: '1px dashed #4d4e56',
          borderRadius: 8,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: '#2c2d33',
          }
        }}
      >
        <ImageIcon css={{ color: '#8a8a98', marginBottom: 8 }} />
        <span css={{ fontSize: 13, fontWeight: 600, color: '#a5b4fc', marginBottom: 4 }}>
          Click to upload
        </span>
        <span css={{ fontSize: 11, color: '#8a8a98' }}>
          PNG · JPG · WEBP
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          css={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

const DropdownItemComponent: FC<{
  label: string;
  value: string;
  options: { id: string; text: string }[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label css={{ fontSize: 10, fontWeight: 600, color: '#8a8a98', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        css={{
          padding: '8px 12px',
          backgroundColor: '#25262b',
          border: '1px solid #37383f',
          borderRadius: 6,
          color: '#fff',
          fontSize: 14,
          outline: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238a8a98%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px top 50%',
          backgroundSize: '10px auto',
          '&:focus': {
            borderColor: '#4d4e56',
          }
        }}
      >
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.text}</option>
        ))}
      </select>
    </div>
  );
};

const ElementsContent: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { layers, actions, activePage } = useEditor((state) => ({
    layers: state.pages[state.activePage] && state.pages[state.activePage].layers,
    activePage: state.activePage,
  }));
  const isMobile = useMobileDetect();

  const [dropdownDataCache, setDropdownDataCache] = useState<Record<string, DropdownItem[]>>({});

  useEffect(() => {
    if (!layers) return;

    const fetchDropdownData = async () => {
      const dropdownFiles = new Set<string>();
      Object.values(layers).forEach(layer => {
        const elementType = layer.data.props.elementType || (layer.data.props as any).aq;
        const dropdownData = layer.data.props.dropdownData || (layer.data.props as any).ar;
        if (elementType === 'dropdown' && dropdownData) {
          dropdownFiles.add(dropdownData);
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

  const editableLayers = Object.values(layers).filter((layer) => {
    const elementType = layer.data.props.elementType || (layer.data.props as any).aq;
    return elementType && elementType !== '';
  });

  // Group layers
  const imageLayers = editableLayers.filter(l => {
    const elementType = l.data.props.elementType || (l.data.props as any).aq;
    return elementType === 'image';
  });

  const textLayers = editableLayers.filter(l => {
    const elementType = l.data.props.elementType || (l.data.props as any).aq;
    return elementType === 'input text';
  });

  const dropdownGroups: Record<string, typeof editableLayers> = {};
  editableLayers.forEach(layer => {
    const elementType = layer.data.props.elementType || (layer.data.props as any).aq;
    const dropdownData = layer.data.props.dropdownData || (layer.data.props as any).ar;
    if (elementType === 'dropdown' && dropdownData) {
      const file = dropdownData;
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
        const text = layer.data.props.text || (layer.data.props as any).v;
        const updatedHtml = updateTextInHtml(text || '', selectedItem.text);
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

  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        display: 'flex',
        padding: '16px 20px',
        boxSizing: 'border-box',
        backgroundColor: '#1a1a24',
        color: '#fff',
      }}
    >
      {!isMobile && <CloseSidebarButton onClose={onClose} />}
      <div css={{ marginBottom: 24 }}>
        <h3 css={{ fontWeight: 'bold', margin: 0 }}>Elements</h3>
      </div>

      <div css={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', overflowX: 'hidden', flexGrow: 1 }}>
        {imageLayers.length > 0 && (
          <CollapsibleSection title="BACKGROUND IMAGE" dotColor="#10b981">
            {imageLayers.map((layer) => {
              const name = layer.data.props.name || (layer.data.props as any).a;
              return (
                <ImageUploadItem
                  key={layer.id}
                  label={name}
                  onChange={(e) => handleImageChange(layer.id, e)}
                />
              );
            })}
          </CollapsibleSection>
        )}

        {textLayers.length > 0 && (
          <CollapsibleSection title={`TEXT ELEMENTS (${textLayers.length})`} dotColor="#3b82f6">
            {textLayers.map((layer) => {
              const name = layer.data.props.name || (layer.data.props as any).a;
              const text = layer.data.props.text || (layer.data.props as any).v;
              const plainText = extractTextFromHtml(text || '');
              const fonts = layer.data.props.fonts || (layer.data.props as any).f;
              const fontName = fonts && fonts.length > 0 ? fonts[0].name : undefined;

              return (
                <TextInputItem
                  key={layer.id}
                  label={name || 'Text Element'}
                  value={plainText}
                  fontName={fontName}
                  onChange={(val) => handleTextChange(layer.id, text || '', val)}
                />
              );
            })}
          </CollapsibleSection>
        )}

        {Object.entries(dropdownGroups).map(([file, layersInGroup]) => {
          const data = dropdownDataCache[file] || [];
          
          // Try to find the currently selected value
          let currentValue = '';
          const firstTextLayer = layersInGroup.find(l => l.data.type === 'Text');
          if (firstTextLayer) {
             const text = firstTextLayer.data.props.text || (firstTextLayer.data.props as any).v;
             const currentText = extractTextFromHtml(text || '');
             const matchedItem = data.find(item => item.text === currentText);
             if (matchedItem) currentValue = matchedItem.id;
          } else {
             const firstImageLayer = layersInGroup.find(l => l.data.type === 'Image');
             if (firstImageLayer) {
                const image = firstImageLayer.data.props.image || (firstImageLayer.data.props as any).p;
                const currentImage = image?.url;
                const matchedItem = data.find(item => item.logo === currentImage);
                if (matchedItem) currentValue = matchedItem.id;
             }
          }

          // Get the name of the first layer in the group to use as the dropdown label
          const firstLayerName = layersInGroup[0]?.data.props.name || (layersInGroup[0]?.data.props as any).a || 'Dropdown';

          return (
            <CollapsibleSection key={`dropdown-${file}`} title={`DROPDOWN: ${firstLayerName}`} dotColor="#f59e0b">
              <DropdownItemComponent
                label={firstLayerName}
                value={currentValue}
                options={data}
                onChange={(val) => handleDropdownChange(file, val)}
              />
            </CollapsibleSection>
          );
        })}

        {editableLayers.length === 0 && (
          <p css={{ fontSize: 14, color: '#8a8a98', textAlign: 'center', marginTop: 20 }}>
            No editable elements found in this template.
          </p>
        )}
      </div>
    </div>
  );
};

export default ElementsContent;

