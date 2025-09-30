+++
title = "Bounding the search space size"
layout = "section"
weight = 5
slug = "sec:factor-gts"
+++

We show in this section that under some assumptions on the GTSs that hold in the
use cases of interest to quantum compilation, there is a provable gap between
the size of the search space of all reachable graphs in the GTS and the size of
the corresponding confluently persistent data structure $\mathcal{D}$.

Let us introduce first the notion of _overwriting rewrites_.

{{% definition title="Overwriting rewrite" id="def:overwriting-rewrite" %}}

For two rewrites $r_1$ and $r_2$, we say that $r_2$ _overwrites_ $r_1$, written
$r_1 \twoheadrightarrow r_2$, if the deletion set $V^-_2$ of $\delta_2$ includes
a vertex of the vertex set $V_1$ of the replacement graph of $r_1$

$$V^-_2 \cap V_1 \neq \varnothing.$$

{{% /definition %}}

The definition can identically be applied to events. In this case, the
overwriting events are precisely given by the parent-child relation: the set of
all overwriting events of $\delta \in \mathcal{D}$ is by definition the set of
parents $P(\delta)$ of $\delta$.

Our argument relies on the comparison of asymptotic bounds for the sizes of two
sets $\mathcal{G}_\Delta$ and $\mathcal{D}_\Delta$, which we now define.
Consider a GTS and an input graph $G$. A graph $G'$ is reachable from $G$ within
depth $\Delta \geqslant 0$ if there is a sequence of rewrites
$r_1, \dots, r_\ell$ in the GTS from $G$ to $G'$ such that all subsequences
$r_{\beta_1}, \dots, r_{\beta_k}$ formed of overwriting rewrites
$r_{\beta_i} \twoheadrightarrow r_{\beta_{i + 1}}$ have length at most
$k \leqslant \Delta$.

The set $\mathcal{G}_\Delta$ is the set of all graphs reachable within depth
$\Delta$. We derive:

1. a lower bound on the size of $|\mathcal{G}_\Delta|$, the space of all graphs
   reachable in at most $\Delta$ rewrites from some input $G$, and
2. an upper bound on the size of the equivalent confluently persistent data
   structure $\mathcal{D}_\Delta$, i.e. such that
   $$\mathcal{G}_\Delta = \{ flat(D) \mid D \in \Gamma(\mathcal{D}_\Delta) \}.$$

<!--The asymptotic complexity separation we obtain between the two sets shows that
confluent persistence factorises the space of reachable graphs $\mathcal{G}$
into a much smaller space $\mathcal{D}$. We conjecture that in most "typical"
GTSs, the size $|\mathcal{D}_\Delta|$ will scale _linearly_ with the input size
$|G|$, whereas $|\mathcal{G}_\Delta|$ scales exponentially.-->

In order to obtain bounds, we will introduce hypotheses that the GTSs must
satisfy. Throughout this section, we will illustrate and motivate the
restrictions that they impose in the following two use cases.

#### Use case 1: $\zeta$-complete GTS

The first GTS we consider can be defined on any graph domain that has a notion
of graph size (e.g. based on number of nodes, number of edges,
etc.[^sizecompatible]) and for any graph size $\zeta$. The GTS is such that for
_any_ subgraph $H \subseteq G$ of size $|H| = \zeta$, there is at least one
transformation rule in the GTS that matches $H$. We will call this case
_CompleteGTS_.

This is the use case of quantum superoptimisation discussed in
{{% reflink "sec:gts-sota" %}} and used for benchmarking in
{{% reflink "sec:benchmarks" %}}. In those cases, the transformation rules are
obtained by enumerating all small circuits up to a certain size $\zeta$, thus
guaranteeing that any subcircuit of size $\zeta$ will be matched by the GTS.

Note that there is also an (obvious) upper bound on the number of transformation
rules that can match on any given subgraph: the total number of transformation
rules in the GTS.

