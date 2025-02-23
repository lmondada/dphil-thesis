+++
title = "An automaton for multi-pattern matching"
layout = "section"
weight = 5
slug = "sec:automaton"
+++
We have shown in the previous sections how we can reduce the pattern matching problem to
a problem on trees, and how we can efficiently enumerate all subtrees of a given pattern width $w$.
To complete the pattern matching algorithm, we need to provide a fast way to evaluate the
subtree relation, for many trees representing the set of all patterns we wish to match.
More precisely, for patterns $P_1, \dots, P_\ell$ with width $w$, fix a root operation $r_i$ in $P_i$ for each $1 \leqslant i \leqslant \ell$
and consider the tree dual of the spanning tree reduction of the patterns $T_{P_1}, \dots, T_{P_\ell}$.
We wish to compute the set
$$\{1 \leqslant i \leqslant \ell \mid T_{P_i} \subseteq T_G\},$$
where $T_G$ is the tree we wish to match on.
This corresponds to the `IsSubTree` predicate introduced in the sketch of the algorith in {{< reflink "sec:canonical" >}}.
In our use case, the tree $T_G$ is obtained from the subject graph $G$ that
we wish to match on by considering the spanning tree reduction given by the sets
of anchors $X$ returned by `AllAnchors` from the previous section.

In the following, we will consider the trees $T_{P_i}$ and $T_G$ in their contracted form,
i.e. as dual contracted spanning trees.
As seen in {{< reflink "sec:treereduc" >}}, this is equivalent to the spanning tree reduction
and the original graph, provided that we keep track of the $split$ and $contract$ weight maps.
In a dual contracted spanning tree,
evyer node in the tree represents an anchor operation of the spanning tree reduction.
Per Proposition 4.5, a dual contracted spanning tree is a ternary tree and has
exactly $width(G) - 1$ nodes.

#### Reduction of tree inclusion to string prefix matching
Recall that every dual tree $T$ of a contracted spanning tree reduction $G_C$ defines a $contract$ map on the values of
$G_C$ (see {{< reflink "sec:treereduc" >}}).
Recall also the concept of an open value of a graph, i.e. a value that is missing either a use or define operation
(see {{< reflink "sec:simplifying-assumptions" >}}).

Now consider two contracted spanning tree reductions $G_1$ and $G_2$ with values $V_1$ and $V_2$
and with dual trees $T_1$ and $T_2$.
We lift the $\subseteq$ relation on dual spanning tree reduction introduced in $\subseteq$ in {{< reflink "sec:anchors" >}}
to dual _contracted_ spanning trees.
We say that $T_1 \subseteq T_2$ if and only if
- the trees share the same root operation,
- $T_1$ is a subtree of $T_2$,
- their types as well as the $spilt$ map coincide on the common subtree, and
- the $contract$ map satisfies
$$\textrm{for all }v \in V_1: \begin{cases}
contract(v) \subseteq contract(f(v))\quad&\textrm{if }v\textrm{ is an open value},\\
contract(v) = contract(f(v))\quad&\textrm{otherwise},\\
\end{cases}$$ where $f: V_1 \hookrightarrow V_2$ designates the embedding of $V_1$ into $V_2$ given by the tree embedding.

The first three conditions are equivalent to the $\subseteq$ relation introduced on non-contracted trees, whilst the
fourth introduces an additional condition specific to contracted trees.
It is easy to derive from this inclusion definition and the definition of tree contraction in {{< reflink "sec:treereduc" >}} that
there is an inclusion relation between two dual trees of spanning tree reductions
if and only if the same relation holds between their contracted versions.

Using Proposition 4.2, there are at most 2 open values for each linear path in the graph,
and thus at most $2 \cdot w$ open values in a dual contracted spanning tree of a graph of width $w$.
For each contracted dual tree, we can thus define a _contracted string tuple_ $(s_1, \dots, s_{2w}) \in (O^\ast)^{2w}$
given by the values of the $contract$ map evaluated in the (up to) $2w$ open values[^noprobtotalorder].
By defining a $contract'$ map that is the restriction of $contract$ to the domain of definition of non-open values,
we can then give an equivalent definition of the inclusion relation on contracted spanning trees
as a tree inclusion with matching weight maps $split$ and $contract'$, along with an inclusion relation on the contracted string tuples.
We state a special case of this property as the following result.
The $\subseteq$ relation on strings refers to prefix inclusion, i.e. $s \subseteq t$ if and only if $s$ is a prefix of $t$.
[^noprobtotalorder]: The values can be ordered as usual by using the total lexicographic order on port labels of the tree.

