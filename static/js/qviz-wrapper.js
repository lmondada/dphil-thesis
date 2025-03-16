document.addEventListener("DOMContentLoaded", () => {
  const qvizDivs = document.querySelectorAll("div.qviz");
  qvizDivs.forEach(loadQviz);
});

function loadQviz(div) {
  const jsonScript = div.querySelector('script[type="application/json"]');
  if (!jsonScript) {
    console.error("No JSON content found in qviz div");
    return;
  }
  
  try {
    const contents = JSON.parse(jsonScript.textContent);
    
    // Remove the script tag
    jsonScript.remove();
    
    // Draw the visualization in the div
    qviz.draw(contents, div, qviz.STYLES["Default"]);
  } catch (error) {
    console.error("Error parsing JSON content:", error);
    div.innerHTML = `<div class="error">Error loading visualization: ${error.message}</div>`;
  }
}
