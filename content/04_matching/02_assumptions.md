+++
title = "Preliminaries and simplifying assumptions"
layout = "section"
weight = 2
slug = "sec:simplifying-assumptions"
+++

For simplicity, we will throughout consider minIR graphs that admit a type
system $\Sigma$, though most of the results can also be adapted to other graph
domains.

#### Linear paths and operation splitting

An operation type $\nu \in \Gamma$ in the type system $\Sigma$ is a hyperedge.
Its endpoints $def(\nu)$ and $use(\nu)$ are strings of data types that define
the input and output signature of the operation $\nu$. We can refer to the set
of all hyperedge endpoints of $\nu$ using the string indices
$\mathrm{Idx}(\cdot)$ ($\sqcup$ denotes the disjoint set union):

$$P_\nu = \mathrm{Idx}(def(\nu)) \sqcup \mathrm{Idx}(use(\nu)).$$

Fix a partition of $P_\nu$ into disjoint pairs

$$P_\nu = \{p_1, p_1'\} \,\sqcup\, \{p_2, p_2'\} \,\sqcup\, \cdots,$$

where the last set of the partition may be a singleton if $|P_\nu|$ is odd. For
every $\nu \in \Gamma$, we then define $f = \lceil |P_o| / 2 \rceil$ new _split
operation types_ $\nu_1, \dots, \nu_f$, each with two endpoints: the $i$-th
operation type $\nu_i$ has endpoints $p_i$ and $p_i'$ in $P_\nu$. For every
operation $o \in O$ of type $\nu$, we can then _split_ $o$ into $f$ operations
$o_1, \dots, o_f,$ each of arity 2 and of types $\nu_1, \dots, \nu_f$
respectively. We will refer to the graph transformation that replaces an
operation $o$ in a minIR graph with the operations $o_i$ for
$1 \leqslant i \leqslant f$ as _operation splitting_.

<!-- prettier-ignore-start -->
{{< figure
    src="svg/operation-split.svg"
    alt="Operation splitting"
    caption="Splitting an operation with 3 uses and 2 defines. The choice of endpoint partition made here, obtained by pairing the $i$-th use with the $i$-th define, is arbitrary, although often a \"natural\" choice."
    width="50%"
>}}
<!-- prettier-ignore-end -->

The endpoint partitions $P_\nu$ also define _linear paths_. Two values $v, v'$
in a minIR graph are on the same linear path if there are values
$u_1, \dots, u_k$ with $v = u_1$ and $v' = u_k$ such that $u_i$ is connected to
$u_{i+1}$ through an operation $o$ and they correspond to the same pair of
endpoints in the endpoints partition (i.e. the indices of $P_{type(o)}$
correspond to values $u_i$ and $u_{i+1}$ in $use(o) \sqcup def(o)$).

#### Linearity assumption

We impose a major restrictions on the general case of minIR graphs, namely that
all types in the type system $\Sigma$ must be linear[^graphiso]. Using this
assumption, every value has exactly one use and one define. As a result, all
linear paths are disjoint and form a partition of the values of the graph. They
correspond to the paths that form the connected components of the _fully split
graph_, i.e. the graph obtained by splitting every operation. We call the number
of linear paths (and hence the number of connected components in the fully split
graph) the graph _width_, written $width(G)$. We also use the linear path
decomposition to define _graph depth_, written $depth(G)$, as the longest linear
path in $G$.

[^graphiso]:
    This restriction is necessary: copyable values may admit an arbitrary number
    of adjacent hyperedges. As a result, minIR graph pattern matching with
    copyable values is a generalisation of the subgraph isomorphism problem, a
    well-known NP-complete problem @Cook1971. The approach generalises to
    non-linear types, but the complexity analysis no longer holds (we pay a
    computational price for every non-linear value matched).

As discussed in {{% reflink "sec-gts-def" %}}, minIR rewrites are instantiated
from transformation rules by minIR morphisms $\varphi: P \to G$. By assumption,
all values in $G$ are linear, and thus $\varphi$ is injective. We say $\varphi$
is an embedding and write it as $\varphi: P \hookrightarrow G$.

