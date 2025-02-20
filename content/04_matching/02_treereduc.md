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
{{< proposition title="Spanning tree reduction" number="4.3" >}}
A tree-like graph, i.e. a graph with no cycles in the underlying undirected
graph, can always be obtained from any graph by successively applying
operation splittings.
{{< /proposition >}}


{{% proof %}}
Consider the undirected simple interaction graph of linear paths,
where vertices are linear paths
and there is an edge between two linear paths for every operation that belongs
to both paths.
Splitting an operation $o$ in a graph $G$ corresponds to removing the corresponding
edge in the interaction graph.
On the other hand, the underlying undirected graph of $G$ has a cycle if
and only if there is a cycle in the interaction graph.
Indeed, a cycle in the underlying graph cannot belong to a single linear path in $G$,
by acyclicity of minIR graphs.
There are therefore a sequence of operations on more than one linear path that
connect linear paths---in such a way that a cycle is formed
in the interaction graph.

Hence, the set of operations to be split to turn $G$ into a tree-like graph
is given by the set of edges $E^-$ in the interaction graph that must be
removed to obtain a spanning tree[^spantheo].
[^spantheo]: It is a simple result from graph theory that such a set of edges
always exists---it suffices to remove one edge from every cycle in the graph.
{{% /proof %}}

We can make the spanning tree reduction a _reversible_ operation
by separately storing the set of split operations that correspond to a single
operation in the original graph.
Recalling that we assumed that every operation is on at most two linear paths,
we can store the pairs of split operations that correspond to each operation
by adding weights to (a subset of) the operations $O_T$ of the spanning tree
$$split: O_T \rightharpoonup P^\ast$$
that maps a split operaton $o$ to the unique path in the spanning tree
from $o$ to the other half of the split operation.
Writing $\mathcal{G}$ for the set of graphs and $\mathcal{T}$ for the
set of tree-like graphs, we can thus view the spanning tree reduction as
a bijection $\mathcal{G} \to (\mathcal{T}, split)$.

#### Tree contraction
