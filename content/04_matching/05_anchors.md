+++
title = "Enumerating all path-split graphs"
layout = "section"
weight = 5
slug = "sec:anchors"
+++

The `CanonicalPathSplit` procedure in the previous section defines for all
graphs $G$ and choice of root operation $r$ a canonical PSG $G^\pi$, and thus a
canonical set of anchors $\pi$ that we write as $\pi_r(G) = \pi.$

Instead of `CanonicalPathSplit`, we can equivalently consider a
`CanonicalAnchors` procedure, which computes $\pi_r(G)$ directly instead of the
graph $G^{\pi_r(G)}$.

We formulate this computation below, using recursion instead of a `for` loop.
This form generalises better to the `AllAnchors` procedure that we will
introduce next.

The equivalence of the `CanonicalAnchors` procedure with `CanonicalPathSplit`
follows from the observation made in
{{< reflink "sec:simplifying-assumptions" >}} that ordering operations in
lexicographic order of the port labels is equivalent to a depth-first traversal
of the graph.

`CanonicalAnchors` implements a recursive depth-first traversal (DFS), with the
twist that the recursion is explicit only on the anchor nodes and otherwise
relying on the lexicographic ordering just like in `CanonicalPathSplit`: lines
5--15 of `CanonicalAnchors` correspond to the iterations of the `for` loop (line
11--20) of `CanonicalPathSplit` until an anchor operation is found (i.e. the
`else` branch on lines 18--20 is executed). From there, the graph traversal
proceeds recursively.

We introduce the `ConnectedComponent`, `Neighbours` and `RemoveOperation`
procedures; the first returns the connected component of the current operation,
whereas the other two procedures are used to traverse, respectively modify, the
graph $G$. Importantly, `Neighbours(G, op)` returns the neighbours of `op`
ordered by port label order.

To ensure that the recursive DFS does not visit the same operation twice, we
modify the graph with `RemoveOperation` on lines 11 and 15, ensuring that no
visited operation remains in `G`. As a consequence, `CanonicalAnchors` may be
called on disconnected graphs, which explains why an additional call to
`ConnectedComponent` (line 4) is required.

