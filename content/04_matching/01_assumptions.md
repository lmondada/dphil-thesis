+++
title = "Preliminaries and simplifying assumptions"
layout = "section"
weight = 1
slug = "sec:simplifying-assumptions"
+++

#### Linear paths and operation splitting

For every operation type $o \in \Gamma$ in the type system $\Sigma$ of the minIR
graphs, let us fix a partition of the edge endpoints $P_o = def(o) \cup use(o)$
(viewed as multiset) into disjoint pairs

$$P_o = \{p_1, p_1'\} \,\cup\, \{p_2, p_2'\} \,\cup\, \cdots,$$

where the last set of the partition may be a singleton if $|P_o|$ is odd. For
every $o$ we can then define $f = \lceil |P_o| / 2 \rceil$ _split operations_
$o_1, \dots, o_f$ such that the $i$-th operation $o_i$ has endpoints $p_i$ and
$p_i'$ in $P_o$. We will refer to the graph transformation that replaces an
operation of type $o$ in a minIR graph with $f$ operations of types
$o_1, \dots, o_f$ as _operation splitting_.

<!-- prettier-ignore-start -->
{{< figure
    src="svg/operation-split.svg"
    alt="Operation splitting"
    caption="Splitting an operation with 3 uses and 2 defines. The choice of endpoint partition made here, obtained by pairing the $i$-th use with the $i$-th define, is arbitrary, although often a \"natural\" choice."
    width="50%"
>}}
<!-- prettier-ignore-end -->

We also use the endpoint partitions to define _linear paths_. Two values $v, v'$
in a minIR graph are on the same linear path if there are values
$u_1, \dots, u_k$ with $v = u_1$ and $v' = u_k$ such that $u_i$ is connected to
$u_{i+1}$ through an operation $o$ (i.e. $u_i, u_{i+1} \in P_o$) and they
correspond to the same pair of endpoints in the endpoints partition.

#### Linearity assumption

We impose a major restrictions on the general case of minIR graphs, namely that
all types in the type system $\Sigma$ must be linear[^graphiso]. Using this
assumption, every value has exactly one use and one define. As a result, the
linear paths of a minIR graph form a partition of the values of the graph. They
correspond to the paths that form the connected components of the graph obtained
by splitting every operation. We call the number of linear paths (and the of
connected components in the fully split graph) the graph _width_, written
$width(G)$. We also use the linear path decomposition to define _graph depth_,
written $depth(G)$, as the longest linear path in $G$.

[^graphiso]:
    This restriction is necessary: without it, the pattern-matching problem we
    are solving is a generalisation of the subgraph isomorphism problem, a
    well-known NP-complete problem @Cook1971. The approach generalises to
    non-linear types, but the complexity analysis no longer holds (we pay a
    computational price for every non-linear value matched).

For a minIR equivalence class $\mathcal{E}$, finding a subgraph $S$ in $G$ such
that $L \in \mathcal{E}$ is the equivalent outlined region of $S$ is equivalent
to finding an embedding of $L' \hookrightarrow G$, i.e. a subgraph
$S \subseteq G$ that is isomorphic to $L' \simeq S$. $L'$ is the minIR graph
obtained from the region $L$ by removing the region definition operation (and
its defined region value), and its children input and output
operations[^notvalid].

[^notvalid]:
    Note that $L'$ is not a valid minIR graph as it violates the linearity of
    the values connected to the removed input and output operations.

#### Convexity

According to proposition 3.2, a condition for subgraph $S$ to be outlined is
that the embedding $L' \hookrightarrow G$ be _convex_. In this chapter we weaken
this requirement and propose a condition based on graph width:

<!-- prettier-ignore -->
{{< proposition title="Necessary condition for convexity" id="prop-convexity" >}}

If an embedding $\varphi: P \to G$ of a pattern $P$ into a minIR graph $G$ with
linear types is convex, then for every subgraph $H \subseteq G$ that contains
the image of $P$, $\varphi(P) \subseteq H$, it holds that
$width(P) \leq width(H).$

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

