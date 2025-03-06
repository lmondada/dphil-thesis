+++
title = "A closer look at equality saturation"
layout = "section"
weight = 2
slug = "sec:eqsat"
+++

We provide a succinct introduction to equality saturation below, along with a discussion
of the shortcomings of the method in the context of quantum computation and graph
rewriting in general.
For further details on equality saturation,
we recommend the presentation of @Willsey2021
as well as its implementation @Willsey2025 and this blog
discussion @Bernstein2024.

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
This representation is particularly suited for any pure functional
(i.e. side effect free) classical computation.
Every node of a term is identified with a term of its own: the subterm given
by the subtree the node is the root of.
Given term transformation rules, term rewriting consists of finding
subterms that match known transformation patterns. The matching subtrees can then be
replaced with the new equivalent trees.

In equality saturation, all terms that are obtained through term rewriting
are stored within a single persistent data structure.
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
To record that a new term obtained through a rewrite is equivalent to an existing
subterm, we extend the data structure we employ
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

A consequence of the use of equivalence relations in the data structure is that
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
the term exists already---something that can be done cheaply by keeping
track of all hashes of existing terms.
In the affirmative case, rather than adding a new term to the equivalence class
of the matched
term, the classes of both terms must be merged.

It might be that equivalence classes must be merged recursively:
given the terms $f(x, 3)$ and $f(y, 3)$, if the classes of $x$ and
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

Term optimisation then proceeds to the extraction phase.
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

#### Equality saturation on graphs?

Equality saturation is a fast developing subfield of compilation sciences with
a growing list of applications.
Unfortunately for us[^thesis], adapting the ideas to
quantum computation (and graph rewriting more generally)
presents several unsolved challenges.
[^thesis]: but fortunately for this thesis

The root of the problem lies in the program representation.
The minIR representation we presented in
{{< reflink "sec:graph-defs" >}}---but also the quantum circuit
representation---capture quantum computations, not as a term, but in a
directed acyclic graph (DAG) structure.

A generalisation of equality saturation to computational DAGs
was studied in @Yang2021, in the context of optimisation of
computational graphs for deep learning.
Their approach is based on the observation that the computation of a (classical)
computational DAG can always be expressed by a term for each output
of the computation.
Consider for example the simple computation that takes two inputs `(x, y)`
representing 2D cartesian coordinates and returns its equivalent in polar
coordinates `(r, θ)`.
```goat
         .----------.
x ------>+          +------> r
         | to_polar |
y ------>+          +------> θ
         '----------'
```
By introducing two operations `to_polar_r` and `to_polar_theta` that
compute `to_polar` and subsequently discard one of the two outputs,
the DAG can equivalently be formulated as two terms
```goat
      .--------.       .------------.
     |to_polar_r|     |to_polar_theta|
      '---+----'       '-----+------'
         / \                / \
      .-.   .-.          .-.   .-.
     | x | | y |        | x | | y |
      '-'   '-'          '-'   '-'
```
corresponding to the two outputs `r` and `θ` of the computation.
This involves temporarily duplicating some of the data and computations in
the DAG---though all duplicates will be merged again in the term graph as a result
of the term sharing invariant.

This duplicating and merging of data is fundamentally at odds with the
constraints that we must enforce on linear data such as quantum resources.
Each operation (or data) of a DAG that is split into multiple terms
introduces a new constraint that must be imposed on the extraction algorithm:
a computational DAG will only satisfy _no-discard_ for linear values
if for each split operation it contains, it either contains all or none
of its splitted components.

To illustrate this point, consider the following simple rewrite on quantum circuits
that pushes X gates ($\oplus$)
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
$$CX0(X(0), X(1)) \quad\textrm{and}\quad CX1(X(0), X(1)).$$
We introduced the term $X(\cdot)$ for the single-qubit X gate
and two terms $CX1(\cdot, \cdot)$ and $CX2(\cdot, \cdot)$ for the terms
that produce the first, repsectively second, output of the two-qubit
CX gate. $1$ and $0$ denote the input qubits of the computation.
This would be interpreted as two different rewrites
$$\begin{aligned}X(CX0(0, 1)) &\mapsto CX0(X(0), X(1))\\\textrm{and}\quad CX1(0, 1) &\mapsto CX1(X(0), X(1)).\end{aligned}$$
Unlike classical computations, however, either of these rewrites on their own
would be unphysical: there is no implementation of either split operations
$CX0$ or $CX1$ on their own.
We would thus have to enforce at extraction time that for every application of this
pair of rewrite rules,
either both or none of the rewrites are applied.

Conversely, satisfying the _no-cloning_ principle requires verification that during
extraction, terms that share a subterm but correspond to distinct graph rewrites are never
selected simultaneously---otherwise the linear value that corresponds to the shared
subterm would require cloning to be used twice.

