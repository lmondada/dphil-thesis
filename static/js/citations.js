// Helper function to check if there's only whitespace between two elements
function hasOnlyWhitespaceBetween(elem1, elem2) {
  let node = elem1.nextSibling;
  while (node && node !== elem2) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
      return false;
    }
    node = node.nextSibling;
  }
  return true;
}

function collectCitations(citations) {
  let keyToCitation = new Map();

  citations.forEach((citation, index) => {
    const keyElement = citation.querySelector(".citation-key");
    const fullElement = citation.querySelector(".citation-full");

    if (keyElement && fullElement) {
      const citationKey = keyElement.getAttribute("data-bibtex-key");
      if (!keyToCitation.has(citationKey)) {
        const clonedElement = fullElement.cloneNode(true);
        clonedElement.classList.replace("citation-full", "citation-display");
        keyToCitation.set(citationKey, {
          key: citationKey,
          full: clonedElement,
          authors: fullElement.querySelector(".authors").textContent,
        });
      }
    }
  });

  return keyToCitation;
}

function replaceCitationKey(citation, keyToIndex) {
  const keyElement = citation.querySelector(".citation-key");
  if (keyElement) {
    const citationKey = keyElement.getAttribute("data-bibtex-key");
    const numberedIndex = keyToIndex.get(citationKey);

    const span = document.createElement("span");
    span.classList.add("citation-number");

    const link = document.createElement("a");
    link.href = "#ref-" + numberedIndex;
    link.textContent = numberedIndex.toString();

    span.appendChild(link);
    keyElement.replaceWith(span);
  }
}

function groupCitations(citations) {
  // Group citations and apply CSS classes
  const citationGroups = Array.from(citations).reduce(
    (groups, citation, index, array) => {
      if (
        index === 0 ||
        !hasOnlyWhitespaceBetween(array[index - 1], citation)
      ) {
        groups.push([citation]);
      } else {
        groups[groups.length - 1].push(citation);
      }
      return groups;
    },
    [],
  );

  citationGroups.forEach((group) => {
    group.forEach((citation, index) => {
      const span = citation.querySelector(".citation-number");
      if (span) {
        if (index === 0) {
          span.classList.add("citation-left");
        }
        if (index === group.length - 1) {
          span.classList.add("citation-right");
        }
        if (index < group.length - 1) {
          span.classList.add("citation-middle");
        }
      }
    });
  });
}

function formatCitationsList(citations) {
  const referencesList = document.createElement("ol");
  citations.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.id = "ref-" + (index + 1);
    listItem.appendChild(entry[1].full);
    referencesList.appendChild(listItem);
  });

  return referencesList;
}

function formatCitationsKeys(citations) {
  // First pass: collect all unique citations
  const keyToCitation = collectCitations(citations);

  // Sort citations by author names
  const sortedCitations = Array.from(keyToCitation.entries()).sort((a, b) =>
    a[1].authors.localeCompare(b[1].authors),
  );

  // Create mapping from old IDs to new ordered indices
  const keyToIndex = new Map();
  sortedCitations.forEach((entry, index) => {
    keyToIndex.set(entry[0], index + 1);
  });

  // Second pass: replace citation keys with numbered links
  citations.forEach((citation) => replaceCitationKey(citation, keyToIndex));

  groupCitations(citations);

  return sortedCitations;
}

function shortenInlineCitations() {
  const inlineCitations = document.querySelectorAll(".citation-full");
  inlineCitations.forEach((citation) => {
    const authorsSpan = citation.querySelector(".authors");
    if (authorsSpan) {
      const authors = authorsSpan.textContent
        .split(",")
        .map((author) => author.trim());
      if (authors.length > 5) {
        authorsSpan.textContent = authors.slice(0, 5).join(", ") + ", et al.";
      }
    }

    const doiSpan = citation.querySelector(".doi");
    if (doiSpan) {
      const br = document.createElement("br");
      doiSpan.parentNode.insertBefore(br, doiSpan);
    }
  });
}
