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