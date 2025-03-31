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

**Pattern limitations.**&emsp; In {{< reflink "sec:simplifying-assumptions" >}},
we imposed conditions on the pattern embeddings to obtain a complexity bound for
pattern-independent matching. We argued how these restrictions are natural for
applications in quantum computing, and most of the arguments will also hold for
a much broader class of computation graphs.

In future work, it would nonetheless be of theoretical interest to explore the
importance of these assumptions and their impact on the complexity of the
problem. As a first step towards a generalisation, our implementation and all
our benchmarks in this section do not make any of these simplifying assumptions.
Our results below give empirical evidence that a significant performance
advantage can be obtained regardless.

**Implementation.**&emsp; We provide an open source implementation in Rust of
pattern independent matching using the results of this chapter, available on
[GitHub](https://github.com/lmondada/portmatching). The implementation works for
weighted or unweighted port graphs---of which typed minIR graphs are a special
case---and makes none of the simplifying assumptions employed in the theoretical
analysis.

**Benchmarks.**&emsp; To assess practical use, we have benchmarked our
implementation against a leading C++ implementation of pattern matching for
quantum circuits from the Quartz superoptimiser project @Xu2022. Using a
real-world dataset of patterns obtained by the Quartz equivalence classes of
circuits (ECC) generator, we measured the pattern-matching runtime on a random
subset of up to 10'000 patterns.

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/eccs-plot.svg"
    width="80%"
    enlarge="full"
    caption="Runtime of pattern matching for $\ell = 0\dots 10^4$ patterns on 2, 3 and 4 qubit quantum circuits from the Quartz ECC dataset, for our implementation (Portmatching) and the Quartz project. All $\ell = 1954$ two-qubit circuits were used, whereas for 3 and 4 qubit circuits, $\ell = 10^4$ random samples were drawn."
    class="break-after"
%}}
<!-- prettier-ignore-end -->

We considered circuits on the $T, H, CX$ gate set with up to 6 gates and 2, 3 or
4 qubits. Thus, for our patterns, we have the bound $d \leq 6$ for the maximum
depth and width $w = 2,3,4$. In all experiments, the graph $G$ subject to
pattern matching was `barenco_tof_10` input, i.e. a 19-qubit circuit input with
674 gates obtained by decomposing a 10-qubit Toffoli gate using the Barenco
decomposition @Barenco_1995. For $\ell = 200$ patterns, our proposed algorithm
is $3\times$ faster than Quartz, scaling up to $20\times$ faster for
$\ell=10^5$. The results are summarised in the figure above.

We also provide a more detailed scaling analysis of our implementation by
generating random sets of 10'000 quantum circuits with 15 gates for qubit
numbers between $w=2$ and $w=10$, using the previous gate set; the results are
shown in the figure below. From {{% refproposition "prop-main" %}}, we expect
that the pattern matching runtime is upper bounded by a $\ell$-independent
constant. Runtime seems indeed to saturate for $w=2$ and $w=3$ qubit patterns,
with an observable runtime plateau at large $\ell$. From the exponential $c^w$
dependency in the complexity bound of {{% refproposition "prop-main" %}}, it is,
however, to be expected that this upper bound increases rapidly for qubit counts
$w \geq 4$. A runtime ceiling is not directly observable at this experiment
size, but the gradual decrease in the slope of the curve is consistent with the
existence of the $\ell$-independent upper bound predicted in
{{% refproposition "prop-main" %}}.

<!-- prettier-ignore-start -->
{{% figure
    src="svg/random-plot.svg"
    caption="Runtime of our pattern matching for random quantum circuits with up to 10 qubits."
    enlarge="full"
    width="65%"
%}}
<!-- prettier-ignore-end -->
