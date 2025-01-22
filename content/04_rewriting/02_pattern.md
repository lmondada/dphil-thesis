+++
title = "Pattern matching engine"
layout = "section"
weight = 2
+++

As discussed in the [review of superoptimisation](/03_compiler/#superoptimisation)
(sec. [3.5](/03_compiler/#sec5)), the adaptation of the technique to 
quantum computing benefits from the use of thousands of rewrite rules. However,
the performance reaches a ceiling as the number of rewrite rules grows, when
pattern matching becomes the bottleneck.
This was the main motivation for the work in @Mondada2024, which speeds up
pattern matching by introducing a pre-computed state automaton data structure.
The result is pattern matching in a runtime that is independent on the number
of rewrite rules being considered---reaching a 20x speedup on datasets of
practical interest.

The inner workings of the algorithm are discussed in {{< reflink "/05_matching" >}}.
In this section, we instead present an user interface that surfaces the capabilities
of the pattern matching engine in an abstract and extensible way.
This allows the user to define pattern matching languages that are tailored to
their domain of application and the rewrite rules of interest, without going into the details of the pattern matching engine.

### Indexing schemes 
We abstract away the domain of definition of patterns and the host data, i.e. the
data being matched, using a structure that we call an _indexing scheme_.
The main object of interest within indexing schemes are index maps,
partial maps from a key set $\mathcal K$ to a value set $\mathcal V$
$$\varphi: \mathcal K \rightharpoonup \mathcal V.$$
Pattern matches will be expressed as instances of index maps---$\mathcal K$
and $\mathcal V$ are thus typically chosen so that there are (obvious)
injective maps $P \hookrightarrow \mathcal K$ and $D \hookrightarrow \mathcal V$
for any pattern $P \in \mathcal P$ and data $D \in \mathcal D$ in the
application domain.
For simplicity of presentation---and in a blatant abuse of notation---we will 
assume in this section that these injective maps are the identity, i.e.
that always $P \subseteq \mathcal K$ and $D \subseteq \mathcal V$.
As a result, whenever the domain of defintion $\textrm{dom}(\varphi)$ of
$\varphi$ contains
$P$ and is injective on it, the index map restircted to $P$ can be viewed as
a pattern embedding of $P$ into $D$: $$\varphi|_P: P \hookrightarrow D.$$

Note that $\mathcal P = \mathcal D$ and $\mathcal K = \mathcal V$ is often
a valid choice---this
corresponds to concrete patterns that will match data exactly.
Keeping the interface more general, however, allows for more expressive
pattern languages that may capture entire subsets of $\mathcal D$ as a single
pattern.

Index maps enable pattern matching through the repeated expansion of their domain
of definition: starting from the empty indexing map
$\varphi_\varnothing: \mathcal K \to \mathcal V$ with
$\textrm{dom}(\varphi_\varnothing)$,
new index maps are created using an user-provided expansion function:
$$\textrm{expand}(\varphi, D) = \{ \varphi_1', \ldots, \varphi_n' \}.$$
Informally, this provides all the ways in which $\textrm{dom}(\varphi)$ can 
be extended.
This can be specified in terms of the following three properties:

1. $\varphi \subseteq \varphi_i'$ for all $1 \leqslant i \leqslant n$
&emsp;(_valid extensions_).

2. For all valid embedding $f: P \hookrightarrow D$ such that
$\varphi|_P \subseteq f$, there exists $1 \leqslant i \leqslant n$
such that $\varphi_i'|_P \subseteq f$
&emsp;(_preserve all embeddings_).

3. $\textrm{dom}(\varphi_i') \neq \textrm{dom}(\varphi)$ 
for all $1 \leqslant i \leqslant n$
&emsp;(_progress must be made_).

where we introduced $\varphi \subseteq \varphi'$ as a shorthand to mean that
$\varphi'$ is equal to $\varphi$ when restricted to $\textrm{dom}(\varphi)$:
$$\varphi'|_{\textrm{dom}(\varphi)} = \varphi|_{\textrm{dom}(\varphi)}.$$

Using this, the pattern matcher can proceed by keeping track of a set
of index maps $\mathcal F$ that satisfy the invariant
$$\textrm{for all }f: P \hookrightarrow D, \textrm{ there exists } \varphi \in \mathcal F \textrm{ such that } \varphi|_P \subseteq f$$
This holds trivially for $\mathcal F = \{\varphi_\varnothing\}$.
The expansion step
$$\mathcal F \mapsto \mathcal F \cup \bigcup_{\varphi \in \mathcal F} \textrm{expand}(\varphi, D)$$
maintains this invariant, as a direct corollary of property 2.
Inductive application of property 3 guarantees that all index maps with at
most $n$ elements will be discovered after $n$ iterations.
Writing $\mathcal F^{(i)}$ for the index maps after the $i$-th iteration
and $\Delta = \max_{P \in \mathcal P} |P|$ for the maximal cardinality
of the patterns,
we can thus formulate the following "completeness" property
for our pattern matcher:
$$\textrm{for all }f: P \hookrightarrow D, \textrm{ there exists }1 \leqslant i \leqslant \Delta \textrm{ such that }\varphi \in \mathcal F^{(i)}\textrm{ and }\varphi|_P = f.$$

To make sure, on the other hand, that _only_ valid embeddings[^sound] are present in
$\mathcal F^{(i)}$, we introduce **constraints**.
[^sound]: Given that we called the previous property completeness, we could call this
_soundness_.

### Constraints and Predicates
At its simplest, a constraint $C$ is a boolean-valued (higher-order) function
that is used to filter out invalid index maps:
$$C: (\mathcal K \rightharpoonup \mathcal V) \to \{0, 1\}$$
Given a set of constraints $C_1, \ldots, C_n$, the idea is then to interleave
index map expansions with pruning using the constraints
$$\mathcal F \mapsto \{ f \in \mathcal F\ |\ C_1(f) \wedge \cdots \wedge C_n(f) \}$$
To obtain and efficient (and correct) implementation of pattern matching
based on such constraints, it is however useful to specify some properties
that the constraints should satisfy, in particular with respect to the
extension of index maps[^delay]:
is it valid to evaluate a constraint on index maps that are only partial
embeddings?
If so, on which partial maps can the constraint be successfully evaluated?
And do index map extensions preserve constraint validity, or must constraints
be evaluated repeatedly after each extension?
[^delay]: It would be possible in theory to delay all evaluations of the
constraints until the end of the pattern matching process, but not without
incurring a blow up of $|\mathcal F|$.

We _constrain_ the expressivity of constraints with the introduction of
predicates. A predicate $\Pi$ is also a boolean-valued function[^use], but it
is instead evaluated on a tuple of values in $\mathcal V$:
$$\Pi: \mathcal V^p \to \{0, 1\}.$$
We refer to $p$ as the _arity_ of the predicate.
We then (re-)define constraints as tuples of a predicate $\Pi$ (of arity $p$),
along with $p$ keys $k_1, \ldots, k_p \in \mathcal K$.
A constraint $C = (\Pi, k_1, \ldots, k_p)$ can then only be evaluated on an
index map $\varphi$ if $\{k_1, \ldots, k_p\} \subseteq \textrm{dom}(\varphi)$.
It is then given by
$$C(\varphi) = \Pi(\varphi(k_1), \ldots, \varphi(k_p)).$$
Not only does this define a clear condition of when it is valid to evaluate
a constraint on a partial index map, it also ensures that for all
index maps $\varphi_1, \varphi_2: \mathcal K \rightharpoonup \mathcal V$
such that
$\{k_1, \ldots, k_p\} \subseteq \textrm{dom}(\varphi_1)$
and
$\{k_1, \ldots, k_p\} \subseteq \textrm{dom}(\varphi_2)$,
we have
$$C(\varphi_1) = C(\varphi_2).$$
[^use]: ...and will also be used to filter index maps, just like constraints.

This completes a bird's eye view on how pattern embeddings are constructed and
matched by the pattern matching engine.
The key point is that this interface will allow us to match multiple patterns
simultaneously by grouping patterns that share constraints together.
Where necessary, pattern embeddings that satisfy conflicting constraints will
be tracked separately using more than one set of index maps.

### The keys to efficient pattern matching (aka. "implementation details")
### An example

### Rewriting rule used in practice