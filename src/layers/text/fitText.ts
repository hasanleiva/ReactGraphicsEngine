/**
 * fitParagraphsToWidth
 *
 * Prevents text from wrapping within each <p> (one visual line per paragraph)
 * by setting `white-space: nowrap` and applying CSS `zoom` to shrink paragraphs
 * that overflow the container width.
 *
 * Unlike `transform: scale()`, the `zoom` property affects layout flow, so:
 *  - Each paragraph occupies exactly its zoomed height in the document.
 *  - Subsequent paragraphs (created by pressing Enter) stack below correctly.
 *  - ProseMirror cursor positions remain accurate during live editing.
 */
export function fitParagraphsToWidth(container: HTMLElement): void {
  const containerW = container.clientWidth;
  if (!containerW) return;

  container.querySelectorAll<HTMLElement>('p').forEach((p) => {
    // Reset previous adjustments so we measure the true natural width.
    (p.style as any).zoom = '';
    p.style.whiteSpace = 'nowrap';

    const naturalW = p.scrollWidth;
    if (naturalW > containerW) {
      const scale = containerW / naturalW;
      (p.style as any).zoom = String(scale);
    }
  });
}
