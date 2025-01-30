+++
title = "A minimimal Quantum-Classical IR"
weight = 3
layout = "section"
slug = "sec:toyir"
+++

Describing the specifics of any one quantum programming language or compiler IR
is beyond our scope and would force us to restrict our considerations
to a narrow subset of the options that are still being actively explored and
developed.
For the purposes of this thesis, it is sufficient to introduce a simplified "toy"
IR that we will call `minIR`. 
It captures all the expressiveness that we require for hybrid programs whilst
remaining sufficiently abstract [^underspec] to be applicable to a variety
of IRs and, by extension, programming languages.
[^underspec]: A critic would say "under-specified".

MinIR is built from statements of the form
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
**minIR (SSA)**<br/>
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

In minIR, a program is thus defined by a set of statements, with no explicit
ordering defined between them.
The program is well-defined if

1. every value is defined exactly once (_SSA_),
2. the dataflow graph connecting operations defining values with their uses
is acyclic (_acylicity_) and,
3. it can be successfully typed, i.e. each value can be assigned
a type such that the type signature of each operation in the program is satisfied
(_well-typedness_).

For well-typedness we must define the list of all valid operations along with their
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

### Linear Types and Structured Control Flow
We have studied so far how IRs express the _data flow_ of a program, i.e. how
outputs of previous computations feed into the inputs of subsequent ones.
An equally essential function of IRs is to capture the _control flow_ of a
program: the order of execution of the program instructions, which is how
an IR can express loops, conditionals, function calls etc.

