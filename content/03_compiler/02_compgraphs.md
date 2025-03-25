+++
title = "Computation graphs and linearity"
weight = 2
layout = "section"
slug = "sec-compgraphs"
+++

Computation graphs represent the flow of data between operations in a program,
with nodes as operations and edges as data dependencies. Widely used in machine
learning frameworks and GPU optimisations @Bergstra2011 @Zhao2023, they are
conceptually equivalent to dataflow graphs used in compiler design, which were
pioneered by @Feo1990 and @Kahn1976 and are now central to most compiler IRs.

In classical computations, these graph representations of computations are
essentially _term graphs_ @Barendregt1987&#x200B;---sets of algebraic
expressions that are stored as trees, combined with an important optimisation
known as _term sharing_. When identical subexpressions appear multiple times,
they can be represented as one computation and referenced from multiple
locations, creating a directed acyclic graph rather than a pure tree @Plump1999.
This sharing enables a more efficient representation. It can also be used as a
compiler optimisation to identify subexpressions that can be cached and shared
across expression evaluations for a more efficient execution---a technique known
as common subexpression elimination (CSE) @Cocke1970.

Each edge of a computation graphs corresponds to a unique _value_: the output of
a previous computation that is being passed on to new operations. These values
flow along edges in the graph---hence _dataflow graph_. Values are immutable:
they are defined once and then passed as input to further operations, where they
can only be consumed, never modified. In compiler speak, programs expressed
using such immutable values are often called single static assignment (SSA)
programs @Cytron1991 @Rosen1988. In SSA:

1. Every value is defined exactly once,
2. Every value may be used any number of times (including zero).

Quantum computing throws SSA into the bin. Values in quantum computations are
the result of computations on quantum data, and as such must obey the no-cloning
and no-deleting theorems ({{% reflink "sec:basics" %}}). We call values subject
to these restrictions _linear_[^linear]. They introduce the following constraint
on valid computation graphs:

<!-- prettier-ignore-start -->
{{% centered %}}
_Every **linear** value must be used exactly once_.
{{% /centered %}}
<!-- prettier-ignore-end -->

[^linear]:
    The terminology comes from "linear" logic @Girard_1987. I apologise for
    slamming additional semantics on what I recognise is an already very
    overloaded term.

Linear values change fundamentally how transformations of the computation graph
must be specified. Where compilers on classical data can:

- freely share common subexpressions (term sharing),
- undo term sharing, i.e. duplicate shared terms into independent subterms, and
- delegate the identification and deletion of obsolete code to specialised
  passes (e.g., dead code elimination @Cytron1991 @Briggs1994),

quantum compilers must enforce much stricter invariants on IR
transformations---or risk producing invalid programs. Two equivalent values
obtained from the same linear inputs can for instance never be simultaneously
defined in a program.

In classical compilers, IR modification APIs (such as MLIR’s
[PatternRewriter](https://mlir.llvm.org/docs/PatternRewriter/)) decouple program
transformation from code deletion. Program transformations are specified by
copying existing values and introducing new values and operations as needed,
while the actual deletion of unused code is deferred to specialized dead code
elimination passes. This approach is no longer feasible in the presence of
linear values. Computation graphs for quantum computations must adopt _proper_
graph rewriting semantics, in which the explicit deletion of obsolete values and
operations is just as much a part of the rewriting data as the new code
generation.
