import { useMemo } from 'react';
import { isFrameLayer, isGroupLayer, isShapeLayer, isTextLayer } from 'canva-editor/utils/layer/layers';
import { useSelectedLayers, useEditor } from '.';

export const useDisabledFeatures = () => {
    const { selectedLayers } = useSelectedLayers();
    const { userRole, isTemplate } = useEditor((state) => ({
        userRole: state.userRole,
        isTemplate: state.isTemplate,
    }));
    const scalable = useMemo(
        () => !!selectedLayers.find((layer) => isTextLayer(layer) || isGroupLayer(layer) || isShapeLayer(layer)),
        [JSON.stringify(selectedLayers.map((l) => l.id))],
    );
    return useMemo(() => {
        const isUserRestricted = userRole === 'user' && isTemplate;
        const disable = {
            vertical: selectedLayers.length > 1 || isUserRestricted,
            horizontal: selectedLayers.length > 1 || isUserRestricted,
            corners: isUserRestricted,
            locked: isUserRestricted,
            rotate: isUserRestricted,
            scalable: !scalable || isUserRestricted,
        };
        selectedLayers.forEach((layer) => {
            if (layer.data.locked) {
                disable.locked = true;
                disable.vertical = true;
                disable.horizontal = true;
                disable.corners = true;
                disable.rotate = true;
            }
            if (isTextLayer(layer)) {
                disable.vertical = true;
            }

            const isFrame = isFrameLayer(layer);
            if (isGroupLayer(layer) || isFrame) {
                disable.horizontal = true;
                disable.vertical = true;
                if (isFrame) disable.scalable = false;
            }
        });
        return disable;
    }, [selectedLayers]);
};
