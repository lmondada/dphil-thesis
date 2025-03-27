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
operations of an input program, its equivalence class can be determined. Any
replacement of that set of operations with another program in the same
equivalence class is a valid transformation and, thus, a potential peephole
optimisation. Transformation systems on minIR graphs based on equivalence
classes were formalised in {{% reflink "sec-gts-def" %}}.

First results of this approach are promising. @Xu2022 demonstrated that
optimisation performance improves markedly with larger sets of transformation
rules. Such workloads however rely heavily on _pattern matching_, the
computational task that identifies subgraphs on which transformation rules
apply. In @Xu2022 and @Xu2023, pattern matching is carried out separately for
each pattern. This becomes a significant bottleneck for large rule sets. In
@Xu2022, performance peaks at around 50,000 transformation rules, after which
the additional overhead from pattern matching becomes dominant, deteriorating
the compilation results.

In this chapter, we solve these scaling difficulties by presenting an algorithm
for pattern matching on minIR graphs that uses a pre-computed data structure to
return all pattern matches in a single query. The set of transformation rules is
directly encoded in this data structure. After a one-time cost for construction,
pattern-matching queries can be answered in running time independent of the
number of rules in the transformation system.

The asymptotic complexity results presented in this chapter depend on some
simplifying assumptions on pattern graphs and embedding. This represents a
restriction on the generality of minIR graphs, but we do not find that they
restrict the usefulness of the result in practice. As discussed in
{{< reflink "sec:benchmarks" >}}, none of these assumptions are required in
practice for the implementation. We have not observed any impact on performance
when the imposed constraints are lifted, so we conjecture that these assumptions
can be relaxed and our results generalised.

After a discussion of related work in
{{% reflink "sec:sota-pattern-matching" %}},
{{< reflink "upper" "sec:simplifying-assumptions" >}} presents the assumptions
that we are making in detail, along with some relevant definitions for the rest
of the chapter.
{{< reflink "upper" "sec:treereduc" "sec:canonical" "sec:anchors" >}} present
the core ideas of our approach, respectively introducing: a reduction of minIR
graphs to equivalent trees, a canonical construction for the tree reduction and
an efficient way to enumerate all possible subtrees of a graph. We also prove
bounds on the size and number of the resulting trees.

In {{< reflink "sec:automaton" >}}, we introduce a pre-computation step and show
that the pattern-matching problem reduced to tree structures can be solved using
a prefix tree-like automaton that is fixed and pre-computed for a given set of
patterns. Combining the automaton construction with bounds from
{{< reflink "sec:anchors" >}} leads to the final result.
We conclude in {{< reflink "sec:benchmarks" >}} with benchmarks on a real-world
dataset of 10000 quantum circuits, obtaining a 20x speedup over a leading
C++ implementation of pattern matching for quantum circuits.
