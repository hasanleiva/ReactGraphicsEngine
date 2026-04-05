import { FC, useEffect } from 'react';
import { EffectSettings, FontData, LayerComponentProps } from '../../types';
import { getTextEffectStyle } from '../text/textEffect';
import { fitParagraphsToWidth } from '../text/fitText';

export interface TextContentProps extends LayerComponentProps {
  id: string;
  text: string;
  scale: number;
  fonts: FontData[];
  colors: string[];
  fontSizes: number[];
  effect: {
    name: string;
    settings: EffectSettings;
  } | null;
}

export const TextContent: FC<TextContentProps> = ({
  id,
  text,
  colors,
  fontSizes,
  effect,
}) => {
  const styles = getTextEffectStyle(
    effect?.name || 'none',
    effect?.settings as EffectSettings,
    colors[0],
    fontSizes[0]
  );
  const textId = `text-${id}`;
  useEffect(() => {
    const el = document.getElementById(textId);
    if (!el) return;

    // Reset any whole-element shrink applied in a previous render
    el.style.transform = '';
    el.style.transformOrigin = '';
    el.innerHTML = text;

    // Step 1: Fit each paragraph horizontally (no wrapping within a line;
    // only Enter creates a new line).
    fitParagraphsToWidth(el);

    // Step 2: If all paragraphs together still overflow the container height,
    // scale the whole element down to fit vertically.
    const container = el.parentElement;
    if (container) {
      const totalH = el.offsetHeight;
      const containerH = container.clientHeight;
      if (totalH > containerH && containerH > 0) {
        const scale = containerH / totalH;
        el.style.transform = `scale(${scale})`;
        el.style.transformOrigin = 'top left';
      }
    }
  }, [text]);
  return (
    <div
      id={textId}
      className={`canva-editor-text`}
      css={{
        p: {
          '&:before': {
            ...styles,
          },
        },
        ...styles,
      }}
    />
  );
};
