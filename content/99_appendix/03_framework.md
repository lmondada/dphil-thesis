+++
title = "A Platform for Scalable Graph Rewriting"
sort_by = "weight"
weight = 3
layout = "section"
slug = "chap:rewriting"
+++

With this chapter we have arrived at the core of this thesis:
a proposal for a new quantum compilation framework.
In summary, our claim is that given

1. the challenge of scaling up quantum programs sizes to make the most of the
computational capabilities of upcoming hardware
(cf. {{< reflink "sec:compilation" "sec:quantum-sota" >}}) and
2. the modularity and expressiveness that quantum compilers will require
to simultaneoulsy express higher level abstractions, hardware primitives
and interleaved quantum classical computation
(cf. {{< reflink "sec:hybrid" "sec:need-help" "sec:graph-defs">}}),

graph rewriting is uniquely positioned to serve as the backbone of a
quantum compilation framework.

Our proposal draws much from the design and techniques of classical compilers
(cf. {{< reflink "sec:graph-defs" "sec:eqsat" >}}).
Quantum, however, distinguishes itself in two ways, forming the cornerstones
of our design.
The focus on small, local graph transformations for quantum optimisation
is justified by the groundbreaking work by Clément et al @Clement2023 @Clement2024.
They showed that the rich algebraic structure of quantum circuits can be fully
captured and expressed using local rewrite rules[^eqcomp].
Our compiler can therefore restrict program manipulation to local transformations
without losing expressiveness.
This design choice in turn opens the door for large scale optimisation and
compilation on parallel or even distributed hardware.

Equally important, the linear types of quantum computing
(cf. {{< reflink "sec:graph-defs" >}}) significantly constrain
the space of possible program transformations.
Our contributions in this thesis highlight how these restrictions can be leveraged
to create quantum-specific variants of classical compilation techniques that
scale much more favourably.
This makes approaches that are too expensive for classical compilers
(cf. {{< reflink "sec:eqsat" >}})
perfectly feasible[^unfeasible] in the context of quantum compilation.
[^eqcomp]: More precisely, they show that any two equivalent quantum circuits
can be transformed into each other using a finite number of local rewriting
rules.
[^unfeasible]: Or at least, less unfeasible.

#### Overview


The framework we propose can be summarised by the diagram below.
It is composed of two main components: _pattern matching_
is tasked with finding all possible applications of rewrite rules from
the set of pre-defined rules.
Importantly, for this computation, we introduce an offline pre-processing step
that builds a data structure that is amenable to pattern matching from the
supplied set of rewrite rules. This allows us to obtain significant speedups
in the exploration phase of the framework.
The design of the pattern matching engine is described in more detail
in ??, while the original contributions
with a detailed presentation of the pre-processing computation and an analysis of the
asymptotic speedup are presented in {{< reflink "chap:matching" >}}.

The second component is charged with the application and prioritisation
of the discovered rewrites.
Depending on the cost function and heuristics employed, it may select a subset
of rewrites or any combination of multiple rewrites to produce zero, one or many
new candidate programs that are equivalent to the input program.
We discuss several rewriting strategies in ??.
Beyond that, we argue that optimisation based on local rewriting must be
done in parallel to scale to large input sizes.
For this purpose, ?? presents a refinement of
our framework for the distributed setting.
To enable this, a new distributed data structure inspired by equality saturation
is presented in {{< reflink "chap:parallel" >}}.

The simple heuristic driving our optimisation loop, consisting
of pattern matching and rewrite application, relies on a
priority queue, which orders all candidate programs by increasing
cost function.
This allows us to keep track of all the best candidates seen so
far, with the top of the queue always containing the current best
optimised program.
Optimisation can thus be terminated at any time based on a timeout.
This corresponds to a simple backtracking search, which greedily
chooses the best candidate at each step, and retreats to optimising
previous candidates once all better candidates have been exhausted.
Improvements to the search heuristic are an obvious area for future work, which we do not explore in this thesis but briefly
discuss in our concluding chapter, {{< reflink "chap:conclusion" >}}.

