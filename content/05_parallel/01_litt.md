+++
title = "Related work"
layout = "section"
weight = 1
slug = "sec:sota_parallel"
+++

First proposed and studied in 1986 by Driscoll et al @Driscoll1989, persistent
data structures have a rich history in computer science @Lagogiannis2005, and
particularly within functional programming @Okasaki1996 @Okasaki1998 @Hinze2005.
Confluently persistent data structures were first explored in @Driscoll1994. A
general treatment of the approach was subsequently presented in @Fiat2003 and
improved in @Collette2012. @Chalermsook2018 proposed a data structure for
confluently persistent tries.

Within the field of graph transformations, there is a well-developed theory for
persistent (and confluently persistent) transformations in the form of the
concurrent graph transformation formalism of Corradini et al. @Corradini1996 and
Baldan et al. @Baldan1999. This categorical formalism has also been extended to
include support for overlapping transformations in @Echahed2017.

The first practical application of persistent graph rewriting was developed by
the graph rewriting engine GRAPE @Weber2017 and was originally based on
ephemeral data structures with transactional ACID semantics. This was later
enhanced by its successor GrapeVine @Weber2022, with the first fully persistent
data structure for graph rewriting. In this work, the vertices and edges that
result from graph rewrites are stored individually in a specialised database.
Depending on the version of the data that is requested, the graph can be
retrieved from the individual vertex and edge entities in the database using the
database's graph query language. To our knowledge, no confluently persistent
data structure has been proposed for graph rewriting.

As we will see in {{< reflink "sec:factor-gts" >}}, confluent persistence is a
particularly valuable property in the absence of a rewriting strategy, i.e. a
procedure to select and prioritise among possible graph transformations
@Echahed2008. This distinguishes the approach presented in this thesis from most
previous work. Rewriting strategies feature prominently in PORGY, a tool for
port graph rewriting @Andrei2011 @Fernandez2010; the graph rewriting software
GROOVE provides the notion of _control program_ to govern the transformation
order @Rensink2004; and finally, tools such as GrGen provide advanced control
flow primitives to specify rewrite rule execution @Geiss2006.

Specifying rewriting strategies yields efficient graph transformation procedures
and is particularly effective for systems with provable properties such as
confluence and termination @Verma1995. As a result, rewriting strategies have
also been used successfully within classical compiler optimisations @Assmann2000
and quantum circuit optimisation @Fagan2018 @Duncan2020.

However, such properties of the transition system---or successful heuristic
approximations for it---cannot always be derived. In these cases, the space of
graphs reachable from an input graph within the GTS must be explored
non-deterministically. In the absence of control program, GROOVE will for
instance fall back to an exhaustive exploration of the search space---for an
exploration up to depth $\Delta$, the result is a search tree of size
$\mathcal O(\gamma^\Delta)$, where $\gamma$ is the number of possible rewrites
at every graph in the search space (assuming $\gamma$ is constant for every
reachable graph).

Exhaustive exploration is used extensively in model checking, typically to
verify properties that must hold for all reachable graphs @Rensink2004a. It has
also proven to be very useful for compiler optimisation, where the constantly
evolving rewrite rules, instruction sets and complex, architecture dependent,
cost functions render it challenging to fix a deterministic program
transformation schedule.

That optimisation using graph transformations were achievable without predefined
rewriting strategies was shown by Jia et al. in @Jia2019, discovering new state
of the art implementations for computation graphs of interest to the deep
learning community, using a simple exhaustive search of the GTS space with
backtracking. This approach was then adapted to quantum circuit optimisation in
@Xu2022 and @Xu2023.

These recent results fit within a long line of compiler research called
_superoptimisation_ @Fraser1979 @Massalin1987 @Sands2011 @Bansal2006
@Sasnauskas2017. On top of excellent optimisation performance, this GTS approach
to compiler optimisation is extremely flexible, as rewrite rules can be
generated and tailored on demand to the constraints and instruction set of the
target hardware. For any supplied cost function, the compiler can then explore
all valid program transformations to find the sequence of rewrites that minimise
cost. This keeps the cost function-specific logic separate from the
transformation semantics of the program, making it straightforward to replace or
update the optimisation objective.

The adaptation of superoptimisation to quantum optimisation of @Xu2022 and
@Xu2023 is however showing scaling difficulties: unlike classical
superoptimisation which is usually designed to optimise small subroutines within
programs, e.g. focusing on arithmetic instructions, single instruction multiple
data (SIMD) etc., the technique should in principle be able to optimise quantum
programs in their entirety and requires tens of thousands of rewrite rules. This
leads to immense search spaces that superoptimisation does not scale well to.

For the special case of _term rewriting_, i.e. rewriting of tree expressions, a
technique known as _equality saturation_ was introduced in @Tate2009 to
significantly compress and reduce the size of the search space. Equality
saturation can be viewed as a twist on persistent data structures, specifically
designed for optimizing terms through term rewriting. It is persistent insofar
as it preserves all data that was inserted into it, though unlike persistent
data structures, it does not retain the history of transformations. This
introduces a new step in the optimisation process known as the _extraction
phase_, where the best term stored within the data structure must be identified
and recovered.

An efficient implementation of it was presented in @Willsey2021 and has recently
seen adoption in modern compiler optimisation pipelines @Fallin2022. Though the
approach was extended to optimise computation graphs for deep learning in
@Yang2021, equality saturation unfortunately does not generalise to graph
rewriting. Equality saturation and the difficulties of adapting it to graph
rewriting are interesting (and subtle!) enough to warrant its own section.
