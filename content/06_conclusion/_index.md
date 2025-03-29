+++
title = "Future Work and Conclusions"
layout = "chapter"
sort_by = "weight"
weight = 7
slug = "chap:conclusion"
+++

The time has now come to conclude this thesis. In summary, our claim is that
given

1. the challenge of scaling up quantum programs sizes to make the most of the
   computational capabilities of upcoming hardware (c.f.
   {{< reflink "sec:compilation" "sec:quantum-sota" >}}),
2. the modularity and expressiveness that quantum compilers will require to
   simultaneoulsy express higher level abstractions, hardware primitives and
   interleaved quantum classical computation (c.f.
   {{< reflink "sec:hybrid" "sec:need-help" "sec:graph-defs">}}), and
3. the linearity restrictions that quantum data imposes on the compiler's
   internal representation (IR) of the computation (c.f.
   {{< reflink "sec:basics" "sec:graph-defs" "sec:rewrite-def" >}}),

graph transformation systems (GTS) are uniquely positioned to serve as the
backbone of a quantum compilation framework.

To this aim, {{% reflink "chap:compiler" %}} presented a graph-based compiler IR
with explicit support for linear types. To go along with it, we proposed the
first formalisation of graph transformation semantics that preserve linearity.

{{% reflink "upper" "chap:matching" "chap:parallel" %}} built on this foundation
and solved two critical scaling problems for the adoption of GTS techniques in
quantum compilers.

**Pattern matching.** Successful implementations of GTSs for quantum circuit
optimisation rely on thousands to hundreds of thousands of transformation rules
@Xu2022 @Xu2023, for which techniques matching one pattern at a time become a
significant bottleneck. {{% reflink "upper" "chap:matching" %}} presented an
approach based on state automata with an asymptotic runtime that is independent
on the number of patterns. This resulted in a 20x speedup for a real-world
pattern matching task of direct utility to quantum compilers.

**Efficient rewrite space exploration.** Applications of GTS to quantum
compilation distinguish themselves---unfortunately---by a lack of successful
rewriting strategies or other rule control mechanisms. Consequently, the
optimisation of quantum computations is framed as a search problem over the
space of all reachable graphs in the GTS.
{{% reflink "upper" "chap:parallel" %}} introduced a novel confluently
persistent data structure that uses the structure of the rewrite search space to
speedup its exploration. In typical applications, the _factorised_ search space
thus obtained is conjectured to grow linearly with the size of the input---an
exponential improvement over the naive search strategy, without which GTS-based
compiler optimisations on real-world computations with thousands of gates will
be infeasible.

Combined, these contributions lay the groundwork for a quantum compiler platform
that is **modular** in the hardware primitives, high-level programming
abstractions and transformation rules that it can model, and **scalable** in the
size of the computation and number of rules that it can match and optimise over.
Work on such a platform is well underway within the TKET2 open source compiler,
available on [GitHub](https://github.com/CQCL/tket2).

Further work could take many directions. The graph transformation semantics of
{{% reflink "chap:compiler" %}} that are presented operationally could for
example be categorified and generalised. This would open many promising bridges
and parallels to work in related domains, such as string diagrams, DPO-based
GTSs and even the family of ZX calculi.

There are also immediate opportunities in extending the work of
{{% reflink "chap:matching" "chap:parallel" %}}, in particular around weakening
the assumptions that had to be made on the structure of the graph, respectively
on the properties of the GTS and graph domain. In both cases, a more in-depth
study of how the runtime of actual implementations depend on properties of the
inputs would be very informative. We suspect from anecdotal observations that
many assumptions we have imposed can be relaxed with little impact on
peformance---conversely, there may be large variations in runtimes for different
regimes within the asymptotic guarantees of our results.

Among the myriad of options, we opt to conclude this thesis with the discussion
of two particularly promising avenues for future work. The first
({{% reflink "sec:conclusion-pm" %}}) relates to increasing the expressivity of
the pattern matching language; such an extended framework would also enable fast
pattern matching _directly_ on the persistent data structure $\mathcal{D}$ of
{{% reflink "chap:parallel" %}}, rather than having to match patterns in each
graph of $\mathcal{D}$ separately.

The second ({{% reflink "sec:conclusion-parallel" %}}) is a proposal to use the
persistent data structure of {{% reflink "chap:parallel" %}} for large scale
distributed graph rewriting. With this, the optimisation of quantum computations
could be distributed across multiple machines, potentially scaling up to
high-performance computing (HPC) clusters and opening the door to optimisation
capabilities that could significantly advance the state of the art of quantum
circuit optimisation.
