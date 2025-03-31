+++
title = "Complexity separation of the search space size"
layout = "section"
weight = 5
slug = "sec:factor-gts"
+++

We show in this section that there is a complexity advantage over previous
approaches to using the confluently persistent data structure $\mathcal{D}$ for
graph optimisations in GTSs. Our argument relies on the comparison of asymptotic
bounds for the sizes of two sets $\mathcal{G}_\Delta$ and $\mathcal{D}_\Delta$,
which we now define.

Let us introduce first the notion of _overwriting rewrites_.

{{% definition title="Overwriting rewrite" id="def:overwriting-rewrite" %}}

For two rewrites $r_1$ and $r_2$, we say that $r_2$ _overwrites_ $r_1$, written
$r_1 \twoheadrightarrow r_2$, if the deletion set $V^-_2$ of $\delta_2$ includes
a vertex of the vertex set $V_1$ of the replacement graph of $r_1$

$$V^-_2 \cap V_1 \neq \varnothing.$$

{{% /definition %}}

The definition can identically be applied to edits. In this case, the
overwriting edits are precisely given by the parent-child relation: the set of
all overwriting edits of $\delta \in \mathcal{D}$ is by definition the set of
parents $P(\delta)$ of $\delta$.

We consider throughout this section a fixed GTS and a fixed input graph $G$. A
graph $G'$ is reachable from $G$ within depth $\Delta \geqslant 0$ if there is a
sequence of rewrites $r_1, \dots, r_\ell$ in the GTS from $G$ to $G'$ such that
all subsequences $r_{\beta_1}, \dots, r_{\beta_k}$ formed of overwriting
rewrites $r_{\beta_i} \twoheadrightarrow r_{\beta_{i + 1}}$ have length at most
$k \leqslant \Delta$.

The set $\mathcal{G}_\Delta$ is the set of all graphs reachable within depth
$\Delta$. We derive:

1. a lower bound on the size of $|\mathcal{G}_\Delta|$, the space of all graphs
   reachable in at most $\Delta$ rewrites from some input $G$, and
2. an upper bound on the size of the equivalent confluently persistent data
   structure $\mathcal{D}_\Delta$, i.e. such that
   $$\mathcal{G}_\Delta = \{ flat(D) \mid D \in \Gamma(\mathcal{D}_\Delta) \}.$$

The asymptotic complexity separation we obtain between the two sets shows that
confluent persistence factorises the space of reachable graphs $\mathcal{G}$
into a much smaller space $\mathcal{D}$. We conjecture that in most "typical"
GTSs, the size $|\mathcal{D}_\Delta|$ will scale _linearly_ with the input size
$|G|$, whereas $|\mathcal{G}_\Delta|$ scales exponentially.

### Lower bound on the naive search tree

The edit history of the set of graphs $\mathcal{G}_\Delta$ defines a tree
$T_\Delta$, where $\mathcal{G}_\Delta$ are the nodes and
$G_p \in \mathcal{G}_\Delta$ is the parent of $G_c \in \mathcal{G}_\Delta$ if
there is a rewrite $r$ rewriting $G_p$ to $G_c$ in the GTS. Paths in $T_\Delta$
are sequences of rewrites. We call $T_\Delta$ the _naive_ search tree of the
GTS. We wish to derive a lower bound for $|T_\Delta|$.

#### Graph partitioning

We assume that the GTS search space on input $G$ is non-trivial up to depth
$\Delta$, i.e. there is always at least one applicable rewrite for every graph
$G' \in T_{\Delta - 1}$ (otherwise the search problem we are trying to solve is
trivial). Then let $n > 0$ be the largest integer such that for all graphs
$G' \in T$, there exists a partition of $G'$ into subgraphs
$\Pi_1, \ldots, \Pi_n$ that satisifes the following property, for all
$1 \leq i \leq n:$

{{% centered %}}

_there exists a rewrite in the GTS that can be applied to $\Pi_i$._

{{% /centered %}}

Such an $n$ and partitioning scheme always exists ($n=1$ is the assumption we
have just imposed).

#### Lower bound on $|T_\Delta|$

For each $G' \in T_\Delta$ and $\Pi_i$, pick a rewrite $r_i(G')$ that applies to
$\Pi_i$ and let $R$ be the set of all such rewrites

