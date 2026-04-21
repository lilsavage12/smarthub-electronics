"use client"

import { useEffect, useRef } from 'react'

export function AutoScroller({ trigger }: { trigger?: any }) {
    const elRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Find the nearest parent that scrolls
        let parent = elRef.current?.parentElement;
        while (parent) {
            const style = window.getComputedStyle(parent);
            if (
                style.overflowY === 'auto' || 
                style.overflowY === 'scroll' || 
                parent.classList.contains('overflow-y-auto') ||
                parent.classList.contains('custom-scrollbar') ||
                parent.classList.contains('no-scrollbar')
            ) {
                parent.scrollTo({ top: 0, behavior: 'instant' });
                // Also setting it directly just to be sure
                parent.scrollTop = 0;
                break;
            }
            parent = parent.parentElement;
        }
    }, [trigger])

    return <div ref={elRef} aria-hidden="true" style={{ display: 'none' }} />
}
