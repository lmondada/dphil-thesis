document.addEventListener('DOMContentLoaded', () => {
    const qvizDivs = document.querySelectorAll('div.qviz');
    qvizDivs.forEach(loadQviz);
});

function loadQviz(div) {
    const contents = JSON.parse(div.textContent);
    qviz.draw(contents, div, qviz.STYLES['Default']);
}
