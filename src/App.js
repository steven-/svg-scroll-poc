import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import React, { createRef, useEffect, useMemo, useState } from 'react';
import './App.css';
import SVGShape from './components/svg-shape';
import { sections } from './config';

function App() {
  const refs= useMemo(() => sections.map(() => createRef()), []);
  const [scrollY, setScrollY] = useState(0);
  const [sectionHeights, setSectionHeights] = useState([]);

  useScrollPosition(({ currPos }) => setScrollY(- currPos.y), []);
  useEffect(() => setSectionHeights(refs.map(ref => ref.current.offsetHeight)), [refs]);

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


// TODO -> detect window resize -> recompute sectionHeights

// TODO -> detect change of any section height -> recompute sectionHeights
