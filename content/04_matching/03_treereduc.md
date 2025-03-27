+++
title = "Tree reduction"
layout = "section"
weight = 3
slug = "sec:treereduc"
+++

We reduce the problem of graph pattern matching to matching on rooted trees---as
we will see in {{% reflink "sec:automaton" %}}, a much simpler problem to solve.
The map between _graphs_ and (rooted) _trees_ is given by _rooted dual trees_.
Call $G$ _tree-like_ if $G$ is connected and the underlying undirected graph
$G_U$ of $G$ is acyclic.

{{% definition title="Rooted dual tree" id="def-rooted-dual-tree" %}}

Let $G$ be a tree-like graph with operations $O$. Then given a root operation
$r \in O$, the rooted dual tree of $G$ rooted at $r$, written $\tau_r(G)$ is the
tree given by

- the nodes of the tree are the operations $O$ of $G$,
- the parent and children of $o \in O$ are the operations that share a value
  with $o$ in $G$; the parent is the unique operation on the path from $o$ to
  $r$,
- the children of an operation are ordered according to the the port labels.

{{% /definition %}}

Unlike graphs, tree nodes are identified uniquely by their path from the root.
Trees isomorphic as graphs with identical root are thus considered equal.

#### A tree reduction using path splitting

To reduce a graph $G$ to a tree using the rooted dual tree construction, it
suffices to reduce $G$ to a tree-like graph. The following result shows that
this can always be achieved by repeatedly applying operation splitting
transformations.

<!-- prettier-ignore -->
{{< proposition title="Path splitting" id="prop-treereduction" >}}

A tree-like graph can be obtained from any connected graph $G$ by applying
operation splittings. The resulting graph is the path-split graph (PSG) of $G$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

Consider the undirected simple graph $\mathcal{I}$, where vertices are linear
paths, and there is an edge between two linear paths for every operation that
belongs to both paths. We call $\mathcal{I}$ the _interface graph_ of $G$.

Splitting an operation $o$ in a graph $G$ corresponds to removing the
corresponding edge in $\mathcal{I}$. On the other hand, the underlying
undirected graph $G_U$ of $G$ has a cycle if and only if there is a cycle in
$\mathcal{I}$. Indeed, a cycle in $G_U$ cannot belong to a single linear path in
$G$, by acyclicity of minIR graphs. There is, therefore, a cycle of operations
that span multiple linear paths, thus forming a cycle in $\mathcal{I}$.

Hence, the operations to be split to turn $G$ into a tree-like graph are given
by the set of edges $E^-$ in $\mathcal{I}$ that must be removed to obtain a
spanning tree of $\mathcal{I}.$[^spantheo]

[^spantheo]:
    It is a simple result from graph theory that such a set of edges always
    exists---it suffices to remove one edge from every cycle in the graph.

<!-- prettier-ignore -->
{{% /proof %}}

If $G'$ is the PSG of some graph $G$, then call an operation $o$ of $G$ an
_anchor_ operation if it is on two linear paths and it is not split in $G'$. The
set of all anchors operations $\pi \subseteq O$ fully determines the path-split
graph. We write $G^\pi = G'$ for the PSG of $G$ obtained by anchors $\pi$.

{{% proposition title="Rooted dual trees are ternary" id="prop-dualspanningtree" %}}

Consider a PSG $G^\pi$ of a graph $G$. There is a _root_ operation $r \in O$
such that the rooted dual tree $\tau_r(G^\pi)$ is a ternary tree, i.e. every
node of $\tau_r(G^\pi)$ has at most three children.

{{% /proposition %}}

{{% proof %}}

We have assumed in {{% reflink "sec:simplifying-assumptions" %}} that every
operation in $G$ is on at most two linear paths and thus can be connected to at
most four values. Each value is linear and hence connected to at most one other
operation. It results that every operation in $\tau_r(G^\pi)$ has at most four
neighbouring operations---one parent and three children. A tree leaf can be
chosen as the root operation to ensure the root does not have four children.

{{% /proof %}}