<!-- prettier-ignore-start -->
```python {linenos=inline}
def CanonicalAnchors(
    G: Graph, root: Operation, seen_paths: Set[int]
) -> (Set[Operation], Set[int], Graph):
  operations = Operations(ConnectedComponent(G, root))
  # sort by PathAsPortLabels, as previously
  sorted_operations := sort(operations)
  operations_queue := queue(sorted_operations)

  # Skip all operations that are not anchors
  op := operations_queue.pop() or return ({}, {}, G)
  G = RemoveOperation(G, op)
  while len(LinearPaths(G, op)) == 1 or
        issubset(LinearPaths(G, op), seen_paths):
    op = operations_queue.pop() or return ({}, {}, G)
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
<!-- prettier-ignore-end -->

{{% proposition title="Equivalence of `CanonicalPathSplit` and `CanonicalAnchors`" id="prop-tree-equiv" %}}

Let $G$ be a connected graph and let $r$ be a root operation in $G$. Then
`CanonicalAnchors` maps the graph to the canonical anchor set:

$$(G, r, \{\}) \mapsto (\pi(G)_r, L, \varnothing),$$

where $L$ is the set of all paths in $G$ and $\varnothing$ designates the empty
graph.

{{% /proposition %}}

The proof follows directly from the previous paragraphs.

#### Maximal PSGs

In addition to "simplifying" the data required to define path splitting, the
definition of PSGs using anchor operations has another advantage that is
fundamental to the pattern matching algorithm.

Consider the rooted dual tree $\tau_r(G^\pi)$ of a PSG with root operation $r$
in $G^\pi$. Recall that tree nodes are uniquely identified by their path from
the root and thus are considered equal if they are isomorphic as graphs. We can
in the same way define a tree inclusion relation $\subseteq$ on rooted dual
trees that corresponds to checking that the trees have the same root and that
the left-hand side is isomorphic to a subtree of the right-hand side. We also
require that the operation weights given by the $split$ map $split$ map coincide
on the common subtree.

{{% proposition title="Maximal PSG" id="prop-maxspanningtree" %}}

Let $G$ be a connected graph, $\pi$ a set of operations in $G$ and $r \in \pi$ a
root operation. Consider the set

$$\mathcal{G}_\pi = \{H \subseteq G \mid \pi_r(H) = \pi \}.$$

- There is a subgraph $M \subseteq G$ such that for all subgraphs
  $H \in \mathcal{G}_X$: $H \subseteq M$.
- Furthermore, for all graph $P$, there is $r'$ and $\pi' = \pi(P)_{r'}$ such
  that {{% centered numbered="maximal-psg" %}}
  $$P \simeq H \in \mathcal{G}_X \quad\Leftrightarrow\quad \tau_{r'}(P^{\pi'}) \subseteq \tau_r(M^\pi).$$
  {{% /centered %}}

We call $M^\pi$ the _maximal PSG_ with anchors $\pi$ in $G$.

<!-- prettier-ignore -->
{{% /proposition %}}

The proof gives an explicit construction for $M$.

<!-- prettier-ignore -->
{{% proof %}}
Assume $\mathcal{G}_X \neq \varnothing$, otherwise the statement is trivial.

_Construction of $M$._ Let $L$ be the set of linear paths in $G$ that go through
at least one operation in $\pi$. Consider the set of operations $O_L$ in $G$
given by the operations whose linear paths are contained in $L$. This defines a
subgraph $G|_{O_L}$ of $G$. Since $\mathcal{G}_X \neq \varnothing$, there exists
$H \in \mathcal{G}_X$. By assumption, $H$ is connected, and thus the anchors
$\pi$ of $H$ are connected in $H$. There is therefore a connected component
$M \subseteq G|_{O_L}$ that contains the set $\pi$.

_Well-definedness of $M^\pi$._ Consider the PSG $M^\pi$ of $M$. We must show
that $M^\pi$ is a tree-like graph for the proposition statement to be
well-defined. In other words, we must show that the interaction graph
$\mathcal{I}$ of $M^\pi$ is acyclic and connected. $M$ is connected by
construction, which implies connectedness of $M^\pi$ and thus of $\mathcal{I}$.
It is acyclic because $width(M) = |\pi| + 1$ and $M$ has exactly $|\pi|$
operations on more than one linear path. $\mathcal{I}$ is a thus a tree.

_$H \subseteq M$._ For any subgraph $H \in \mathcal{G}_X$, its operations must
be contained in $O_L$. Since any $H \in \mathcal{G}$ is connected and contains
$\pi$, it must further hold that $H \subseteq M$.

We can now prove the $\Leftrightarrow$ equivalence of
{{% refcentered "maximal-psg" %}}.

$\Leftarrow$: If $\tau_{r'}(P^{\pi'}) \subseteq \tau_r(M^\pi)$, then there
exists $H' \subseteq M^\pi$ with rooted dual tree

$$\tau_r(H^\pi) = \tau_r(P^{\pi'}).$$

Furthermore, by definition of $\subseteq$ on rooted trees, a $split$ map is
defined on $H'$, given by the $split$ map of $M^\pi$ on the domain $H'$. Recall
from {{< reflink "sec:treereduc" >}} that there is a map $\sigma$ that maps
$$(H', split) \overset{\sigma}{\longmapsto} H\quad\textrm{and}\quad(M^\pi, split) \overset{\sigma}{\longmapsto} M.$$
It merges split operations pairwise, and thus it is immediate that
$H' \subseteq M^\pi$ implies $H \subseteq M$. Thus $H \in \mathcal{G}_X$ and
$H' = H^\pi$. By construction, one can also derive that $P \simeq H$. The
statement follows.

$\Rightarrow$: Since $H \in \mathcal{G}_X$, we know from point 1 that
$H \subseteq M$. Thus we can define an injective embedding $\varphi: P \to M$.

Operation splitting leaves the set of values from $H$ to $H^\pi$, as well as
from $M$ to $M^\pi$ unchanged. Similarly, there is a bijection between values in
$H^\pi$ and $M^\pi$ and thus between edges in $\tau_r(H^\pi)$ and
$\tau_r(M^\pi)$. The pattern embedding $\varphi$ hence defines an injective map
$\phi_E$ from tree edges in $\tau_r(H^\pi)$ to tree edges in $\tau_r(M^\pi)$. We
extend this map to a map on the trees $\phi: \tau_r(H^\pi) \to \tau_r(M^\pi)$ by
induction over the nodes set of $\tau_r(H^\pi)$. We start by the root map
$\phi(r) = r$. Using $\phi_E$, we can then uniquely define the image of any
child node of $r$ in $\tau_r(H^\pi)$, and so forth inductively.

We show now that the map $\phi$ thus defined is injective. Suppose $v, v'$ are
nodes in $\tau_r(H^\pi)$ such that $\phi(v) = \phi(v')$. By the inductive
construction there are paths from the root $r$ to $v$ and $v'$ respectively such
that their image under $\phi_E$ are two paths from $r$ to $\phi(v) = \phi(v')$.
But $\tau_r(M^\pi)$ is a tree, so both paths must be equal. By bijectivity of
$\phi_E$, it follows $v = v'$, and thus $\phi$ is injective. Finally, the value
and operation weights are invariant under pattern embedding and thus are
preserved by definition.

<!-- prettier-ignore -->
{{% /proof %}}

This result means that instead of listing all PSGs for every possible subgraph
of $G$, it is sufficient to proceed as follows:

1. for every pattern $P$, fix a root operation $r_P$ and construct the rooted
   tree dual of the canonical PSG $$\tau_P := \tau_{r_P}(P^{\pi_{r_P}(P)}).$$
2. enumerate every possible root operation $r$ in $G$,
3. enumerate every possible sets of anchors $\pi$ in $G$ with root $r$,
4. for each set $\pi$, find the maximal PSG $M$ with anchors $\pi$ in $G$, and
   take its rooted tree dual $\tau_M := \tau_r(M^\pi)$,
5. find all patterns $P$ such that $\tau_P \subseteq \tau_M$.

In other words, if `AllAnchors` is a procedure that enumerates all possible sets
of anchors $\pi$ in $G$ and `MaximalPathSplit` computes the maximal PSG $M$ as
presented in the proof of {{% refproposition "prop-maxspanningtree" %}}, then
`AllPathSplits(G)` can simply be obtained by calling `AllAnchors` and then
returning their respective maximal PSGs in $G$:

```python
def AllPathSplits(G: Graph, root: Operation) -> Set[Graph]:
  all_anchors = AllAnchors(G, root)
  return {MaximalPathSplit(G, pi) for pi in all_anchors}
