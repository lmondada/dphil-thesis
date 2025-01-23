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

We are intersted in a fast pattern matching engine because it sits at the center
of the "rewriter" component that appears in the diagram above---and in particular
on which the offline pre-processing phase is based.
Let us zoom in a bit on the rewriter component to understand.
The workings of the "Rewriter" (offline) and "Pattern matching" (online) components
of the overview diagram presented earlier can be refined into the following schema.

{{< figure
  src="svg/rewriter.svg"
  alt="Rewriter component of the proposed quantum compiler optimisation framework"
  caption="Detailed view of the \"Rewriter\" and \"Pattern matching\" components of the optimisation framework."
  width="95%"
>}}

Instead of taking ready-to-apply rewrite rules as input to the offline pre-computation phase,
we now take a large set of quantum programs, typically enumerated automatically.
To construct rewrite rules, we cluster the programs into sets of equivalent programs.
This is particularly simple in the case of small quantum circuits, as the program
can be equivalently represented by a unitary, which can for instance be hashed
and put into buckets to gather semantically equivalent programs together.

The valid rewrite rules correspond to transformations between programs within
the same equivalence class. One may consider all $n^2$ possible rewrite
rules within a class of size $n$, or alternatively pick a representative $C$
and only consider $2n - 2$ rules to and from $C$. An arbitrary rewrite between two elements
of a class can then be expressed by composing two rewrite rules to and from $C$[^sncf].
[^sncf]: A bit like [travelling by TGV](https://en.wikipedia.org/wiki/TGV#/media/File:France_TGV.png).

The set of all patterns of interest are then all left hand sides of the rewrite
rules---i.e. every program in any of the equivalence classes.
These are passed off to the pattern matching engine, that will first pre-process
the patterns offline to build a pattern matcher, and then use the matcher to
find all matches in the data.
With a simple map from the left hand sides to the right hand sides of the
rewrite rules, we can then convert every pattern match into a rewrite to be
considered during optimisation.

The inner workings of the pattern matching algorithm are discussed in-depth
for the use case of portgraph matching in {{< reflink "/05_matching" >}}.
In this section, we instead present pattern matching abstractions and a novel
user interface that surfaces the capabilities
of the pattern matching engine in a declarative and extensible way.
This allows the user to define pattern matching languages that are tailored to
their domain of application and the rewrite rules of interest, without going
into the details of the pattern matching engine.

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

### Making pattern matching efficient (aka. "implementation details")

The title of this section may tempt you to skip the next few paragraphs---don't!
There is more consideration sthat go into this than first meets the eye.

A reasonable proxy for the runtime of the pattern matcher is the total number
of constraints that must be evaluated. This is the accumulation[^integral]
of the total number of constraints that the patterns being matched
require, aggregated over all the index maps that we must keep track
of throughout the computation.
Our overall strategy to minimise this is summarised as the combination of the
following three principles
[^integral]: Or an "integral", as an _engineer_ would call it.

1. Minimise the number of index maps to keep track of by maximising index map
overlaps between patterns.

1. Express patterns using constraints that are shared or can be evaluated
jointly across multiple patterns.

1. Prune away candidate index maps that do not extend to valid embeddings
as early as possible.

To an extent, these are of course application domain dependent and can only
be achieved with the willing cooperation of a dedicated user[^thankfully]---principle
1 is for instance best achieved through some form of _canonicalisation_ of the
patterns, such that similar patterns can share the same keys.
However, it remains up to the interface designer to encourage this behaviour
and ensure that the pattern matching engine can make the most of a well
thought out implementation.
Continuing our example, we have already seen that our interface requires
each pattern and data to be mapped explicitly to common key $\mathcal K$ and
value sets $\mathcal V$, which is the  first step towards canonical identifiers.
[^thankfully]: Thankfully, this often happens to be ourselves.

We further restrict the number of index maps that must be kept track of by
refining the expansion function we introduced earlier to be able to specify
the key $k \notin \textrm{dom}(\varphi)$ that an index map
$\varphi: \mathcal K \rightharpoonup \mathcal V$ should be
extended to.
The set
$$\textrm{expand}_k(\varphi, D) = \{ \varphi_1', \ldots, \varphi_n' \}.$$
must satisfy the following modified properties:

1. $\varphi \subseteq \varphi_i'$ for all $1 \leqslant i \leqslant n$
&emsp;(_valid extensions_).

2. for all valid embedding $f: P \hookrightarrow D$ such that
$\varphi|_P \subseteq f$ and $k \in P$,
there exists $1 \leqslant i \leqslant n$
such that $\varphi_i'|_P \subseteq f$
&emsp;(_preserve all embeddings of $k$_).

3. $k \in \textrm{dom}(\varphi_i')$ for all $1 \leqslant i \leqslant n$.
&emsp;(_include $k$_).

The most obvious change is in the third property, where instead of requiring
that the domain of definition is enlarged _in some way_, we now require
explicitly that $k$ be added to the domain of definition.
The other change is a _weakening_ of property 2. 
Unlike the original expansion function, in this case the expansion is no longer
"complete", in the sense that for some $f: P \hookrightarrow D$ with $k \notin P$, 
it may be that $\varphi_i'|_P \not\subseteq f$ for any $\varphi_i' \in \textrm{expand}_k(\varphi, D)$,
even though $\varphi|_P \subseteq f$.

With the $\textrm{expand}_k$ function, we can extend index maps to cover exactly
the subset of $\mathcal K$ required to evaluate a constraint of interest, thus
avoiding to extend index map beyond the necessary keys (and accumulate multiple
versions of them in $\mathcal F$).

Now, how do we choose which constraints we consider, and in which order?
This is key not only to minimising the number of index maps when using the
$\textrm{expand}_k$ function, but also to maximise the number of constraints
that can be shared across patterns.

Rather than relying on rigid decompositions of patterns into sets of constraints,
we achieve this by selecting and applying one constraint at at time from the patterns.
As we progress, we can pick constraints that will result in the best performance,
dynamically and specially for the patterns under consideration.

Concretely, we establish a protocol whereby patterns are asked
to **nominate constraints** that they would like to evaluate.
The results are pooled together and the constraint that is shared by the most
patterns is applied.
The patterns can then be updated, conditioned on the application of the
constraint and the process can be repeated until all patterns have been
reduced to tautologies.
Further benefitting performance, it suffices to run this once during the
pre-processing phase ahead of any pattern matching, so that this optimisation
implements principle 2
without incurring any runtime pattern matching cost.

To further maximise constraint overlaps, we introduce **constraint classes**.
They are sets of constraints that the user can specify to indicate that the
constraints share a logical relation---in statistics words, that the constraints
are not independent. A particularly useful property of
constraint classes would be a relation of pairwise mutual exclusion between
elements of the class: the satisfaction of any of the constraints in the set
precludes any other from being satisfied. 
More trivially, a constraint class can also group together constraints that
should be evaluated jointly, for a more efficient implementation.

Patterns having an overlapping constraint class is thus a useful
generalisation of shared constraints that is much more broadly applicable.
This undoubtedly begs the question of how various constraints and constraint
classes, possibly of greatly differing "value",
should be compared with and prioritised over one another---besides by counting the number of patterns
that share them.

We propose a measure to quantify the "utility" of a constraint for matching
a given pattern.
Using this we can prioritise highly valuable constraints, which, when their evaluation
is negative, result in early prunings of irrelevant index maps (principle 3).
We define the **expansion factor** $\alpha_C$ of a constraint $C$ as the expected
relative change in the number of the index maps that results from conditioning
on $C$:
$$\alpha_C = \mathbb{E}_{\mathcal F}\left[\,\frac{|\{f \in \mathcal F \mid C(f)\}|}{|\mathcal F|}\,\right].$$
This value is of course hair rippingly hard to compute precisely in most cases---presumably,
it would require a model of the precise distribution of the index maps during pattern matching
that would have to depend on the distribution that the data being matched is
drawn from, along with all the previous constraints that have been applied.

We could spend the rest of this thesis (and then some) doing these computations,
or we can choose to ignore all these intricacies,
fix $\mathcal F$ to be the subset of the index maps on which $C$ is defined,
and just take the frequentist's interpretation  of the ratio within
the expectation value as the probability that the constraint is satisfied:
$$\alpha_C \approx \mathbb{P}_{f \sim \mathcal F}\left[\,C(f)\,\right]$$
with $f \in \mathcal{F}$ drawn uniformly at random.
Much easier! From here on, we take the latter as the definition of $\alpha_C$.

By asking the user to provide some heuristic approximation of $\alpha_C$,
we can gauge the effect on the number of index maps
of picking a constraint and conditioning on it as roughly
$$|\mathcal F| \to \alpha_C \cdot |\mathcal F|$$

We propose a further generalisation of this metric to quantify the value of
any subset of constraints in a constraint class.
For a constraint class $\mathcal B$, we define the expansion factor of
$\mathcal S \subseteq \mathcal B$ as
$$\alpha_{\mathcal S} = \mathbb{E}_{f \sim \mathcal F}\left[\, |\{ C \in \mathcal{S} \mid C(f)\}| \,\right].$$
In the (uninteresting) case of pairwise independent constraints in $\mathcal S$,
this simplifies to $\sum_{C \in \mathcal S} \alpha_C$, as one would expect.

Being a strict generalisation of the single constraint case, in the following
(and in our implementation), we always consider expansion factors over sets
of constraints.
Importantly, however, we restrict expansion factors to only
be defined over sets of constraints within a shared constraint class---this
simplifies significantly the implementation as it does not require to handle
any arbitrary combination of constraints, and makes constraint classes an
important tool to express constraint dependencies in a way that the pattern
matcher can reason about.

Lower values of $\alpha$ will result in a smaller number of index maps. For
every constraint we are considering applying, we can query the constraint
classes that it is part of and group constraints by class.
We can then obtain the expansion factor associated with the constraints
in each of the constraint classes
and pick the class with the smallest expansion factor.
The following pseudo-code summarises the constraint selection procedure.
Given a list of patterns, it returns a list of constraints from one constraint
class such that the expansion factor is minimised.
```rust
in:     patterns
return: best_constraints

// For each pattern, collect all constraints that it nominates
// and group by constraint class
class_to_constraints = {}
for p in patterns {
    for c in nominate_constraints(p) {
        for cls in constraint_classes(c) {
            constraints = class_to_constraints[cls] or []
            constraints.append(c)
            class_to_constraints[cls] = constraints
        }
    }
}

// Find class with smallest expansion factor
best_constraints = None
best_ef = None
for (cls, constraints) in class_to_constraints {
    ef = expansion_factor(cls, constraints)
    if best_ef == None || ef < best_ef {
        best_constraints = constraints
        best_ef = ef
    }
}
```
We will see an example implementation of the various functions
called in this pseudo-code in the next section.

### An example

### Rewriting rule used in practice