We can make the path splitting transformation $G \to G^\pi$ _reversible_ by
separately storing the set of split operations in $G^\pi$ that correspond to a
single operation in $G$. As every operation of $G$ can get split in at most two
split operations, we can store the pairs of split operations in $G^\pi$ that
correspond to an operation in $G$ in a partial map that defines weights for (a
subset of) the operations $O^\pi$ of $G^\pi$:

$$split: O^\pi \rightharpoonup P^\ast.$$

This maps a split operation $o$ to the unique undirected path in $G^\pi$ from
$o$ to the other half of the split operation.

This defines a map $\sigma_1: (G^\pi, split) \mapsto G$, the inverse of the path
splitting transformation $G \to G^\pi$.

#### Contracted path-split graphs

We can further simplify the structure of the data of a PSG by contracting all
operations of $G^\pi$ that are on a single linear path. The result is the
_contracted path-split graph_ (cPSG) of $G$, written $c(G^\pi)$.

We employ a similar trick as above to make this transformation reversible, this
time by introducing weights on the _values_ of $c(G^\pi)$ that store the string
of operations that were contracted[^whystring]

$$contract: V_C \rightharpoonup (\Gamma^\pi)^\ast$$

where $V_C$ are the values of $c(G^\pi)$ and $\Gamma^\pi$ are the optypes of
operations in $G^\pi$, i.e. the optypes of the minIR graph $G$ along with the
optypes of the split operations. This defines a second map
$\sigma_2: (c(G^\pi), contract) \mapsto G^\pi$ that is the inverse of the
path-split graph contraction transformation $c(\cdot)$. In summary, we have the
composition
$$(c(G^\pi), contract, split) \xrightarrow{\sigma_2 \times Id} (G^\pi, split) \xrightarrow{\sigma_1} G.$$
[^whystring]: Because all contracted operations apply on a single, shared,
linear path, they indeed form a string of operations.

Contracted PSGs are particularly useful for the study of the asymptotic
complexity of the pattern matching algorithm we propose, as they have a very
regular structure. This is expressed by the following proposition that further
extends the statement of {{% refproposition "prop-dualspanningtree" %}}:

{{% proposition title="Contracted PSG" id="prop-contractedspanningtree" %}}

Consider a PSG $G^\pi$ of a graph $G$. There is a root operation $r \in O$ such
that the rooted dual tree of the contracted PSG $\tau_r(c(G^\pi))$ is a ternary
tree with $width(G) - 1$ nodes.

{{% /proposition %}}

{{% proof %}}

That the tree is ternary follows from
{{% refproposition "prop-dualspanningtree" %}}. Every node of the tree
corresponds to an operation in $c(G^\pi)$, which is on exactly two linear paths.
As a result of acyclicity of the tree, a tree of $k$ nodes spans $k+1$ linear
paths---and hence, we conclude $k = width(G) - 1$.

{{% /proof %}}

We conclude the construction presented in this section with the following
result, expressing graph pattern matching in terms of tree equality:

<!-- prettier-ignore -->
{{% proposition title="Reduction to Tree Pattern matching" id="prop-tree-patternmatching" %}}

Let $P$ be a pattern graph and $G$ a graph. Let $P^\pi$ be a PSG of $G$. There
is an embedding $P \hookrightarrow G$ if and only if there is $H \subseteq G$
and a PSG $H^{\pi'}$ of $H$ such that

$$\tau(c(P^\pi)) = \tau(c(H^{\pi'}))$$

and the trees have equal weight maps $split$ and $contract$.

<!-- prettier-ignore -->
{{% /proposition %}}

The proof of this follows directly from our construction, the unicity of trees
under isomorphism and the bijection between the graphs $P, H$ and their cPSGs.

We have thus successfully reduced the problem of pattern matching to the problem
of matching on trees. Given that the ordering of children of a node in a tree is
fixed, checking trees for equality is a simple matter of checking node and
weight equality, one node (and edge) at a time.

We conclude this section with a figure summarising the constructions we have presented.

{{% figure src="/svg/tree-decomp.svg" enlarge="full" width="70%"
    caption="A graph $G$, along with the path-split graph $G^\pi$, the contracted path-split graph $c(G^\pi)$ and their rooted dual trees. The anchor operations are $d$ (grey) and $e$ (red). The root of the rooted dual trees is $e$." %}}
