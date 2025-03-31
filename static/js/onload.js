// Only load this file in browser version (not paged)

// for footnotes
document.addEventListener("DOMContentLoaded", () => {
  let containers = document.querySelectorAll("pagedjs_pagebox");
  if (containers.length === 0) {
    containers = document.querySelectorAll("article");
  }
  containers.forEach((container) => {
    const resizeObserver = new ResizeObserver(() => {
      const footnotes = container.querySelectorAll("div.footnotes");

      // Collect all footnote items and references
      const allFootnotes = Array.from(footnotes).reduce((acc, footnote) => {
        const listItems = footnote.querySelectorAll("ol > li");
        return acc.concat(Array.from(listItems));
      }, []);
      const allReferences = container.querySelectorAll(".footnote-ref");
      // Create a map from footnote IDs to their references
      const footnoteToRef = new Map(
        allFootnotes.map((footnote, index) => {
          const id = footnote.id;
          // Use index to find corresponding reference
          const ref = allReferences[index];
          return [id, ref];
        }),
      );

      let lastOffset = null;
      footnotes.forEach((footnote) => {
        const listItems = footnote.querySelectorAll("ol > li");
        if (
          !footnote.classList.contains("floating-footnotes") &&
          !footnote.classList.contains("paged-footnotes")
        ) {
          // Clear top property
          listItems.forEach((li) => {
            li.style.removeProperty("top");
          });
        } else {
          listItems.forEach((li) => {
            const ref = footnoteToRef.get(li.id);
            if (ref) {
              // Find the first <p> ancestor of the footnote reference
              let refParagraph = ref.closest("p") || ref;

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

document.addEventListener("DOMContentLoaded", toggleFloatingFootnotes);
window.addEventListener("resize", toggleFloatingFootnotes);

// For citations
document.addEventListener("DOMContentLoaded", function () {
  // Get all citation elements
  const citations = document.querySelectorAll(".citation");

  const sortedCitations = formatCitationsKeys(citations);

  if (sortedCitations.length > 0) {
    // Create and append the references section
    const referencesSection = document.createElement("details");
    referencesSection.id = "references";

    const referencesTitle = document.createElement("summary");
    referencesTitle.textContent = "References";
    referencesSection.appendChild(referencesTitle);

    const referencesList = formatCitationsList(sortedCitations);

    referencesSection.appendChild(referencesList);

    const mainArticle = document.querySelector("main article");
    if (mainArticle) {
      mainArticle.appendChild(referencesSection);
    } else {
      console.error("Main article element not found");
    }
  }

  // Shorten the inline citation-full elements
  shortenInlineCitations();
});
