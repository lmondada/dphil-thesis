function getRemInPixels() {
  // Get the computed style of the root element (html) to determine the root font size
  const rootFontSize = getComputedStyle(document.documentElement).fontSize;
  return parseFloat(rootFontSize); // Convert '16px' to 16 (number)
}

function toggleFloatingFootnotes() {
  const footnotes = document.querySelectorAll("div.footnotes");
  const remInPixels = getRemInPixels();
  const screenWidth = window.innerWidth;

  footnotes.forEach((footnote) => {
    if (screenWidth > 56 * remInPixels) {
      // 56rem: width set by hugo-book
      footnote.classList.add("floating-footnotes");
    } else {
      footnote.classList.remove("floating-footnotes");
    }
  });
}

///////// Footnote placement ////////////

// Computes an offset such that setting `top` on `footnote` will put it
// in vertical alignment with targetAlignment.
function computeOffsetForAlignment(
  footnote,
  targetAlignment,
  alignToBottom = false,
) {
  const offsetParentTop = footnote.offsetParent.getBoundingClientRect().top;
  if (alignToBottom) {
    // Distance that puts the bottom of the footnote aligned with the bottom of the target
    return (
      targetAlignment.getBoundingClientRect().bottom -
      offsetParentTop -
      footnote.offsetHeight
    );
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
    bottom:
      offset +
      footnote.offsetParent.getBoundingClientRect().top +
      footnoteRect.height,
    left: footnoteRect.left,
    right: footnoteRect.right,
  };

  const footnoteAboveElements = container.querySelectorAll(
    ".footnote-above, .pagedjs_margin-bottom-right, .pagedjs_margin-bottom-left",
  );
  for (const element of footnoteAboveElements) {
    const elementRect = element.getBoundingClientRect();
    // Check if there's overlap
    if (
      !(
        potentialPosition.right < elementRect.left ||
        potentialPosition.left > elementRect.right ||
        potentialPosition.bottom < elementRect.top ||
        potentialPosition.top > elementRect.bottom
      )
    ) {
      return true;
    }
  }
  return false;
}
