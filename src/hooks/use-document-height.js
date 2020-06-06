import { ResizeObserver } from '@juggle/resize-observer';
import { useLayoutEffect, useState } from 'react';

export function useDocumentHeight() {
  const [docHeight, setDocHeight] = useState(document.body.innerHeight);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([bodyEntry, ...unused]) => {
      setDocHeight(bodyEntry.contentRect.height);
    })
    observer.observe(document.body);

    return () => observer.unobserve(document.body);
  }, []);

  return docHeight;
}