$$R_\Delta = \{ r_i(G') \mid 1 \leq i \leq n, G' \in T_\Delta \}.$$

We can consider the subtree $T'_\Delta \subseteq T_\Delta$ that only contains
graphs obtained by applying rewrites in $R_\Delta$.

For $\Delta = 1$, the search tree $T'_\Delta$ will contain $2^n$ graphs: for
each subgraph $\Pi_i$ of the input graph $G$, we can choose to either apply
$r_i(G)$ or not[^sameres].

[^sameres]:
    Note that this counting is already an act of clemency: we are not counting
    all permutations of the rewrites, which would be considered separately by a
    naive exploration that applies one graph rewrite at a time. In this case,
    the search tree for $\Delta = 1$ would contain $n! \cdot 2^n$ graphs.

By repeating $\Delta$ times the search tree of size $2^n$ for $\Delta = 1$, we
obtain a lower bound

$$|\mathcal{G}_\Delta| = |T_\Delta| \geqslant |T'_\Delta| = (2^n)^\Delta.$$

We frame this result as the following proposition.

{{% proposition title="Lower bound for $|\mathcal{G}_\Delta|$" id="prop:lower-bound-gts" %}}

The naive search tree size $|\mathcal{G}_\Delta|$ is in
$\Omega(2^{\Delta \cdot n})$.

{{% /proposition %}}

We conjecture that for most GTS of practical interest, it holds
$n = \Theta(|G|)$, i.e. $n$ grows linearly with the graph size. Here $|G|$
designates the number of vertices in $G$.

An example of a sufficient condition for this asymptotic correspondence to hold
would be a GTS and a graph domain in which the possible rewrites are "uniformly
distributed", i.e. for any large enough subgraph, there are applicable rewrites
in the GTS. We could formalise this with a "minimal pattern density" measure
$\rho$, given by the largest value $0 \leqslant \rho \leqslant 1$ such that for
any graph $G$ that satisfies $|G| \geqslant \rho^{-1}$, there is at least one
rewrite in the GTS that can be applied to $G$. Then, for any graph domain that
admits a non-zero $\rho$ and $\Delta = 1$, we have

$$\left\lfloor \rho \cdot |G| \right\rfloor \leqslant n \leqslant |G|.$$

For $\Delta > 1$, assuming any rewrite in the GTS removes at most $q$ vertices,
the above relation can be adjusted for the possibly shrinking subgraph size in
the partition

$$\left\lfloor \frac12 \rho (|G| - q \cdot (\Delta - 1)) \right\rfloor \leqslant n \leqslant |G|,$$

so that the linear relation $n = \Theta(|G|)$ still holds asymptotically for
constant $\Delta$.

### Upper bound on the factorised search space

Consider two rewrites $r_1$ and $r_2$. If neither overwrites the other, i.e.
$r_1 \not\twoheadrightarrow r_2$ and $r_2 \not\twoheadrightarrow r_1$, then the
order in which they are applied is irrelevant (see also
{{% refproposition "prop-flat-graph" %}}). The persistent data structure
$\mathcal{D}$ uses this symmetry explicitly when exploring the set of reachable
graphs.

This drastically reduces the size of the edit history of $\mathcal{D}_\Delta$.
The edit history defines a directed acyclic graph $F_\Delta$ that is the
equivalent for $\mathcal{D}_\Delta$ to the naive search tree $T_\Delta$ of
$\mathcal{G}_\Delta$. The vertices of $F_\Delta$ are the flattened histories of
edits in $\mathcal{D}_\Delta$:

$$V(F_\Delta) = \{flat(\{\,\delta\,\}) \mid \delta \in \mathcal{D}_\Delta\},$$

with an edge from $flat(\{\,\delta_p\,\})$ to $flat(\{\,\delta_c\,\})$ if there
is a parent-child relation $\delta_p \in P(\delta_c)$. We call $F_\Delta$ the
_factorised search space_ of $\mathcal{D}_\Delta$.

By construction, any graph $G' \in V(T)$ in the naive search tree maps
injectively to a _subgraph_ $S \subseteq F_\Delta$ of the factorised search
space, given by the subgraph of $F$ induced by the rewrites on the path from $G$
to $G'$ in $T$.

Whereas our earlier discussion was focused on proving a lower bound for the size
of the search tree, we now show an upper bound on the number of graphs
$|F_\Delta|$ in the factorised search space.

#### Graph covering

Instead of considering partitions of graphs in $T_\Delta$ as we did above, we
now consider _coverings_ of graphs $G'$ in $F_\Delta$, i.e. a set of subgraphs
$\Gamma_1, \ldots, \Gamma_n$ such that their union is $G'$ but that might not be
disjoint.

Let $n$ be the same integer as picked for the partitions of $T_\Delta$. We fix
parameters $s$ and $\gamma$ and coverings $\Gamma_1, \ldots, \Gamma_n$ for each
graph $G' \in V(F_\Delta)$ such that:

- for all $G'$ and $1 \leqslant i \leqslant n$, there are at most $s$ applicable
  rewrites in $\Gamma_i$,
- for all rewrites $r \in E(F_\Delta)$, there are at most $\gamma$ covering
  subgraphs $\Gamma_i$ of graphs $G' \in V(F_\Delta)$ that $r$ applies to.
- for all rewrites $r \in E(F_\Delta)$, if $r$ applies to $\Gamma_i$ of a graph
  $G'$, then the image $r(\Gamma_i) \subseteq \Gamma_i'$ must be a subgraph of
  the $i$-th covering subgraph $\Gamma_i'$ of $r(G')$.

