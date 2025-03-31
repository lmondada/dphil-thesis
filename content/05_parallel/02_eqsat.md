+++
title = "A closer look at equality saturation"
layout = "section"
weight = 2
slug = "sec:eqsat"
+++

Below, we provide a succinct introduction to equality saturation and discuss its
shortcomings in the context of quantum computation and graph rewriting in
general. For further details on equality saturation, we recommend the
presentation of @Willsey2021, its implementation @Willsey2025, and this blog
discussion @Bernstein2024.

Unlike a general-purpose compiler utility, equality saturation is specifically a
technique for term rewriting. Terms[^ast] are algebraic expressions represented
as trees, in which tree nodes correspond to operations, the children of an
operation are the subterms passed as arguments to the operation, and leaf nodes
are either constants or unbound variables. For instance, the term
$f(x \times 2, 3)$ would be represented as the tree:

[^ast]:
    Depending on the context, computer scientists also call them abstract syntax
    trees (AST)---for our purposes, it's the same thing.

{{% figure src="svg/term.svg" nobg="true" width="30%" %}}

This representation is particularly suited for any pure functional (i.e.
side-effect-free) classical computation. Every node of a term is identified with
its own term: the subterm given by the subtree the node is the root of. Given
term transformation rules, term rewriting consists of finding subterms that
match known transformation patterns. The matching subtrees can then be replaced
with the new equivalent trees.

In equality saturation, all terms obtained through term rewriting are stored
within a single persistent data structure. Term optimisation proceeds in two
stages. First, an exploration phase adds progressively more terms to the data
structure to discover and capture all possible terms that the input can be
rewritten to until _saturation_ (see below), or a timeout, is reached. In the
second phase, the saturated data structure is passed to an _extraction_
algorithm tasked with finding the term that minimises the cost function of
interest among all terms discovered during exploration.

The data structure that enables this is a generalisation of term trees. Just as
in terms, nodes correspond to operations and have children subterms
corresponding to the operation's arguments. To record that a new term obtained
through a rewrite is equivalent to an existing subterm, we extend the data
structure we employ to also store equivalence classes of nodes, typically
implemented as Union-Find data structures @Galler1964 @Cormen2009. If we, for
instance, applied the rewrite $x * 2 \mapsto x + x$ to the term above, we would
obtain

{{% figure src="svg/term-eq.svg" nobg="true" width="50%" %}}

Nodes within a grey box indicate equivalent subterms. This diagram encodes that
any occurrence of the `x * 2` term can equivalently be expressed by the `x + x`
term. Henceforth, when matching terms for rewriting, both the `*` term and the
`+` term are valid choices for the first argument of the `f` operation. Suppose,
for example, the existence of a rewrite $f(x + y, z) \mapsto f(x, y * z)$, then
this would match the above data structure, resulting in

{{% figure src="svg/term-eq-eq.svg" nobg="true" width="80%" %}}

A consequence of using equivalence relations in the data structure is that the
ordering in which the rewrites are considered and applied becomes irrelevant!

As presented, the exploration process would never terminate, and the data
structure size would grow indefinitely: as more rewrites are applied, more and
more terms are created, resulting in an ever-increasing set of possible rewrites
to be considered and processed. Equality saturation resolves this by enforcing a
term uniqueness invariant: every term or subterm explored is expressed by
exactly one node in the data structure. We can see in the above example that
this is currently not the case: the term $x$ for instance, is present multiple
times---so is $3$. As a result, the nodes no longer form a forest of trees but
instead directed acyclic graphs:

{{% figure src="svg/term-eq-eq-shared.svg" nobg="true" width="80%" %}}

This is commonly known as _term sharing_, and the resulting data structure is
known as a _term graph_ @Willsey2021. Maintaining this invariance is not hard in
practice: whenever a new term is about to be added by applying a rewrite, it
must first be checked whether the term exists already---something that can be
done cheaply by keeping track of all hashes of existing terms. In the
affirmative case, rather than adding a new term to the matched term's
equivalence class, both terms' classes must be merged.

It might be that equivalence classes must be merged recursively: given the terms
$f(x, 3)$ and $f(y, 3)$, if the classes of $x$ and $y$ are merged (and thus $x$
and $y$ have been proven equivalent), then the classes of their respective
parent $f(x, 3)$ and $f(y, 3)$ must also be merged. Doing so efficiently is
non-trivial, so we will not go into details here and refer again to
@Willsey2021.

