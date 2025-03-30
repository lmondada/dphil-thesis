+++
title = "Contributions and thesis outline"
weight = 2
layout = "section"
slug = "sec:contributions"
+++

#### Preliminaries

The thesis starts in {{% reflink "chap:basics" %}} with a review of the main
concepts on which the rest of the thesis is built. Aside from a short
introduction to quantum computations ({{% reflink "sec:basics" %}}) and a survey
of the major quantum circuit optimisation techniques
({{% reflink "sec:quantum-sota" %}}), this chapter makes two observations that
impart a research direction for the rest of the thesis:

1. The emergence of hybrid quantum-classical computations is rendering the
   quantum circuit obsolete as the main representation of quantum computations
   within compilers ({{% reflink "sec:hybrid" %}}).
2. The best optimisation outcomes will be obtained by combining classical and
   quantum compiler optimisations. The way to achieve this is by adopting
   abstractions that are interoperable with classical compiler infrastructure.

#### A graph transformation formalism for quantum computations

{{% reflink "upper" "chap:compiler" "chap:matching" "chap:parallel" %}} form the
core of this thesis and present our main contributions. The results in
{{% reflink "chap:compiler" %}} are a crucial stepping stone for the rest of the
thesis. {{% reflink "upper" "chap:matching" "chap:parallel" %}} meanwhile
present our most significant contributions to the state of the art.

