class MyHandler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterPageLayout(pageFragment, page, breakToken) {
    // Identify pages with a chapter heading
    const chapterNumber = pageFragment.querySelector("p.chapter-number");
    if (chapterNumber) {
      // Add chapter-head class to the root element of the page
      pageFragment.classList.add("chapter-head");
    }

    this.addFootnotes(pageFragment);
  }

  beforeParsed(content) {
    runCitationFormatter(content);

    const footnotes = content.querySelectorAll("div.footnotes");
    this.footnoteMap = removeFootnotes(footnotes);

    // Remove all empty paragraphs
    const emptyParagraphs = content.querySelectorAll("p:empty, input");
    emptyParagraphs.forEach((p) => p.remove());
  }

  addFootnotes(pageFragment) {
    // Get all footnote references on this page
    const footnoteRefs = Array.from(pageFragment.querySelectorAll("sup"));

    // If no footnotes on this page, return
    if (footnoteRefs.length === 0) {
      return;
    }

    // Create footnote container
    const footnoteDiv = document.createElement("div");
    footnoteDiv.classList.add("footnotes", "paged-footnotes");

    // Get start index for footnote numbering
    const startIndex = getSupStartIndex(pageFragment);

    // Create ordered list for footnotes
    const footnoteList = document.createElement("ol");
    footnoteList.setAttribute("start", startIndex);
    footnoteDiv.appendChild(footnoteList);

    // Map footnote references to their ids
    const footnoteToRef = footnoteRefs.reduce((acc, el) => {
      const id = el.id.replace("fnref", "fn");
      acc[id] = el;
      return acc;
    }, {});

    // Add footnotes to the list
    Object.keys(footnoteToRef).forEach((id) => {
      const footnote = this.footnoteMap[id];
      if (footnote) {
        footnoteList.appendChild(footnote.cloneNode(true));
      }
    });

    // Add footnote div to the article element (it will be positioned by CSS grid)
    const article = pageFragment.querySelector("article.markdown");
    if (article) {
      article.appendChild(footnoteDiv);
    }

    // Position footnotes vertically aligned with their references
    let lastOffset = null;
    footnoteList.querySelectorAll("li").forEach((li) => {
      const ref = footnoteToRef[li.id];
      if (ref) {
        // Find the first <p> ancestor of the footnote reference
        let refParagraph = ref.closest("p") || ref;

        // First try with top alignment (default behavior)
        let offset = computeOffsetForAlignment(li, refParagraph, false);
        if (lastOffset !== null) {
          offset = Math.max(offset, lastOffset);
        }

        // Check if this would cause overlap with .footnote-above
        if (overlapsWithFootnoteAbove(li, offset, pageFragment)) {
          // If overlap detected, align to bottom instead
          offset = computeOffsetForAlignment(li, refParagraph, true);
          // hacky fix (not sure why)
          offset += 10;
          if (lastOffset !== null) {
            offset = Math.max(offset, lastOffset);
          }
        }

        li.style.top = `${offset}px`;
        lastOffset = offset + li.offsetHeight;
      }
    });
  }
}
Paged.registerHandlers(MyHandler);

function getSupStartIndex(pageFragment) {
  // Find the first sup element
  const sup = pageFragment.querySelector("sup");

  if (!sup) {
    console.error("No sup element found");
    return;
  }

  // Get the text content and convert to integer
  const startNumber = parseInt(sup.textContent);

  if (isNaN(startNumber)) {
    console.error("Sup element does not contain a valid number");
    return;
  }

  return startNumber;
}

function removeFootnotes(footnotes) {
  const footnoteMap = {};

  // Process each footnote section
  footnotes.forEach((f) => {
    // Extract all footnote list items
    const listItems = f.querySelectorAll("ol > li");

    // Add each footnote to our map, but create a deep clone to preserve for later use
    listItems.forEach((li) => {
      footnoteMap[li.id] = li.cloneNode(true);
    });

    // Remove the original footnote section as we'll recreate it in the grid
    f.remove();
  });

  return footnoteMap;
}

function runCitationFormatter(parsed) {
  // Get all citation elements
  const citations = parsed.querySelectorAll(".citation");

  const sortedCitations = formatCitationsKeys(citations);

  // Create and append the references section
  if (sortedCitations.length > 0) {
    // where to append
    const mainArticle = parsed.querySelector("main article");
    if (!mainArticle) {
      console.error("Main article element not found");
    }

    const referencesTitle = document.createElement("h1");
    referencesTitle.textContent = "References";
    referencesTitle.classList.add("references");
    mainArticle.appendChild(referencesTitle);

    const referencesList = formatCitationsList(sortedCitations);
    mainArticle.appendChild(referencesList);
  }
}
