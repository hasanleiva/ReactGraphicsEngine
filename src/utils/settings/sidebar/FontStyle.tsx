import React, { useMemo } from 'react';
import { css, Global } from '@emotion/react';
import { useEditor } from 'canva-editor/hooks';
import { getFontFormat } from 'canva-editor/utils/fontHelper';

const FontStyle = () => {
  const { fontList } = useEditor((state) => ({ fontList: state.fontList }));
  const fontFaceString = useMemo(() => {
    const fontFaceCss: string[] = [];
    const metricOverrides: Record<string, string> = {
      'ARDELA EDGE': 'ascent-override: 99%; descent-override: 1%; line-gap-override: 0%;',
    };
    fontList.forEach((font) => {
      const overrideEntry = Object.entries(metricOverrides).find(([key]) =>
        font.name.toUpperCase().includes(key.toUpperCase())
      );
      const extraMetrics = overrideEntry ? overrideEntry[1] : '';
      fontFaceCss.push(`
                    @font-face {
                      font-family: '${font.name}';
                      src: url('${font.url}') ${getFontFormat(font.url)};
                      font-display: block;
                      ${extraMetrics}
                    }
                `);
    });
    return fontFaceCss.join('\n');
  }, [fontList]);
  return (
    <Global
      styles={css`
        ${fontFaceString}
      `}
    />
  );
};

export default React.memo(FontStyle);
