+++
title = "Tree reduction"
layout = "section"
weight = 2
slug = "sec:treereduc"
+++

We reduce the problem of graph pattern matching to matching on
rooted trees---a much simpler problem to solve.

#### Spanning tree
For the tree reduction, we start by repeatedly
applying operation splitting until a spanning tree of the original graph
is obtained.
The following result shows that a spanning tree reduction using operation splitting
is always possible.
We say a graph $G$ is tree-like if there are no cycles in the underlying
undirected graph $G_U$ of $G$.
{{< proposition title="Spanning tree reduction" number="4.3" >}}
A tree-like graph $G_T$ can always be obtained from any graph $G$ by successively applying
operation splittings.
{{< /proposition >}}

{{% proof %}}
Consider the undirected simple interaction graph of linear paths,
where vertices are linear paths
and there is an edge between two linear paths for every operation that belongs
to both paths.
Splitting an operation $o$ in a graph $G$ corresponds to removing the corresponding
edge in the interaction graph.
On the other hand, the underlying undirected graph $G_U$ has a cycle if
and only if there is a cycle in the interaction graph.
Indeed, a cycle in $G_U$ cannot belong to a single linear path in $G$,
by acyclicity of minIR graphs.
There are therefore a sequence of operations on more than one linear path that
connect linear paths---in such a way that a cycle is formed
in the interaction graph.

Hence, the set of operations to be split to turn $G$ into a tree-like graph $G_T$
is given by the set of edges $E^-$ in the interaction graph that must be
removed to obtain a spanning tree[^spantheo].
[^spantheo]: It is a simple result from graph theory that such a set of edges
always exists---it suffices to remove one edge from every cycle in the graph.
{{% /proof %}}

With the choice of a root operation $r \in O_T$ of $G_T$,
a tree-like graph $G_T$ can also be seen as a rooted tree, obtained
by taking the dual of $G_T$:
- the nodes of the tree are the operations $O_T$ of $G_T$,
- the parent and children of an operation $o$ are the operations
  that share a value with $o$ in $G_T$; of these neighbouring operations,
  the parent is the unique operation that is on the path from $o$ to the
  root $r$, the others are the children,
- the children are distinguishable and ordered according to the total
  order of the port labels in $P$.

We call the resulting tree $T$ the dual spanning tree of $G$.

{{% proposition title="Dual spanning tree" number="4.4" %}}
A root operation $r \in O_T$ can always be chosen such that the
dual spanning tree $T$ of a graph $G$ rooted in $r$ is a ternary tree,
i.e. every node of $T$ has at most three children.
{{% /proposition %}}
{{% proof %}}
We have assumed that every operation is on at most two linear paths,
and thus can be connected to at most four values; each value is linear
and hence connected to at most one other operation.
It results that every operation in $T$ has at most four neighbouring
operations---one parent and three children. To ensure that the root does not
have four children, a leaf of the tree can be chosen as the root operation.
{{% /proof %}}

We can make the spanning tree reduction from $G$ to $G_T$
a _reversible_ operation
by separately storing the set of split operations that correspond to a single
operation in the original graph.
Recalling that we assumed that every operation is on at most two linear paths,
we can store the pairs of split operations that correspond to each operation
by adding weights to (a subset of) the operations $O_T$ of the spanning tree
$$split: O_T \rightharpoonup P^\ast$$
that maps a split operaton $o$ to the unique path in $G_T$
from $o$ to the other half of the split operation.
Writing $\mathcal{G}$ for the set of graphs and $\mathcal{G}_T$ for the
set of valid tree-like graphs, we can thus view the spanning tree reduction as
a bijection $\mathcal{G} \to (\mathcal{G}_T, split)$.

#### Tree contraction

We can further simplify the structure of the data being matched by
contracting all operations of $G_T$ that are on a single linear
path. We call the resulting tree-like graph the contracted spanning tree $G_C$
of $G$.
We employ a similar trick as above to make this reduction reversible,
this time by introducing weights on the _values_ of $G_C$ that store the
string of operations that were contracted[^whystring]
$$contract: V_C \rightharpoonup \Gamma_T^\ast$$
where $\Gamma_{G_T}$ are the optypes of operations in $G_T$, i.e. the optypes
of the minIR graph $G$ along with optypes for the split operations.
In summary, we have the bijections
$$\mathcal{G} \to (\mathcal{G}_T, split) \to (\mathcal{G}_C, spill, contract),$$
where $\mathcal{G}_C$ designates the set of valid contracted spanning trees.
[^whystring]: Because all contracted operations apply on a single, shared,
linear path, they indeed form a string of operations.

Contracted spanning trees are particularly useful for the study of the
asymptotic complexity of the pattern matching algorithm we propose, as they
have a very regular structure, which we express in terms of its dual:

{{% proposition title="Contracted spanning tree" number="4.5" %}}
There is a root operation $r \in O_C$ such that the dual contracted spanning tree
$G_C$ of a graph $G$ rooted in $r$ is a
ternary tree with $width(G) - 1$ nodes.
{{% /proposition %}}
{{% proof %}}
That the tree is ternary follows from proposition 4.4.
Every node of the tree corresponds to an operation in $G_C$, which is
on exactly two linear paths. As a result of acyclicity of the tree,
a tree of $k$ nodes spans $k+1$ linear paths---and hence,
we conclude $k = width(G) - 1$.
{{% /proof %}}

We can summarise our construction with the following result:
{{% proposition title="Reduction to Tree Pattern matching" %}}
Let $P$ be a pattern graph and $G$ a graph. Let $P_{CD}$ be the dual
contracted spanning tree of $P$.
There is an embedding $P \hookrightarrow G$ if and only if
there is $S \subseteq G$ with dual contracted spanning tree $S_{CD}$
such that $P_{CD} = S_{CD}$.
{{% /proposition %}}
The proof of this follows directly from our construction and the injection
of the graphs $P, S$ into their dual contracted spanning tree.

We have thus successfully reduced the problem of pattern matching to
the problem of matching on trees.
Given that the ordering of children of a node in a tree is fixed, checking
trees for equality is a simple matter of checking node equality, one node
at a time.
