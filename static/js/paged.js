class MyHandler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterPageLayout(pageFragment, page) {
    const isLeftPage = pageFragment.classList.contains("pagedjs_left_page");
    const marginSelector = isLeftPage
      ? ".pagedjs_margin-right"
      : ".pagedjs_margin-left";
    const margin = pageFragment.querySelector(marginSelector);
    const footnoteToRef = Array.from(
      pageFragment.querySelectorAll("sup"),
    ).reduce((acc, el) => {
      const id = el.id.replace("fnref", "fn");
      acc[id] = el;
      return acc;
    }, {});
    if (Object.keys(footnoteToRef).length === 0) {
      return;
    }

    const footnoteDiv = document.createElement("div");
    footnoteDiv.classList.add("footnotes", "paged-footnotes");
    const startIndex = getSupStartIndex(pageFragment);
    const footnoteList = document.createElement("ol");
    footnoteList.setAttribute("start", startIndex);
    footnoteDiv.appendChild(footnoteList);
    Object.keys(footnoteToRef).forEach((id) => {
      const footnote = this.footnoteMap[id];
      if (footnote) {
        footnoteList.appendChild(footnote);
      }
    });
    margin.insertBefore(footnoteDiv, margin.firstChild);

    // Now place the li at the right height
    // Admittedly this shouldn't be copied over from footnotes.js, but share
    // the logic in a separate function
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
  footnotes.forEach((f) => {
    const listItems = f.querySelectorAll("ol > li");
    listItems.forEach((li) => {
      footnoteMap[li.id] = li;
    });
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