```

#### The missing piece: `AllAnchors`

We can now complete the definition of `AllPathSplits` by defining the
`AllAnchors` procedure, which enumerates all possible sets of anchors in $G$
given a root operation $r$.

The procedure is similar to `CanonicalAnchors`, described in detail in the
previous paragraphs. In addition to the arguments of `CanonicalAnchors`,
`AllAnchors` requires a width $w \geq 1$ argument. It then returns all sets of
$w$ operations that form the canonical anchors of some width-$w$ subgraph of $G$
with root $r$. The main difference between `CanonicalAnchors` and `AllAnchors`
is that the successive recursive calls (line 22 in `CanonicalAnchors`) are
replaced by a series of nested loops (lines 42--48 in `AllAnchors`) that
exhaustively iterate over the possible outcomes for different subgraphs of $G$.
The results of every possible combination of recursive calls are then collected
into a list of anchor sets, which is returned.

```python {linenos=inline}
def AllAnchors(
    G: Graph, root: Operation, w: int,
    seen_paths: Set[int] = {}
) -> List[(Set[Operation], Set[int], Graph)]:
  # Base case: return one empty anchor list
  if w == 0:
    return [({}, {}, G)]

  operations = Operations(ConnectedComponent(G, root))
  sorted_operations := sort(operations)
  operations_queue := queue(sorted_operations)

  op := operations_queue.pop() or return [({}, {}, G)]
  G = RemoveOperation(G, op)
  while len(LinearPaths(G, op)) == 1 or
        issubset(LinearPaths(G, op), seen_paths):
    op = operations_queue.pop() or return [({}, {}, G)]
    G = RemoveOperation(G, op)

  seen0 = union(seen_paths, LinearPaths(G, op))
  # There are always at most three neighbours: we
  # unroll the for loop of CanonicalAnchors.
  [child1, child2, child3] = Neighbours(G, op)
  # Iterate over all ways to split w-1 anchors over
  # the three children and solve recursively
  all_anchors = []
  for 0 <= w1, w2, w3 < w with w1 + w2 + w3 == w - 1:
    for (anchors1, seen1, G1) in
        AllAnchors(G, child1, w1, seen0):
      for (anchors2, seen2, G2) in
          AllAnchors(G1, child2, w2, seen1):
        for (anchors3, seen3, G3) in
            AllAnchors(G2, child3, w3, seen2):
          # Concatenate new anchor with anchors from all paths
          anchors = union([op], anchors1, anchors2, anchors3)
          all_anchors.push((anchors, seen3, G3))
  return all_anchors
