import { css, Global } from '@emotion/react';
import React, { FC, useMemo } from 'react';
import { FontData } from '../../types';
import { handleFontStyle, getFontFormat } from 'canva-editor/utils/fontHelper';

export interface FontStyleProps {
    font: FontData;
}

const FontStyle: FC<FontStyleProps> = ({ font }) => {
    const fontFaceString = useMemo(() => {
        const fontFaceCss: string[] = [];
        // Some fonts have oversized winAscent/winDescent or large lineGap in their
        // OS/2 table, causing extra whitespace above/below glyphs. Override metrics
        // for known problematic fonts so text sits correctly in its layer box.
        const metricOverrides: Record<string, string> = {
            'ARDELA EDGE': 'ascent-override: 99%; descent-override: 1%; line-gap-override: 0%;',
        };
        const overrideEntry = Object.entries(metricOverrides).find(([key]) =>
            font.name.toUpperCase().includes(key.toUpperCase())
        );
        const extraMetrics = overrideEntry ? overrideEntry[1] : '';
        fontFaceCss.push(`
            @font-face {
                font-family: '${font.name}';
                ${handleFontStyle(font.style)}
                src: url('${font.url}') ${getFontFormat(font.url)};
                font-display: block;
                ${extraMetrics}
            }
        `);
        return fontFaceCss.join('\n');
    }, [font]);

    return (
        <Global
            styles={css`
                ${fontFaceString}
            `}
        />
    );
};

export default React.memo(FontStyle);
