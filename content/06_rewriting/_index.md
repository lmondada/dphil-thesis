+++
title = "A Framework for Scalable Graph Rewriting"
sort_by = "weight"
weight = 6
layout = "chapter"
slug = "chap:rewriting"
+++

With this chapter we have arrived at the core of this thesis:
a proposal for a new quantum compilation framework.
In summary, our claim is that given

1. the challenge of scaling up quantum programs sizes to make the most of the
computational capabilities of upcoming hardware
(cf. {{< reflink "sec:compilation" "sec:quantum-sota" >}}) and
2. the modularity and expressiveness that quantum compilers will require
to simultaneoulsy express higher level abstractions, hardware primitives
and interleaved quantum classical computation
(cf. {{< reflink "sec:hybrid" "sec:need-help" "sec:graph-defs">}}),

graph rewriting is uniquely positioned to serve as the backbone of a
quantum compilation framework.

Our proposal draws much from the design and techniques of classical compilers
(cf. {{< reflink "sec:graph-defs" "sec:eqsat" >}}).
Quantum, however, distinguishes itself in two ways, forming the cornerstones
of our design.
The focus on small, local graph transformations for quantum optimisation 
is justified by the groundbreaking work by Clément et al @Clement2023 @Clement2024.
They showed that the rich algebraic structure of quantum circuits can be fully
captured and expressed using local rewrite rules[^eqcomp].
Our compiler can therefore restrict program manipulation to local transformations
without losing expressiveness.
This design choice in turn opens the door for large scale optimisation and
compilation on parallel or even distributed hardware.

Equally important, the linear types of quantum computing
(cf. {{< reflink "sec:graph-defs" >}}) significantly constrain
the space of possible program transformations.
Our contributions in this thesis highlight how these restrictions can be leveraged
to create quantum-specific variants of classical compilation techniques that
scale much more favourably.
This makes approaches that are too expensive for classical compilers
(cf. {{< reflink "sec:eqsat" >}})
perfectly feasible[^unfeasible] in the context of quantum compilation.
[^eqcomp]: More precisely, they show that any two equivalent quantum circuits
can be transformed into each other using a finite number of local rewriting
rules.
[^unfeasible]: Or at least, less unfeasible.