{{< proposition title="Inclusion of equal-width trees" number="4.13" >}}
Let $G_1$ and $G_2$ be two graphs of width $w$. Let $T_1$ and $T_2$ be their respective
dual contracted spanning trees and $(s_1, \dots, s_{2w}), (t_1, \dots, t_{2w}) \in (O^\ast)^{2w}$
their contracted string tuples.
Then $T_1 \subseteq T_2$ if and only if the trees share the same root, are isomorphic, have the same $split$ and $contract'$ maps
and for all $i \in \{1, \dots, 2w\}$: $s_i \subseteq t_i$.
{{< /proposition >}}
The proof of this follows directly from the definition and presentation above.

Why restricting ourselves to trees of the same width $w$?
It is sufficient for our purposes! All patterns are of width $w$ by assumption and the tree instances $T_G$ are
constructed from duals of spanning tree reductions obtained using the `AllAnchors` procedure,
which by design produces subgraphs of width $w$.

The string prefix matching problem is a simple computational task that can be generalised
to to check for multiple string patterns at the same time using a prefix tree.
An overview of this problem can be found in [appendix A]({{< relref "/08_appendix#sec:prefixtrees" >}}).
We can thus obtain a solution for the pattern matching problem for $\ell$ patterns:
{{< proposition title="Fixed anchor pattern matching" number="4.14" >}}
Let $G$ be a graph, $P_1, \dots, P_\ell$ be patterns of width $w$ and depth $d$
and $X \subseteq V$ be a set of $w - 1$ operations in $G$.
Let $r_1,\dots, r_\ell$ be the root operations of the patterns $P_1, \dots, P_\ell$
and $r$ be the root operation of $G$.
The set of all pattern embeddings mapping the canonical anchor set of $P_i$ to $X$
and root $r_i$ to $r$ for $1 \leq i \leq \ell$
can be computed in time $O(w\cdot d)$ using a pre-computed prefix tree of size
at most $(\ell \cdot d + 1)^w$,
constructed in time complexity $O((\ell \cdot d)^w)$.
{{< /proposition >}}
{{< proof >}}
For each pattern, we consider its canonical spanning tree reduction and construct
a multi-dimensional prefix tree for each group of patterns that share the same spanning tree reduction.

Given a graph $G$, we can compute the spanning tree reduction of $G$ for anchors $X$ and map
it to the corresponding prefix tree. This can be done in $O(|G|)$ time by using a search tree.
The rest of the proof follows from the multi-dimensional prefix tree construction.
{{< /proof >}}

#### Combining everything
Finally, putting Proposition 4.14 and 4.12 together, we obtain our main result.
{{% proposition title="Pattern matching" number="4.15" %}}
  Let $P_1, \dots, P_\ell$ be patterns with width $w$
  and depth $d$.
  The pre-computation runs in time and space complexity

  $$O \left( (d\cdot \ell)^w \cdot \ell + \ell \cdot w^2 \cdot d \right).$$

  For any subject graph $G$, the pre-computed prefix tree can be used
  to find all
  pattern embeddings $P_i \to G$ in time
  $$O \left( |G| \cdot \frac{c^w}{w^{\sfrac{1}{2}}} \cdot d \right)$$
  where $c = 6.75$ is a constant.
{{% /proposition %}}

{{% proof %}}
The pre-computation consists of running the `CanonicalAnchors` procedure on
every pattern and then transforming them into a map of prefix trees as described in the proof of Proposition 4.14.
\textsc{AsStrings} is linear in pattern sizes and `CanonicalAnchors` runs in $O(w^2\cdot d)$ for each pattern (\cref{prop:cananchors}).
This is followed by the insertion of $\ell$ tuples of $2w$ strings of length $\Theta(d)$
into a multidimensional prefix tree. This dominates the total runtime, which can be obtained
directly from \cref{prop:prefixmatch}.

The complexity of pattern matching itself on the other hand is composed of two parts:
the computation of all anchor set candidates, and the execution of
the prefix string matcher for each of the trees resulting from these sets of fixed anchors.
The complexity of the former is obtained by
multiplying the result of \cref{prop:catalanbound} with $|G|$,
as \textsc{AllAnchors}
must be run for every choice of root vertex $r$ in $G$:
\begin{equation}\label{eq:finalcomplexity}
  O(w \cdot d \cdot C_w \cdot |G|),
\end{equation}
where $C_w$ is the bound for the number of anchor lists returned by \textsc{AllAnchors}.
For the latter we use \cref{prop:prefixmatch} and obtain the complexity
$O(w \cdot d \cdot C_w)$, which is dominated by \cref{eq:finalcomplexity}.
{{% /proof %}}
