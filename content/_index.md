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

## Abstract

As the capabilities of quantum hardware advance and their architectures become
more complex, **quantum compilers** must evolve to optimise increasingly large
programs and support a growing range of computational primitives. In particular,
the emergence of **hybrid quantum-classical computations**, required for
instance by implementations of quantum error correcting protocols, poses
significant challenges to established quantum compilation techniques.

This thesis argues that **graph transformation systems (GTS)** offer a
principled foundation for compiler platforms that can express arbitrary hardware
primitives and support computations over both quantum and classical data. To
this end, it introduces a **graph-based intermediate representation** (IR), with
support for **linear types** to model quantum data. This unifies graphical
formalisms used for reasoning over quantum computations (such as the ZX
calculus) with IR-based program transformation techniques from classical
compiler design.

Building upon this foundation, the thesis tackles two critical scaling problems
hindering the adoption of GTS in quantum compilers. First, it presents an
efficient **pattern matching algorithm** based on a precomputed data structure
that achieves query times **independent of the number of transformation rules**
in the system. This removes a key bottleneck in quantum **superoptimisers**,
which optimise quantum programs using tens to hundreds of thousands of rules.

Second, the thesis introduces a **confluently persistent data structure** that
enables efficient exploration of the GTS state space of possible graph
transformations. This factorised search space offers an exponential complexity
advantage in search space size and traversal time compared to naively exploring
all reachable graphs. The thesis also discusses the problem of extracting
optimal programs from this data structure, relating it to Boolean satisfiability
(SAT) problems.

Together, these contributions lay the groundwork for scalable, GTS-based quantum
compilers and advance the integration of quantum and classical compilation
techniques. The persistent data structure for graph rewriting also opens the
door for **concurrent graph rewriting** in distributed systems, a technique that
may have applications within the graph transformations field more broadly and
merits further research.

</div>

---

<div class="left-of-toc">
<div class="acknowledgements"><div>

<!-- prettier-ignore -->
To my family who have supported me throughout these years. I couldn’t have done it without you.
{ .gap }

<!-- prettier-ignore -->
To my friends and colleagues that made this adventure an unforgettable journey.
Thank you to Aleks and the entire group in Oxford.
{ .gap }

A special mention goes to Ross and the amazing crew at Quantinuum: Dan, Pablo
and Thomas---thank you for proofreading---as well as Alan, Agustin, Alec,
Callum, Craig, Doug, Ian, Lukas, Mark, Richie, Silas, Seyon, Will, Yao, and so
many more! I look forward to continuing this incredible undertaking with you
all.

</div></div>

<!-- prettier-ignore -->
This document is also available as HTML
[here](https://luca.mondada.net/dphil-thesis). If you are reading this document
on a screen, you might find the experience much more pleasant in the browser (you can hover on citations, resize the window to your liking, search the document and more).
{ .online-version }

</div>

---

{{< tableofcontents >}}