Finding such emeddings $P \hookrightarrow G$ is the _pattern matching problem_
that we are solving. This problem is equivalent to finding minIR subgraphs
$H \subseteq G$ of $G$ such that $H$ is isomorphic to the pattern $P \simeq H$.

#### Convexity

According to {{% refproposition "prop-fullrewrite" %}}, a necessary condition
for a subgraph $H$ to define a valid minIR rewrite is _convexity_. In this
chapter we weaken this requirement and propose a condition based on graph width:

<!-- prettier-ignore -->
{{< proposition title="Necessary condition for convexity" id="prop-convexity" >}}

Let $\varphi: P \hookrightarrow G$ be an embedding of a pattern $P$ into a minIR
graph $G$ with linear types such that $\varphi(P)$ is a convex subgraph of $G$.
Then for every subgraph $H \subseteq G$ such that $\varphi(P) \subseteq H$, it
holds that $width(P) \leq width(H).$

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

Up to isomorphism, we can assume $P \subseteq G$. Suppose there is
$H \subseteq G$ such that $P \subseteq H$ and $width(P) > width(H)$. Let
$\mathcal{L}_P, \mathcal{L}_H \subseteq \mathcal{P}(V)$ be partitions of $V_P$
and $V_H$ into sets of values that are on the same linear path of $P$ and $H$
respectively. It must hold that for all $\ell \in \mathcal{L}_P$ there is
$\ell' \in \mathcal{L}_H$ such that $\ell \subseteq \ell'$, because
$P \subseteq H$ and operation splitting is preserved under embeddings. As the
map from $\mathcal{L}_P$ to $\mathcal{L}_H$ cannot be injective, there must be
$\ell_1, \ell_2 \in \mathcal{L}_P$ and $\ell' \in \mathcal{L}_H$, such that
$\ell_1 \neq \ell_2$ and $\ell_1, \ell_2 \subseteq \ell'$. We conclude that
there must be a path in the fully split graph of $H$ between a value of $\ell_1$
and a value of $\ell_2$ that is not in the fully split graph of $P$. Given that
$P$ is convex, this path must be in $P$, which contradicts the preservation of
operation splitting under embeddings.

<!-- prettier-ignore -->
{{% /proof %}}

In this chapter, whenever we define a subgraph $H \subseteq G$ of a graph $G$,
we will assume that $H$ satisfies the above weakened convexity condition.

The converse of {{% refproposition "prop-convexity" %}}, however, is not true.
The pattern-matching technique presented below will find a strict superset of
convex embeddings. To restrict considerations to convex embeddings, it suffices
to filter out the non-convex ones in a post-processing step.

#### Ignoring minIR Hierarchy

So far, we have omitted discussing one part of the minIR structure: the nested
hierarchy of operations. Syntactically, the hierarchy formed by $parent$
relations between minIR operations can be viewed as just another value type that
operations are incident to: parent operations define an additional output that
children operations consume as additional input. Because of the bijectivity
requirement of minIR morphisms on parent-child relations of
{{% refdefinition "def-minir-morphism" %}}, these parent-child relations behave,
in fact, like linear values---and hence do not violate the linearity assumption
we have imposed.

However, by treating them as such, we have further weakened the constraints on
pattern embeddings. We do not enforce that boundary values must be in the same
regions or that parent-child relations cannot be boundary values. Similarly to
convexity, we defer checking these properties to a post-processing step.

#### Further (harmless) assumptions

We will further simplify the problem by making presentation choices that do not
imply any loss of generality. First of all, we assume that all patterns have the
same width $w$ and depth $d$, are connected graphs and have at least 2
operations. These conditions can always be fulfilled by adding "dummy"
operations if necessary. Embeddings of disconnected patterns can be computed one
connected component at a time.

