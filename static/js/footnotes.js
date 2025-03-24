function getRemInPixels() {
    // Get the computed style of the root element (html) to determine the root font size
    const rootFontSize = getComputedStyle(document.documentElement).fontSize;
    return parseFloat(rootFontSize); // Convert '16px' to 16 (number)
}

function toggleFloatingFootnotes() {
    const footnotes = document.querySelectorAll('div.footnotes');
    const remInPixels = getRemInPixels();
    const screenWidth = window.innerWidth;

    footnotes.forEach(footnote => {
        if (screenWidth > 56 * remInPixels) { // 56rem: width set by hugo-book
            footnote.classList.add('floating-footnotes');
        } else {
            footnote.classList.remove('floating-footnotes');
        }
    });
}

// Run the function on page load and on window resize
toggleFloatingFootnotes();
window.addEventListener('resize', toggleFloatingFootnotes);


///////// Footnote placement ////////////

// Computes an offset such that setting `top` on `footnote` will put it
// in vertical alignment with targetAlignment.
function computeOffsetForAlignment(footnote, targetAlignment, alignToBottom = false) {
    const offsetParentTop = footnote.offsetParent.getBoundingClientRect().top;
    if (alignToBottom) {
        // Distance that puts the bottom of the footnote aligned with the bottom of the target
        return targetAlignment.getBoundingClientRect().bottom - offsetParentTop - footnote.offsetHeight;
    } else {
        // Distance between the top of the offset parent and the top of the
        // target alignment
        return targetAlignment.getBoundingClientRect().top - offsetParentTop;
    }
}

// Function to check if a footnote would overlap with a .footnote-above element
function overlapsWithFootnoteAbove(footnote, offset, container) {
    const footnoteRect = footnote.getBoundingClientRect();
    const potentialPosition = {
        top: offset + footnote.offsetParent.getBoundingClientRect().top,
        bottom: offset + footnote.offsetParent.getBoundingClientRect().top + footnoteRect.height,
        left: footnoteRect.left,
        right: footnoteRect.right
    };
    
    const footnoteAboveElements = container.querySelectorAll('.footnote-above');
    for (const element of footnoteAboveElements) {
        const elementRect = element.getBoundingClientRect();
        // Check if there's overlap
        if (!(potentialPosition.right < elementRect.left || 
              potentialPosition.left > elementRect.right || 
              potentialPosition.bottom < elementRect.top || 
              potentialPosition.top > elementRect.bottom)) {
            return true;
        }
    }
    return false;
}

// Register ResizeObserver on page load
document.addEventListener('DOMContentLoaded', () => {
    let containers = document.querySelectorAll('pagedjs_pagebox');
    if (containers.length === 0) {
        containers = document.querySelectorAll('article');
    }
    containers.forEach(container => {
        const resizeObserver = new ResizeObserver(() => {
            const footnotes = container.querySelectorAll('div.footnotes');

            // Collect all footnote items and references
            const allFootnotes = Array.from(footnotes).reduce((acc, footnote) => {
                const listItems = footnote.querySelectorAll('ol > li');
                return acc.concat(Array.from(listItems));
            }, []);
            const allReferences = container.querySelectorAll('.footnote-ref');
            // Create a map from footnote IDs to their references
            const footnoteToRef = new Map(
                allFootnotes.map((footnote, index) => {
                    const id = footnote.id;
                    // Use index to find corresponding reference
                    const ref = allReferences[index];
                    return [id, ref];
                })
            );

            let lastOffset = null;
            footnotes.forEach(footnote => {
                const listItems = footnote.querySelectorAll('ol > li');
                if (!footnote.classList.contains('floating-footnotes') && !footnote.classList.contains('paged-footnotes')) {
                    // Clear top property
                    listItems.forEach(li => {
                        li.style.removeProperty('top');
                    });
                } else {
                    listItems.forEach(li => {
                        const ref = footnoteToRef.get(li.id);
                        if (ref) {
                            // Find the first <p> ancestor of the footnote reference
                            let refParagraph = ref.closest('p') || ref;
                            
                            // First try with top alignment (default behavior)
                            let offset = computeOffsetForAlignment(li, refParagraph, false);
                            if (lastOffset !== null) {
                                offset = Math.max(offset, lastOffset);
                            }
                            
                            // Check if this would cause overlap with .footnote-above
                            if (overlapsWithFootnoteAbove(li, offset, container)) {
                                // If overlap detected, align to bottom instead
                                offset = computeOffsetForAlignment(li, refParagraph, true);
                                if (lastOffset !== null) {
                                    offset = Math.max(offset, lastOffset);
                                }
                            }
                            
                            li.style.top = `${offset}px`;
                            lastOffset = offset + li.offsetHeight;
                        }
                    });
                }
            });

        });
        if (container !== null) {
            resizeObserver.observe(container);
        }
    });
});