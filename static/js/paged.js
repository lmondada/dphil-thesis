class MyHandler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterPageLayout(pageFragment, page, breakToken) {
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
        let offset = computeOffsetForAlignment(li, refParagraph);
        if (lastOffset !== null) {
          offset = Math.max(offset, lastOffset);
        }
        li.style.top = `${offset}px`;
        lastOffset = offset + li.offsetHeight;
      }
    });
  }

  beforeParsed(content) {
    runCitationFormatter(content);

    const footnotes = content.querySelectorAll("div.footnotes");
    this.footnoteMap = removeFootnotes(footnotes);
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

    const referencesTitle = document.createElement("h2");
    referencesTitle.textContent = "References";
    mainArticle.appendChild(referencesTitle);

    const referencesList = formatCitationsList(sortedCitations);
    mainArticle.appendChild(referencesList);
  }
}

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

// Run the function on page load and on window resize
toggleFloatingFootnotes();
// window.addEventListener('resize', toggleFloatingFootnotes);

///////// Footnote placement ////////////

// Computes an offset such that setting `top` on `footnote` will put it
// in vertical alignment with targetAlignment.
function computeOffsetForAlignment(footnote, targetAlignment) {
  const offsetParentTop = footnote.offsetParent.getBoundingClientRect().top;
  // Distance between the top of the offset parent and the top of the
  // target alignment
  return targetAlignment.getBoundingClientRect().top - offsetParentTop;
}
