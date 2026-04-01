import React, { FC, useMemo } from 'react';
import ColorSettings from './ColorSettings';
import SettingButton from './SettingButton';
import ResizeIcon from 'canva-editor/icons/ResizeIcon';
import { useEditor } from 'canva-editor/hooks';
import { RootLayerProps } from 'canva-editor/layers/RootLayer';
import { Layer, GradientStyle } from 'canva-editor/types';

interface RootSettingsProps {
    layer: Layer<RootLayerProps>;
}
const RootSettings: FC<RootSettingsProps> = ({ layer }) => {
    const { actions, activePage, userRole } = useEditor((state) => ({
        activePage: state.activePage,
        sidebar: state.sidebar,
        userRole: state.userRole,
    }));
    const color = useMemo(() => {
        return layer.data.props.color;
    }, [layer]);
    const gradient = useMemo(() => {
        return layer.data.props.gradientBackground;
    }, [layer]);
    const updateColor = (color: string) => {
        actions.history.throttle(2000).setProp<RootLayerProps>(activePage, layer.id, {
            color,
            gradientBackground: null,
        });
    };

    const handleChangeGradient = (data: { colors: string[]; style: GradientStyle }) => {
        actions.history.throttle(2000).setProp<RootLayerProps>(activePage, layer.id, {
            gradientBackground: data,
            color: null,
        });
    };

    const handleEditBackgroundSize = () => {
        const { boxSize, position, rotate, image } = layer.data.props;
        if (image) {
            actions.openImageEditor(activePage, layer.id, { boxSize, position, rotate, image });
        }
    };

    return (
        <div css={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ColorSettings
                colors={color ? [color] : []}
                gradient={gradient}
                useGradient={true}
                onChange={updateColor}
                onChangeGradient={handleChangeGradient}
                disabled={userRole === 'user'}
            />
            {layer.data.props.image && (
                <SettingButton onClick={handleEditBackgroundSize} tooltip="Edit Background Size">
                    <ResizeIcon />
                </SettingButton>
            )}
        </div>
    );
};

export default RootSettings;
