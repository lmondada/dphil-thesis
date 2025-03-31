+++
title = "An automaton for multi-pattern matching"
layout = "section"
weight = 6
slug = "sec:automaton"
+++

We have shown in the previous sections that graph pattern-matching can be
reduced to a problem of tree inclusions, with trees of fixed width $w$. To
complete the pattern-matching algorithm, we must provide a fast way to evaluate
the subtree relation $\substeq$ for many trees representing the set of all
patterns we wish to match.

More precisely, for patterns $P_1, \dots, P_\ell$ with width $w$, fix a root
operation $r_i$ in $P_i$ for each $1 \leqslant i \leqslant \ell$ and consider
the rooted tree duals of the canonical PSGs $\tau_{r_i}(P_i^{\pi_i})$, with
$\pi_i = \pi_{r_i}(P_i)$ the canonical anchors. Then given a subject graph $G$,
we wish to compute the set

{{% centered numbered="eq-tree-inclusion" %}}

$$\{1 \leqslant i \leqslant \ell \mid \tau_{r_i}(P_i^{\pi_i}) \subseteq \tau_r(G^\pi)\},$$

{{% /centered %}}

for all anchor sets $\pi \in \Pi_r^w(G)$ and root operation $r$ in $G$. This
corresponds to the `IsSubTree` predicate introduced in the sketch of the
algorith in {{< reflink "sec:canonical" >}}.

Instead of considering the trees of PSGs, it will prove easier to consider the
_contracted_ PSGs (cPSGs)

$$\tau_{r_i}(c(P_i^{\pi_i}))\quad\textrm{and}\quad \tau_r(c(G^\pi)).$$

Such tree inclusions are equivalent to finding embeddings in the subject graph
itself, provided that we keep track of the $split$ and $contract$ weight maps
(see {{< reflink "sec:treereduc" >}}).

It will be useful to remind ourselves the following properties of contracted
PSGs. Every operation of a cPSG (and thus every node in its rooted dual tree) is
an anchor operation of the PSG. Per
{{% refproposition "prop-contractedspanningtree" %}}, the rooted dual tree of a
cPSG is a ternary tree and has exactly $width(G) - 1$ nodes. Finally, recall the
concept of an open value of a graph, i.e. a value that is missing either a use
or define operation (see {{< reflink "sec:simplifying-assumptions" >}}).

#### Reduction of tree inclusion to string prefix matching

Now consider two contracted spanning tree reductions $c(G_1^{\pi_1})$ and
$c(G_2^{\pi_2})$ with values $V_1$ and $V_2$. To simplify notation, define

$$\tau_1 = \tau_{r_1}(c(G_1^{\pi_1})) \quad\textrm{and}\quad \tau_2 = \tau_{r_2}(c(G_2^{\pi_2}))$$

for some choice of root operations $r_1$ and $r_2$ in $G_1$ and $G_2$,
respectively. We lift the $\subseteq$ relation on rooted dual trees of PSGs
introduced in {{< reflink "sec:anchors" >}} to rooted dual trees of cPSGs in
Such a way that there is an inclusion relation between two rooted dual trees of
PSGs if and only if the same relation holds on the rooted duals of cPSGs.

We say that $\tau_1 \subseteq \tau_2$ if and only if

- the trees share the same root operation,
- $\tau_1$ is a subtree of $\tau_2$,
- the $spilt$ map coincides on the common subtree, and
- the $contract$ map satisfies for all $v \in V_1$:
  $$\begin{cases}contract(v) \subseteq contract(f(v))\quad&\textrm{if }v\textrm{ is an open value},\\contract(v) = contract(f(v))\quad&\textrm{otherwise},\\\end{cases}$$

where $f: V_1 \hookrightarrow V_2$ designates the embedding of $V_1$ into $V_2$
given by the tree embedding.

The first three conditions are taken as-is from the $\subseteq$ relation on
non-contracted trees, whilst the fourth condition on the $contract$ map is
specific to contracted trees.

Using {{% refproposition "prop-widthbound" %}}, there are at most 2 open values
for each linear path in the graph, and thus at most $2 \cdot w$ open values in a
rooted dual tree of a cPSG of width $w$. For each such contracted rooted dual,
we can thus define a _contracted string tuple_
$S = (s_1, \dots, s_{2w}) \in (O^\ast)^{2w}$ given by the values of the
$contract$ map evaluated in the (up to) $2w$ open values[^noprobtotalorder].

If $contract|_C$ is the restriction of $contract$ to the domain of definition of
non-open values of a cPSG, the fourth condition for the inclusion relation
$\subseteq$ on rooted dual cPSGs, given above becomes an equality condition when
restricted to non-open values. A special case of this property of particular
interest to us is stated as the following result. The $\subseteq$ relation on
strings refers to prefix inclusion, i.e. $s \subseteq t$ if and only if $s$ is a
prefix of $t$.

[^noprobtotalorder]:
    The values can be ordered as usual by using the total lexicographic order on
    port labels of the tree.

<!-- prettier-ignore -->
{{< proposition title="Inclusion of equal-width trees" id="prop-treeincl" >}}