We will make the further assumption that all applicable rewrites within a
covering subgraph are mutually exclusive, i.e. they modify a shared subgraph so
that it is never possible to apply more than one rewrite among the (up to $s$)
applicable ones. This can always be made to hold by replacing any set of
mutually disjoint rewrites with their cartesian product, that is, viewing the
application of multiple disjoint rewrites as one large rewrite[^costsalotofs].

[^costsalotofs]: At the cost of a larger value for $s.$

#### Upper bound on $|F_\Delta|$

The third (and slightly more obscure) condition above can be understood as
"rewrites must preserve the coverings". In other words, the coverings are chosen
such that a graph mutation produced by the application of a rewrite
$r \in E(F_\Delta)$ on $G$ is always contained within a single covering subgraph
of $r(G')$.

This condition allows us to consider a covering of $V(F_\Delta)$: for each
$1 \leqslant i \leqslant n$, let $F_\Delta^{(i)} \subseteq V(F_\Delta)$ be the
set of graphs in $V(F_\Delta)$ that are the result of a rewrite of its $i$-th
covering subgraph. Every graph in $V(F_\Delta)$ is the result of a rewrite on
some covering subgraph $i$, or is the input graph $G$. So, from a bound
$U_\Delta \geqslant |F_\Delta^{(i)}|$ for all $1 \leqslant i \leqslant n$, we
can obtain a bound

$$|V(F_\Delta)| \leqslant 1 + n \cdot U_\Delta.$$

The bound $U_\Delta$ can be obtained recursively: $U_1 = s$ upper bounds by
definition the number of rewrites in any covering subgraph of the root graph
$G$, and thus the number of graphs in $F_1^{(i)}$. We then proceed by induction
for $1 < \delta \leqslant \Delta$.

A rewrite $r \in E(F_\Delta)$ overlaps with at most $\gamma$ other covering
subgraphs. It can overwrite at most one previous rewrite for each subgraph, and
thus will have at most $\gamma$ parent graphs in sets
$F_{\Delta-1}^{(i_1)}, \cdots, F_{\Delta-1}^{(i_\gamma)}$. Each of the $\gamma$
sets is of size at most $U_{\delta - 1}$. Furthermore, there are at most $s$
rewrites in any covering subgraph. We thus obtain the recursion:

$$U_\delta \leqslant s \cdot U_{\delta - 1}^\gamma,$$

Unrolling the recursion, we can write this as

$$U_\delta \leqslant s^{1 + \gamma + \gamma^2 + \dots + \gamma^{\delta - 1}} = s^{\frac{\gamma^\delta - 1}{\gamma - 1}} = s^{\Theta(\gamma^{\delta - 1})}.$$

Recalling that by construction $|F_\Delta| = |\mathcal{D}_\Delta|$, we obtain:

{{% proposition title="Upper bound for $|\mathcal{D}_\Delta|$" id="prop-upper-bound" %}}

The factorised search space size $|\mathcal{D}_\Delta|$ is in
$n \cdot s^{\Theta(\gamma^{\Delta - 1})}$.

<!-- prettier-ignore -->
{{% /proposition %}}

### Discussion of the complexity separation

The main feature of the complexity separation between the two bounds we have
proved is that the upper bound of the factorised search space is _linear_ in
$n$, and thus linear in the size of the input graph $G$. This stands in stark
contrast to the lower bound of the naive search tree, which scales exponentially
with the size of the input graph. The other variables in the bound of
{{% refproposition "prop-upper-bound" %}} are "local" properties of the GTS: $s$
relates to the density of rewrites (the "minimal pattern density" $\rho$),
whereas $\gamma$ relates to the number of parent rewrites that a rewrite can
overlap with (and thus ultimately, is bounded by the size of the pattern in the
rewrite).

Note further that whilst it looks as though there would be a regime of
$s, \gamma, \Delta$ and $n$ in which the factorised search space is larger than
the naive search tree, this is not the case. It is purely an artifact of the
looseness of our bounds: it is easy to see that each state in the factorised
search space must also appear in the naive search tree, and thus we always have
$|F_\Delta| \leqslant |T_\Delta|$.
