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
explored in other domains such as RETE networks @Forgy1982 @Varro2013 @Ian2003
and computational biology @Danos2007 @Boutillier2017, no algorithm is known with
provable sub-exponential worst-case complexity bounds. These results were
published in @Mondada2024.

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

{{% proposition title="Pattern matching" id="prop:pattern-matching" %}}

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
crude lower-bound for $N_{w,d}$ derived in {{< refappendix "sec:ellbound" >}},
we obtain a computational advantage for our approach when

$$\Theta\left(\frac{c^w}{w^{\frac32}}\right) < \ell < \left(\frac{w}{2e}\right)^{\Theta(w d)} \leq N_{w, d}.$$

We present benchmarks on a real world dataset of 10'000 quantum circuits in
{{% reflink "sec:benchmarks" %}}, showing a 20x speedup over a leading C++
implementation of pattern matching for quantum circuits.

#### Confluently persistent graph rewriting

Our second major contribution, in **{{% reflink "chap:parallel" %}}**, presents
a novel data structure $\mathcal{D}$ that compresses the representation of the
space $\mathcal{G}$ of all graphs reachable from an input within a GTS. We call
$\mathcal{D}$ the _factorised search space_ of $\mathcal{G}$. We show in
{{% reflink "sec:factor-gts" %}} that under mild assumptions on the GTS and
input, there is an exponential complexity separation in the input size between
the size of the factorised search space $\mathcal{D}$---which admits an
asymptotically _linear_ upper bound---and the size of the rewrite space
$\mathcal{G}$ that it encodes---which grows at least exponentially. We are not
aware of any previous work that explores compressed representations of
$\mathcal{G}$.

$\mathcal{D}$ is furthermore the first _confluently persistent_ data structure
@Driscoll1994 @Fiat2003 @Collette2012: it performs non-destructive rewrites on
immutable graph objects by maintaining an explicit history of all graph rewrites
and their dependencies. This allows concurrent application of multiple rewrites
and can merge rewritten graphs that were obtained independently. This represents
an exciting development in its own right that opens the door to functional
programming and massively parallelised approaches to graph rewriting (see
{{% reflink "sec:conclusion-parallel" %}}).

The intuition behind the exponential reduction in search space size is as
follows: if rewrites $r_1, \dots, r_n$ apply to disjoint subgraphs of a common
graph $G$, then $\mathcal{D}$ will be of size $n$, storing the set possible
rewrites, rather than the up to $2^n$ distinct graphs in $\mathcal{G}$ obtained
by applying a subset of the rewrites. To generalise to arbitrary rewrites, the
data structure $\mathcal{D}$ must keep track of the dependencies and overlaps
between rewrites and update these as more rewrites are added to $\mathcal{D}$.

A lot of parallels can be drawn between this approach and _equality saturation_,
a technique for term rewriting with applications in classical compilers. We
explore these connections in {{% reflink "sec:eqsat" %}}.

Unlike the results of {{% reflink "chap:matching" %}}, the construction and
bounds proven in {{% reflink "chap:parallel" %}} can be applied to a wide range
of graph rewriting domains. It has particularly significant implications for
applications of GTSs that are unable to derive rewriting strategies from first
principles, and hence have to resort to an exhaustive (or heuristic) exploration
of the rewrite space $\mathcal{G}$. They can proceed as follows:

1. _Exploration phase_. Construct the factorised search space $\mathcal{D}$ by
   finding and applying rewrites, in time proportional to $|\mathcal{D}|$. With
   our results, this results in an exponential speedup over the naive
   exploration of $\mathcal{G}$ ({{% reflink "sec:persistent-ds" %}}).

2. _Extraction phase_. Unlike the case of $\mathcal{G}$ where the optimal
   solution is an element $G_{opt} \in \mathcal{G}$, constructing the optimal
   solution $\mathcal{D} \rightarrow G_{opt}$ in $\mathcal{D}$ is a non-trivial
   extraction problem. We show in {{% reflink "sec:extraction" %}} that the
   extraction can be expressed as a boolean satisfiability (SAT) problem;
   depending on the cost function, the optimisation can then be encoded as a
   side condition on SAT or by a generalisation of the problem to Satisfiability
   Modulo Theories (SMT).

In the worst case, SAT and SMT problems will require exponential time to solve
@Cook1971 @Moskewicz2001 @Biere2021, thus cancelling the exponential compression
of the search space $\mathcal{G} \rightarrow \mathcal{D}$. However, SAT and SMT
are standardised problems for which heavily optimised solvers and optimisers
have been developed @Moura2008 @Sebastiani2015. We expect that the instances of
SAT and SMT that encode the extraction problem will scale well in practice:

- Clauses in the problem encode _local_ properties that SAT solvers are
  well-suited to solve @Zulkoski2018&#x200B;: the boolean variables represent
  rewrites, which only impose restrictions on other rewrites that apply in the
  same neighbourhood of the graph.
- Furthermore, in quantum compilation applications, $\mathcal{D}$ can be
  _sparsified_: most rewrties in $\mathcal{D}$ do not change the cost function
  (think of IR transformations that reorder operations but do not reduce the
  runtime) and thus do not need to be encoded in the SAT problem.

#### Conclusion

The thesis concludes in {{% reflink "chap:conclusion" %}} with a discussion on
how our contributions serve our overall goal of a scalable and modular quantum
compiler platform. We discuss in particular two extensions of our work that we
see as particularly promising: the generalisation of fast multi-pattern matching
to non-linear values and to the persistent data structure $\mathcal{D}$ of
{{% reflink "chap:parallel" %}} ({{% reflink "sec:conclusion-pm" %}}) and the
deployment of confluently persistent graph rewriting to a massively parallel
distributed compute architecture ({{% reflink "sec:conclusion-parallel" %}}).