We will further assume that all operations are on at most two linear paths (and
thus in particular, have at most 4 endpoints). Operations on $\Delta > 2$ linear
paths can always be broken up into a composition of $\Delta-1$ operations, each
on two linear paths as follows:

<!-- prettier-ignore-start -->
{{< figure
    src="svg/gate-decomp.svg"
    alt="Gate decomposition"
    caption="Expressing an operation on $\Delta = 3$ linear paths as a composition of two operations on 2 linear paths." width="70%">}}
<!-- prettier-ignore-end -->

This transformation leaves graph width unchanged but may multiply the graph
depth by up to a factor $\Delta$.

We furthermore define the set of all _port labels_

$$P_{all} = \bigcup_{\nu \in \Gamma} P_\nu$$

so that we can associate every operation endpoint in a minIR graph $G$ with a
_port label_ from the set $P_{all}$. We further endow the labels $P_{all}$ with
a total order (for instance, based on the string index values). The total order
on $P_{all}$ then induces a total order on the paths $v_1\cdots v_k \in V^\ast$
in $G$ that start in the same value $v_1$: the paths are equivalently described
the sequence of port labels of the operations traversed. These form strings in
$P_{all}^\ast$, which we order lexicographically. Given a root value $r$, for
every value $v$ in $G$ there is thus a unique smallest path from $r$ to $v$ in
$G$[^thisisdfs]. This path is invariant under isomorphism of the underlying
graph (i.e. relabelling of the values and operations but preserving the port
labels).

[^thisisdfs]:
    Remark that the ordering of the operations thus defined is a particular case
    of a depth-first search (DFS) ordering of the graph: given an operation $o$
    that has been visited, all its descendants will be visited before proceeding
    to any other operation.

With this we conclude the discussions of the specificities of minIR graphs
related to typing, linearity and hierarchy, and the related assumptions that we
are making. Syntactically, minIR graphs as they are considered in this chapter
are hypergraphs as defined in {{% refdefinition "def-hypergraph" %}} with the
following properties

- vertices are values, hyperedges are operations in the computation,
- every vertex is incident to at most two hyperedges. It is the target of at
  most one hyperedge (its _definition_) and the source of at most one hyperedge
  (its _use_),
- every hyperedge is incident to at most four vertices,
- every hyperedge can be _split_ in a unique way (and invariant under
  isomorphism) into at most two split operations, with each at most two
  endpoints.

Note that such hypergraphs also model subgraphs of minIR graphs, which may not
be valid minIR graphs themselves, because of missing hyperedge connections at
the boundary of the subgraph. In this case, we say a value is _open_ if a use or
define operation is missing (i.e. it is a boundary value in a minIR subgraph).

We will simplify refer to hypergraphs that satisfy the above assumptions as
_graphs_. In the unique instance of this chapter where a graph that does not
satisfy this construction is refered to, we will specifically call it a _simple
graph_.

We conclude with the following notable bound on graph width.

<!-- prettier-ignore -->
{{< proposition title="Bound on graph width" id="prop-widthbound" >}}

Let $G$ be a graph with $n_\textrm{odd}$ operations of odd arity (i.e.
$|def(o) + use(o)|$ is odd) and $n_\omega$ open values. Then, the graph width of
$G$ is

$$width(G) = \lfloor(n_\textrm{odd} + n_\omega) / 2\rfloor.$$

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

For any linear path $P \subseteq V^\ast$ in $G$ consider its two ends $v_1$ and
$v_2$, i.e. the two values in $P$ with only one neighbouring value in $P$ (by
definition linear paths cannot be empty). In the fully split graph of $G$, these
values are either open or must be connected to two operations. In the latter
case, at least one of the operations must have a single endpoint (otherwise by
acyclicity, the operation would have two neighbours).

In a fully split graph, operations with a single endpoint result from a split
operation with an odd number of endpoints. We conclude that for every linear
path, there are either two operations with an odd number of endpoints in $G$, or
one such operation and one open value, or two open values. The result follows.

<!-- prettier-ignore -->
{{% /proof %}}
