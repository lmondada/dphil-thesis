// Helper function to check if there's only whitespace between two elements
function hasOnlyWhitespaceBetween(elem1, elem2) {
    let node = elem1.nextSibling;
    while (node && node !== elem2) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
            return false;
        }
        node = node.nextSibling;
    }
    return true;
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Maps to store citation data
    const citationKeyToId = new Map();
    const idToCitation = new Map();

    // Get all citation elements
    const citations = document.querySelectorAll('.citation');

    // First pass: collect all unique citations
    citations.forEach((citation, index) => {
        const keyElement = citation.querySelector('.citation-key');
        const fullElement = citation.querySelector('.citation-full');

        if (keyElement && fullElement) {
            const citationKey = keyElement.getAttribute('data-bibtex-key');
            if (!citationKeyToId.has(citationKey)) {
                citationKeyToId.set(citationKey, index);
                const clonedElement = fullElement.cloneNode(true);
                clonedElement.classList.replace('citation-full', 'citation-display');
                idToCitation.set(index, {
                    key: citationKey,
                    full: clonedElement,
                    authors: Array.from(fullElement.querySelectorAll('.author'))
                        .map(author => author.textContent)
                        .join(', ')
                });
            }
        }
    });

    // Sort citations by author names
    const sortedCitations = Array.from(idToCitation.entries())
        .sort((a, b) => a[1].authors.localeCompare(b[1].authors));

    // Create mapping from old IDs to new ordered indices
    const idToOrderedIndex = new Map();
    sortedCitations.forEach((entry, index) => {
        idToOrderedIndex.set(entry[0], index + 1);
    });

    // Second pass: replace citation keys with numbered links
    citations.forEach(citation => {
        const keyElement = citation.querySelector('.citation-key');
        if (keyElement) {
            const citationKey = keyElement.getAttribute('data-bibtex-key');
            const originalId = citationKeyToId.get(citationKey);
            const numberedIndex = idToOrderedIndex.get(originalId);

            const span = document.createElement('span');
            span.classList.add('citation-number');

            const link = document.createElement('a');
            link.href = '#ref-' + numberedIndex;
            link.textContent = numberedIndex.toString();

            span.appendChild(link);
            keyElement.replaceWith(span);
        }
    });

    // Group citations and apply CSS classes
    const citationGroups = Array.from(citations).reduce((groups, citation, index, array) => {
        if (index === 0 || !hasOnlyWhitespaceBetween(array[index - 1], citation)) {
            groups.push([citation]);
        } else {
            groups[groups.length - 1].push(citation);
        }
        return groups;
    }, []);

    citationGroups.forEach(group => {
        group.forEach((citation, index) => {
            const span = citation.querySelector('.citation-number');
            if (span) {
                if (index === 0) {
                    span.classList.add('citation-left');
                }
                if (index === group.length - 1) {
                    span.classList.add('citation-right');
                }
                if (index < group.length - 1) {
                    span.classList.add('citation-middle');
                }
            }
        });
    });

    if (sortedCitations.length > 0) {
        // Create and append the references section
        const referencesSection = document.createElement('details');
        referencesSection.id = 'references';

        const referencesTitle = document.createElement('summary');
        referencesTitle.textContent = 'References';
        referencesSection.appendChild(referencesTitle);

        const referencesList = document.createElement('ol');
        sortedCitations.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.id = 'ref-' + (index + 1);
            listItem.appendChild(entry[1].full);
            referencesList.appendChild(listItem);
        });

        referencesSection.appendChild(referencesList);

        const mainArticle = document.querySelector('main article');
        if (mainArticle) {
            mainArticle.appendChild(referencesSection);
        } else {
            console.error('Main article element not found');
        }

    }

    // Shorten the inline citation-full elements
    const inlineCitations = document.querySelectorAll('.citation-full');
    inlineCitations.forEach(citation => {
        const authorsSpan = citation.querySelector('.authors');
        if (authorsSpan) {
            const authors = authorsSpan.textContent.split(',').map(author => author.trim());
            if (authors.length > 5) {
                authorsSpan.textContent = authors.slice(0, 5).join(', ') + ', et al.';
            }
        }

        const doiSpan = citation.querySelector('.doi');
        if (doiSpan) {
            const br = document.createElement('br');
            doiSpan.parentNode.insertBefore(br, doiSpan);
        }
    });
});