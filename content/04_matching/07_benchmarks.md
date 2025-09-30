+++
title = "Benchmarks"
layout = "section"
weight = 7
slug = "sec:benchmarks"
+++

{{% refproposition "prop-main" %}} shows that pattern-independent matching can
scale to large datasets of patterns but imposes some restrictions on the
patterns and embeddings that can be matched. In this section, we discuss these
limitations and give empirical evidence that the pattern-matching approach we
have presented can be used on a large scale and outperform existing solutions.

#### Pattern limitations

In {{< reflink "sec:simplifying-assumptions" >}}, we imposed conditions on the
pattern embeddings to obtain a complexity bound for pattern-independent
matching. We argued how these restrictions are natural for applications in
quantum computing, and most of the arguments will also hold for a much broader
class of computation graphs.

In future work, it would nonetheless be of theoretical interest to explore the
importance of these assumptions and their impact on the complexity of the
problem. As a first step towards a generalisation, our implementation and all
our benchmarks in this section do not make any of these simplifying assumptions.
Our results below give empirical evidence that a significant performance
advantage can be obtained regardless.

#### Implementation

We provide an open-source implementation in Rust of pattern independent matching
using the results of this chapter, available on
[GitHub](https://github.com/lmondada/portmatching). The code and datasets used
for the benchmarks themselves are available in a
[dedicated repository](https://github.com/lmondada/portmatching-benchmarking).

The implementation works for weighted or unweighted port graphs---of which typed
minIR graphs are a special case---and makes none of the simplifying assumptions
employed in the theoretical analysis. Pattern matching proceeds in two phases:
precomputation and runtime.

**Precomputation.**&emsp; In a first step, all graph patterns are processed and
compiled into a single state automaton that will be used at _runtime_ for fast
pattern independent matching. The automaton in the implementation combines in
one data structure two distinct computations of this chapter:

- the recursive branching logic used in the `AllAnchors` procedure to enumerate
  all possible choices of anchors.
- the automaton described in {{% reflink "sec:automaton" %}} that matches
  patterns for a fixed set of anchors, and

The former is implemented with non-deterministic state transitions---each
transition corresponding to choosing an additional anchor---, whereas the latter
is implemented deterministically.

Concretely, the automaton is constructed by following the construction of
{{% reflink "sec:canonical" %}} to decompose each pattern into its canonical
path-split graph. We then order the nodes of the PSG and express each node as a
condition that ensures the connectivity and node weight in the graph matches the
pattern. We thus obtain a chain of conditions, with a transition between any two
consecutive conditions; transitions are deterministic by default and marked as
non-deterministic whenever they lead to a condition on an anchor node. The state
automaton for all patterns is then obtained by joining all chains of conditions
into a tree.

**Runtime.**&emsp; Pattern matching is then as simple as simulating the state
automaton, evaluating all conditions on the graph $G$ passed as input. The
states in the automaton corresponding to the last condition of a pattern must be
marked as _end states_, along with a label identifying the pattern that was
matched. This can then be used at runtime to report all patterns found.

Our implementation has been tested for correctness, i.e. on the one hand that
all matches that are reported are correct, and on the one hand that all pattern
matches are found. This was done by comparing the matches of our implementation
with the results obtained from matching every pattern separately on millions of
randomly generated graphs and edge cases. We also ensured during benchmarking
that the number of matches reported by our implementation and by Quartz were
always the same.

#### Benchmarks

**Baseline.**&emsp; To assess practical use, we have benchmarked our
implementation against a leading C++ implementation of pattern matching for
quantum circuits from the Quartz superoptimiser project @Xu2022. This
implementation is the principal component of an end-to-end quantum circuit
optimisation pipeline. The results and speedups we obtain here thus apply and
transfer directly to this application.

**Dataset.**&emsp; We further ensure that our results apply in practice by using
a real-world dataset of patterns. The Quartz optimiser finds opportunities for
circuit optimisation by relying on precomputed equivalence classes of circuits
(ECC). These are obtained exhaustively by enumerating all possible small quantum
circuits, computing their unitaries and clustering them into classes of circuits
with identical unitaries.

The generation of ECC sets is parametrised on the number of qubits, the maximum
number of gates and the gate set in use. For these benchmarks we chose the
minimal set of gates $T, H, CX$ and considered circuits with up to 6 gates and
2, 3 or 4 qubits. The size of these pattern circuits is typical for the
application[^whysosmall].

[^whysosmall]:
    Such small circuit sizes are imposed in part by the fact that ECCs of larger
    circuits quickly become unfeasible to generate as their number grows
    exponentially. In practice, large circuit transformations can often be
    expressed as the composition of smaller atomic transformations, hence the
    good performance of this approach in practice.

Thus, for our patterns, we have the bound $d \leq 6$ for the maximum depth and
width $w = 2,3,4$. In all experiments, the graph $G$ subject to pattern matching
was `barenco_tof_10` input, i.e. a 19-qubit circuit input with 674 gates
obtained by decomposing a 10-qubit Toffoli gate using the Barenco decomposition
@Barenco_1995.

**Results.**&emsp; We study the runtime of our implementation as a function of
the number $\ell$ of patterns being matched, up to $\ell = 10^4$ patterns. We
expect the runtime of pattern matching algorithms that match one pattern at a
time to scale linearly with $\ell$. On the other hand,
{{% refproposition "prop-main" %}} results in a complexity that is independent
of $\ell$.

For each value of $\ell$, we select a subset of all patterns in the ECC sets at
random. For $w = 2$, there are only a total of $\ell = 1954$ patterns,
explaining why we do not report result beyond that number. For $\ell = 200$
patterns, our proposed algorithm is $3\times$ faster than Quartz. As expected,
the advantage of our approach increases as we match more patterns, scaling up to
a $20\times$ speedup for $\ell=10^4$. The results are summarised in the
following figure:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/eccs-plot.svg"
    width="80%"
    enlarge="full"
    caption="Runtime of pattern matching for $\ell = 0\dots 10^4$ patterns on 2, 3 and 4 qubit quantum circuits from the Quartz ECC dataset, for our implementation (Portmatching) and the Quartz project. All $\ell = 1954$ two-qubit circuits were used, whereas for 3 and 4 qubit circuits, $\ell = 10^4$ random samples were drawn."
%}}
<!-- prettier-ignore-end -->

