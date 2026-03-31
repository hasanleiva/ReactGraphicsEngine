import { useMemo } from 'react';
import { isFrameLayer, isGroupLayer, isShapeLayer, isTextLayer } from 'canva-editor/utils/layer/layers';
import { useSelectedLayers } from '.';
import { useAuth } from '../contexts/AuthContext';

export const useDisabledFeatures = () => {
    const { selectedLayers } = useSelectedLayers();
    const { user } = useAuth();
    const scalable = useMemo(
        () => !!selectedLayers.find((layer) => isTextLayer(layer) || isGroupLayer(layer) || isShapeLayer(layer)),
        [JSON.stringify(selectedLayers.map((l) => l.id))],
    );
    return useMemo(() => {
        const disable = {
            vertical: selectedLayers.length > 1,
            horizontal: selectedLayers.length > 1,
            corners: false,
            locked: false,
            rotate: false,
            scalable: !scalable,
        };

        // Page locking logic for 'user' role
        const isUserRole = user?.role === 'user';

        selectedLayers.forEach((layer) => {
            const isRoot = layer.id === 'ROOT';
            
            // If user role is 'user', lock everything except ROOT.
            // Also, per request, background image (ROOT) should be unlocked for every kind of user roles.
            if ((layer.data.locked && !isRoot) || (isUserRole && !isRoot)) {
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
    }, [selectedLayers, user]);
};
