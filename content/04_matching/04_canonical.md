+++
title = "Canonicalising the tree reduction"
layout = "section"
weight = 4
slug = "sec:canonical"
+++

The reduction of graph matching to ternary trees from the previous section is a
big step towards an algorithm for graph matching. However,
{{% refproposition "prop-tree-patternmatching" %}} is expressed in terms of
_existence_ of PSGs---it is as yet unclear how the trees can be constructed.
This is the purpose of this section.

We introduce for this purpose a _canonical_, that is, invariant under
isomorphism, choice of PSG $G^\pi$ of $G$. The result is a unique canonical
transformation $G \mapsto G^\pi \mapsto c(G^\pi)$ from $G$ to cPSG that we can
use for pattern matching.

We proceed by using the total order that we have defined on port labels and can
be extended lexicographically to paths outgoing from a shared root operation
(see {{< reflink "sec:simplifying-assumptions" >}} for more details). Whenever
more than one path from $r$ to $o$ exist in $G$, it suffices to consider the
smallest one. For a choice of root operation $r \in O,$ we thus obtain a total
order of all operations $O$ in $G$.

We then restrict our attention to operations on two linear paths and consider
them in order. We keep track of linear paths that have been visited and proceed
as follows to determine whether $o \in O$ must be split:

- if $o$ is on a linear path that was not seen before, it is left unchanged and
  the set of visited linear paths is updated;
- otherwise, i.e. $o$ is on two linear paths that have already been visited, the
  operation is split, resulting in two operations on a single linear path.

The pseudocode `CanonicalPathSplit` implements this algorithm. We use
`Operations(G)` to retrieve all the operations on the graph `G` and
`LinearPaths(G, op)` to retrieve the linear paths of the operation `op`. The
linear paths are identified using integer indices that can be pre-computed and
stored in linear time in the graph size. `SplitOperation(G, op)` returns the
graph resulting from splitting `op` into two operations on a single linear path.
Finally, `PathAsPortLabels(G, root, v)` returns the string of the port labels
that encode the path from `root` to `v` in the graph `G`. The strings are
ordered lexicographically. The non-capitalized functions `set`, `union`,
`sort`[^sortkey], `len`, and `issubset` have their standard meanings.

<!-- prettier-ignore-start -->
```python {linenos=inline}
def CanonicalPathSplit(G: Graph, root: Operation) -> Graph:
  new_G := G
  all_operations := Operations(G)
  sorted_operations := sort(
      all_operations,
      sort_key= v -> PathAsPortLabels(G, root, v)
  )

  # keep track of the visited linear paths
  seen_paths := set()
  for op in sorted_operations:
    # Get the (pre-computed) indices of the linear paths
    op_linear_paths := LinearPaths(G, op)
    if len(op_linear_paths) == 2:
      if issubset(op_linear_paths, seen_paths):
        # The two linear paths of `op` are already visited
        new_G = SplitOperation(new_G, op)
      else:
        # Mark the new linear paths as visited
        seen_paths = union(seen_paths, op_linear_paths)
  return new_G
```
<!-- prettier-ignore-end -->

[^sortkey]:
    The `sort_key` parameter of the `sort` function defines the total order
    according to which the elements are sorted, from smallest to largest.

{{% proposition title="Correctness of `CanonicalPathSplit`" id="prop-canonical-correctness" %}}

For a graph $G$, the graph returned by `CanonicalPathSplit(G)` is a valid PSG of
$G.$ It is deterministic and invariant under isomorphism of $G$. The runtime of
`CanonicalPathSplit` is $O(|G|)$, where $|G|$ is the number of operations in the
graph $G$.

{{% /proposition %}}

{{% proof %}}

Let $G^\pi$ be the graph returned by `CanonicalPathSplit(G)`. From the
discussion in the proof of {{% refproposition "prop-treereduction" %}}, we know
it is sufficient to show that the interaction graph $\mathcal{I}$ of $G^\pi$ is
acyclic and connected.

_$\mathcal{I}$ is acyclic._ If there was a cycle in $\mathcal{I}$, then there
would be operations $o_0, \dots, o_{k-1}$ in $G$ that pairwise
$(o_i, o_{i+1\, mod\, k})$ share a linear path. One of these operations must be
considered last in the `for` loop of lines 11--20, suppose it is $o_{k-1}$. But
every linear path of $o_{k-1}$ is either also a linear path of $o_{k-2}$ or a
linear path of $o_{1}$: $o_{k-1}$ thus does not satisfy the condition on line
15, and thus cannot be in $\mathcal{I}$, a contradiction. Hence $\mathcal{I}$ is
acyclic.