The no-discard and no-cloning restrictions result in a complex web of `AND` respectively `XOR`
relationships between individual terms in the term graph.
These constraints _could_ be ignored during the exploration phase and then be modelled
in the extraction phase by an integer linear programming (ILP) problem.
However, @Yang2021 observed that this approach causes the term graph
to encode a solution space that grows super-exponentially with rewrite depth
(see Fig. 7 in @Yang2021),
rendering the ILP extraction problem computationally intractable beyond 3 subsequent rewrites.

In constrast, in the absence of clonable values, we claim that the solution space
can only grow exponentially with rewrite depth[^superexpsmaller].
In other words:
[^superexpsmaller]: Exponential is super-exponentially smaller than super-exponential!
Or put mathematically $e^{o(n)}/e^{\Theta(n)} = e^{o(n) - \Theta(n)} = e^{o(n)}$.

{{< proposition >}}
Consider a term graph and for each term $t$ in the term graph
define $P(t)$, the set of all
uses of $t$,
i.e. all terms $t'$ such that $t$ is one of the children of the root of $t'$.
Suppose there are sets $A_{t,1}, \dots A_{t,n_t} \subseteq P(t)$ defined for each term $t$.

Say a set of terms $S$ is _linear_ if for every term $t$, either $S \cap P(t) = A_{t,i}$
for some $i$ or $S \cap P(t) = \emptyset$ and say a rewrite is linear if it applies on a linear set of terms.

After $d$ linear rewrites,
there will be at most $O(e^{\alpha \cdot d})$ applicable linear rewrites.

TODO: $A$ etc would depend on $d$...
{{< /proposition >}}
Note that this definition of linear rewrite corresponds exactly to the rewrites that are valid
if terms represent linear values.
The sets $A_{t,i}$ are then the sets of terms that result from a single graph rewrite, split into
several term rewrites.
The condition on sets $S$ then enforce that for all terms $t$,
if $t$ is used in the rewrite
then all term rewrites of exactly one graph rewrite must be applied.

{{% proof %}}
<!-- Let $\mathcal{G}_d$ be the set of all computational DAGs that can be reached from $G$ in the
GTS after $d$ rewrites. -->
For all $d \geqslant 0$, we consider the set $Val_d$ of all terms contained in the term graph
after $d$ linear rewrites.
<!-- and define
$$n_v = \left|\left\{G' \in \mathcal{G}_d \mid v \in G'\right\}\right|$$
if $v \in Val_d$ and $n_v = 0$ otherwise. -->

It is sufficient to count the number of valid linear sets of terms $S_d \subseteq Val_d$;
the total number of linear rewrites will then be in $O(|S_d|)$, given that the total number of
rewrite rules is a constant.
From the definition of linear in the proposition, we can derive that
$$|S_d| = \prod_{t \in Val_d} n_t + 1,$$
obtained by observing that for every value $v$, one of $n_t$ sets of parents can
be chosen, or none at all.

Applying a linear graph rewrite will introduce at most $p$ new parent sets
$A_{t_1, i_1}, \dots, A_{t_p, i_p}$,
where $p$ is the maximum number of inputs in any of the rewrite rules.
Writing $n_t'$ for the updated number of parent sets for each $t \in Val_{d+1}$
and $X = \{t_1, \dots, t_p\}$, we have
$n_t' = n_t + 1$ if $v \in X$, and $n_t' = n_t$ otherwise
(we introduce for convenience $n_t = 0$ if $t \in Val_{d+1} \smallsetminus Val_d$).
By defining
$$\alpha = 2^p \geqslant \prod_{t \in X} \frac{n_t + 1}{n_t},$$
we obtain the new bound after rewrite application $|S_{d+1}| < \alpha \cdot |S_d|$.
Finally, for $d=0$, we can bound $|S_0| \leq 2^|G|$, where $|G|$ is the number of
vertices in the input graph. The result follows.
{{% /proof %}}

In summary, equality saturation is a specialisation of persistent data structures
uniquely suited to the problem of term rewriting.
It succinctly encodes the space of all equivalent terms and using term sharing
does away with the need to
apply equivalent rewrites on multiple copies of the same term, which inevitably
occur on more naive rewriting approaches.

However, equality saturation is unable to model rewrites that require deletion of parts of the data.
This is not a problem for terms representing classical operations, as data
can always be implicitly copied during exploration and discarded during extraction
as required.
This is not the case for quantum computations---and for graph rewriting in general,
where explicit vertex and edge deletions are an integral part of graph transformation
semantics.

As a result, numerous constraints would have to be imposed to restrict the solution
space encoded by term graphs to valid outcomes of graph rewriting procedures.
This would make extraction algorithms complex and cumbersome. More importantly,
we showed that it also makes the solution space explored by equality saturation
_super-exponentially larger_ than the true solution space, rendering the extraction
algorithm and a meaningful exploration of the relevant rewriting space computationally
intractable.

<!-- We can thus define $n_v$ as the number of graph rewrites in the term graph that
use the value $v$. Each such rewrite corresponds to a set of terms in the term graph
that include $v$.

can only be used in the graph that results
from one graph rewrite (which may correspond to a set of terms).
For each value $v$ in the term graph, we can thus define $n_v$ as the number of
graphs in the term graph that







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
exploration. -->
