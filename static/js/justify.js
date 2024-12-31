import enGbPatterns from 'https://cdn.jsdelivr.net/npm/hyphenation.en-gb@0.2.1/+esm';
import texLinebreak from 'https://cdn.jsdelivr.net/npm/tex-linebreak@0.7.1/+esm';

const hyphenate = texLinebreak.createHyphenator(enGbPatterns);

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('article');

    const resizeObserver = new ResizeObserver(() => {
        const paragraphs = Array.from(container.querySelectorAll('p:not(.footnotes p)'));
        texLinebreak.justifyContent(paragraphs, hyphenate);
    });
    resizeObserver.observe(container);
});