_$\mathcal{I}$ is connected._ We proceed inductively to show the following
invariant for the main `for` loop (lines 11--20): for all linear paths in
`seen_paths`, there is a path in $\mathcal{I}$ to a linear path of the root
operation. `seen_paths` is only modified on line 20. If `op` is the root
operation, then trivially there is a path from the linear paths
`op_linear_paths` to a linear path of the root operation. Otherwise, we claim
that there must be one of the paths in `op_linear_paths` that is already in
`seen_paths`. From there it follows that there is a path in $\mathcal{I}$ from
the root path to the unseen linear path, given by the path to the linear path in
`seen_path` followed by the edge in $\mathcal{I}$ that corresponds to `op`.

By connectedness of $G$, there is a path from the root operation to `op`. The
path is not empty because `op` is not the root operation, so we can consider the
prefix of the path of all operations excluding `op`. Call `op'` the last
operation preceding `op` and `op_linear_paths'` its linear paths. Two successive
operations on a path must share a linear path: `op_linear_paths` $\cap$
`op_linear_paths'` cannot be empty. According to line 4, `op'` must have been
visited before `op`, thus `op_linear_paths'` $\subseteq$ `seen_paths`. It
follows that at least one element of `op_linear_paths` must be in `seen_paths`.

_Determinstic and isomorphism invariant._ The pseudocode above is deterministic
and only depends on paths in $G$ encoded as strings of port labels, which are
invariant under isomorphism.

_Runtime complexity._ Lines 2 and 3 run in $O(|G|)$ time. With the exception of
the `sort` function on lines 4--7, every other line can be run in $O(1)$ time:

- lines 13 and 15 run in constant time because the size of `op_linear_paths` is
  always at most 2;
- line 20 (and the `in` check on line 15) can be run in constant time by
  representing the `seen_paths` set as a fixed-size boolean array of size $w$,
  with the $i$-th bit indicating whether the $i$-th linear path has been seen;
- line 17 is a constant time transformation if we allow in-place modification of
  `new_G`.

The `for` loop will run $|G|$ iterations, for a total of $O(|G|)$ runtime.
Finally, the sorting operation would naively take time $O(|G| \log |G|)$.
However, given that the ordering is obtained lexicographically from the paths
starting at the root, we can obtain the sorted list of operations by depth-first
traversal of the graph starting at the root. The result follows.

<!-- prettier-ignore -->
{{% /proof %}}

Using `CanonicalPathSplit`, we can now sketch what the pattern matching
algorithm should look like. For each pattern, we first compute their canonical
PSG for an arbirary choice of pattern root operation; then, given a graph $G$,
we can find all embeddings of patterns into $G$ by iterating over all possible
PSGs within $G$. Naively, this involves enumerating all posible subgraphs of
$G$, and then for each of them, iterating over all possible root choices.

This can be significantly sped up by realising that many of the PSGs that are
computed when iterating over all possible subgraphs and root choices are
redundant[^overlapgraph]. We will see in the next section that we can _i)_
iterate once over all possible root choices $r$ in $G$ and _ii)_ introduce a new
procedure `AllPathSplits` that will efficiently enumerate all possible rooted
ual trees of PSGs that are rooted in $r$ for subgraphs within $G$. In the
process, we will also see that we can replace the tree equality check of line 12
with a subtree inclusion check, further reducing the number of PSGs that must be
considered.


<!-- prettier-ignore-start -->
{{% columns ratio="1:1" enlarge="full" %}}
**Naive pattern matching.**
```python {linenos=inline}
# Precompute all PSGs
allT = [CanonicalPathSplit(
    P, root_P
) for (P, root_P) in patterns]

for S in Subgraphs(G):
  for root_S in Operations(S):
    TG = CanonicalPathSplit(
        S, root_S
    )
    for T in allT:
      if T == TG:
        yield T
```
<--->
**Improved using `AllPathSplits` ({{% reflink "sec:anchors" %}}).**
```python {linenos=inline}
# Precompute all PSGs
allT = [CanonicalPathSplit(
    P, root_P
) for (P, root_P) in patterns]

for root_G in Operations(G):
  for TG in AllPathSplits(
      G, root_G
  ):
    for T in allT
      # Replace == with subtree
      if IsSubTree(T, TG)
        yield T
```
{{% /columns %}}
<!-- prettier-ignore-end -->



[^overlapgraph]:
    Think for example of the same root operation $r$ that is considered
    repeatedly for every overlapping subgraph of $G$ that contains $r$.