#### Use case 2: single-rule GTS in a uniform domain

At the other extreme of the GTS spectrum, we can consider a GTS made of a single
(arbitrary) transformation rule. In this case, we require that graphs are drawn
from a domain uniformly at random, so that for any subgraph $H \subseteq G$, all
patterns of size $|H|$ are equally likely. We will call this case
_SingleRuleGTS_.

In this case, we will not show that our hypotheses hold for _all_ inputs, but
rather that they hold with a high probability. We will phrase our statements as
a function of $\epsilon > 0$ and will require that they hold with probability
$1 - \epsilon$ for randomly drawn $G$.

This regime is interesting as it is the simplest instance of problem domains for
which few assumptions can be made about the GTS themselves, but all inputs are
expected to be equally likely.

[^sizecompatible]:
    The only constraint on the notion of graph _size_ $|\cdot|$ is that it must
    be compatible with the subgraph relation: if $G \subseteq G'$, then
    $|G| \leqslant |G'|.$

### Lower bound on the naive search tree

The event history of the set of graphs $\mathcal{G}_\Delta$ defines a tree
$T_\Delta$, where $\mathcal{G}_\Delta$ are the nodes and
$G_p \in \mathcal{G}_\Delta$ is the parent of $G_c \in \mathcal{G}_\Delta$ if
there is a rewrite $r$ rewriting $G_p$ to $G_c$ in the GTS. Paths in $T_\Delta$
are sequences of rewrites. We call $T_\Delta$ the _naive_ search tree of the
GTS. We wish to derive a lower bound for $|T_\Delta|$.

#### Graph partitioning

For fixed search depth $\Delta$, let $n > 0$ be the largest integer such that
for all graphs $G' \in T_\Delta$, there exists disjoint subgraphs
$\Pi_1, \ldots, \Pi_n$ of $G'$ that satisfies the following property, for all
$1 \leq i \leq n:$

{{% centered %}}

_there exists a rewrite in the GTS that can be applied to $\Pi_i$._

{{% /centered %}}

{{% hypothesis title="Linear scaling of $n$" id="hyp-1" %}}

For a fixed GTS, a fixed depth $\Delta$ and a family of input graphs $G$, we
have the scaling $n = \Theta(|G|)$.

{{% /hypothesis %}}

We conjecture that this scaling holds for many GTSs of interest:

{{% proposition id="prop-1" %}}

Hypothesis 1 holds for `CompleteGTS` and for `SingleRuleGTS` probabilistically.

{{% /proposition %}}

{{% proof %}}

In _CompleteGTS_, it suffices to partition any input $G$ into
$n = \lfloor \frac{|G|}\zeta \rfloor = \Theta(|G|)$ disjoint subgraphs of size
at least $\zeta$. Each subgraph will match a rule of the GTS by definition.

For _SingleRuleGTS_, let $\epsilon > 0$. Let $|L|$ be the size of the left hand
side $L$ of the GTS rule. By assumption, for any subgraph $H$ of size $|L|$ of
an input $G$, there is a constant probability $p$ that the rule matches $H$. For
a subgraph $H$ of size $k |L|$, the probability of the rule not matching in $H$
is $(1 - p)^k$. Picking

$$k > \frac1{1 + \delta}\frac{\ln \epsilon + \ln {\frac{|L|}{|G|}}}{\ln (1 - p)}$$

for some $\delta > 0$ ensures that whenever
$\delta > - \frac{\ln k}{k \ln (1 - p)}$ (i.e. for $k$ large enough),

$$
\begin{aligned}
&k - \frac {\ln k}{\ln (1 - p)} > (1 + \delta)k > \frac{\ln \epsilon + \ln {\frac{|L|}{|G|}}}{\ln (1 - p)}\\
\Leftrightarrow\quad &k > \frac{\ln{\frac \epsilon n}}{\ln (1 - p)},
\end{aligned}
$$