In the absence of terms of unbounded size, the uniqueness invariant guarantees
that the exploration will eventually _saturate_: as rewrites are applied, there
will come a point where all equivalent terms have been discovered, i.e. every
applicable rewrite will correspond to an equivalence within an already known
class, thereby not providing any new information. This marks the end of the
exploration phase[^timeout].

[^timeout]:
    Of course, it is also practical to include a timeout parameter in
    implementations to guarantee timely termination even on large or ill-behaved
    systems.

Term optimisation then proceeds to the extraction phase. Reading out an
optimised term out of the saturated term data structure is not trivial. For
every equivalence class in the data structure, a representative node must be
chosen so that the final term, extracted recursively from the root by always
selecting the representative node of every term class, minimises the desired
cost function[^sharing].

[^sharing]:
    Note that we are omitting a subtle point here that arises due to term
    sharing: depending on the cost function, choosing different representative
    nodes for the same class could be favourable for the other occurrences of
    the term in the computation.

The strategy for choosing representative terms depends heavily on the cost
function. In simple cases, such as minimising the total size of the extracted
term, this can be done greedily in reverse topological order, i.e. proceeding
from the leaves towards the root @Willsey2021. There are also more complex
cases, however: if the cost function allows for the sharing of subexpressions
that may be used more than once in the computation, for instance, then finding
the optimal solution will require more expensive computations such as solving
boolean satisfiability (SAT) or Satisfiability Modulo Theories (SMT) problem
instances @Biere2021.

#### Equality saturation on graphs?

Equality saturation is a fast-developing subfield of compilation with a growing
list of applications. Unfortunately for us[^thesis], adapting these ideas to
quantum computation (and graph rewriting more generally) presents several
unsolved challenges.

[^thesis]: but fortunately for this thesis

The root of the problem lies in the program representation. The minIR
representation we presented in {{< reflink "sec:graph-defs" >}}---but also the
quantum circuit representation---captures quantum computations, not as a term,
but in a directed acyclic graph (DAG) structure.

A generalisation of equality saturation to computation DAGs was studied in
@Yang2021 in the context of optimisation of computation graphs for deep
learning. Their approach is based on the observation that the computation of a
(classical) computation DAG can always be expressed by a term for each output of
the computation. Consider, for example, the simple computation that takes two
inputs `(x, y)` representing 2D cartesian coordinates and returns its equivalent
in polar coordinates `(r, θ)`.

{{% figure src="svg/polar.svg" nobg="true" width="50%" %}}

By introducing two operations $\textit{polar}_r$ and $\textit{polar}_\theta$
that compute $\textit{polar}$ and subsequently, discard one of the two outputs,
the DAG can equivalently be formulated as two terms

{{% figure src="svg/polar-split.svg" nobg="true" width="70%" %}}

corresponding to the two outputs `r` and `θ` of the computation. This involves
temporarily duplicating some of the data and computations in the DAG---though
all duplicates will be merged again in the term graph due to the term sharing
invariant.

This duplicating and merging of data is fundamentally at odds with the
constraints we must enforce on linear data, such as quantum resources. Each
operation (or data) of a DAG that is split into multiple terms introduces a new
constraint that must be imposed on the extraction algorithm: a computation DAG
will only satisfy the _no-discarding_ theorem ({{% reflink "sec:basics" %}}) for
linear values if, for each split operation it contains, it either contains all
or none of its split components.

To illustrate this point, consider the following simple rewrite on quantum
circuits that pushes X gates ($\oplus$) from the right of a CX gate to the left:

{{% figure src="/svg/simple-cx-rule.svg" nobg="true" width="50%" %}}

Both the left and right hand sides would be decomposed into two terms, one for
each output qubit. The left terms could be written as

$$X(CX0(0, 1)) \quad\textrm{and}\quad CX1(0, 1)$$

whereas the right terms would be

$$CX0(X(0), X(1)) \quad\textrm{and}\quad CX1(X(0), X(1)).$$

We introduced the term $X(\cdot)$ for the single-qubit X gate and two terms
$CX1(\cdot, \cdot)$ and $CX2(\cdot, \cdot)$ for the terms that produce the
first, respectively second, output of the two-qubit CX gate. $1$ and $0$ denote
the input qubits of the computation. This would be interpreted as two different
rewrites

$$\begin{aligned}X(CX0(0, 1)) &\mapsto CX0(X(0), X(1))\\\textrm{and}\quad CX1(0, 1) &\mapsto CX1(X(0), X(1)).\end{aligned}$$

