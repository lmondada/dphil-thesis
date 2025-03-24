+++
title = "Quantum Compilation as a Graph Transformation Problem"
sort_by = "weight"
weight = 3
layout = "chapter"
slug = "chap:compiler"
+++

<!-- prettier-ignore-start -->

{{% hint "danger" %}} TODOs.

- Redo figure at the end of 3.4
- dowhile figure at the end of 3.3
- Proof of "Proposition: MinIR subgraph rewrite"
- Order of def/props {{% /hint %}}
<!-- prettier-ignore-end -->

This thesis proposes interpreting quantum compilation as a graph transformation system (GTS). This allows us to decouple the hardware primitives, constraints, and cost function from the compiler infrastructure itself. Thus, we can focus on building and designing scalable and efficient graph transformation algorithms that can then be leveraged across a wide range of applications and hardware targets.

From a formal point of view, GTSs endow quantum compilation with well-defined semantics and strong theoretical foundations @Lack2005. They establish a practical, purely declarative framework in which compiler transformations can be defined, debugged and analysed. Indeed, while the specialised optimisation techniques that we reviewed in {{< reflink "sec:quantum-sota" >}} are effective for the scenarios they were designed for, these methods are hard to generalise. They struggle to incorporate new primitives, constraints, or cost functions and are hard to adapt to hybrid programs. We argue that as we advance, the scaling and engineering challenges that will come with building out custom compiler tooling will prove difficult, given the significant variations in quantum architectures and the unavoidable integration with classical hardware such as CPUs, GPUs and FPGAs[^whyfpga].

[^whyfpga]: The adoption of exotic classical hardware within quantum computer architectures is not a figment of our imagination: quantum error decoding using GPUs is already well-developed @Bausch2024 @Cao2023 and more esoteric platforms FPGAs @Overwater2022 @Meinerz2022, superconducting circuits @Ueno2021 and compute-in-memory architectures @Wang2024 are being actively studied.

In this chapter, we formalise quantum computation and optimisation based on graphs and graph transformations, providing the foundation for all considerations in later chapters. The internal representation IR we present here is based on our work in @Hugr, although it is simplified and modified slightly to fit our needs.

{{< reflink "upper" "sec:gts-sota" >}} starts with a review of previous related work at the intersection of graph transformation software and quantum circuit optimisation. We then discuss in {{< reflink "sec-compgraphs" >}} a fundamental difference between classical computation graphs and the requirements of quantum computation. This motivates a new graph-based IR tailored to quantum computation that we present in {{< reflink "sec:graph-defs" >}}, along with formal graph transformation semantics based on double pushout (DPO) rewriting, presented in {{< reflink "sec:rewrite-def" >}}.
