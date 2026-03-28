import React, { FC, useEffect, useState } from 'react';
import { useEditor } from 'canva-editor/hooks';
import axios from 'axios';
import { Layer, LayerComponentProps } from 'canva-editor/types';
import { isTextLayer } from 'canva-editor/utils/layer/layers';
import CloseIcon from 'canva-editor/icons/CloseIcon';

interface ElementsContentProps {
  onClose: () => void;
}

const ElementsContent: FC<ElementsContentProps> = ({ onClose }) => {
  const { layers, actions, activePage, rootLayer } = useEditor((state) => ({
    layers: state.pages[state.activePage]?.layers || {},
    activePage: state.activePage,
    rootLayer: state.pages[state.activePage]?.layers.ROOT,
  }));

  const getOrderedLayers = (layerId: string): Layer<LayerComponentProps>[] => {
    const layer = layers[layerId];
    if (!layer) return [];
    
    let result: Layer<LayerComponentProps>[] = [];
    if (layer.id !== 'ROOT') {
      result.push(layer as Layer<LayerComponentProps>);
    }
    
    if (layer.data.child) {
      layer.data.child.forEach((childId) => {
        result = result.concat(getOrderedLayers(childId));
      });
    }
    
    return result;
  };

  const orderedLayers = rootLayer ? getOrderedLayers('ROOT') : [];

  const editableLayers = orderedLayers.filter(
    (layer) => layer.data.props.elementType && layer.data.props.elementType !== 'none'
  );

  return (
    <div css={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div css={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
        <h2 css={{ flexGrow: 1, fontSize: 16, fontWeight: 600, margin: 0 }}>Elements</h2>
        <button onClick={onClose} css={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <CloseIcon />
        </button>
      </div>
      <div css={{ flexGrow: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {editableLayers.map((layer) => (
          <ElementEditor key={layer.id} layer={layer} activePage={activePage} actions={actions} />
        ))}
        {editableLayers.length === 0 && (
          <div css={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
            No editable elements found in this template.
          </div>
        )}
      </div>
    </div>
  );
};

const ElementEditor: FC<{ layer: Layer<LayerComponentProps>; activePage: number; actions: any }> = ({ layer, activePage, actions }) => {
  const { elementType, customName, dropdownJson } = layer.data.props;
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);

  useEffect(() => {
    if (elementType === 'dropdown' && dropdownJson) {
      axios.get(`/api/r2/get/${dropdownJson}`).then((res) => {
        setDropdownOptions(res.data);
      }).catch((err) => {
        console.error('Failed to load dropdown data', err);
      });
    }
  }, [elementType, dropdownJson]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    actions.setProp(activePage, layer.id, { text: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const layerBoxSize = layer.data.props.boxSize;
          const imgRatio = img.width / img.height;
          const layerRatio = layerBoxSize.width / layerBoxSize.height;
          
          let newWidth, newHeight, newX, newY;
          if (imgRatio > layerRatio) {
            newHeight = layerBoxSize.height;
            newWidth = newHeight * imgRatio;
            newX = (layerBoxSize.width - newWidth) / 2;
            newY = 0;
          } else {
            newWidth = layerBoxSize.width;
            newHeight = newWidth / imgRatio;
            newX = 0;
            newY = (layerBoxSize.height - newHeight) / 2;
          }

          actions.setProp(activePage, layer.id, {
            image: {
              url,
              thumb: url,
              boxSize: { width: newWidth, height: newHeight },
              position: { x: newX, y: newY },
              rotate: 0,
            },
          });
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (isTextLayer(layer)) {
      actions.setProp(activePage, layer.id, { text: selectedValue });
    } else {
      const img = new Image();
      img.onload = () => {
        const layerBoxSize = layer.data.props.boxSize;
        const imgRatio = img.width / img.height;
        const layerRatio = layerBoxSize.width / layerBoxSize.height;
        
        let newWidth, newHeight, newX, newY;
        if (imgRatio > layerRatio) {
          newHeight = layerBoxSize.height;
          newWidth = newHeight * imgRatio;
          newX = (layerBoxSize.width - newWidth) / 2;
          newY = 0;
        } else {
          newWidth = layerBoxSize.width;
          newHeight = newWidth / imgRatio;
          newX = 0;
          newY = (layerBoxSize.height - newHeight) / 2;
        }

        actions.setProp(activePage, layer.id, {
          image: {
            url: selectedValue,
            thumb: selectedValue,
            boxSize: { width: newWidth, height: newHeight },
            position: { x: newX, y: newY },
            rotate: 0,
          },
        });
      };
      img.src = selectedValue;
    }
  };

  return (
    <div css={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label css={{ fontWeight: 500, fontSize: 14 }}>{customName || 'Unnamed Element'}</label>
      {elementType === 'input text' && (
        <input
          type="text"
          value={layer.data.props.text || ''}
          onChange={handleTextChange}
          css={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
        />
      )}
      {elementType === 'image' && (
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          css={{ fontSize: 14 }}
        />
      )}
      {elementType === 'dropdown' && (
        <select
          onChange={handleDropdownChange}
          css={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #ccc', fontSize: 14 }}
          value={isTextLayer(layer) ? layer.data.props.text : layer.data.props.image?.url || ''}
        >
          <option value="" disabled>Select an option</option>
          {dropdownOptions.map((opt, idx) => {
            const val = opt.value || opt.url || opt.text || opt;
            const label = opt.label || opt.name || opt.text || opt.value || opt;
            return (
              <option key={idx} value={val}>
                {label}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
};

export default ElementsContent;
