import { Fragment, PropsWithChildren } from 'react';
import { useEditor, useLayer } from '../hooks';
import { LayerComponent } from 'canva-editor/types';
import { RootContentProps, RootContent, ImageContentProps } from '.';

export interface RootLayerProps extends Omit<RootContentProps, 'image'> {
    image?: ImageContentProps['image']|null;
}
const RootLayer: LayerComponent<PropsWithChildren<RootLayerProps>> = ({
    boxSize,
    children,
    color,
    gradientBackground,
    image,
    position,
    rotate,
    scale,
}) => {
    const { actions } = useLayer();
    const { isPageLocked } = useEditor((state) => ({
        isPageLocked: state.pages.length > 0 ? state.pages[state.activePage]?.layers.ROOT.data.locked : false,
    }));
    return (
        <Fragment>
            <RootContent
                boxSize={boxSize}
                position={position}
                rotate={rotate}
                gradientBackground={gradientBackground}
                color={color}
                image={image}
                scale={scale}
                onDoubleClick={() => {
                    if (isPageLocked) return;
                    (image) && actions.openImageEditor({ boxSize, position, rotate, image })
                }}
            />
            {children}
        </Fragment>
    );
};

RootLayer.info = {
    name: 'Main',
    type: 'Root',
};
export default RootLayer;
