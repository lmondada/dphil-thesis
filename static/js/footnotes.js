function toggleFloatingFootnotes() {
    const footnotes = document.querySelectorAll('div.footnotes');
    const screenWidth = window.innerWidth;

    footnotes.forEach(footnote => {
        if (screenWidth > 56 * 16) { // 56rem converted to pixels (assuming 1rem = 16px)
            footnote.classList.add('floating-footnotes');
        } else {
            footnote.classList.remove('floating-footnotes');
        }
    });
}

// Run the function on page load and on window resize
toggleFloatingFootnotes();
window.addEventListener('resize', toggleFloatingFootnotes);