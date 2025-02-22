+++
title = "Enumerating all spanning trees"
layout = "section"
weight = 4
slug = "sec:anchors"
+++

For the spanning tree reduction $G_T$ of a graph $G$, call an operation
$o$ of $G$ an _anchor_ operation if it is on two linear paths
and it is not split in $G_T$.
Remark that the set of anchors operations $X$ in $G_T$ fully determines
the spanning tree reduction $G_T$.
We can therefore simplify the problem of finding a spanning tree reduction
of $G$ to the problem of finding a set of anchor operations $X$.

Instead of the `CanonicalSpanningTree` procedure, we can equivalently
consider a `CanonicalAnchors` procedure, that performs the same computation
but returns the set of anchor operations $X$.
We express this computation below, using recursion instead of a `for` loop.
This form generalises better to the `AllAnchors` procedure that we will
introduce next to define `AllSpanningTrees`.
```python {.numbered}
def CanonicalAnchors(
    G: Graph, root: Operation, seen_paths: Set[int]
) -> (Set[Operation], Set[int], Graph):
  operations = Operations(ConnectedComponent(G, root))
  # sort by PathAsPortLabels, as previously
  sorted_operations := sort(operations)
  operations_queue := queue(sorted_operations)

  # Skip all operations that are not anchors
  op := operations_queue.pop() or return []
  G = RemoveOperation(G, op)
  while len(LinearPaths(G, op)) == 1 or
        issubset(LinearPaths(G, op), seen_paths):
    op = operations_queue.pop() or return []
    G = RemoveOperation(G, op)

  # op is anchor, update seen_paths and recurse
  seen_paths = union(seen_paths, LinearPaths(G, op))
  anchors := [op]
  # sort by port labels
  for child in Neighbours(G, op):
    (new_anchors, seen_paths, G) = CanonicalAnchors(
        G, child, seen_paths
    )
    anchors += new_anchors

  return (anchors, seen_paths, G)
```
We introduced the self-describing `ConnectedComponent`, `Neighbours` and `RemoveOperation`
procedures to traverse, respectively modify, the graph $G$.
Importantly, `Neighbours(G, op)` returns the neighbours of `op` in increasing
port label order.

The equivalence of this procedure with `CanonicalSpanningTree` follows directly
from the observation made in {{< reflink "sec:simplifying-assumptions" >}}
that ordering operations in lexicographic order of the port labels is
equivalent to a depth-first traversal of the graph.
`CanonicalAnchors` implements a recursive depth-first traversal (DFS), with the
twist that the recursion is explicit only on the anchor nodes, and otherwise
relying on the lexicographic ordering just like in `CanonicalSpanningTree`:
lines 5--15 of `CanonicalAnchors` correspond to the iterations
of the `for` loop (line 11--20) of `CanonicalSpanningTree` until
an anchor operation is found (i.e. the `else` branch on lines 18--20 is
executed). From there, the graph traversal proceeds recursively.

To ensure that the recursive DFS does not visit the same operation twice, we
modify the graph with `RemoveOperation` on lines 11 and 15, ensuring that
no visited operation remains in `G`.
As a consequence, `CanonicalAnchors` may be called on disconnected graphs,
which explains the additional call to `ConnectedComponent` on line 4.

{{% proposition title="Equivalence of `CanonicalSpanningTree` and `CanonicalAnchors`" number="4.8" %}}
Let $G$ be a connected graph and let $X$ be the anchors of its canonical spanning tree reduction
`CanonicalSpanningTree(G)`.
Then `CanonicalAnchors(G, root, seen_paths={})` returns $X$, the set of
all paths in $G$ and the empty graph.
{{% /proposition %}}
The proof follows directly from the previous paragraphs.

#### Maximal spanning tree reductions
In addition to "simplifying" spanning tree reductions, anchor operations
have another property that is fundamental to the pattern matching algorithm.

Recall that a spanning tree reduction $G_T$ is tree-like and can always
be seen as a rooted tree $T_G$ by taking the dual of $G_T$ and picking a root operation
$r$ in $G_T$.
Furthermore, children of nodes in a tree are ordered by the port label ordering.

For the following proposition we introduce a $\subseteq$ relation on rooted trees:
$T_H \subseteq T_G$ if the trees share the same root operation $r$, $T_H$ is
a subtree of $T_G$ up to isomorphism and they coincide on all weights on the common subtree
(including on the $split$ map in the case of spanning tree reductions).
{{% proposition title="Maximal spanning tree reductions" number="4.9" %}}
Let $G$ be a connected graph, $X$ a set of operations in $G$ and $r \in X$
a root operation. Let
$$\mathcal{G}_X = \{H \subseteq G \mid \textrm{anchors}(H, r) = X\},$$
where $\textrm{anchors}(H, r)$
refers to the set `CanonicalAnchors(H, r, {})`.

1. There is a subgraph $G^X \subseteq G$
such that for all subgraphs $H \in \mathcal{G}_X$:
$H \subseteq G^X$.
2. Furthermore, for all graph $P$,
$$P \simeq H \in \mathcal{G}_X \quad\Leftrightarrow\quad T_P \subseteq T_{G^X}.$$
where $T_P$ and $T_{G^X}$ are the tree duals rooted in $r$
of the spanning tree reduction with anchors $X$
of $P$ and $G^X$, respectively.

