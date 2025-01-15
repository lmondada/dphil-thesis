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