Unlike classical computations, however, either of these rewrites on their own
would be unphysical: there is no implementation of either split operations $CX0$
or $CX1$ on their own. We would thus have to enforce at extraction time that for
every application of this pair of rewrite rules, either both or none of the
rewrites are applied.

Conversely, satisfying the _no-cloning_ theorem requires verification that
during extraction, terms that share a subterm but correspond to distinct graph
rewrites are never selected simultaneously---otherwise, the linear value
corresponding to the shared subterm would require cloning to be used twice.

The no-discarding and no-cloning restrictions result in a complex web of `AND`
respectively `XOR` relationships between individual terms in the term graph.
These constraints _could_ be ignored during the exploration phase and then be
modelled in the extraction phase by an integer linear programming (ILP) problem.
However, @Yang2021 observed that this approach causes the term graph to encode a
solution space that grows super-exponentially with rewrite depth (see Fig. 7 in
@Yang2021), rendering the ILP extraction problem computationally intractable
beyond 3 subsequent rewrites. Recent work has attempted to tackle this issue
using reinforcement learning @Barbulescu2024.

#### Linearity-preserving rewrites are an exponentially small subset

A simple calculation shows that in the case that all values in the computation
graph are linear and only graphs up to a maximal size are considered, the number
of possible rewrites only grows exponentially in the rewrite depth. In other
words, for optimisation of quantum computations, the solution space of valid
computations is _much_ smaller[^superexpsmaller] than the space explored by the
equality saturation approach of @Yang2021.

[^superexpsmaller]:
    Exponential is super-exponentially smaller than super-exponential! Or put
    mathematically $e^{o(n)}/e^{\Theta(n)} = e^{o(n) - \Theta(n)} = e^{o(n)}$.

Indeed suppose there is a maximal graph size $|V(G)| \leqslant \Theta$ and
suppose that all rewrite patterns, i.e. the subgraph induced by the vertex
deletion set $V^-$ of a rewrite, are connected. This is an assumption that was
also made in {{% reflink "chap:matching" %}}, see
{{% reflink "sec:simplifying-assumptions" %}} for a discussion.

In a computation graph of linear values $G$, every vertex (value in the
computation) $v \in V(G)$ has a _unique_ incoming and outgoing edge. This means
that any pattern embedding $\varphi: P \hookrightarrow G$ is uniquely defined by
the image $\varphi(v_P)$ of a single vertex $v_P \in V(P)$. Thus for a GTS with
$m$ transformation rules, there can be at most a constant number

$$m \cdot |V(G)| \leqslant m \cdot \Theta =: \alpha$$

of possible rewrites that can be applied to any graph $G$. Let $\mathcal{G}_d$
be the set of all graphs that can be reached in the GTS in at most $d$ rewrites
from some input graph $G_0$. $\mathcal{G}_{d+1}$ is the set of all graphs
obtained by applying a rewrite to a graph $G \in \mathcal{G}_d$. Thus we have
the relation:

$$|\mathcal{G}_{d+1}| \leqslant \alpha \cdot |\mathcal{G}_d|,$$

The total number of rewrites $R_d$ that can be applied on any graph in
$\mathcal{G}_d$ is thus

$$R_d \leqslant \alpha \cdot |\mathcal{G}_d| = O(e^{\alpha \cdot d}).$$

---

In summary, equality saturation is a specialisation of persistent data
structures uniquely suited to the problem of term rewriting. It succinctly
encodes the space of all equivalent terms, and using term sharing does away with
the need to apply equivalent rewrites on multiple copies of the same term, which
inevitably occurs on more naive rewriting approaches.

However, equality saturation cannot model rewrites that require deleting parts
of the data. This is not a problem for terms representing classical operations,
as data can always be implicitly copied during exploration and discarded during
extraction as required. This is not the case for quantum computations---and for
graph rewriting in general, where explicit vertex (and edge) deletions are an
integral part of graph transformation semantics.

As a result, numerous constraints would have to be imposed to restrict the
solution space encoded by term graphs to valid outcomes of graph rewriting
procedures. This would make extraction algorithms complex and cumbersome. More
importantly, we showed that in the case of computation graphs on linear values,
such as quantum computations, the solution space explored by equality saturation
is _super-exponentially larger_ than the space of valid computations, rendering
the extraction algorithm and meaningful exploration of the relevant rewriting
space computationally intractable.