Suppose there is $H \subseteq G$ such that $\varphi(P) \subseteq H$ and
$width(P) > width(H)$. Let
$\mathcal{L}_P, \mathcal{L}_H \subseteq \mathcal{P}(V)$ be the set of linear
paths of $P$ and $H$ respectively. It must hold that for all
$\ell \in \mathcal{L}_P$ there is $\ell' \in \mathcal{L}_H$ such that
$\ell \subseteq \ell'$, because $P$ is embedded in $L$ and operation splitting
is preserved under embeddings. As the map from $\mathcal{L}_P$ to
$\mathcal{L}_H$ cannot be injective, there must be $\ell_1 \neq \ell_2$, both in
$\mathcal{L}_P$, such that $\ell_1, \ell_2 \subseteq \ell'$. We conclude that
there must be a path in the fully split graph of $H$ between a value of $\ell_1$
and a value of $\ell_2$ that is not in the fully split graph of $\varphi(P)$.
Given that $P$ is convex, this path must be in $P$, which contradicts the
preservation of operation splitting under embeddings.

<!-- prettier-ignore -->
{{% /proof %}}

In this chapter, whenever we define a subgraph $H \subseteq G$ of a graph $G$,
we will assume that $H$ satisfies the above weakened convexity condition.

The converse is, however, not true. The pattern-matching technique presented
below will find a strict superset of convex embeddings. To restrict
considerations to convex embeddings, it suffices to filter out the non-convex
ones in a post-processing step.

#### Ignoring MinIR Hierarchy

So far, we have omitted discussing one part of the minIR structure: the nested
hierarchy of operations. Syntactically, hierarchy relations (between region
definitions and input/output operations) can be viewed as just another value
type by adjusting these operations to define output and use a region value as
input. Because of the bijectivity requirement of $\varphi_O$ on children of
Definition 3.2, these parent-child relations behave, in fact, like linear
values---and hence satisfy the linearity assumption we have imposed.

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
depth by up to a factor $\Delta$. We furthermore assume that the set of
endpoints $P_o$ for all operations $o \in O$ map injectively to some port labels
$P_o \hookrightarrow \Pi$, for instance, by introducing distinct sets of integer
labels for $use(\cdot)$ and $def(\cdot)$ endpoints and mapping endpoints in $o$
to their position in the $use(o)$ or $def(o)$ string. We further endow the
labels $\Pi$ with a total order (for instance, based on the integer values). The
total order on $\Pi$ then induces a total order on the paths
$v_1\cdots v_k \in V^\ast$ in $G$ that start in the same value $v_1$: the paths
are equivalently described by a string in $\Pi^\ast$, the sequence of port
labels of the operations traversed, which we order using the lexicographical
ordering on strings. Given a root value $r$, for every value $v$ in $G$ there is
thus a unique smallest path from $r$ to $v$ in $G$[^thisisdfs]. This path is
invariant under isomorphism of the underlying graph (i.e. relabelling of the
values and operations but preserving the port labels).

[^thisisdfs]:
    Remark that the ordering of the operations thus defined is a particular case
    of a depth-first search (DFS) ordering of the graph: given an operation $o$
    that has been visited, all its descendants will be visited before proceeding
    to any other operation.

Define an _open_ value as a value with a missing use or define operation (i.e.
an open value can never be part of a valid minIR graph but will be found in
pattern graphs). We can obtain the following notable bound on graph width using
these assumptions.

<!-- prettier-ignore -->
{{< proposition title="Bound on graph width" id="prop-widthbound" >}}

Let $G$ be a graph with $n_\textrm{odd}$ operations of odd degrees and
$n_\omega$ open values. Then, the graph width of $G$ is
$width(G) = \lfloor(n_\textrm{odd} + n_\omega) / 2\rfloor$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

For any linear path $P \subseteq V^\ast$ in $G$ consider its two ends $v_1$ and
$v_2$, i.e. the two values in $P$ with only one neighbouring value in $P$
(linear paths must contain at least one value). In the fully split graph of $G$,
these values are either open or must be connected to two operations---one that
defines them and one that uses them. If $v_1 = v_2$, then the value cannot be
open, as the graph would have no operations. Thus, there are two connected
operations, and both must have $v_1 = v_2$ as their single endpoint. Otherwise,
both $v_1$ and $v_2$ must either be open values or be connected to an operation
with a single endpoint.

In a fully split graph, operations with a single endpoint result from a split
operation with an odd number of endpoints. We conclude that for every linear
path, there are either two operations with an odd number of endpoints in $G$, or
one such operation and one open value, or two open values. The result follows.

<!-- prettier-ignore -->
{{% /proof %}}

---

In this chapter, we will refer to MinIR graphs that satisfy the above
assumptions and may possibly have open values as "graphs".