The most popular---and simplest---way of expressing control flow in classical
IRs is with the introduction of branch statements[^goto].
For instance, LLVM IR provides a conditional branch statement
```llvm
br i1 %cond, label %iftrue, label %iffalse
```
that will jump to the `iftrue` label if `%cond` is true and to the `iffalse`
label otherwise.
[^goto]: You may know this from prehistoric times as the `goto` statement, in
languages such as Fortran, C, and, yes, [even Go](http://golang.org/ref/spec#Goto_statements).

This is a both simple and versatile approach to control flow that can be used
to express any higher level language constructs.
However, in the context of quantum computing, the combination of value-based
semantics, conditional branching and the no-cloning theorem is proving to be
a toxic brew.

Indeed, quantum data introduces an additional condition on the well-formedness
of IR programs: every value that represents a quantum state must not only be
defined _exactly once_, but must also be used _exactly once_.
We call a type that satisfies this constraint a **linear type**[^linear]:

4. every value with a linear type is used exactly once (_linearity_).

In the absence of conditional branching, this is a very simple verification
pass to perform on our IR, the exact converse of checking that each value
is defined exactly once.
[^linear]: The terminology comes from "linear" logic @Girard_1987.
We apologise for slamming additional semantics on an already very
overloaded term.

However, as conditional branching is introduced into the IR, the linearity 
constraint would have to be relaxed to allow for a single use _in each mutually exclusive
branch_ of the program. The following two uses of `b` should be allowed (in pseudo-IR):
```python
b := h(a)
<if cond> c := x(b)
<else>    d := h(b)
```
This is now a much harder invariant to check on the IR and would be extremely
error prone!
Instead, we resort to **structured control flow** to express control flow
at a higher abstraction level and maintain the linearity constraint in its
simplest form.

#### Subroutines
The simplest case of structured control flow we introduce is calling subroutines[^func].
The more complex control flow statements will be built on top of subroutines.
We define subroutines by introducing two operations:
```
block<Ts, Us>: () -> (Block<Ts, Us>, Ts)
return<Us>: Us -> ()
```
that can be parametrised on any input types `Ts = (T1, T2, ...)` and any output types
`Us = (U1, U2, ...)`.
We group types into tuples to simplify notation and separate input from output
types.
In the following we will write `Ts` and `Us` to mean
an arbitrary number of types `T1, T2, ...` and `U1, U2, ...` respectively.
We wrote `()` for the [unit type](https://ncatlab.org/nlab/show/unit+type):
for our purposes, read it as
saying that `block` takes no inputs and `return` returns no outputs. 
[^func]: Think of them as functions, if you prefer.

Notice that we have introduced a new (parametrised) type `Block<Ts, Us>`. 
The only way we can obtain a value of this type is from an `block` statement.
You can think of it as pointing to the set of statements that make up the body
of the subroutine[^llvmblock].
It will serve us as a handle to call the subroutine.
[^llvmblock]: like the label of a block in LLVM IR.
You can also view it as a function pointer, but note that the code that it points
to is always fixed in the IR!

The `block` and `return` operations are enough to define very minimal
subroutines!
We define a `call` operation to make use of them:
```python
call<Ts, Us>: Block<Ts, Us>, Ts -> Us
```
We can thus use a `block` operation to obtain a `Block` value that we then
pass on to `call` operations to invoke the subroutine.
Finally, the `return` operation designates the values that the subroutine
computes.
These are in turn passed to the outputs of the `call` operation where the subroutine
was invoked. In summary, a subroutine definition and invocation looks like this:
```
f, a, b := block()
c, d = cx(a, b)
return(c, d)

z, w := call(f, x, y)
```
Note that for all three ops `block`, `return` and `call` we have omitted
the type parameters `<(Qubit, Qubit), (Qubit, Qubit)>` for clarity.

The effect of the call operation to a subroutine is to redirect the control flow 
to the set of operations between the `block` and `return` statements.
We can obtain the sequence of operations that result from the invocation by
replacing all uses of values output by the `block` operation with
the input values to the `call` op, and conversely,
swapping out the values defined by the outputs of the `call` op for the values
in the subroutine passed to the `return` op.
In pictures:
{{% columns ratio="1:1" %}}
**The following subroutine invocation**
```goat
  |   |
  |   |         .-------.
  |   |      .--+ block |
  |   |     |   '--+-+--'
  |   |     |      | |
  v   v     |      | |
.-------.   |      v v
| call  |<-'  .----------.
'---+---'     |subroutine|
    |         '-----+----'
    |               |
    |               v
    |           .--------.
    v           | return |
                '--------'
```
<--->
**results in the following control flow**
```goat
                .-------.
  |   |         | block |
  |   |         '-------'
  |   '--------------.
  '----------------. |
                   | |
.-------.          v v
| call  |     .----+-+---.
'-------'     |subroutine|
              '-----+----'
    .---------------'
    |                
    |           .--------.
    v           | return |
                '--------'
```
{{% /columns %}}
The left diagram represents the IR, with arrows connecting value definitions
to their uses (the arrow with rounded edges is the `Block` value).
The right diagram on the other hand shows the simplified IR, where the subroutine
was _inlined_, i.e. the `call` operation was replaced with the body of the
subroutine between the `block` and `return` statements.

Notice that because of the precise type signatures we imposed on the `call`,
`block` and `return` operations, the types of the values that are rewired
between the left and right diagrams will always match.

{{% hint info %}}
**A note on IR validation.**
Without additional constraints, the `block` and `return` operations could easily
be used to define invalid IR programs! Subroutine arguments obtained from
`block` operations could for instance lead to `return` operations with
mismatched types---or to no `return` operation at all.
We would also need to enforce proper scoping rules to prevent values from one
subroutine being used in another.

Real IRs such as MLIR @Lattner_2021 and HUGR @Hugr address these issues by
imposing more structure on their IRs, such as code blocks and hierarchical
dependencies.
We will ignore these issues in this thesis and refer to these projects for
a much better treatment of these "practicalities".
{{% /hint %}}

#### Conditionals
Using the same `Block` value, we can model conditional control
flow and loops similarly.
We introduce for this a new boolean type `Bool` that can hold the values `True`
or `False`:
```
ifelse<Ts, Us>: Bool, Ts, Block<Ts, Us>, Block<Ts, Us> -> Us
dowhile<Ts>: Block<Ts, (Ts, Bool)>, Ts -> Ts
```
The `ifelse` operation is passed four inputs: a boolean condition, a set of
input values and two `Block`s.
Depending on the value of the boolean condition,
one of the two `Block`s will be evaluated by passing it the input values.
The `dowhile` operation is similar, but instead of being provided a boolean
conditional as input, a `Bool` value can be computed by evaluating the `Block`
passed as input.
At the first iteration, the block is called on the values of `Ts`
in the input of the `dowhile` operation.
Each block evaluation returns new values of `Ts`.
If the returned boolean condition is true, the `Block` is re-evaluated on the
new values of `Ts`.
The loop terminates when the returned boolean condition is false.
The outputs of the `dowhile` operation are the values of `Ts` returned by
the last evaluation of the block.

{{% columns ratio="1:1" %}}
**The `ifelse` operation**
```goat
                     inputs   Bool
                       | |    .
    .-------. if       | |   /  else .-------.
    | block +--.       | |  /     .--+ block |
    '--+-+--'   |      | | |     |   '--+-+--'
       | |      |      | | |     |      | |
       | |      |      v v v     |      | |
       v v      |   .--------.   |      v v
   .---------.   '->| ifelse |<-'   .---------.
   | if-code |      '---+----'      |else-code|
   '----+----'          |           '----+----'
        |               |                |
        v               |                v
    .--------.          |            .--------.
    | return |          v            | return |
    '--------'       outputs         '--------'
```
<--->
**The `dowhile` operation**
```goat
            inputs                              
              | |      
              | |           .-------.          
              | |        .--+ block |
              | |       |   '--+-+--'
              | |       |      | |
              v v       |      | |
          .---------.   |      v v
          | dowhile |<-'  .-----------.
          '---+-+---'     | loop-code |
              | |         '--+-+---+--'
              | |            | |   | repeat?
              | |            v v   v 
              | |           .--------.
              v v           | return |
            outputs         '--------'
```
{{% /columns %}}
This approach can be extended to support virtually any control flow primitives,
as required by the available programming language abstractions.
For the purposes of minIR, we will contend ourselves with the three constructs
just introduced.

---

All the concepts introduced here also embed themselves very easily within the
MLIR-based quantum IRs, as well as the HUGR IR.
By waiving goodbye to the circuit model, we have been able to integrate much
of the theory of traditional compiler design and has brought us much closer
to traditional compiler research and the large scale software infrastructure
that is already available.
This naturally gives us access to all the classical optimisation and program
transformation techniques that were developed over decades. Using structured
control flow, we were also able to model linear resources such as qubits
well---by using value semantics and SSA, checking that no-cloning is not
violated is as simple as checking that each linear value is used exactly once.

Finally, this new design is also extremely extensible. Not only does it 
support arbitrary operations, the type system is very flexibel, too. There is
dedicated support for linear types, but this does not have to be restricted
to qubits: lists of qubits could be added or even, depending on the target
hardware, higher dimensional qudits, continuous variable quantum data, etc.

These new possibilities bring with them a host of new challenges. The main focus
of the rest of this thesis is to build a new platform form quantum compiler 
optimisations on top of minIR.
In this sense, our toy IR serves as the minimum denominator across IRs and
compiler technologies, so that proposals and contributions we are about to make
can be applied regardless of the underlying technical details.

But before we proceed to doing that, a burning question must be addressed:
how will all the advanced quantum compiler optimisations developed so far with
mostly a circuit model in mind transfer to IR-based representations?
To answer this, let us spend the rest of this chapter surveying some of
the most promising quantum (and to a limited extent classical)
compiler optimisations.