+++
title = "Factorising the GTS search space"
layout = "section"
weight = 4
slug = "sec:factor-gts"
+++

Equality saturation introduces a persistent data structure
that encodes not only a single computation (term), but
all equivalent computations that can be obtained from sequences
of rewrites applied to it.
The result of this compact representation is a _factorisation_
of the term rewriting search space:
the same solution space (in fact, a strictly greater one) can be
covered by a much smaller search space.

Whilst the exact data structure of equality saturation does not
apply to computation graphs with linear resources, it turns out
that a similar factorisation of the search space is also
obtainable for GTS search space exploration.
Throughout this section, we consider a GTS and will aim to bound the size
of the space of possible sequences of rewrites starting from
an input graph $G$ using the GTS.

#### A lower bound for the naive search tree

Consider an input graph $G$.
The graphs $G'$ that can be obtained from $G$ by applying
a sequence of transformations from the GTS form the nodes of a (possibly infinite) tree $T$,
with edges between graphs given by the transformations.
The path from the root $G$ to $G'$ is the sequence of transformations that produces $G'$.
We call $T$ the naive search tree of $G$.

As in the previous section, we assume that every transformation
$t \in E(T)$ introduces fresh vertices;
that is to say, the new vertices introduced by transformations in $T$ form disjoint sets.
Thus, if a vertex $v$ is contained in the vertex sets of two graphs $G_1, G_2 \in V(T)$,
then either $v \in V(G)$ or there is a shared transformation that introduces $v$
contained in both sequences of transformations that produce $G_1$ and $G_2$.
For two transformations $t_1$ and $t_2$, we say that $t_2$ overlaps $t_1$ if the
former deletes a vertex that the latter introduces.

For a depth $\Delta \geqslant 0$, we say a graph $G'$ is reachable from $G$
within depth $\Delta$ in the GTS if there is a sequence of transformations in the GTS
from $G$ to $G'$ such that all subsequences formed of overlapping transformations
have length at most $\Delta$.
We fix $\Delta$ and from now on consider naive search trees truncated to the set of
graphs reachable from $G$ within depth $\Delta$.

We wish to derive a lower bound on the size of $T$ for a fixed GTS, fixed $G$ and fixed $\Delta$.
We consider for this a partition of $G$ into subgraphs $\Pi_1, \ldots, \Pi_n$ such that
on each subgraph $\Pi_i$,  there are at least two applicable transformations in the GTS.
We can then consider the subtree of the naive search tree $T$ that only contains the
graphs obtained by applying one of the two applicable transformations in each subgraph
of the partition.

Naively, this search tree will contain all $n!$ orderings of partition subgraphs
and for each $\Pi_i$ of them, all $2^n$ possible choices of transformations---resulting
in a search tree with $2^n \cdot n!$ leaves.
If we instead detect and merge duplicate graphs within the search tree, this reduces
to "only" $2^n$ unique graphs[^sameres].
[^sameres]: The same result can be obtained by simply fixing the ordering in which
the possible transformations are applied.

We can generalise this to a lower bound for the naive search tree of all graphs reachable
within depth $\Delta$.

Notice that if a graph $G'$ is obtained from $G$ by a transformation $t \in E(T)$ that is fully
contained within one of the partition subgraphs $\Pi_i$, then the partition of $G$
also defines a partition of $G'$ by assigning all vertices of $G'$ that are also in $G$
to the same subgraph $\Pi_i$ and the new vertices introduced by the right hand side
of $t$ to the same subgraph as all the vertices matched by $t$ in $G$.
Define the subtree $T'$ of $T$ recursively as follows:
- the root $G$ is in $T'$,
- the child $G'$ of a graph is in $T'$ if $G'$ is obtained from a transformation
  that is fully contained within one of the partition subgraphs $\Pi_i$ of the parent
- the partition of a child $G'$ is induced by the partition of the parent $G$ as described above.

We can always choose $n$ and a partition $\Pi_1, \ldots,\Pi_n$ of $G$ into subgraphs[^justgocoarser]
such that the property
$$\textrm{for all $\Pi_i$, there are at least two applicable transformations in the GTS}$$
holds not only for the partition of $G$, but for any graph $G' \in V(T')$.
[^justgocoarser]: if the property does not hold for some $G' \in V(T')$, then one can
always merge partitions and decrease $n$ until the property holds.

