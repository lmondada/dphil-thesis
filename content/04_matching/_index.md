+++
title = "Pattern Matching in large Graph Transformation Systems"
sort_by = "weight"
weight = 4
layout = "chapter"
slug = "chap:matching"
+++

To our knowledge, the first practical proposal for a GTS-based quantum compiler
was presented in @Xu2022 and then refined in @Xu2023. In these, the set of
possible graph transformations is obtained by exhaustive enumeration. Using SAT
solvers and fingerprinting techniques, the set of all small programs up to a
certain size can be generated ahead of time and clustered into disjoint
partitions of equivalent programs. This concisely expresses every possible
peephole optimisation up to the specified size: for every small enough subset of
instructions of an input program, its equivalence class can be determined. Any
replacement of that set of instructions with another program in the same
equivalence class is a valid transformation and, thus, a potential peephole
optimisation.

The results obtained are promising (and the motivation for this thesis), but it
suffers from a significant scaling challenge. In @Xu2022, optimisation
performance improved markedly with larger sets of rewrite rules. However, in
these implementations, pattern matching is carried out separately for each
pattern, becoming a bottleneck for large rule sets. As a result, performance
peaks at around 50,000 rewrite rules, after which the additional overhead from
pattern matching becomes dominant, deteriorating the compilation results.

In this chapter, we solve these scaling difficulties by presenting an algorithm
for pattern matching on minIR graphs that uses a pre-computed data structure to
return all pattern matches in a single query. The set of rewrite rules is
directly encoded in this data structure. After a one-time cost for construction,
pattern-matching queries can be answered in running time independent of the
number of rewrite rules.

{{< reflink "upper" "sec:simplifying-assumptions" >}} starts with introducing
some relevant definitions and a summary of assumptions that are made for the
asymptotic complexity results in this chapter to hold. They represent a
restriction from the generality of minIR graphs, but we do not find that they
restrict the usefulness of the result in practice. Moreover, as discussed in
{{< reflink "sec:benchmarks" >}} and further generalised in
{{< reflink "chap:rewriting" >}}, none of these assumptions is required for the
implementation, and we have not observed any impact on performance when lifting
them in practice, so we conjecture that these assumptions can be relaxed and our
results generalised.

{{< reflink "upper" "sec:treereduc" >}}, {{< reflink "sec:canonical" >}} and
{{< reflink "sec:anchors" >}} present the core ideas of our approach,
respectively introducing: a reduction of minIR graphs to equivalent trees, a
canonical construction for the tree reduction and an efficient way to enumerate
all possible subtrees of a graph. We also prove bounds on the size and number of
the resulting trees, which will directly translate to the asymptotic complexity.
In {{< reflink "sec:automaton" >}}, we introduce a pre-computation step and show
that the pattern-matching problem reduced to tree structures can be solved using
a prefix tree-like automaton that is fixed and pre-computed for a given set of
patterns. As a result, given the automaton, pattern matching can be performed in
time independent of the number of patterns---unlike previous approaches that
match patterns one by one.

We conclude in {{< reflink "sec:benchmarks" >}} with benchmarks on a real-world
dataset of 10000 quantum circuits, obtaining a $20\times$ speedup over a leading
C++ implementation of pattern matching for quantum circuits.

#### Related work

Our proposed solution can be seen as a specialisation of RETE networks
@Forgy1982 @Varro2013 and derivatives @Ian2003 @Armstrong2014 @Miranker1987 to
the case of graph pattern matching. The additional structure obtained from
restricting our considerations to graphs results in a simplified network design
that allows us to derive worst-case asymptotic runtime and space bounds that are
polynomial in the parameters relevant to our use
case[^spaceefficiency]---overcoming the key limitations of RETE.
[^spaceefficiency]: RETE networks have been shown to have exponential worst-case
space (and thus time) complexity @Rakib2018, although performance in practical
use cases can vary widely @Uddin2016.

Another well-studied application of large-scale pattern matching is in the
context of stochastic biomolecular simulations @Sneddon2010 @Bachman2011,
particularly the Kappa project @Danos2004. Stochastic simulations depend on
performing many rounds of fast pattern-matching for continuous Monte Carlo
simulations @Yang2008. However, unlike our use case, the procedure typically
does not need to scale well to a large number of patterns. In @Danos2007, Danos
et al. introduced a pre-computation step to accelerate matching by establishing
relations between patterns that activate or inhibit further patterns. This idea
was later expanded upon and formalised in categorical language in
@Boutillier2017. The ideas presented in @Boutillier2017 in particular are
similar to ours; their formalism has the advantage of being more general but
does not present any asymptotic complexity bounds and suffers from the same
worst-case complexities as RETE.

A similar problem has also been studied in the context of multiple-query
optimisation for database queries @Sellis1988 @Ren2016, but it has limited
itself to developing caching strategies and search heuristics for specific use
cases. Finally, using a pre-compiled data structure for pattern matching was
already proposed in @Messmer1999. However, with a $n^{\Theta(m)}$ space
complexity---$n$ is the input size and $m$ the pattern size---it is a poor
candidate for pattern matching on large graphs, even for small patterns.
