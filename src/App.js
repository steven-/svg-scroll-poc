import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import React, { createRef, useEffect, useMemo, useState } from 'react';
import './App.css';
import SVGShape from './components/svg-shape';
import { sections } from './config';
import { useDocumentHeight } from './hooks/use-document-height';
import { useWindowSize } from './hooks/use-window-size';

function App() {
  const refs= useMemo(() => sections.map(() => createRef()), []);
  const [scrollY, setScrollY] = useState(0);
  const [sectionHeights, setSectionHeights] = useState([]);
  const [windowWidth, windowHeight] = useWindowSize();
  const docHeight = useDocumentHeight();

  useScrollPosition(({ currPos }) => setScrollY(- currPos.y), []);
  useEffect(() => {
    const sectionHeights = refs.map(ref => ref.current.offsetHeight);
    setSectionHeights(sectionHeights);
  }, [refs, windowWidth, windowHeight, docHeight]);

  return (
    <div>
      <SVGShape scrollY={scrollY} sectionHeights={sectionHeights} />
      <main>
        {
          sections.map(({ component }, i) => (
            <div key={i} ref={refs[i]}>
              { React.createElement(component) }
            </div>
          ))
        }
      </main>
    </div>
  );
}

export default App;

// TODO -> detect change of any section height -> recompute sectionHeights
