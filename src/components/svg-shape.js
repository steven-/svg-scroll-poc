import React, { useEffect, useState } from 'react';
import { shapes } from '../config';


const pathConfigs = shapes.map(({ path }) => {
  return path.split(/M|C|L|Z/)
                      .map(s => s.trim())
                      .filter(Boolean)
                      .map(r => {
                        return r.split(/\s/g)
                                .map(coords => coords.split(',').map(Number))
                      });
});


const computePathString = (pathFrom, pathTo, progress) => {
  const p = (i, j, k) => {
    const [a, b] = [pathFrom[i][j][k], pathTo[i][j][k]];
    return a - (a - b) * progress;
  };

  return `
    M${p(0, 0, 0)},${p(0, 0, 1)}
    C${p(1, 0, 0)},${p(1, 0, 1)} ${p(1, 1, 0)},${p(1, 1, 1)} ${p(1, 2, 0)},${p(1, 2, 1)}
    C${p(2, 0, 0)},${p(2, 0, 1)} ${p(2, 1, 0)},${p(2, 1, 1)} ${p(2, 2, 0)},${p(2, 2, 1)}
    C${p(3, 0, 0)},${p(3, 0, 1)} ${p(3, 1, 0)},${p(3, 1, 1)} ${p(3, 2, 0)},${p(3, 2, 1)}
    C${p(4, 0, 0)},${p(4, 0, 1)} ${p(4, 1, 0)},${p(4, 1, 1)} ${p(4, 2, 0)},${p(4, 2, 1)}
    L${p(5, 0, 0)},${p(5, 0, 1)}
    L${p(6, 0, 0)},${p(6, 0, 1)}
    L${p(7, 0, 0)},${p(7, 0, 1)} Z
  `.split(/\n/).filter(Boolean).join(' ');
};

const computeColor = (colorFrom, colorTo, progress) => {
  // https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
  const ah = +colorFrom.replace('#', '0x'),
  ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
  bh = +colorTo.replace('#', '0x'),
  br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
  rr = ar + progress * (br - ar),
  rg = ag + progress * (bg - ag),
  rb = ab + progress * (bb - ab);

  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};


const SVGShape = ({ scrollY, sectionHeights }) => {
  const [anchors, setAnchors] = useState([]);
  const [path, setPath] = useState(shapes[0].path);
  const [gradient, setGradient] = useState([shapes[0].startColor, shapes[0].stopColor]);

  /*
    Each times the sections height change, prepare an array with anchors :
    [
      0,     // <- top of first section
      0.50, // <- bottom of first section / top of second section
      0.7, // ...
      1    // <- end of last section
    ]
    All values are in percentage of the whole body height
  */
  useEffect(() => {
    if (!sectionHeights.length) {
      return;
    }

    setAnchors(
      sectionHeights.reduce((arr, height) => [
        ...arr,
        arr[arr.length -1] + (height / document.body.offsetHeight)
      ], [0])
    );
  }, [sectionHeights]);


  /*
    For the time being, we have n+1 shapes than we have sections, which means each section is "between" two shapes, and thus, the interpolation between these shapes must be spread proportionnaly to each section height.

    On scroll, we detect the percentage of the whole page body the user has scrolled so far.
    With this value, we can detect which shapes we have to interpolate between, by using the previouly computed "anchors".
    Let's say we did compute those anchors: [0, 0.5, 0.7, 1], and the current page scroll is 0.6, we know we are currently scrolling between the second and the third section.

    To reflect the interpolation "duration" according to the currently scrolled section height,
    we also compute the "scroll progress" from the current to the next section.

    We apply the same exact logic for the colors transitions.
  */
  useEffect(() => {
    console.group('scroll-logs');

    const globalScroll = scrollY / (document.body.offsetHeight - window.innerHeight);
    console.log('Percentage scrolled in whole page is', globalScroll);

    for (let i = 1; i < anchors.length; i++) {
      if (globalScroll <= anchors[i]) {
        console.log('Current section =>', i);
        const sectionProgress = (globalScroll - anchors[i - 1]) / (anchors[i] - anchors[i - 1]);
        setPath(computePathString(pathConfigs[i - 1], pathConfigs[i], sectionProgress));
        setGradient([
          computeColor(shapes[i - 1].startColor, shapes[i].startColor, sectionProgress),
          computeColor(shapes[i - 1].stopColor, shapes[i].stopColor, sectionProgress),
        ]);
        break;
      }
    }

    console.groupEnd('scroll-logs');
  }, [scrollY, anchors]);


  if (!path) {
    return null;
  }

  return (
    <div id="svg-shape">
      <svg viewBox="0 0 842 400" version="1.1" preserveAspectRatio="none">
        <defs>
            <linearGradient x1="50%" y1="100%" x2="50%" y2="-2.48949813e-15%" id="linearGradient-1">
                <stop stopColor={gradient[0]} offset="0%"></stop>
                <stop stopColor={gradient[1]} offset="100%"></stop>
            </linearGradient>
        </defs>
        <path d={path} fill="url(#linearGradient-1)"></path>
      </svg>
    </div>
  );
};

export default SVGShape;
