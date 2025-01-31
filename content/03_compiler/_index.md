+++
title = "Quantum Compilation as a Graph Transformation System"
sort_by = "weight"
weight = 3
layout = "chapter"
slug = "chap:compiler"
+++

This thesis proposes to interpret quantum compilation as a graph
transformation system (GTS).
This allows us to decouple the hardware primitives, constraints and cost function
from the compiler infrastructure itself.
We can thus focus on building and designing scalable and efficient graph
transformation algorithms that can then be leveraged across a wide range of
applications and hardware targets.

From a formal point of view, GTS endow quantum compilation with
well-defined semantics and strong theoretical foundations @Lack2005.
Just as importantly, they establish a practical, purely
declarative framework in which compiler transformations can be defined, debugged
and analysed.
Indeed, while the specialised optimisation techniques that we reviewed in
{{< reflink "sec:quantum-sota" >}} are effective for the scenarios they
were designed for, these methods are hard to generalise.
They struggle to incorporate new primitives, constraints
or cost functions and are hard to adapt to hybrid programs. 
We argue that going forward the scaling and engineering challenges
that will come with building out custom compiler tooling will prove difficult,
given the large variations in quantum architectures and the unavoidable
integration with classical hardware such as CPUs, GPUs and FPGAs.


This chapter presents the graph formalism that enables our GTS.
The IR that we present here is based on our work in @Hugr, although
it is simplified and modified slightly to fit our needs.
{{< reflink "upper" "sec:gts-sota" >}} starts with a review of previous
related work at the intersection of graph transformation software
and quantum circuit optimisation.
We then present in {{< reflink "sec:ir" >}}
a graph-based internal representation (IR)
for quantum programs.
This allows us to capture the semantics of any classical-quantum computation
in a graph structure that we define formally
in {{< reflink "sec:graph-defs" >}}.
Finally, {{< reflink "sec:eqsat" >}} defines the graph
transformation semantics. 