In **{{% reflink "chap:compiler" %}}**, we propose minIR, a new graph-based
intermediate representation (IR) for quantum computations. MinIR is a minimal
subset of the _Hierarchical Unified Graph Representation_ (HUGR), recently
presented in joint work @Hugr and the subject of
[ongoing development](https://github.com/CQCL/hugr). It is to our knowledge the
first compiler IR with support for linear types---required to model the
restrictions that quantum mechanics imposes on quantum computations.

Unlike quantum circuits, minIR (and HUGR) programs can model computations that
act on arbitrary combinations of classical (bits) and quantum data (qubits)
within a single, unified representation. It represents the best of two worlds:
it combines the safety guarantees of quantum-specific representations such as
quantum circuits (i.e. it is impossible to declare physically unrealisable
computations), whilst at the same time being interoperable with classical
compiler IRs.

Graph-based representations of computations, known as _computation graphs_ in
deep learning and _dataflow graphs_ within the compiler community, are common in
these fields. Our original contribution is in the formalisation of the IR
transformation semantics: whereas classical compilers typically define IR
transformations in terms of the values that they depend on and the values that
they overwrite, this approach implicitly relies on value copying and discarding
and thus does not generalise to linear values. Instead, we define graph
rewriting semantics on minIR and show sufficient conditions for which minIR
transformations preserve the validity of the program, and in particular the
linearity conditions.

---

The encoding of quantum computations as graphs sets the stage for quantum
compilation and optimisation using _graph transformation systems_ (GTS), in
which the set of transformations that the compiler is allowed to perform is
expressed by a set of graph transformation rules. This is in effect a
generalisation of an approach first proposed in @Xu2022 in the context of
quantum circuits. We improve on this work with two major contributions that
resolve critical issues that concerning the scaling of the technique to large
numbers of transformation rules and large inputs respectively.

#### Pattern matching

Our first major contribution is a pattern matching algorithm, presented in
**{{% reflink "chap:matching" %}}**. The main result is a runtime complexity
bound independent of the number of patterns being matched, achieved using a
one-off pre-computation. This is to our knowledge the first pattern matching
algorithm for quantum circuits that does not depend on the number of patterns
being matched. Whilst similar multi-pattern matching techniques have been
explored in other domains such as RETE networks and computational biology, no
algorithm is known with provable sub-exponential worst-case complexity bounds.
These results were peer-reviewed and published in @Mondada2024.

The proven complexity bound applies to computations with only linear
values[^otherwisehard], of which quantum circuits are a special case. The result
is expressed in terms of maximal pattern _width_ $w$ and _depth_ $d$, two
measures of pattern size defined in
{{% reflink "sec:simplifying-assumptions" %}}. The main result, presented in
{{% refproposition "prop-main" %}}, is reproduced here:

[^otherwisehard]:
    In the absence of linearity, pattern matching is an instance of the subgraph
    isomorphism problem, an NP-complete problem. The assumption is therefore
    necessary and expected.

{{% proposition title="Pattern matching" %}}

Let $P_1, \dots, P_\ell$ be patterns with width $w$ and depth $d$. The
pre-computation runs in time and space complexity

$$O \left( (d\cdot \ell)^w \cdot \ell + \ell \cdot w \cdot d \right).$$

For any subject graph $G$, the pre-computed prefix tree can be used to find all
pattern embeddings $P_i \to G$ in time

{{% centered numbered="eq-overallcompl" %}}
$$O \left( |G| \cdot \frac{c^w}{w^{1/2}} \cdot d \right)$$ {{% /centered %}}

where $c = 6.75$ is a constant.

{{% /proposition %}}

The runtime complexity is dominated by an exponential scaling in maximal pattern
width $w$. Meanwhile, the advantage of our approach over matching one pattern at
a time grows with the number of patterns $\ell$. It is thus of particular
interest for matching numerous small width patterns. In the case of quantum
circuits, the width of the patterns is given by the number of qubits.

We illustrate this point by comparing our approach to a standard algorithm that
matches one pattern at a time @Jiang1998, with runtime complexity
$O(\ell \cdot |P| \cdot |G|)$. Using $|P| \leq w\cdot d$ (cf.
{{% reflink "sec:simplifying-assumptions" %}}), and comparing to eq.
{{% refcentered "eq-overallcompl" %}}, we thus have a speedup in the regime
$\Theta(c^w / w^{3/2}) < \ell$. On the other hand, $\ell$ is upper bounded by
the maximum number $N_{w, d}$ of patterns of bounded width and depth. Using a
crude lower-bound for $N_{w,d}$ derived in appendix
[B]({{< relref "/99_appendix#sec:ellbound" >}}), we obtain a computational
advantage for our approach when

$$\Theta\left(\frac{c^w}{w^{\frac32}}\right) < \ell < \left(\frac{w}{2e}\right)^{\Theta(w d)} \leq N_{w, d}.$$

We present benchmarks on a real world dataset of 10'000 quantum circuits in
{{% reflink "sec:benchmarks" %}}, showing a 20x speedup over a leading C++
implementation of pattern matching for quantum circuits.

#### Confluently persistent graph rewriting

Our second major contribution, in **{{% reflink "chap:parallel" %}}**, presents
a novel data structure $\mathcal{D}$ to represent the space $\mathcal{G}$ of all
graphs reachable from an input within a GTS. We show in
{{% reflink "sec:factor-gts" %}} that under mild assumptions on the GTS and
input, there is an exponential separation between the size of $\mathcal{D}$ and
the size of the rewrite space $\mathcal{G}$ that it encodes.

enables graph rewriting that is both _persistent_---i.e. with immutable data and
fast non-destructive updates---and _confluent_---i.e. multiple changes can be
merged and combined.

Unlike the results of {{% reflink "chap:matching" %}}, the construction and
bounds proven in {{% reflink "chap:parallel" %}} can be applied to a wide range
of graph rewriting domains.

This chapter contributes to this goal by introducing a data structure for the
_concurrent_ exploration of the state space of GTSs. As the name implies, this
will allow for a parallelised exploration of the state space; but more
importantly, we will see that it significantly reduces the size of the total
search space, whilst keeping the solution space unchanged.

Our proposal draws much from the design and techniques of classical compilers
(cf. {{< reflink "sec:graph-defs" "sec:eqsat" >}}). Quantum, however,
distinguishes itself in two ways, forming the cornerstones of our design. The
focus on small, local graph transformations for quantum optimisation is
justified by the groundbreaking work by Clément et al @Clement2023 @Clement2024.
They showed that the rich algebraic structure of quantum circuits can be fully
captured and expressed using local rewrite rules[^eqcomp]. Our compiler can
therefore restrict program manipulation to local transformations without losing
expressiveness. This design choice in turn opens the door for large scale
optimisation and compilation on parallel or even distributed hardware.

Equally important, the linear types of quantum computing (cf.
{{< reflink "sec:graph-defs" >}}) significantly constrain the space of possible
program transformations. Our contributions in this thesis highlight how these
restrictions can be leveraged to create quantum-specific variants of classical
compilation techniques that scale much more favourably. This makes approaches
that are too expensive for classical compilers (cf. {{< reflink "sec:eqsat" >}})
perfectly feasible[^unfeasible] in the context of quantum compilation.

[^eqcomp]:
    More precisely, they show that any two equivalent quantum circuits can be
    transformed into each other using a finite number of local rewriting rules.

[^unfeasible]: Or at least, less unfeasible.
