+++
title = "Selected techniques in modern classical compilation"
template = "section"
weight = 5
+++

Optimisations in compilers are typically built as passes.
Compiler authors then design sequences of these passes to create the default
optimisation pipelines that most end-users rely on.
This is not easy.
For a large project like LLVM, the end result looks something
[like this](https://github.com/llvm-mirror/llvm/blob/2c4ca6832fa6b306ee6a7010bfb80a3f2596f824/lib/Transforms/IPO/PassManagerBuilder.cpp)---a thousand lines of meticulously commented code,
carefully crafted and hand tuned to handle every optimisation
edge case and perform well on thousands of benchmarks.
This is the phase-ordering problem @Click1995&#x200B;---one of the hardest problems in classical compilation. 

Quantum compilers are not immune to this, either. 
The same pass ordering sorcery [can be found just as well in TKET](https://github.com/CQCL/tket/blob/5f7af8d97d81c620071e8b639a694b3a7135e2f8/tket/src/Transformations/OptimisationPass.cpp#L43), a
leading quantum compiler @Sivarajah2020.
It does not look quite as scary yet, but the code is growing and some passes
are already being called three times within the default sequence.
This is hard to maintain and any change and new feature comes at the risk
of degrading the compiler performance on established use cases.

If we are serious about adopting classical compiler tooling for quantum computations,
we will need to find a more convincing solution to this problem.
Fortunately, classical compilation is a mature field that has already experienced
(and solved!) most of the challenges that quantum compilers have faced, and will ever face,
in peephole optimisation.
Our proposal, described in {{< reflink "/04_rewriting" >}}, combines two modern compilation techniques
that mitigate this and which we will review now: Superoptimisation and Equality saturation.

### Superoptimisation

Large compiler projects support a multitude of program representations and
large sets of operations/instructions to be able to generate code for a wide
array of devices and architectures.
Designers of optimising compiler passes must thus necessarily put constraints
on the program input format that the pass will accept.
In all likelihood, the pass will furthermore only be applicable for certain
cost functions or for a limited set of hardware target.
This all leads to a proliferation of special purpose compiler passes that are
bug-prone and must be carefully ordered to perform well across all the use
cases of interest.
On top of this, new instruction sets, architectures or new cost functions
require new sets of compiler passes, in effect rebuilding the entire compilation
pipeline.

As early as 1979, Fraser suggested deriving peephole optimisations
automatically @Fraser1979,
an idea Massalin coined superoptimisation @Massalin1987.
Instead of hard-coding the peephole optimisations as passes to be ordered and
executed, useful valid program transformations are synthesised automatically.
Early work used probabilistic verification, which meant that program
transformations were generated ahead of time, and once verified manually,
added to the compiler for use in optimisation @Massalin1987 @Sands2011.
With advances in theorem proving techniques, 
program transformation synthesis and verification was further automated,
resulting in end-to-end automatically generated and proven compiler
transformations @Bansal2006 @Sasnauskas2017.

A particularly simple superoptimising compiler design was proposed in @Jia2019,
specially for the purposes of computation graph optimisation @Fang2020
in deep learning.
The set of all small programs, up to a threshold, is generated ahead of time and
partitioned into disjoint classes of equivalent programs.
This concisely expresses every possible peephole optimisation up to the specified
size: for every small enough subset of instructions of an input program,
its equivalence class can be determined.
Any replacement of that set of instructions with another program in the same
equivalence class 
is a valid transformation, and thus a potential peephole optimisation.

This framework was adapted to quantum circuit optimisation
in @Xu2022 and separately in @Xu2023.
On top of excellent performance, this approach is extremely flexible.
For any supplied cost function, the compiler can explore all valid
program transformations
to find the sequence of transforms that minimise cost.
This keeps the cost function-specific logic separate from the transformation
semantics of the program, making it straightforward to replace or update the
optimisation objective.

Furthermore, the set of supported primitives and architectures can easily be
extended at any time by supplementing the equivalence classes with new programs.
Any input using this extended set of primitives can thus be successfully compiled
and any output program format constraints can be enforced by restricting the
set of valid transformations.

The adaptation of superoptimisation to quantum optimisation of @Xu2022 and
@Xu2023 is however showing scaling difficulties:
unlike classical superoptimisation which is usually designed to optimise
small subroutines within programs, e.g. focusing on arithmetic instructions,
single instruction multiple data (SIMD) etc., the technique should in principle
be able to optimise quantum programs in their entirety. This leads to
much larger programs that superoptimisation does not scale well to.
An orthogonal scaling challenge has also been observed: in @Xu2022,
optimisation performance was observed to improve markedly with
larger sets of rewrite rules.
However, each rewrite rule requires a separate run of pattern matching to
find all possible applications.
As a result, performance peaks at around 50 000 rewrite rules, after which the
additional overhead from pattern matching becomes dominant, deteriorating the
compilation results.

### Equality saturation

Superoptimisation resolves half of the phase ordering problem: it stops the
proliferation of a multitude of hardware or input specific passes, replacing
it instead with one, extensible and unified local rewrite-based compiler platform.
However, in a sense it makes the other half of the problem worse: instead of 
building a compilation pipeline from a library of manually written passes,
superoptimising compilers must discover sequences of rewrites out of a much
larger pool of automatically generated transformations!

Equality saturation removes the phase ordering problem altogether.
The technique was first proposed in @Tate2009.
A modern implementation of it was presented in @Willsey2021.
We will provide a succinct introduction to equality saturation below, but
recommend the presentation of @Willsey2021 to the interested 
reader, as well as its implementation @Willsey2025 and this blog
discussion @Bernstein2024.
Finally, in spite its theoretical origins, equality saturation is also
(slowly) making it into production compilers @Fallin2022.

Unlike a general purpose compiler utility, equality saturation is specifically
a technique for term rewriting.
Terms[^ast], are algebraic expressions represented as trees, in which tree
nodes correspond to operations, the children of an operation are the subterms
passed as arguments to the operation and leaf nodes are either constants
or unbound variables
[^ast]: Depending on the context, computer scientists also call them
abstract syntax trees (AST)---it's the same thing.
```goat
                      .-.
                     | f |                                 
                      '+'
                       |
                       +
                      / \
                   .-.   .-.
                  | ✱ | | 3 |       The term f(x ✱ 2, 3)                            
                   '+'   '-'
                    |
                    +
                   / \
                .-.   .-.
               | x | | 2 |
                '-'   '-'
```
This representation is particularly suited representation for any functional
(i.e. side effect free) classical computation.
Every node of a term is identified with a term of its own: the subterm given
by the subtree the node is the root of.
Given equivalences between terms, term rewriting consists of finding 
subterms that match known equivalences. The matching subtrees are then be
replaced with the new equivalent trees.

The core of equality saturation is a data structure that stores the
term being compiled, along with the result of every possible rewrite that could
be applied to it or to any of its subterms.
Term optimisation proceeds in two stages. First, an exploration phase
adds progressively more terms to the data structure in order to discover and capture
all possible terms that the input can be rewritten to, until
_saturation_ (see below), or a timeout, is reached.
In the second phase, the saturated data structure is passed to an _extraction_
algorithm, tasked with finding the term that minimises the cost function of
interest among all terms discovered during exploration.

The data structure that enables this is a generalisation of term trees. Just
as in terms, nodes correspond to operations and have children subterms that 
correspond to the arguments of the operation.
However, the data structure is persistent: when applying a rewrite, existing
terms are never removed and thus information in the data structure is never lost.
Instead, the new term introduced by a term rewrite is added to the data structure
while the term that was matched remains unchanged.
To record that both terms are equivalent, we extend the data structure we employ
to also store equivalence classes of nodes, typically implemented as
Union-Find data structures @Galler1964 @Cormen2009.
If we for instance applied the rewrite $x * 2 \mapsto x + x$ to the term above,
we would obtain
```goat
                                            .-.
                                           | f |                                 
                                            '+'
                                             |
                                             +
                                            / \
                           .-.           .-.   .-.
                          | ➕ |<------->| ✱ | | 3 |                             
                           '+'           '+'   '-'
                            |             |      
                            +             +
                           / \           / \
                        .-.   .-.     .-.   .-.
                       | x | | x |   | x | | 2 |
                        '-'   '-'     '-'   '-'
```
This diagram encodes that any occurence of the `x * 2` term can
equivalently be expressed by the `x + x` term.
Henceforth, when matching terms for rewriting, both the `*` term and the
`+` term are valid choices for the first argument of the `f` operation.
Suppose for example the existence of a rewrite $f(x + y, z) \mapsto f(x, y * z)$,
then this would match in the above data structure resulting in
```goat
                                       .-.            .-.
                                      | f |<-------->| f |       
                                       '+'            '+'
                                        |              |
                                        +              +
                                       / \            / \
                      .-.           .-.   .-.      .-.   .-.
                     | ➕ |<------->| ✱ | | 3 |    | x | | ✱ |                      
                      '+'           '+'   '-'      '-'   '+'
                       |             |                    |
                       +             +                    +
                      / \           / \                  / \
                   .-.   .-.     .-.   .-.            .-.   .-.
                  | x | | x |   | x | | 2 |          | x | | 3 |
                   '-'   '-'     '-'   '-'            '-'   '-'
```

A consequence of persistency and the use of equivalence relations is that
the ordering in which the rewrites are considered and applied becomes totally 
irrelevant!
As presented, the exploration process would however never terminate and the
data structure size would grow indefinitely: as more
rewrites are applied, more and more terms are created, resulting in an ever
increasing set of possible rewrites to be considered and processed.
Equality saturation resolves this by enforcing a term uniqueness invariant:
every term or subterm that is explored is expressed by exactly one node in
the data structure.
We can see in the above example that this is currently not the case: the term
$x$ for instance, is present multiple times---so is $3$.
As a result, the nodes no longer form a forest of trees, but instead a directed
acyclic graphs:
```goat
                                       .-.            .-.
                                      | f |<-------->| f |       
                                       '+'            '+'
                                        |              |
                                        +              +
                                       / \            / \
                      .-.           .-.   \        .-.   \
                     | ➕ |<------->| ✱ |   \      | ✱ |   |                    
                      '+'           '+'     \      '+'    |
                       |             |       \      |     |
                       +             +        \     +     |
                      / \           / \        \   / \    .
                     .   \         /   .-.      .-.   .  /
                      \   \       .   | 2 |    | 3 | /  /         
                       \   \     .+.   '-'      '-' /  /           
                        \   '---+   +--------------'  /            
                         '------+ x +----------------'
                                 '-'
```
This is commonly known as _term sharing_, or _term graphs_ @Willsey2021.
Maintaining this invariance is not hard in practice: whenever a new term is about
to be added by the application of a rewrite, it must first be checked whether
the term exist already---something that can be done cheaply by keeping
track of all hashes of existing terms.
In the affirmative case, rather than adding a new term to the equivalence class
of the matched
term, the entire class of the existing node must be merged into it.

Note that when term sharing, it might be that not only the equivalence classes
of the two terms must be merged, but also that merging of classes must be done
recursively: given the terms $f(x, 3)$ and $f(y, 3)$, if the classes of $x$ and
$y$ are merged (and thus $x$ and $y$ have been proven equivalent), then the
classes of their
respective parent $f(x, 3)$ and $f(y, 3)$ must also be merged.
Doing so efficiently is non-trivial, so we will not go into details here
and refer again to @Willsey2021.

In the absence of terms of unbounded size, the uniqueness invariant guarantees that
the exploration will eventually _saturate_: as rewrites are applied, there will
come a point where all equivalent terms have been discovered, i.e. every
applicable rewrite will correspond to an equivalence within an already known class,
thereby not providing any new information.
This marks the end of the exploration phase[^timeout].
[^timeout]: Of course, it is practical to also include a timeout parameter in
implementations to guarantee timely termination even on large or ill-behaved
systems.

The optimiser may then proceed to the extraction phase.
It is not trivial to read out an optimised term out of the saturated term
data structure.
For every equivalence class in the data structure, a representative node must
be chosen in such a way that the final term, extracted recursively from the 
root by always choosing the representative node of every term class, minimises
the desired cost function[^sharing].
[^sharing]: Note that we are omitting a subtle point here that arises due to
term sharing: depending on the cost function, it could be favourable to choose
different representative nodes for the same class, for the different occurences
of the term in the computation.

The strategy for choosing representative terms depends heavily on the cost
function.
In simple cases, such as minimising the total size of the extracted term,
this can be done greedily in a reverse topological order,
i.e. proceeding from the leaves towards the root @Willsey2021.
There are also more complex cases, however: if the cost function allows
for sharing of subexpressions that may be used more than once in the computation,
for instance,
then finding the optimal solution will require more expensive computations such
as solving boolean satisfiability (SAT) or Satisfiability Modulo Theories (SMT)
problem instances @Biere2021.

#### Quantum programs: trouble in paradise?

Equality saturation is a fast developing subfield of compilation sciences with
a growing list of applications.
Unfortunately for us[^thesis], adapting the ideas to
quantum computation presents several unsolved challenges.
[^thesis]: but fortunately for this thesis

The root of the problem lies in the program representation.
Fundamentally, the `minIR` representation we sketched out in
{{< reflink "/03_compiler/03_toyir" >}}---but also the quantum circuit
representation---capture quantum computations, not as a term, but in a
directed acyclic graph (DAG) structure.

This issue was studied by @Yang2021 in the context of tensor graphs optimisation.
They propose decomposing computation DAGs into a tuple of (overlapping) terms,
one for each output of the computation.
In theory, this should allow for the full use of the equality saturation
workhorse with very minimal adjustements.
In their application, however, they found exponential size increases in the term data
structure used as a result of the
cartesian product between the decomposed terms of DAG rewrite rules and had
to limit the number of applications of multi-term rewrite rules to 2 for
performance reasons.

DAG rewriting also introduces new issues in the extraction phase of equality
saturation.
The authors of @Yang2021 show that multi-term rewrites can introduce
cycles in the term data
structure, which are expensive to detect and account for in the extraction algorithm.
Finally, such rewrites result in large overlaps between terms. This means that
greedy divide-and-conquer extraction heuristics that do not model cost
savings from subexpression sharing perform poorly, necessitating the use of
more compute intensive SMT techniques for competitive results.

To make matters worse, there are also quantum-specific difficulties in using
equality saturation.
Term sharing and the hash-based uniqueness invariant enforced by the term data
structure is fundamentally at odds with the linearity of quantum resources.
At extraction time, all linear resources would have to be carefully tracked.
Additional constraints would have to be added to ensure that expressions that
depend on the same linear resources are mutually exclusive. Conversely, we would have
to guarantee that for all terms that make up a multi-term rewrite, the linear
resources used on their overlaps coincide.

Consider for instance the following simple rewrite that pushes X gates ($\oplus$)
from the right of a CX gate to the left:
<div class="book-columns flex" style="align-items: center;">
  <div class="flex-even markdown-inner">
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1 }],
    "operations": [
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "targets": [{ "qId": 0 }]
         }
    ]
}
{{< /qviz >}} 
  </div>
  <div style="min-width: 16px; margin: 0 -40px;">
    <svg width="16" height="16" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2L6 4L4 6" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <div class="flex-even markdown-inner">
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1 }],
    "operations": [
         {
            "gate": "X",
            "targets": [{ "qId": 0 }]
         },
         {
            "gate": "X",
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }]
         }
    ]
}
{{< /qviz >}}
  </div>