```

The part of the pseudocode that is without comments is unchanged from
`CanonicalAnchors`. Using {{% refproposition "prop-dualspanningtree" %}}, we
know that we can assume that every operation has at most 3 children, and thus 3
neighbours in `G`, given that the operations equivalent to parent nodes were
removed.

Let us write $\Pi_r^w(G)$ for the set of sets of anchors returned by
`AllAnchors(G, r, w, {})`.

<!-- prettier-ignore -->
{{< proposition title="Correctness of AllAnchors" id="prop-allanchors-correctness" >}}

Let $G$ be a graph and $H \subseteq G$ be a subgraph of $G$ of width $w$. Let
$r$ be a choice of root operation in $H$. We have
$\pi_r(H) \subseteq \Pi_r^w(G).$

<!-- prettier-ignore -->
{{< /proposition >}}

The proof is by induction over the width $w$ of the subgraph $H$. The idea is to
map every recursive call in `CanonicalAnchors` to one of the calls to
`AllAnchors` on lines 29, 31 or 33. All recursive results are concatenated on
line 36, and thus, the value returned by `CanonicalAnchors` will be one of the
anchor sets in the list returned by `AllAnchors`.

<!-- prettier-ignore -->
{{% proof %}}

Let $H \subseteq G$ be a connected subgraph of $G$ of width $w$. We prove
inductively over $w$ that if $(X, S', H') = $`CanonicalAnchors`$(H,
r,S)$
then there is a graph $G'$ such that $H' \subseteq G' \subseteq G$ such
that

$(X, S', G') \in$ `AllAnchors`$(G, r, w, S)$

for all valid root operations $r$ of $H$ and all subsets of the linear paths of
$H$ in `seen_paths`. The statement in the proposition directly follows this
claim.

For the base case $w = 1$, `CanonicalAnchors` will return the anchors
`anchors = [op]` as defined on line 19: there is only one linear path, and it is
already in `seen_paths`, thus for every recursive call to `CanonicalAnchors`,
the `while` condition on line 12 will always be satisfied until all operations
have been exhausted and empty sets are returned. In `AllAnchors`, on the other
hand, The only values of `w1`, `w2` and `w3` that satisfy the loop condition on
line 27 for $w = 1$ are `w1` $=$ `w2` $=$ `w3` $= 0$. As a result, given the `w`
$=0$ base case on lines 6--7, the lines 35 and 36 of `AllAnchors` are only
executed once, and the definition of `anchors` on line 36 is equivalent to its
definition in `CanonicalAnchors`.

We now prove the claim for $w > 1$ by induction. As documented in `AllAnchors`,
we can assume that every operation has at most 3 children. This simplifies the
loop on lines 21--25 of `CanonicalAnchors` to, at most, three calls to
`CanonicalAnchors`.

Consider a call to `CanonicalAnchors` for a graph $H \subseteq G$, a root
operation $r$ in $H$ and a set $S$ of linear paths. Let $w_a$, $w_b$ and $w_c$
be the length of the values returned by the three recursive calls to
`CanonicalAnchors` of line 22 for the execution of `CanonicalAnchors` with
arguments $H$, $r$ and $S$. Let $c_a, c_b$ and $c_c$ be the three neighbours of
$r$ in $H$. If the child $c_x$ does not exist, then one can set $w_x = 0$ and it
can be ignored---the argument below still holds in that case. The definition of
`seen0` on line 20 in `AllAnchors` coincides with the update to the variable
`seen_paths` on line 18 of `CanonicalAnchors`; similarly, the updates to `G` on
lines 14 and 18 of `AllAnchors` are identical to the lines 11 and 15 of
`CanonicalAnchors` that update `H`. Let the updated `seen_paths` be the set
$S_a$, the updated `G` be $G_a$ and the updated $H$ be $H_a$, with
$H_a \subseteq G_a$.

As every anchor operation reduces the number of unseen linear paths by exactly
one (using the simplifying assumptions of
{{% reflink "sec:simplifying-assumptions" %}}), it must hold that
$w_a + w_b + w_c + 1 = w$. Thus, for a call to `AllAnchors` with the arguments
$G$, $r$, $w$ and $S$, there is an iteration of the `for` loop on line 27 of
`AllAnchors` such that `w1` $= w_a$, `w2` $= w_b$ and `w3` $= w_c$. It follows
that on line 29 of `AllAnchors`, the procedure is called recursively with
arguments $(G_a, c_a, w_a, S_a)$. From the induction hypothesis, we obtain that
there is an iteration of the `for` loop on line 29 in which the values of
`anchors1` and `seen1` coincide with the values of the `new_anchors` and
`seen_paths` variables after the first iteration of the `for` loop on line 21 of
`CanonicalAnchors`. Call the value of `seen1` (and `seen_paths`) $S_b$.
Similarly, call the updated value of `G` in `AllAnchors` $G_b$ and the updated
value of `G` in `CanonicalAnchors` $H_b$. We have, by the induction hypothesis,
that $H_b \subseteq G_b$.

Repeating the argument, we obtain that there are iterations of the `for` loops
on lines 30 and 32 of `AllAnchors` that correspond to the second and third
recursive calls to `CanonicalAnchors` on line 22 of the procedure. Finally, the
concatenation of anchor lists on line 36 of `AllAnchors` is equivalent to the
repeated concatenations on line 25 of `CanonicalAnchors`, and so we conclude
that the induction hypothesis holds for $w$.

{{% /proof %}}

We will see that the overall runtime complexity of `AllAnchors` can be easily
derived from a bound on the size of the returned list. For this, we use the
following result:

{{% proposition title="Number of anchor sets in `AllAnchors`" id="prop-nanchors" %}}

For a graph $G$, a root operation $r$ in $G$ and $1 \leq w \leq width(G)$, the
length of the list `AllAnchors`$(G, r, w)$ is in $O(c^w \cdot w^{-3/2})$, where
$c = 6.75$ is a constant.

{{% /proposition %}}

{{% proof %}}

Let $C_w$ be an upper bound for the length of the list returned by a call to
`AllAnchors` for width $w$. For the base case $w = 0$, $C_0 = 1$. The returned
`all_anchors` list is obtained by pushing anchor lists one by one on line 36. We
can count the number of times this line is executed by multiplying the length of
the lists returned by the recursive calls on lines 28--32, giving us the
recursion relation

$$C_w \leq \sum_{\substack{0 \leq w_1, w_2, w_3 < w\\w_1 + w_2 + w_3 = w - 1}} C_{w_1} \cdot C_{w_2} \cdot C_{w_3}.$$

Since $C_w$ is meant to be an upper bound, we replace $\leq$ with equality above
to obtain a recurrence relation for $C_w$. This recurrence relation is a
generalisation of the well-known Catalan numbers @Stanley2015, equivalent to
counting the number of ternary trees with $w$ internal nodes: a ternary tree
with $w \geq 1$ internal nodes is made of a root along with three subtrees with
$w_1,w_2$ and $w_3$ internal nodes respectively, with $w_1 + w_2 + w_3 = w-1$. A
closed form solution to this problem can be found in @Aval2008&#x200B;:

$$C_w = \frac{{3w \choose w}}{2w + 1} = \Theta \left(\frac{c^w}{w^{3/2}} \right)$$

satisfying the above recurrence relation with equality, where $c = 27/4 = 6.75$
is a constant obtained from the Stirling approximation:

<!-- prettier-ignore -->
$$\begin{aligned}{3w \choose w} = \frac{(3w)!}{(2w)!w!} &= \Theta\left(\frac{1}{\sqrt{w}}\right)
\Big(\frac{(3w)^3}{e^3}\Big)^{w}\Big(\frac{e^2}{(2w)^2}\Big)^{w}\Big(\frac{e}{w}\Big)^{w}\\
&= \Theta\left(\frac{(27/4)^w}{w^{1/2}}\right).\end{aligned}$$

<!-- prettier-ignore -->
{{% /proof %}}

To obtain a runtime bound for `AllAnchors`, it is useful to identify how much of
$G$ needs to be traversed. If we suppose all patterns have at most depth $d$,
then it immediately follows that any operation in $G$ that is in the image of a
pattern embedding must be at most a distance $d$ away from an anchor operation.
We can thus equivalently call `AllAnchors` on a subgraph of $G$ such that no
linear path is longer than $2d$. We thus obtain the following runtime.

<!-- prettier-ignore -->
{{< proposition title="Runtime of `AllAnchors`" id="prop-allanchors" >}} For
patterns with at most width $w$ and depth $d$, the total runtime of `AllAnchors`
is in $$O\left(\frac{c^w \cdot d}{w^{1/2}}\right).$$

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

We restrict `Operations` on line 9 to only return the first $d$ operations on
the linear path in each direction, starting at the anchor operation: operations
more than distance $d$ away from the anchor cannot be part of a pattern of depth
$d$.

We use the bound on the length of the list returned by calls to `AllAnchors` of
{{% refproposition "prop-nanchors" %}} to bound the runtime. We can ignore the
non-constant runtime of the concatenation of the outputs of recursive calls on
line 35, as the total size of the outputs is asymptotically at worst of the same
complexity as the runtime of the recursive calls themselves. Excluding the
recursive calls, the only remaining lines of `AllAnchors` that are not executed
in constant time are the `while` loop on lines 15--18 and the `Operations` and
`sort` calls on lines 9--11. Using the same argument as in `CanonicalAnchors`,
we can ignore the latter two calls by replacing the queue of operations by a
lazy iterator of operations. The next operation given `op` and the graph `G` can
always be computed in $O(1)$ time using a depth-first traversal of `G`.

Consider the recursion tree of `AllAnchors`, i.e. the tree in which the nodes
are the recursive calls to `AllAnchors` and the children are the executions
spawned by the nested `for` loops on line 28--32. This tree has at most

$$C_w = \Theta\left(\frac{c^w}{w^{3/2}}\right)$$

leaves. A path from the root to a leaf corresponds to a stack of recursive calls
to `AllAnchors`. Along this recursion path, `seen_paths` set is always strictly
growing (line 35) and the operations removed from `G` on lines 14 and 18 are all
distinct. For each linear path, at most $2d$ operations are traversed. Thus the
total runtime of the `while` loop (lines 15--18) along a path from root to leaf
in the recursion tree is in $O(w \cdot d)$. We can thus bound the overall
complexity of executing the entire recursion tree by
$O(C_w \cdot w \cdot d) = O(\frac{c^w \cdot d}{w^{1/2}})$.

<!-- prettier-ignore -->
{{% /proof %}}