**Dependency on $w$ and $\ell$.**&emsp; We further study the runtime of our
algorithm as a function of its two main parameters, the number of patterns
$\ell$ and the pattern width $w$, on an expanded dataset. To this end, we
generate random sets of 10,000 pattern circuits with 15 gates and between $w=2$
and $w=10$ qubits, using the same gate set as previously. The resulting pattern
matching runtimes are shown in the figure below.

From {{% refproposition "prop-main" %}}, we expect that the pattern matching
runtime is upper bounded by a $\ell$-independent constant. Our results support
this result for $w=2$ and $w=3$ qubit patterns, where runtime seems indeed to
saturate, reaching an observable runtime plateau at large $\ell$.

We suspect on the other hand that the exponential $c^w$ dependency in the
complexity bound of {{% refproposition "prop-main" %}} makes it difficult to
observe a similar plateau for $w \geq 4$, as we expect this upper bound on the
runtime to increase rapidly with qubit counts . A runtime ceiling is not
directly observable at this experiment size, but the gradual decrease in the
slope of the curve is consistent with the existence of the $\ell$-independent
upper bound predicted in {{% refproposition "prop-main" %}}.

<!-- prettier-ignore-start -->
{{% figure
    src="svg/random-plot.svg"
    caption="Runtime of our pattern matching for random quantum circuits with up to 10 qubits."
    enlarge="full"
    width="65%"
%}}
<!-- prettier-ignore-end -->
