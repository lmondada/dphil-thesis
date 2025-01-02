+++
title = "A Quantum-Classical Toy IR"
weight = 3
+++

Describing the specifics of any one quantum programming language or compiler IR
is beyond our scope and would force us to restrict our considerations
to a narrow subset of the options that are still being actively explored and
developed.
For the purposes of this thesis, it is sufficient to introduce a simplified "toy"
IR. 
It captures all the expressiveness that we require for hybrid programs whilst
remaining sufficiently abstract [^underspec] to be applicable to a variety
of IRs and, by extension, programming languages.
[^underspec]: A critic would say "under-specified".

Our toy IR is built from statements of the form
```
x, y, ... := op<T1, T2, ...>(a, b, c, ...)
```
to be understood as an operation `op` applied on the inputs `a, b, c, ...`
and producing the outputs `x, y, ...`.
The number of inputs and outputs is determined by the "type signature" of the
operation `op`.
We use the optional `<T1, T2, ...>` syntax to allow for "overloaded" operations:
an operation may be parametrised on some types `T1`, `T2` to `Tk` that will dictate
different type signatures (and their associated semantics) for the operation.

Each variable in the input and output tuples is a _value_ with a fixed _type_
which can be always infered from the type signature that produces or consumes
a value.
Every value must appear exactly once on the left hand side of an IR statement,
as an output.
Values are immutable and represent a piece of data in the computation at one
moment in time.
This IR format is known in compiler speak as single static assignment (SSA) @Rosen1988.
This represents a notable departure from quantum circuits, where
operations are typically thought of as "placed" on a qubit (the "lines" in the
circuit representation) that sits there for the entire duration of the
computation.
In the value semantics of SSA, on the other hand,
qubits only exist in the form of the data they encode: when applying an operation,
the (quantum) data is "given" to the operation and new data is returned.

To make the difference clear, compare the program representations of
the following computation:

{{% columns ratio="1:1" %}}
**Quantum circuit**
```goat
   .---.   .----.
---+ H +---+    +-----------
   '---'   | CX |   .---.
-----------+    +---+ X +---
           '----'   '---'
```
<--->
**Toy IR (SSA)**<br/>
_in_ : `q0_0`, `q1_0`
_out_ : `q0_2`, `q1_2`
```
q0_1       := h(q0_0)
q0_2, q1_1 := cx(q0_1, q1_0)
q1_2       := x(q1_1)
```
{{% /columns %}}

In value semantics, it becomes much harder to track qubits across their life
span. This has very practical implications: without the convenient naming scheme,
it would for example be non-trivial to count how many qubits are required
in the SSA representation of the computation above.
However, it is a drastically simpler picture from the point of view of the
compiler and the optimiser---hence its popularity in classical compilers.
When operations are defined based on the qubit they act on, the compiler
must carefully track the ordering of these operations: operations on the same
qubit must always be applied in order.
Through multi-qubit gates, this also imposes a (partial) ordering on operations
across different qubits.
Conversely, the fact that two operations, separated in the
computation by a million other operations, will eventually be applied on the
same physical entity is totally irrelevant information to the optimiser.

This is precisely what value semantics abstracts away:
the notion of physical qubit disappears and the ordering of statements
becomes irrelevant.
All that matters is to connect each use of a value (i.e. occurrence as an input
on the right hand side of an IR statement) with its _unique_ definition on
the left hand side of another statement.

In our toy IR, a program is thus defined by a set of statements, with no explicit
ordering defined between them.
The program is well-defined if _i)_ the dataflow graph connecting operations
defining values with their uses is acyclic
and _ii)_ it can
be successfully typed, i.e. each value can be assigned a type such that the
type signature of each operation in the program is satisfied.
For this we must define the list of all valid operations along with their
signatures. Examples of operations with their signatures could be
```python
# A typical quantum gate
h:                  Qubit -> Qubit
# A classical XOR gate on two inputs
xor<Bit, Bit>:      Bit, Bit -> Bit
# The same XOR gate, but with three inputs
xor<Bit, Bit, Bit>: Bit, Bit, Bit -> Bit
# Measurements consume a qubit and produce a bit
measure:            Qubit -> Bit
```
where `Bit` and `Qubit` are the defined types and the `xor` op was given two
overloaded signatures that can be distinguished by the type parameters. 

### Structured control flow
We have studied so far how IRs express the _data flow_ of a program, i.e. the
flow of data between program statements.
An equally essential function of IRs is to capture the _control flow_ of a
program: the order of execution of the program instructions, which is how
an IR can express loops, conditionals, function calls etc.

Classical IRs typically introduce conditional control 