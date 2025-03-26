+++
title = "Quantum Compilation as a Graph Transformation Problem"
sort_by = "weight"
weight = 3
layout = "chapter"
slug = "chap:compiler"
+++

The specialised optimisation techniques that we reviewed in
{{< reflink "sec:quantum-sota" >}} are effective for the scenarios they were
designed for, but they are challenging to adapt to new hardware primitives,
constraints, or cost functions.

This thesis proposes interpreting quantum compilation as a graph transformation
system (GTS). GTSs endow quantum compilation with well-defined semantics and
strong theoretical foundations @Lack2005. They establish a practical, purely
declarative framework in which compiler transformations can be defined, debugged
and analysed.

This allows us to decouple the semantics of quantum programs and the
architecture specifics from the compiler infrastructure itself. We can thus
focus on building and designing scalable and efficient graph transformation
algorithms that can then be applied on a wide range of compilation problems and
hardware targets.

In this chapter, we formalise quantum computation and optimisation based on
graphs and graph transformations, providing the foundation for all
considerations in later chapters. Albeit slightly simplified, the internal
representation IR we propose here is based on joint work recently presented at
the _Workshop on Programming Languages for Quantum Computing_ (PlanQC) 2025
@Hugr, as well as [ongoing development](https://github.com/CQCL/hugr).

{{< reflink "upper" "sec:gts-sota" >}} starts with a review of previous related
work at the intersection of graph transformation software and quantum program
optimisation. We then discuss in {{< reflink "sec-compgraphs" >}} a fundamental
difference between classical computation graphs and the requirements of quantum
computation. This motivates a new graph-based IR tailored to quantum computation
that we present in {{< reflink "sec:graph-defs" >}}, along with formal graph
rewriting semantics ({{< reflink "sec:rewrite-def" >}}). The main difficulty
here is in ensuring that rewrites cannot create invalid graphs. We conclude in
{{< reflink "sec-gts-def" >}} by proposing definitions for transformation
systems on the IR and discuss how they compare to the double pushout (DPO)
construction.

{{% hint "info" %}}

The words graph _rewrite_ and graph _transformation_ are often used
interchangeably in the literature. In the context of this thesis, we will take
these words to distinguish two slightly different problems:

The study of equivalences and other relations between graphs under well-defined
graph semantics is the subject of **graph transformations**. For instance:

- a _graph transformation rule_ $L \to R$ ({{% refdefinition "minirtransfo" %}})
  expresses that an instance of $L$ can always be transformed into an instance
  of $R$, reflecting the semantics of the system that the graph is modelling.
- a minIR equivalence class ({{% refdefinition "minireqclass" %}}) is an
  instance of a _graph transformation system_ (GTS), which uses known semantic
  relations, expressed, for example, as graph transformation rules, to define
  how graphs can be transformed.

**Graph rewriting**, on the other hand, encapsulates the algorithmic procedures
and data structures that mutate graphs. A _rewrite_
({{% refdefinition "minirrewrite" %}}) is the tuple of data required to turn a
graph $G$ into a new graph $G'$.

Given matches of patterns $L$ on a graph $G$, a _graph transformation system_
can consider the set of _graph transformation rules_ that define the semantics
of $G$ to produce a set of _rewrites_ that can be applied to $G$ and mutate $G$.

{{% /hint %}}

<!-- The term "rewriting" is also used in this thesis whenever we mention
transformation systems that act not on graphs but on strings and terms, as this
is the standard terminology in those fields. String and term rewriting are never
a research topic in this work and will only be mentioned when reviewing relevant
past work. -->