where $n = \frac{|G|}{k |L|}$ was chosen. It follows that a partition of $G$
into $\lfloor n \rfloor$ disjoint subgraphs of size at least $k |L|$ satisfies
the hypothesis with probability $1 - \epsilon$.

{{% /proof %}}

#### Lower bound on $|T_\Delta|$

Fix the tree depth $\Delta$ and the GTS. Any rewrite from the GTS removes at
most a constant $K$ number of vertices from the graph it applies on. Thus, Any
graph in $T_\Delta$ is at least of size $(1 - K\Delta)|G| = \Theta(|G|)$. Let
$n'$ be the smallest value of $n$ for a graph $G_{min} \in \mathcal G_\Delta$.
Whenever hypothesis 1 applies, we have $n' = \Theta(|G_{min}|) = \Theta(|G|)$.

For each $G' \in T_\Delta$ and $\Pi_i$, pick a rewrite $r_i(G')$ that applies to
$\Pi_i$ and let $R$ be the set of all such rewrites

$$R_\Delta = \{ r_i(G') \mid 1 \leq i \leq n', G' \in T_\Delta \}.$$

We can consider the subtree $T'_\Delta \subseteq T_\Delta$ that only contains
graphs obtained by applying rewrites in $R_\Delta$.

For $\Delta = 1$, the search tree $T'_\Delta$ will contain $2^{n'}$ graphs: for
each subgraph $\Pi_i$ of the input graph $G$, we can choose to either apply
$r_i(G)$ or not[^sameres].

[^sameres]:
    Note that this counting is already an act of clemency: we are not counting
    all permutations of the rewrites, which would be considered separately by a
    naive exploration that applies one graph rewrite at a time. In this case,
    the search tree for $\Delta = 1$ would contain $n! \cdot 2^n$ graphs.

By repeating $\Delta$ times the search tree of size $2^{n'}$ for $\Delta = 1$,
we obtain a lower bound

$$|\mathcal{G}_\Delta| = |T_\Delta| \geqslant |T'_\Delta| = (2^{n'})^\Delta.$$

We frame this result as the following proposition.

{{% proposition title="Lower bound for $|\mathcal{G}_\Delta|$" id="prop:lower-bound-gts" %}}

