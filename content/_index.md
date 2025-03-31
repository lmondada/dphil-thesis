+++
title = "DPhil Thesis"
layout = "titlepage"
sort_by = "weight"
+++

# Scaling<br />Quantum Compilation<br />with<br />Graph Rewriting

<!-- prettier-ignore-start -->
![Oxford logo]({{< relurl "svg/oxford-logo.svg" >}})
{.logo}

Luca Mondada
{.name .author}

Lady Margaret Hall
{.college .author}

University of Oxford
{.university .author}

A thesis submitted for the degree of
{.submission}

Doctor of Philosophy
{.submission .title}

Hilary 2025
{.submission}
<!-- prettier-ignore-end -->

---

<div class="abstract">

## Abstract (TODO: rewrite)

This thesis addresses the critical challenges in developing scalable and modular
quantum compilers necessitated by the vast diversity of quantum hardware
architectures, the increasing complexity of quantum programs, and the emergence
of hybrid quantum-classical computations. The central argument of this work is
that **graph transformation systems (GTS)** provide a robust foundation for
building such compiler platforms.

To this aim, the thesis introduces **minIR**, a novel graph-based intermediate
representation (IR) that explicitly supports linear types, enabling the unified
modeling of both classical and quantum data within a single representation
interoperable with classical compiler infrastructures. Furthermore, the thesis
proposes the first formalization of graph transformation semantics for minIR
that provably preserve the fundamental linearity constraints of quantum
computation.

Building upon this foundation, the thesis tackles two critical scaling problems
hindering the adoption of GTS in quantum compilers. First, it presents an
efficient **pattern matching algorithm** for minIR graphs that utilizes a
pre-computed data structure, allowing for rapid identification of all pattern
matches with a query time independent of the number of transformation rules.
This approach involves a reduction of graph pattern matching to tree inclusion
through the development of path-split graphs (PSGs) and their canonical
representations. Second, the thesis introduces a **confluently persistent data
structure** capable of exploring the exponentially large space of possible graph
transformations in a GTS. This factorized search space offers a significant
complexity advantage compared to naively exploring all reachable graphs. The
thesis also discusses the problem of extracting optimal programs from this data
structure, relating it to boolean satisfiability (SAT) problems.

The contributions of this thesis lay the groundwork for a **modular and scalable
quantum compiler platform** capable of handling diverse hardware primitives,
high-level programming abstractions, and a large number of optimization rules.
The enforcement of linearity within minIR is shown to be crucial for achieving
asymptotic runtime guarantees. Ongoing work integrating these techniques into
the TKET2 open-source compiler further underscores their practical relevance.
Finally, the thesis outlines promising avenues for future research, including
enhancing the expressiveness of the pattern matching language and extending the
application of the persistent data structure for direct pattern matching and
distributed parallel graph rewriting.

</div>

---

<div class="left-of-toc">
<div class="acknowledgements"><div>

<!-- prettier-ignore -->
To my family that supported me throughout these years. Thank you thank you thank
you.
{ .gap }

To my friends and colleagues that made this adventure an unforgettable journey.
Thank you to Aleks and the entire group in Oxford and thank you to Ross and your
amazing crew at Quantinuum. I could name you all, but you know who you are.
Thank you from the bottom of my heart.

</div></div>

<!-- prettier-ignore -->
This document is also available as HTML
[here](https://luca.mondada.net/dphil-thesis). If you are reading this document
on a screen, you might find the experience much more pleasant in the browser (you can hover citations, resize the window, search the text and more).
{ .online-version }

</div>

---

{{< tableofcontents >}}