By repeating $\Delta$ times the search tree of size $2^n$, which corresponds
to graphs reachable within depth $\Delta = 1$, we obtain a lower bound
$$(2^n)^\Delta$$
for the number of leaves in $T'$.
We have obtained the following lower bound for $T$.
{{% proposition title="Lower bound for naive search trees" number="5.1" %}}
The naive search tree of all graphs reachable from a graph $G$ within depth $\Delta$
in a GTS contains $\Omega(2^{\Delta \cdot n})$ graphs.
{{% /proposition %}}
Noe that this is a very rough lower bound on the size of $T$.
The subtree $T'$ does not contain any transformations that span more than one partition
subgraph; and even within $T'$, there are reachable graphs that are not accounted for, such as
graphs obtained by applying a sequence of $\delta \leqslant \Delta$
overlapping transformations within a single partition subgraph, but that leave
other subgraphs unmodified.

We conjecture that for most GTS of practical interest and for fixed maximal depth $\Delta$,
it holds $n = \Theta(|G|)$, i.e. $n$ grows linearly with the graph size.
Here $|G|$ designates the number of vertices in $G$.

An example of a sufficient condition for this asymptotic correspondence to hold
would be $\Delta = 1$ and a GTS with a non-zero "minimal pattern density" $\rho > 0$,
where we define $\rho$
as the largest value $0 \leqslant \rho \leqslant 1$ such that for any graph $G$
that satisfies $|G| \geqslant \rho^{-1}$, there is at least one transformation in the GTS
that can be applied to $G$.
Then
$$\left\lfloor \frac12 \rho |G| \right\rfloor \leqslant n \leqslant |G|.$$
For $\Delta > 1$, assuming any transformation in the GTS removes at most $q$ vertices,
the above relation can be adjusted for the possibly shrinking subgraph size in the partition
$$\left\lfloor \frac12 \rho (|G| - q \cdot (\Delta - 1)) \right\rfloor \leqslant n \leqslant |G|,$$
so that the linear relation still holds asymptotically for constant $\Delta$ and large $|G|$.

#### Factorised search space and upper bound

Consider all transformations $E(T)$ in a naive search tree $T$ (truncated to graphs reachable within depth $\Delta$),
for some fixed GTS and input graph $G$.
The overlapping relation between transformations in $E(T)$ defines a partial order $\leqslant$:
we write $t_1 \leqslant t_2$ if $t_2$ overlaps $t_1$.
For any two transformations without an ordering, i.e. neither $t_1 \not\leqslant t_2$
nor $t_2 \not\leqslant t_1$, the order in which they are applied is irrelevant:
it is easy to show that for a sequence of transformations that includes $t_1$ and $t_2$,
the graph obtained is left unchanged by swapping the order of application of $t_1$ and $t_2$.

We propose to use this symmetry explicitly when exploring the set of reachable graphs
and show that this
drastically reduces the size of the search space.
Consider the directed acylic graph $F$ given by the transitive reduction of $\leqslant$
on the set of all transformations $E(T)$.
We call it the factorised search space.