The naive search tree size $|\mathcal{G}_\Delta|$ is in
$\Omega(2^{\Delta \cdot n'})$.

{{% /proposition %}}

As a result, for any GTS satisfying Hypothesis 1 the size of $\mathcal G_\Delta$
grows at least exponentially with input graph size $G$ and search depth
$\Delta$.

<!--An example of a sufficient condition for this asymptotic correspondence to hold
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
constant $\Delta$.-->

### Upper bound on the factorised search space

Consider two rewrites $r_1$ and $r_2$. If neither overwrites the other, i.e.
$r_1 \not\twoheadrightarrow r_2$ and $r_2 \not\twoheadrightarrow r_1$, then the
order in which they are applied is irrelevant (see also
{{% refproposition "prop-flat-graph" %}}). The persistent data structure
$\mathcal{D}$ uses this symmetry explicitly when exploring the set of reachable
graphs.

This drastically reduces the size of the event history of $\mathcal{D}_\Delta$.
The event history defines a directed acyclic graph $F_\Delta$ that is the
equivalent for $\mathcal{D}_\Delta$ to the naive search tree $T_\Delta$ of
$\mathcal{G}_\Delta$. The vertices of $F_\Delta$ are the flattened histories of
events in $\mathcal{D}_\Delta$:

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

Let $m$, $s$ and $\gamma$ be parameters and fix a covering
$\Gamma_1, \ldots, \Gamma_m$ for each graph $G' \in V(F_\Delta)$ such that:

- for all $G'$ and all $1 \leqslant i \leqslant m$, there are at most $s$
  applicable rewrites to the $i$-th covering set $\Gamma_i$ of $G'$.
  Furthermore, all rewrites within $\Gamma_i$ are mutually exclusive, i.e. they
  modify a shared subgraph so that it is never possible to apply more than one
  rewrite among the (up to $s$) applicable ones[^costsalotofs];
- for all $G'$ and for all rewrites $r$ that apply to $G'$, there is
  $1 \leqslant i \leqslant m$ such that $r$ applies to $\Gamma_i$ (i.e. the
  matching subgraph of $r$ is fully contained within one of the coverings).
  Furthermore, the matching subgraph of $r$ overlaps with at most $\gamma$
  distinct $\Gamma_i$;
- for all rewrites $r$ that apply to the covering set $\Gamma_i$ of a graph
  $G'$, the image $r(\Gamma_i) \subseteq \Gamma_i'$ must be a subgraph of the
  $i$-th covering subgraph $\Gamma_i'$ of $r(G')$.

[^costsalotofs]:
    This can always be made to hold by replacing any set of mutually disjoint
    rewrites with their cartesian product, in effect viewing the application of
    multiple disjoint rewrites as one large rewrite. Thi comes at the cost of a
    larger value for $s.$

The first condition is satisfied whenever the size of the coverings can be
bounded: in that case $s$ can be chosen based on the number of distinct
subgraphs that can be contained in a covering set and the number of rules that
can apply to each. The second condition is related to the connectivity between
the covering sets: $\gamma$ can thus often be derived by considering how many
neighbours a covering set has, and how many of those neighbours can a match of a
GTS rule span.

The third condition above can be understood as "rewrites must preserve the
coverings". In other words, the coverings are chosen such that a graph mutation
produced by the application of a rewrite $r \in E(F_\Delta)$ on $G$ is always
contained within a single covering subgraph of $r(G')$.

{{% hypothesis title="Linear scaling of $m$ and constant $s, \gamma$" id="hyp-2" %}}

For a fixed GTS, a fixed depth $\Delta$ and a family of input graphs $G$, we
have the scaling $m = \Theta(|G|)$ and $s = \Theta(1)$ and $\gamma = \Theta(1)$.

{{% /hypothesis %}}

These conditions along with Hypothesis 2 are somewhat restrictive and future
work should explore how to relax them. For our use cases `CompleteGTS` and
`SingleRuleGTS`, we restrict our considerations to the special case where the
graph domain is quantum circuits. We make the further simplifying assumptions
(similar results can be obtained with variations on these assumptions)

- transformation rules have two-qubit circuits as left and right hand sides, and
- the number of qubits on the inputs is fixed (i.e. the number of gates on each
  qubit scales with circuit size).

Define $\ell$ to be the largest number of gates on any one qubit in the left
hand sides of the GTS transformation rules. Consider a partition of the gates on
each qubit into sequences of $\ell$ gates. We can obtain a covering of a quantum
circuit $G$ by considering covering sets $\Gamma_1, \ldots, \Gamma_m$ defined
for all $1 \leq i \leq m$ such that for all matches $H$ of a left hand side of a
transformation rule of the GTS, $H \subseteq \Gamma_i$ if and only if there is a
gate $v$ in $H$ such that $v$ is in the $i$-th sequence of $\ell$ gate on some
qubit in $G$. Imposing the condition that rewrites must preserve coverings, the
covering of the input fixes the covering of all reachable graphs $G'$ in the
GTS.

{{% proposition id="prop-hyp-2" %}}

Restrict the graph domain to quantum circuits, the GTS to two-qubit rules and
the inputs to a fixed number of qubits. Then hypothesis 2 holds for
`CompleteGTS` and for `SingleRuleGTS`.

{{% /proposition %}}

{{% proof %}}

Let $G$ be the input circuit with $q$ qubits. Consider the covering
$\Gamma_1, \dots, \Gamma_m$ of $G$ as constructed above. By construction
$m = \lceil N / \ell \rceil = \Theta(|G|)$, where $N$ is the maximum number of
gates on a qubit of $G$.

The covering set $\Gamma_i$ contains the set $V_i$ of gates composed of the
$i$-th sequence of $\ell$ gates for each qubit in $G$. Furthermore, for all
$v \in V_i$, if $H$ is a match of a two-qubit rule that contains $v$, then $H$
may contain at most $2\ell - 1$ other gates. Hence by construction,
$|\Gamma_i| \leqslant 2\ell|V| = 2q\ell^2 = \Theta(1)$. This is a constant and
thus there is a constant $s = \Theta(1)$ such that for all
$1 \leqslant i \leqslant m$ there are most $s$ matches of a two-qubit rule that
intersect $\Gamma_i$.

Finally, any match $H$ spans two qubits; the gates on each qubit (at most
$\ell$) may belong to at most two distinct sequences of $\ell$ gates of that
qubit. Thus, any match $H$ spans at most $\gamma = 4$ distinct covering sets.
These arguments made no assumption on properties of the rule set and thus apply
equally to `CompleteGTS` and `SingleRuleGTS`.

{{% /proof %}}

#### Upper bound on $|F_\Delta|$

The preservation of coverings under rewrites allows us to consider a covering of
$V(F_\Delta)$: for each $1 \leqslant i \leqslant m$, let
$F_\Delta^{(i)} \subseteq V(F_\Delta)$ be the set of graphs in $V(F_\Delta)$
that are the result of a rewrite of its $i$-th covering subgraph. Every graph in
$V(F_\Delta)$ is the result of a rewrite on some covering subgraph $i$, or is
the input graph $G$. So, from a bound $U_\Delta \geqslant |F_\Delta^{(i)}|$ for
all $1 \leqslant i \leqslant m$, we can obtain a bound

$$|V(F_\Delta)| \leqslant 1 + m \cdot U_\Delta.$$

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
$m \cdot s^{\Theta(\gamma^{\Delta - 1})}$.

<!-- prettier-ignore -->
{{% /proposition %}}

### Discussion and empirical exploratory analysis

We have derived bounds on the size of the search spaces and shown that under
some assumptions on the properties of the GTS, the factorised search space grows
_linearly_ in the size of the input graph $G$. This stands in stark contrast to
the lower bound of the naive search tree, which scales exponentially with the
size of the input graph.

However, when considering the overall optimisation problem of finding the
optimal solution over the set of reachable graphs in a GTS, the exponential
overhead does not disappear: it is rather shifted to the extraction phase that
relies on a SAT solver. It is therefore an open question whether the factorised
search space can be used to improve optimisation problems on GTSs.

To this end, we devise a simple numerical experiment that assesses the potential
of using the unfolding construction as presented in this chapter in the context
of quantum computation optimisation.

**The toy problem.**&emsp; We consider a very simple circuit optimisation
problem that is desiged to require a deep search space (i.e. a large number of
rewrites) to be solved. This will exacerbate the scaling difference between an
optimiser that must traverse the naive search space and another that relies on
the factorised representation instead.

The inputs are quantum circuits composed of two-qubit $\textit{CX}$ and
single-qubit $\textit{Rz}$ rotation gates. The angles of the rotations are not
relevant and set randomly. They are of the following form:

{{% figure src="/svg/cx-rz-circ.svg" nobg=true width="70%" %}}

i.e. each pair of subsequent qubits have 2 $\textit{CX}$ gates at either end and
10 $\textit{Rz}$ rotation in-between, on the control qubits of the $\textit{CX}$
gates. These circuits admit a very simple optimisation that can be expressed by
the following two transformation rules:

{{% figure src="/svg/cx-rz-rules.svg" nobg=true width="95%" %}}

Given the objective of minimising the number of $\textit{CX}$ gates, the
optimiser must commute the leftmost $\textit{CX}$ gates through all of the
rotation gates, until the two $\textit{CX}$ on each qubit are adjacent and
cancel out. We study the performance of the optimisers as we increase the number
$2q$ of qubits in the circuit.

**Optimisers.**&emsp; We define two optimisers. _Badger_ is a backtracking
search through the naive search space of reachable graphs in the GTS: starting
from the input, the search space is expanded by computing all possible rewrites
at a given state. States with the lowest cost function are processed first. This
is similar to an A\* search @Hart1968.

_Seadog_ on the other hand performs the backtracking search on the factorised
search space instead: when expanding a state of the search space, only rewrites
that overlap with the last rewrite are considered and added to the search space,
as discussed in {{% reflink "sec:extraction" %}}. In a second phase, the search
space is encoded as a SAT problem that is solved using Z3 @Moura2008.

The Badger optimiser is released and publicly available as part of the
open-source TKET package[^pyandrust]. The Seadog optimiser on the other hand is
still in early development; more benchmarks and a release will follow.

[^pyandrust]:
    As a Python package on [PyPI](https://pypi.org/project/tket/) and a rust
    crate on [crates.io](https://docs.rs/tket/latest/tket/)).

**Results.**&emsp; We ran the experiment on an Apple M3 Max CPU (4.05GHz) for
inputs between $2$ ($12$ gates) and $78$ qubits ($468$ gates). Both optimisers
ran on a single core. For each instance, we set a timeout of $2$ seconds and
report the relative $\textit{CX}$ gate reduction, i.e.
$$\frac{\textit{CX}_\text{init} - \textit{CX}_\text{final}}{\textit{CX}_\text{init}}.$$

The results are shown in the figures on the right.

**Discussion.**&emsp; On the left, we observe that both optimisers are able to
find the optimum for circuits with up to 30 CX gates. Beyond that point, the
time limit starts impacting Badger performance, which drops continuously and
reaches 0% for inputs of 50 CX gates and above. Seadog on the other hand does
not time out and is able to explore the entire (factorised) search space
exhaustively up until 70 CX gates.

Observe that the Badger optimiser reaches the time limit for as few as 10 CX.
Indeed, the complete naive search space size can be calculated to have $12^q$
states (each pair of qubits can be in one of 12 states). For $2q = 6$ we get
$1728$ states, but this already reaches over $20'000$ states for $2q = 8$.

{{% figure src="/img/badger-seadog-bench.png" width="90%" enlarge="full"
           caption="CX gate count reduction (left) and runtime (right) for the Badger and Seadog optimisers. 100% gate count reduction is optimal. A timeout was set to 2 seconds." %}}

{{% figure src="/svg/search_space_plot.svg" width="50%" enlarge="full"
           caption="Size of factorised search space for Seadog." %}}

On the other hand, the factorised search space will only contain $12$ states for
each qubit pair. This results in a linear scaling of the search space size, as
can clearly be seen in the second figure.

Where the runtime exceeds the 2 second timeout, this is due to pre- and
post-optimisation steps such as memory allocation/deallocation, I/O, file
parsing etc that are included in the measurements. The quadratic runtime scaling
that we observe in Seadog is due to a hash function that is run on every state
of the search space to detect and discard duplicates: as the number of states in
the search space grows linearly with input size and each state requires a hash
in linear time, the overall runtime grows quadratically. Future work may be able
to address this issue by designing updateable hash functions that do not require
the full graph to be rehashed when applying a local rewrite.

Future work should also investigate how to scale Seadog to larger input sizes on
a broader class of problems. We have observed that the SAT-based extraction
phase of Seadog corresponds to less than 1% of the runtime budget (under 15ms
for all input sizes). Whilst being asymptotically exponential in the worst case,
it is thus not currently a bottleneck. On the other hand, the number of states
visited per second in the exploration phase is currently up to $10\times$ slower
for Seadog compared to Badger. Further investigations into the causes of this
are still required, but we expect that large performance improvements can be
realised on the current implementation and as a result could scale to larger
inputs.
