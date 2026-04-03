import React, { useCallback, useEffect, useMemo } from 'react';
import { useEditor, useLayer, useSelectedLayers } from '../hooks';
import { createEditor } from 'canva-editor/components/text-editor/core/helper/createEditor';
import { LayerComponent } from 'canva-editor/types';
import { TextContentProps, TextContent } from '.';
import { useAuth } from 'canva-editor/contexts/AuthContext';

export type TextLayerProps = TextContentProps;

const TextLayer: LayerComponent<TextLayerProps> = ({
    text,
    boxSize,
    scale,
    fonts,
    colors,
    fontSizes,
    effect,
    rotate,
    position,
}) => {
    const { actions, id, pageIndex } = useLayer();
    const { selectedLayerIds } = useSelectedLayers();
    const { actions: editorActions, textEditor } = useEditor((state) => ({
        textEditor: state.textEditor,
    }));
    const { user } = useAuth();
    useEffect(() => {
        const editor = createEditor({ content: text });
        editor && actions.setTextEditor(editor);
    }, []);
    const handleStartUpdate = useCallback(() => {
        if (user?.role === 'user') return;
        if (selectedLayerIds.includes(id)) {
            actions.openTextEditor();
        }
    }, [editorActions, selectedLayerIds, user?.role]);

    const isEditing = useMemo(() => {
        if (!textEditor) return false;
        return textEditor.pageIndex === pageIndex && textEditor.layerId === id;
    }, [textEditor]);

    return (
        <div
            css={{
                transformOrigin: '0 0',
            }}
            style={{
                width: boxSize.width / scale,
                height: boxSize.height / scale,
                transform: `scale(${scale})`,
                opacity: isEditing ? 0 : 1,
            }}
            onDoubleClick={handleStartUpdate}
        >
            <TextContent
                id={id}
                text={text}
                scale={scale}
                fonts={fonts}
                colors={colors}
                fontSizes={fontSizes}
                effect={effect}
                boxSize={boxSize}
                rotate={rotate}
                position={position}
            />
        </div>
    );
};

TextLayer.info = {
    name: 'Text',
    type: 'Text',
};

export default TextLayer;