By construction, any graph $G' \in V(T)$ in the naive search tree maps injectively to a
_subgraph_ $F_{G'} \subseteq F$ of the factorised search tree,
given by the subgraph of $F$ induced by the transformations on the path from $G$ to $G'$
in $T$.
It will be the topic of the next section to demonstrate how this space can efficiently
be traversed to speed up the exploration of the search space.
For now, we instead focus on estimating its size.

Whereas our earlier discussion was focused on proving a lower bound for the size of the
search tree, we now change gear to instead derive an _upper_ bound on the size of the
factorised space. This will enable us to prove a gap between the two asymptotic regimes.

Consider the same partition of the input graph $G$ into $n$ subgraphs $\Pi_1, \ldots, \Pi_n$.
Instead of caring about the fact that each subgraph contains at _least_ two applicable
transformations, we now wish to upper bound the number of transformations in $\Pi_i$.
Unlike the lower bound in the naive search tree where our considerations could be
restricted to a subtree $T' \subseteq T$---on which it was straightforward
to derive partitions on all graphs in $T'$ from the partition of $G$---we must
here define a partition (or rather, a covering) for all graphs in $T$.
We proceed as follows:
1. Given a covering $\Pi_1, \ldots, \Pi_n$ of $G$, extend the subgraphs $\Pi_i$
in so that all applicable transformations in $G$
are contained in one of the subgraphs---the resulting subgraphs
$\widetilde\Pi_1, \ldots, \widetilde\Pi_n$ are no longer disjoint.
2. Assign each transformation in $G'$ to one of the subgraphs it is contained in.
3. Define the covering on the children of $G$ by deriving it from the covering on $G$,
similarly to the way we derived the partitions in the lower bound for the naive search tree.
4. Repeat the process recursively.

The resulting subgraphs $\widetilde\Pi_1, \ldots, \widetilde\Pi_n$ are no longer disjoint
and form a covering of $G$ rather than a partition. For our purposes, this makes no difference.
To avoid that the size of covering subgraphs grows too large,
overlaps between covering subgraphs can be removed from one of the subgraphs
to the extent that the assignment of transformations to covering subgraphs in step 2 can still
be satisfied.

Define $s$ as an upper bound on the number of transformations assigned to any of the subgraphs
$\widetilde\Pi$ of any of the graphs in $T$.
Further, for the subgraphs $\widetilde\Pi_1, \dots, \widetilde\Pi_n$ of a graph $G'$,
consider the sets
$$A_{\widetilde\Pi_i} = \left\{j \mid \textrm{there is }t\in E(T) \textrm{ that overlaps both }\widetilde\Pi_i \textrm{ and }\widetilde\Pi_j\right\}$$
and define $\gamma$ as an upper bound on the number of elements in the sets $A_{\widetilde\Pi_i}$,
i.e. such that $\gamma \geqslant |A_{\widetilde\Pi_i}|$ for all $i$
and all graphs $G'$ in $T$[^badsgamma].
[^badsgamma]: The construction of the coverings of graphs in $T$ is not unique and in
fact leaves a lot of room for choices. Poor choices of coverings can be constructed,
which will result in large values for $s$ and $\gamma$ and result in worse asymptotic bounds.
In the _ideal_ case (similar to the naive search tree), we expect asymptotically
that $n = \Theta(|G|)$, $s = const$ and $\gamma = const$.

We will make the further assumption that all applicable transformations within
a covering subgraph are mutually exclusive, i.e. they modify a shared subgraph so that
it is never possible to apply more than one transformation among the (up to $s$) applicable
ones.
This can always be made to hold by replacing any set of mutually disjoint transformations
with their cartesian product, that is, viewing the application of multiple disjoint
transformations as one large transformation[^costsalotofs].
[^costsalotofs]: At the cost of a larger value for $s$.

To count the number of transformations in $F$, we upper bound the total number of transitions
in $F$ assigned to the $i$-th covering subgraph across all graphs $G'$ in $T$.
Assuming $T$ is truncated to graphs within depth $\Delta$ and
calling this bound $D_\Delta$, it will then follow that $|F| \leqslant n \cdot D_\Delta$.

The bound $D_\Delta$ can be obtained recursively:
$D_1 = s$ upper bounds by definition the number of transformations in any covering
subgraph of the root graph $G$ in $T$.
We then proceed by induction for $1 < \delta \leqslant \Delta$.
A transformation $t \in E(T)$ overlaps with at most $\gamma$ other covering subgraphs---it
will thus have at most $\gamma$ parents in $F$, each of which must be chosen from
a set of size at most $D_{\delta - 1}$.
There are further at most $s$ transformations in any covering subgraph for a given
set of parents. We thus obtain the recursion:
$$D_\delta = s \cdot (D_{\delta - 1} + 1)^\gamma,$$
where the $+1$ comes from the option of not choosing any parent for in a particular covering
subgraph.
Unrolling the recursion, we can write this as
$$D_\delta = \Theta(s)^{1 + \gamma + \gamma^2 + \dots + \gamma^{\delta - 1}} = \Theta(s)^{\frac{\gamma^\delta - 1}{\gamma - 1}} = \Theta(s)^{\Theta(\gamma^{\delta - 1})}.$$

{{% proposition title="Upper bound for factorised search space" number="5.2" %}}
The factorised search space $F$ contains at most $n \cdot O(s)^{\Theta(\gamma^{\Delta - 1})}$
transitions.
{{% /proposition %}}

#### Discussion of the bound gap
The main feature of the gap between the two bounds we have proved is that the upper
bound of the factorised search space is _linear_ in $n$, and thus linear in the size of the
input graph $G$.
This stands in stark contrast to the lower bound of the naive search tree, which scales
exponentially with the size of the input graph.
The over variables in the bound of Proposition 5.2 are _local_ properties of the GTS:
$s$ relates to the density of transformations (see the "minimal pattern density" $\rho$),
whereas $\gamma$ relates to the number of parent transformations that a transformation
can overlap with (and thus ultimately, is bounded by the size of the pattern in the
transformation).

Note further that whilst it looks as though there would be a regime of $s, \gamma, \Delta$ and $n$
in which the factorised search space is larger than the naive search tree, this is not the case.
It is purely an artifact of the looseness of our bounds: it is easy to see that
each state in the factorised search space must also appear in the naive search tree,
and thus we always have $|F| \leqslant |T|$.