We call the spanning tree reduction $G^X_T$ of $G^X$ with anchors $X$ the _maximal spanning tree reduction_ with anchors $X$ in $G$.
{{% /proposition %}}
The proof gives an explicit construction for $G^X$.
{{% proof %}}
Assume $\mathcal{G}_X \neq \varnothing$, otherwise the statement is trivial.

_Construction of $G^X$._
Let $L$ be the set of linear paths in $G$ that go through at least one operation in $X$.
Consider the set of operations $O_L$ in $G$ given by the operations whose
linear paths are contained in $L$.
This defines a subgraph $G|_{O_L}$ of $G$.
Since $\mathcal{G}_X \neq \varnothing$, there exists $H \in \mathcal{G}_X$.
By assumption, $H$ is connected, and thus the anchors $X$ of $H$ are connected in $H$.
There is therefore a connected component $G^X \subseteq G|_{O_L}$ that contains
the set $X$.

_Well-definedness of $G^X_T$._
Consider graph $G^X_T$ obtained from $G^X$ by the spanning tree reduction
with anchors $X$.
We must show that $G^X_T$ is a valid spanning tree reduction for the proposition
statement to be well-defined.
In other words, we must show that the interaction graph of $G^X_T$ is acyclic and connected.
$G^X$ is connected by construction, which implies connectedness of $G^X_T$ and its
interaction graph.
It is acyclic because $width(G^X) = |X + 1|$ and $G^X$ has exactly $|X|$ operations
on more than one linear path. The interation graph of $G^X$ is thus a tree.

_Point 1: $H \subseteq G^X$._
For any subgraph $H \in \mathcal{G}_X$, its operations must be contained in $O_L$.
Since any $H \in \mathcal{G}$ is connected and contains $X$, it must further hold
that $H \subseteq G^X$.


We can now prove the $\Leftrightarrow$ equivalence of point 2.

$\Leftarrow$:
If $T_P \subseteq T_{G^X}$, then there exists $H_T \subseteq G^X_T$
with dual tree rooted in $r$ equal to $T_P$.
Furthermore, by definition of $\subseteq$ on rooted trees, the $split$ map
of $H_T$ coincides with the $split$ map of $G^X_T$ on $H_T$.
Recall from {{< reflink "sec:treereduc" >}} that there is a map
$\sigma$ that maps
$$(H_T, split) \overset{\sigma}{\longmapsto} H\quad\textrm{and}\quad(G^X_T, split) \overset{\sigma}{\longmapsto} G^X.$$
It merges split operations pairwise, and thus it is immediate that
$H_T \subseteq G^X_T$ implies $H \subseteq G^X$.
By construction, one can also derive that $P \simeq H$. The statement follows.

$\Rightarrow$:
Since $H \in \mathcal{G}_X$, we know from point 1 that $H \subseteq G^X$.
Thus we can define an injective embedding $\varphi: P \to G^X$.

Operation splitting leaves the set of values from $H$ to $H_T$, as well as
from $G^X$ to $G^X_T$ unchanged.
Similarly, there is a bijection between values in $H_T$ and $G^X_T$ and
edges in $T_H$ and $T_{G^X}$.
Thus the pattern embedding $\varphi$ defines an injective map $\phi_E$
from tree edges in $T_H$ to tree edges in $T_{G^X}$.
We extend this map to a map on the trees $\phi: T_H \to T_{G^X}$
by induction over the nodes set of $T_H$.
We start by the root map $\phi(r) = r$.
Using $\phi_E$, we can then uniquely define the image of any child node of $r$ in $T_H$,
and so forth inductively.

We show now that the map $\phi$ thus defined is injective.
Suppose $v, v'$ are nodes in $T_H$ such that $\phi(v) = \phi(v')$.
By the inductive construction there are paths from the root $r$ to $v$ and $v'$ respectively
such that their image under $\phi_E$ are two paths from $r$ to $\phi(v) = \phi(v')$.
But $T_{G^X}$ is a tree, so both paths must be equal. By bijectivity of $\phi_E$,
it follows $v = v'$, and thus $\phi$ is injective.
Finally, the value and operation weights are invariant under pattern embedding and thus are
preserved by definition.
{{% /proof %}}

This result means that instead of listing spanning tree reductions
for every possible subgraph of $G$, it is sufficient to proceed as follows:
1. enumerate all possible sets of anchors $X$ in $G$,
2. for each set $X$, find the maximal spanning tree reduction with anchors $X$ in $G$,
3. for each maximal spanning tree reduction, find all patterns with a canonical
   spanning tree reduction that is a subtree of the maximal spanning tree reduction.

In other words, if `AllAnchors` is a procedure that enumerates all possible
sets of anchors $X$ in $G$
and `MaximalSpanningTree` computes the maximal spanning tree as presented in the
proof of Proposition 4.9, then
`AllSpanningTrees(G)` can simply be obtained by
calling `AllAnchors` and then returning their
respective maximal spanning tree reductions in $G$:
```python
def AllSpanningTrees(G: Graph, root: Operation) -> Set[Graph]:
  all_anchors = AllAnchors(G, root)
  return {MaximalSpanningTree(G, X) for X in all_anchors}
```

#### The final missing piece: `AllAnchors`