{{< figure
  src="svg/overview-matcher.svg"
  alt="Proposed quantum compiler optimisation framework"
  caption="Overview of the proposed quantum compiler optimisation framework. The two main components (white square boxes in the figure) are discussed in details in sec. [4.2](/04_rewriting#sec2) and [4.3](/04_rewriting#sec3) respectively."
  width="95%"
>}}


#### Pattern matching engine

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
for the use case of portgraph matching in {{< reflink "chap:matching" >}}.
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
fn best_constraints(patterns: [Pattern]) -> [Constraint] {
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
    return best_constraints
}
```
Finally, after selecting the constraints to be applied, the patterns are
updated by applying the constraints one-by-one and constructing the pattern
matcher for the (now simplified) patterns recursively:
```rust
fn build_matcher(patterns: [Pattern], root = None) -> Tree {
    if root == None {
        root = new_tree()
    }
    for c in best_constraints {
        new_patterns = [condition_on(p, c) for p in patterns]
        child = root.add_child(c)
        build_matcher(new_patterns, child)
    }
    return root
}
```
Of course, the real implementation must keep track of additional information, such
as the set of bound keys and the pattern matching at each node. Nodes that
represent the same pattern matching state are also merged to reduce the size
of the data structure.

This has certainly all been very abstract---and probably rather confusing.
To illustrate the ideas we just presented, the next section presents
an implementation of this interface for string pattern matching.
Among others this will include concrete implementations for the various functions
(`nominate_constraints`, `constraint_classes`, `expansion_factor`, `condition_on` etc.)
called in the pseudo-code.

### An example
The pattern matching framework we are proposing can of course model the
matching problems on graphs and compiler IRs that we are mostly interested in.
It can however be applied just as well to other domains.

Among the simplest possible use cases of this is pattern matching on strings.
Over the course of the previous paragraphs, we introduced all the main ideas
and concepts using a mathematical language.
In this section, we will use string matching as an excuse to revisit the same
ideas, this time staying much closer to the perspective of the user and the
actual programming interface as implemented in the Rust library `portmatching`[^portm].
I suspect the reader will fall into one of two camps---either excited that
the rumblings in this thesis might at last show some early signs of coherence,
or utter disbelief that the presentation is about to become more applied still.
In either case, rest assured that no knowledge of Rust is expected---we will
mimick the real interface as much as possible, but the "code" we will write
will be straight-forward pseudo-code[^fullex]
[^portm]: Available on [crates.io](https://crates.io/crates/portmatching).
[^fullex]: Call it pseudo-Rust if you will---pseudo-code with a Rust-inspired
syntax, but  simple enough for anyone to follow. The complete, working
implementation of this example is available
within the portmatching crate in the module [`portmatching::concrete::string`](https://github.com/lmondada/portmatching/blob/main/src/concrete/string.rs).

Let us start with the indexing scheme. For this we propose integer valued key
and value sets $\mathcal K \simeq \mathbb N$, $\mathcal V \simeq \mathbb N$.
To distinguish between $\mathcal K$ and $\mathcal V$, we will write their
elements as `PatternPos(i)` and `DataPos(i)` respectively.
We use the indices to refer to the position of characters within the pattern
and data strings.

For a pattern $p$ and a data string $D$ with $|P|$ and $|D|$ characters
respectively, a pattern embedding is thus a map
$$\{\,\texttt{PatternPos}(i) \mid 0 \leqslant i < |P| \}\to\{\texttt{PatternPos}(i + s) \mid 0 \leqslant i < |P|\}$$
that maps `PatternPos(i)` to `DataPos(s + i)` for some $s \in \mathbb N$
and such that the pattern
matches the characters in $D$ between positions $s$ and $s+|P|$, i.e. $P = D[s:s+i]$.

To define the indexing scheme, we provide the following two functions:
```rust
fn required_bindings(key: PatternPos) -> [PatternPos] {
    if key == PatternPos(0) {
        return []
    } else {
        return [PatternPos(0)]
    }
}