Let $S = (s_1, \dots, s_{2w})$ and $T = (t_1, \dots, t_{2w}) \in (O^\ast)^{2w}$
be the contracted string tuples of $\tau_1$ and $\tau_2$ respectively. Then
$\tau_1 \subseteq \tau_2$ if and only if the trees share the same root, are
isomorphic, have the same $split$ and $contract|_C$ maps and for all
$i \in \{1, \dots, 2w\}$: $s_i \subseteq t_i$.

<!-- prettier-ignore -->
{{< /proposition >}}

The proof of this follows directly from observing that rooted duals of cPSGs
have the same set of nodes and that the restriction to non-open values
$contract|_C$ must satisfy equality.

Why restricting ourselves to trees of the same width $w$? It is sufficient for
our purposes! All patterns are of width $w$ by assumption and so are the rooted
dual trees of the form $\tau_r(G^\pi)$, given that $\pi \in \Pi_r^w(G)$.

The string prefix matching problem is a simple computational task that can be
generalised to check for multiple string patterns at the same time using a
prefix tree. An overview of this problem can be found in appendix
[A]({{< relref "/99_appendix#sec:prefixtrees" >}}). We can thus obtain a
solution for the pattern matching problem for $\ell$ patterns:

<!-- prettier-ignore -->
{{< proposition title="Fixed anchor pattern matching" id="prop-fixedanchors" >}}

As above, let

- $G$ be a graph, with $\pi \in \Pi_r^w(G)$ a set of $w - 1$ operations and
  $r \in \pi$ a choice of root operation,
- $P_1, \dots, P_\ell$ be patterns of width $w$ and depth $d$, with choices of
  root operations $r_1, \dots, r_\ell$ and canonical anchors
  $\pi_i = \pi_{r_i}(P_i).$

The set of all pattern embeddings mapping the canonical anchor set $\pi_i$ to
$\pi$ and root $r_i$ to $r$ for $1 \leq i \leq \ell$ can be computed in time
$O(w\cdot d)$ using at most $\ell$ pre-computed prefix tree of size at most
$(\ell \cdot d)^w + 1$, each constructed in time complexity
$O((\ell \cdot d)^w)$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

For each pattern, we consider its canonical spanning tree reduction and
construct a _multi-dimensional prefix tree_ (see appendix
[A]({{< relref "/99_appendix#sec:prefixtrees" >}}) for each group of patterns
that share the same spanning tree reduction.

Given a graph $G$, we can compute the cPSG of $G$ for anchors $\pi$ and map its
rooted dual tree to the corresponding prefix tree. This can be done in
$O(|T_G|)$ time by using a search tree. We can restrict $G^\pi$ to a graph of
size $O(w \cdot d)$ by truncating the linear paths to at most $2d$ length, as in
the proof of {{% refproposition "prop-allanchors" %}}. Thus we can assume
$|G^\pi| \in O(w \cdot d)$.

The rest of the proof and the runtime follow from the multi-dimensional prefix
tree construction detailed in Appendix
[A]({{< relref "/99_appendix#sec:prefixtrees" >}}).

<!-- prettier-ignore -->
{{% /proof %}}

#### Combining everything

Finally, putting {{% refproposition "prop-fixedanchors" %}} and
{{% refproposition "prop-allanchors" %}} together, we obtain our main result.

<!-- prettier-ignore -->
{{% proposition title="Pattern matching" id="prop-main" %}}

Let $P_1, \dots, P_\ell$ be patterns with width $w$ and depth $d$. The
pre-computation runs in time and space complexity

$$O \left( (d\cdot \ell)^w \cdot \ell + \ell \cdot w \cdot d \right).$$

For any subject graph $G$, the pre-computed prefix tree can be used to find all
pattern embeddings $P_i \to G$ in time

$$O \left( |G| \cdot \frac{c^w}{w^{1/2}} \cdot d \right)$$

where $c = 6.75$ is a constant.

<!-- prettier-ignore -->
{{% /proposition %}}

<!-- prettier-ignore -->
{{% proof %}}

The pre-computation consists of running the `CanonicalAnchors` procedure on each
of the $\ell$ patterns and then transforming them into a map of prefix trees
using {{% refproposition "prop-fixedanchors" %}}. By
{{% refproposition "prop-canonical-correctness" %}}, `CanonicalAnchors` runs in
$O(w\cdot d)$ for each pattern, where we used that $|P_i| \leqslant w \cdot d$
for all patterns. The total runtime of prefix construction is thus

$$O \left( (d\cdot \ell)^w \cdot \ell + \ell \cdot w \cdot d \right).$$

The complexity of pattern matching itself on the other hand is composed of two
parts: the computation of all possible anchor sets $\Pi_r^w(G)$, and the
execution of the prefix string matcher for each of the trees resulting from
these sets $\pi \in \Pi_r^w(G)$. As `AllAnchors` must be run for every choice of
root vertex $r$ in $G$, the runtime is thus obtained by multiplying _i)_ $|G|$
with _ii)_ the runtime of the prefix tree matching
({{% refproposition "prop-fixedanchors" %}}), and with _iii)_ $|\Pi_r^w(G)|$,
i.e. the number of anchor lists returned by `AllAnchors`
({{% refproposition "prop-nanchors" %}}):

$$O(|G| \cdot w \cdot d \cdot C_w ),$$

where $C_w$ is the bound for the number of anchor lists returned by
`AllAnchors`. The result follows.

<!-- prettier-ignore -->
{{% /proof %}}
