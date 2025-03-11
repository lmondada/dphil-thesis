+++
title = "Computation graphs and linearity"
weight = 2
layout = "section"
slug = "sec-compgraphs"
+++

Computation graphs represent the flow of data between operations in a program,
with nodes as operations and edges as data dependencies.
Widely used in machine learning frameworks and GPU
optimisations @Bergstra2011 @Zhao2023,
they are conceptually equivalent to dataflow graphs used in compiler design,
which were pioneered
by @Feo1990 and @Kahn1976 and are now central to most compiler internal
representations (IRs)---the intermediate structures compilers use during
translation.

In classical computations, these graph representations of computations
are essentially term graphs @Barendregt1987&#x200B;---tree
representations of algebraic expressions with an important optimization:
term sharing. When identical subexpressions appear multiple times, they can
be represented as one computation and referenced from multiple locations,
creating a directed acyclic graph rather than a pure tree @Plump1999.
This sharing enables a more efficient representation.
It can also be used as a compiler
optimisation for a more efficient execution---a technique known as common
subexpression elimination (CSE) @Cocke1970.
At any moment, however, the graph is functionally equivalent to a forest
of term trees.

Each (sub)term in a computation graph defines a _value_: the immutable
result of a computation at
a specific point in time. These values flow along edges in the graph---hence
"dataflow"---where they can only be consumed, never modified.
In compiler speak, programs expressed using such immutable values
are often referred to as single static assignment (SSA) programs @Cytron1991 @Rosen1988.
In SSA:
1. Each value is defined exactly once (static single assignment),
2. Dead values (unused values in the computation) are easily
identifiable because they have no consumers.

In quantum computations, we must deal with values that are _linear_[^linear],
reflecting the fact that they are the result of computations on quantum data,
which must obey the no-cloning and no-deleting laws.
This leads us to the fundamental constraint:
[^linear]: The terminology comes from "linear" logic @Girard_1987.
I apologise for slamming additional semantics on what I recognise
is an already very overloaded term.

{{% centered %}}
_Every **linear** value must be used exactly once_.
{{% /centered %}}

Linear values change fundamentally how transformations of the
computation graph must be specified.
Where compilers on classical data can:
- freely share common subexpressions (term sharing),
- reverse term sharing, i.e. duplicate shared terms into independent subterms, and
- delegate the identification and deletion of obsolete code to specialised
passes (e.g., dead code elimination @Cytron1991 @Briggs1994),

quantum compilers must maintain strict conservation of linear resources throughout
all transformations.
For instance, the creation and deletion of values
cannot be decoupled in the presence of linear values.
Two (possibly equivalent) values that are obtained
from the same linear inputs cannot be simultaneously defined in the program,
or the IR is in an invalid state.

As a result, whereas
it is common in [IR modification APIs](https://mlir.llvm.org/docs/PatternRewriter/) within classical compilers to specify
program transformations by referencing (copies of) existing values and
adding new values and operations as required, without any explicit code
deletion,
computation graphs with linear values must adopt _proper_ graph transformation
semantics.
Restricting IR transformations to valid graph rewrites will guarantee that
obsolete values and operations are always _explicitly_ deleted,
making it in turn possible to check and enforce linearity constraints at
every transformation.

<!-- existing values as inputs and define new output values. Subsequent operations
in the IR can then be "rewired" to use the new values instead of the old ones.
In other words, values, and the operations defining them, are never
explicitly deleted from the IR. This is handled separately by the compiler
with _dead code elimination_ passes @Cytron1991 @Briggs1994
that detect and remove unused values.

This separation of concerns between generating new code and "garbage collecting"
obsolete code means that IR transformations do not need to worry about
all global uses of a particular value when rewriting it---after all, both
new and old versions can be kept in the IR if useful.
In the presence of linear values, however,
creating new values and deleting old ones
cannot be decoupled.
Two (possibly equivalent) values that are obtained
from the same linear inputs cannot be simultaneously defined in the program,
or the IR is in an invalid state. -->