fn list_bind_options(
    key: PatternPos, data: String, known_bindings: Map<PatternPos, DataPos>
) -> [DataPos] {
    if key == PatternPos(0) {
        // Every position in data is valid
        return [DataPos(i) for i in [0, 1, .. data.len() - 1] ]
    } else {
        PatternPos(pattern_offset) = key
        DataPos(root_binding) = map.get(PatternPos(0))
        if root_binding + key < data.len() {
            // Valid position is obtained by adding offset to root binding
            return [DataPos(root_binding + pattern_offset)]
        } else {
            // The only valid position would be beyond the end of data
            return []
        }
    }
}
```
The first is independent of the `data` string being matched.
It is thus sufficient to call it once for each pattern key in the offline
precomputation phase.
The keys returned are the dependency of the `key` passed as argument:
they must be bound before `key` can itself be bound.
This defines a dependency graph of all key bindings, from which a total order
of key bindings can be determined (assuming the dependency graph is acyclic).
In our case, we declare that before any index $i > 0$ can be bound,
first a binding for the index $0$ must be provided.
The latter index, on the other hand, can be bound without requiring any
prior bindings.

The second function captures the binding logic proper and corresponds to the
$\textrm{expand}_k$ function introduced in the previous section.
The user implementing this function may safely assume that all required bindings,
as returned by `required_bindings`, have already been bound and can be accessed
using the binding map passed as third argument.
We see in the implementation why we made every other binding depend on
`PatternPos(0)`: once the latter is bound (to any position in the data string),
all other pattern posistions resolve to a unique `DataPos`[^mayormaynotexist], making the implementation
of `list_bind_options` very simple.
[^mayormaynotexist]: That may or may not exist in $D$.

We now turn to the set of valid **predicates**, from which pattern
constraints are defined.
To add a bit of spice here (and incidentally support string matching capabilities
more powerful than regular expressions), we consider a somewhat extended pattern
language.
Suppose our data strings are drawn from an alphabet $\Sigma$, i.e. $D \in \Sigma^*$.
Instead of taking pattern strings in $\Sigma^*$, we instead extend the
alphabet with a (disjoint) set of symbols $X$ and take patterns in $P \in (\Sigma \cup X)^*$.
Characters of a pattern in $\Sigma$ must match the character they are mapped to in $D$
exactly.
Characters in $\mathcal X$, meanwhile, can match any character; however,
any two occurences of the same symbol in a pattern must map to identical characters
in $D$.

In our implementation, we fix $\Sigma$ to be lowercase letters `'a'` -- `'z'` and identify
symbols in $\mathcal X$ by prefixing a character with `$`, e.g. `$x` and `$y`.
For instance, the pattern `ab$xc$x` will match `fooabccc` starting from
position 3 (i.e. mapping `PatternPos(0)` to `DataPos(3)`),
but will not match `abccd`, as `$x` would have to be assigned once to `c` and
once to `d`.

To capture these matching semantics we introduce two predicates[^tobeprecise]
- `ConstVal(c)` for all `c` in $\Sigma$
- `BindingEq`

The first predicate is of arity 1: given an index `DataPos(i)`, it will evaluate
to true if `d[i] == c` is satisfied.
This corresponds to matching characters of the pattern string within $\Sigma$.
On the other hand, `BindingEq`, of arity 2, compares the characters at
two positions `DataPos(i)` and `DataPos(j)` for equality: `d[i] == d[j]`.
Such a predicate is used for every occurence of a symbol of $\mathcal X$ in the
pattern beyond the first one.
[^tobeprecise]: To be precise, `ConstVal` is an entire family of predicates.

We provide this predicate evaluation in the simple function `check`.
```rust
fn check(predicate, args: [DataPos], data: String) -> bool {
    if predicate == ConstVal(c) {
        [DataPos(i)] = args
        return d[i] == c
    } else {  // predicate == BindingEq
        [DataPos(i), DataPos(j)] = args
        return d[i] == d[j]
    }
}
```
We then define our pattenrs by a set of constraints that must be satisfied.
Each constraint is expressed by a predicate along with one or two pattern keys
`PatternPos(i)`, indicating which characters the predicate applies to.
Continuing the example of the pattern, `ab$xc$x`, we can express it by the
set of constraints
```
[
  (ConstVal('a'), PatternPos(0)),
  (ConstVal('b'), PatternPos(1)),
  (ConstVal('c'), PatternPos(3)),
  (BindingEq(PatternPos(2), PatternPos(4))
]
```
Note that in this latter representation the name of the variable `$x$ is no
longer specified---this simplifies the pattern. It will also increase the
overlap of contraints between patterns by removing duplicates that differ
in variable name only.

The task of the pattern matcher is then, given some data string, to
find a binding of the positions between `PatternPos(0)` and `PatternPos(4)`
to some data positions `DataPos(i)` ... `DataPos(i + 4)` for some i
such that all constraints above are satisfied[^allgoodcontinuous].
[^allgoodcontinuous]: Note: that the bound `DataPos` indices will form
a contiguous interval is already guaranteed by our design of the indexing
scheme---replacing with an indexing scheme allowing non-contiguous
but monotonic indices, we would obtain pattern matching on string subsequences.

A concrete decomposition of the pattern would include the ordering in which
the constraints should be evaluated. For all but the simplest cases, however,
fixing such a constraint decomposition and the evaluation order is likely
to yield inefficient pattern matchers.
As we discussed, the API instead expects the pattern decomposition to be
provided through the functions `nominate_constraints`, `constraint_classes`,
`expansion_factor` and `condition_on`.

For the implementations of `nominate_constraints` and `condition_on`, we
rely on the [`ConstraintPattern`](https://docs.rs/portmatching/0.4.0-rc.5/portmatching/constraint/pattern/struct.ConstraintPattern.html)
type provided by `portmatching`.
Provided with the set of constraints above, an instance of `ConstraintPattern`
will keep track of which constraints have already been satisfied through
successive calls to `condition_on`. Calls to `nominate_constraints` will return
the set of constraints that are still left to be satisfied.

To conclude, we must indicate which constraints should be grouped together
and how to estimate their value.
We note that when evaluated on the same `DataPos(i)`, any two `ConstVal`
constraints are mutually exclusive.
We can interpret a `BindingEq arg1 arg2` constraint similarly, by viewing it as
identical to a `ConstVal(c) arg2` constraint, where `c` is the character at
the position of `arg1`.
We hence choose to group together constraints that apply to the same position.
We introduce for this the classes `AtPositionClass(i)`, for integer `i`.
```rust
fn constraint_classes(predicate, args: [DataPos]) -> [ConstraintClass] {
    if predicate == ConstVal {
        [DataPos(i)] = args
        return [AtPositionClass(i)]
    } else {  // predicate == BindingEq
        [DataPos(i), DataPos(j)] = args
        // assuming i < j, and that DataPos(i) is bound before DataPos(j)
        return [AtPositionClass(j)]
    }
}
```
To simplify here, we chose to only assign `BindingEq` constraints to a single
class---this allows us to assume that the first key was already bound, and
therefore treat the constraint in the same way as `ConstVal` constraints.
We could also assign `BindingEq` to the two classes corresponding to the
two positions it applies to, but it then becomes harder to give a good estimate
for the `expansion_factor`.
Assuming every character in $\Sigma$ is equally likely to occur, this gives
the straight-forward approximation of the expansion factor $\alpha$[^notaccountingbindingeq]
[^notaccountingbindingeq]: A better approximation in `expansion_factor` should
take into account that multiple `BindingEq` constraints can result in the
same constraint, if the data contains multiple repetitions of the same character.
One could for example treat the two constraint types independently, and assume
that `BindingEq` constraints are satisfied with probability $1/26$,
independently of one another.

```rust
fn expansion_factor(constraints: [Constraint]) -> f64 {
    return 1.0 / 26.0 * constraints.len()
}
```

{{% hint danger %}}
There is still the branching factor!
{{% /hint %}}

### Rewriting rule used in practice
