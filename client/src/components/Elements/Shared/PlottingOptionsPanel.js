import { Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

const OPEN_MS  = 320;
const CLOSE_MS = 240;

/**
 * anchorRef — ref to the Edit button. Used to compute transform-origin so the
 * panel appears to grow out of / collapse back into the button.
 */
export const PlottingOptionsPanel = ({ show, className, children, anchorRef }) => {
  const [mounted, setMounted]           = useState(show);
  const [active, setActive]             = useState(show);
  const [transformOrigin, setOrigin]    = useState('top center');

  const panelRef = useRef(null);
  const raf1     = useRef(null);
  const raf2     = useRef(null);
  const timer    = useRef(null);

  const computeOrigin = useCallback(() => {
    if (!anchorRef?.current || !panelRef.current) return;
    const btn = anchorRef.current.getBoundingClientRect();
    const el  = panelRef.current;
    // Temporarily suppress the scale transform so getBoundingClientRect returns
    // the natural layout position rather than the collapsed (scale-0) point.
    const saved = el.style.transform;
    el.style.transform = 'none';
    const panel = el.getBoundingClientRect();
    el.style.transform = saved;
    // Button centre relative to the panel's top-left corner
    const x = btn.left + btn.width  / 2 - panel.left;
    const y = btn.top  + btn.height / 2 - panel.top;
    setOrigin(`${x}px ${y}px`);
  }, [anchorRef]);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // First rAF: panel is in the DOM (scale(0)), measure button position.
      // Second rAF: browser has painted; start the enter transition.
      raf1.current = requestAnimationFrame(() => {
        computeOrigin();
        raf2.current = requestAnimationFrame(() => setActive(true));
      });
    } else {
      // Recompute origin just before closing so the panel collapses back toward
      // the current button position. This is critical when the button was null
      // during the initial open (e.g. AMRInsights expanded on a non-filter tab)
      // and the stored origin is still the default 'top center'.
      computeOrigin();
      setActive(false);
      timer.current = setTimeout(() => setMounted(false), CLOSE_MS + 30);
    }
    return () => {
      cancelAnimationFrame(raf1.current);
      cancelAnimationFrame(raf2.current);
      clearTimeout(timer.current);
    };
  }, [show, computeOrigin]);

  if (!mounted) return null;

  return (
    <Box
      ref={panelRef}
      className={className}
      sx={{
        transformOrigin,
        transform    : active ? 'scale(1)'   : 'scale(0)',
        opacity      : active ? 1            : 0,
        pointerEvents: active ? 'auto'       : 'none',
        transition: active
          ? `transform ${OPEN_MS}ms cubic-bezier(0.34, 1.15, 0.64, 1), opacity ${OPEN_MS - 60}ms ease-out`
          : `transform ${CLOSE_MS}ms cubic-bezier(0.4, 0, 0.6, 1), opacity ${CLOSE_MS - 30}ms ease-in`,
      }}
    >
      {children}
    </Box>
  );
};
