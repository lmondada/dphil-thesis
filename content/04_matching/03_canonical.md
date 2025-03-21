+++
title = "Canonicalising the tree reduction"
layout = "section"
weight = 3
slug = "sec:canonical"
+++

The reduction of graph matching to ternary trees from the previous section
is a big step towards an algorithm for graph matching.
However, {{% refproposition "prop-tree-patternmatching" %}}
is expressed in terms of _existence_ of spanning
trees---it is as yet unclear how the trees can be constructed.
This is the purpose of this section.

We introduce for this puprose a canonical, that is, invariant under isomorphism,
tree reduction map $G \mapsto G_T \mapsto G_C$.
The map from $G_T \to G_C$ is given by $\sigma_2^{-1}$ as defined in the
previous section,
so that there remains only to define a map $canonical: G \to G_T$.

We proceed by using the total order that we have defined on port labels,
and can be extended lexicographically to paths outgoing from a shared root
operation (see {{< reflink "sec:simplifying-assumptions" >}} for more details).
For a choice of root operation $r$, we can thus order the set of operations
on two linear paths by the total order on the paths from $r$.
We then consider them in order and only keep unchanged those operations that
contain a linear path that was not seen before, updating the set of seen
linear paths as we go.
The other operations, i.e. those on two linear paths that have already been
visited, are split, resulting in two operations on a single linear path.
The following pseudocode implements this algorithm.

```python {.numbered}
def CanonicalSpanningTree(G: Graph, root: Operation) -> Graph:
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
We used `Operations(G)` to retrieve all the operations
on the graph `G`; `LinearPaths(G, op)` to retrieve the indices of the
linear paths of the operation `op`, which can be pre-computed, numbered
and stored in linear time in the graph size.
`SplitOperation(G, op)` returns the graph resulting from splitting `op`
into two operations on a single linear path.
Finally, `PathAsPortLabels(G, root, v)` returns the string of the port labels
that encode the path from `root` to `v` in the graph `G`.
The non-capitalized functions `set`, `union`, `sort`[^sortkey], `len` and `issubset`
have their standard meanings.
[^sortkey]: The `sort_key` parameter of the `sort` function defines the total
order according to which the elements are sorted, from smallest to largest.

{{% proposition title="Correctness of `CanonicalSpanningTree`" id="prop-canonical-correctness" %}}
For a graph $G$, the graph returned by `CanonicalSpanningTree(G)`
is a valid spanning tree reduction of $G$.
It is deterministic and invariant under isomorphism of $G$.
The runtime of `CanonicalSpanningTree` is $O(|G|)$,
where $|G|$ is the number of operations in the graph $G$.
{{% /proposition %}}
{{% proof %}}
_Valid spanning tree reduction._
From the discussion in the proof of {{% refproposition "prop-treereduction" %}},
we know it is sufficient to show that the linear path
interaction graph $I$ of the returned
graph $G_T$ is acyclic and connected.
If there was a cycle in $I$, then there would be operations
$o_0, \dots, o_{k-1}$ in $G$ that pairwise $(o_i, o_{i+1\, mod\, k})$
share a linear path.
One of these operations must be considered last in the `for` loop
of lines 11--20, suppose it is $o_k$.
But the two linear paths of $o_k$ are either also a linear path of $o_{k-1}$
or a linear path of $o_{1}$: $o_k$ thus does not satisfy the condition
on line 15, and thus cannot be in $I$, a contradiction.
Hence $I$ is acyclic.

To see that $I$ is connected, we proceed inductively to show the following
invariant for the main `for` loop (lines 11--20):
for all linear paths in `seen_paths`, there is a path in $I$ to the linear
paths of the root operation.
`seen_paths` is only modified on line 20.
If `op` is the root operation, then trivial there is a path from
the linear paths `op_linear_paths` to linear paths of the root operation.
Otherwise, we claim that there must be one of the paths in `op_linear_paths`
that is already in `seen_paths`.
From there it follows that there is a path in $I$ from the root path to the
unseen linear path, given by the path to the linear path in `seen_path` followed
by the edge in $I$ that corresponds to `op`.

By connectedness of $G$, there is a path from the root operation to `op`.
The path is not empty because `op` is not the root operation, so we can
consider the prefix of the path of all operations excluding `op`.
Call `op'` the last operation preceding `op` and `op_linear_paths'` its linear
paths.
Two successive operations on a path must share a linear path: `op_linear_paths` $\cap$ `op_linear_paths'`
cannot be empty.
According to line 4, `op'` must have been visited before `op`, thus
`op_linear_paths'` $\subseteq$ `seen_paths`.
It follows that at least one element of `op_linear_paths` must be in `seen_paths`.

_Determinstic and isomorphism invariant._
The pseudocode above is deterministic and only depends on paths in $G$ encoded
as strings of port labels, which we have established to be invariant under
isomorphism.

_Runtime complexity._
Lines 2 and 3 run in $O(|G|)$ time.
With the exception of the `sort` function on lines 4--7, every other line
can be run in $O(1)$ time:
- lines 13 and 15 run in constant time because the size of `op_linear_paths` is always at most 2;
- line 20 (and the `in` check on line 15) can be run in constant time by representing
  the `seen_paths` set as a fixed-size boolean array of size $w$, with the $i$-th bit
  indicating whether the $i$-th linear path has been seen;
- line 17 is a constant time transformation if we allow in-place
  modification of `new_G`.

The `for` loop will run $|G|$ iterations, for a total of $O(|G|)$ runtime.
Finally, the sorting operation would naively take time $O(|G| \log |G|)$.
However, given that the ordering is obtained lexicographically from the
paths starting at the root, we can obtain the sorted list of operations
by depth-first traversal of the graph starting at the root.
The result follows.
{{% /proof %}}

Using `CanonicalSpanningTree`, we can now sketch what the pattern matching
algorithm should look like.
For each pattern, we first compute their canonical spanning tree for an
arbirarily set pattern root operation;
then, given a graph $G$, we can find all embeddings of patterns into $G$
by iterating over all possible spanning trees within $G$.
Naively, this involves enumerating all posible subgraphs of $G$, and then
for each of them, iterating over all possible root choices.
{{% columns ratio="1:1" %}}
**Naive pattern matching.**
```python
# Precompute all spanning trees
allT = [CanonicalSpanningTree(
    P, root_P
) for (P, root_P) in patterns]

for S in Subgraphs(G):
  for root_S in Operations(S):
    TG = CanonicalSpanningTree(
        S, root_S
    )
    for T in allT:
      if T == TG:
        yield T
```
<--->
**Improved using `AllSpanningTrees`.**
```python
# Precompute all spanning trees
allT = [CanonicalSpanningTree(
    P, root_P
) for (P, root_P) in patterns]

for root_G in Operations(G):
  for TG in AllSpanningTrees(
      G, root_G
  ):
    for T in allT
      # Replace == with subtree
      if IsSubTree(T, TG)
        yield T
```
{{% /columns %}}

This can be significantly sped up by realising that many of the spanning
trees that are computed when iterating over all possible subgraphs and root
choices are redundant[^overlapgraph].
We will see in the next section that we can instead iterate once over all
possible root choices $r$ in $G$ once and introduce
a new procedure `AllSpanningTrees` that will efficiently enumerate
all possible spanning trees that are rooted in $r$ for subgraphs within $G$.
In the process, we will also see that we can replace the tree equality check
with a subtree check, further reducing the number of spanning trees that
must be considered.
[^overlapgraph]: Think for example of the same root operation $r$ that is
considered repeatedly for every overlapping subgraph of $G$ that contains $r$.
