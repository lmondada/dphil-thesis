+++
title = "Pattern Matching Engine"
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
their rewrite rules of interest, without going into the details of the pattern
matching engine.

### Indexing schemes, constraints and branch selectors 

### An example

### Rewriting rule used in practice