</div>

Both the left and right hand sides would be decomposed into two terms, one
for each output qubit. The left terms could be written as
$$X(CX0(0, 1)) \quad\textrm{and}\quad CX1(0, 1)$$
whereas the right terms would be
$$CX0(X(0), X(1)) \quad\textrm{and}\quad CX1(X(0), X(1))$$
where we introduced the term $X(\cdot)$ for the single-qubit X gate
and two terms $CX1(\cdot, \cdot)$ and $CX2(\cdot, \cdot)$ for the terms
that produce the first, repsectively second, output of the two-qubit
CX gate. $1$ and $0$ denote the input qubits of the computation.
This would be interpreted as two different rewrites
$$\begin{aligned}X(CX0(0, 1)) &\mapsto CX0(X(0), X(1))\\\textrm{and}\quad CX1(0, 1) &\mapsto CX1(X(0), X(1))\end{aligned}$$
but the crucial point is: unlike classical computations,
we would have to enforce at extraction time that for every set of applicable gates,
either both or none of these rewrites are applied.
Otherwise, the extracted program would be unphysical.

This problem is further compounded by quantum entanglement.
Indeed, consider the rewrite rule above applied to the second and third gate
of the following circuit:
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1 }],
    "operations": [
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "targets": [{ "qId": 0 }]
         }
    ]
}
{{< /qviz >}} 
With some creative drawing, we can represent the resulting equality saturation
data structure containing both the circuit before and after the rewrite as
follows.
{{< figure
  src="svg/superposed.svg"
  alt="A superposed circuit"
  caption="A sketch of an equality saturation data structure containing two versions of a circuit, before and after a rewrite. The two alternatives are represented by \"splitting\" each qubit wire. The top-most split wires correspond to the original circuit, the bottom-most split wires correspond to the circuit after the rewrite."
  width="70%"
>}}
Now, suppose the existence of another rewrite rule, given by
<div class="book-columns flex" style="align-items: center;">
  <div class="flex-even markdown-inner">
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1 }, { "id": 2 }],
    "operations": [
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 2 }]
         },
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "targets": [{ "qId": 0 }]
         },
         {
            "gate": "X",
            "targets": [{ "qId": 2 }]
         }
    ]
}
{{< /qviz >}} 
  </div>
  <div style="min-width: 16px; margin-left: -40px; margin-right: -20px;">
    <svg width="16" height="16" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 2L6 4L4 6" stroke="#666" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <div class="flex-even markdown-inner">
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1 }, { "id": 2 }],
    "operations": [
         {
            "gate": "X",
            "targets": [{ "qId": 0 }]
         },
         {
            "gate": "X",
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 2 }],
            "targets": [{ "qId": 1 }]
         },
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 2 }]
         },
         {
            "gate": "X",
            "isControlled": true,
            "controls": [{ "qId": 2 }],
            "targets": [{ "qId": 1 }]
         }
    ]
}
{{< /qviz >}}
  </div>
</div>

If during rewriting we ignore the linearity constraint that we mentioned above
in the context of the extraction procedure, the part of the diagram highlighted
in red would be a valid match of the left hand side.
Applying the rewrite to this match is not only unphysical, it is plain nonsensical:
{{< figure
  src="svg/superposed-rewritten.svg"
  alt="A superposed circuit"
  caption="The same equality saturation data structure after a second rewrite. For simplicity, we are not overlaying in the illustration the circuit between the first and second rewrite."
  width="70%"
>}}
This applies entangling gates between different versions of the same qubit!
In other words, linearity constraints would not only have to be taken into account
during extraction, but also to restrict pattern matching and rewriting during
exploration.