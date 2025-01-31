+++
title = "Related work"
weight = 1
layout = "section"
slug = "sec:gts-sota"
+++

Rewriting systems were first introduced on strings @Dershowitz1990, then
generalised to trees and terms @Bezem2003, before being introduced 
in the context of graph transformations @Ehrig1973 @Rozenberg1997 @Koenig2018.
Their use in quantum computing is part of a long tradition of diagrammatic
reasoning in physics @Penrose1964 @Feynman1949, and particularly in
quantum mechanics and computing with the advent of categorical quantum
mechanics @Abramsky2008 @Coecke2012 @Coecke2017.

In the context of quantum computing, the ZX calculus @Coecke2008 and its
derivatives are of particular importance.
GTS properties such as completeness, confluence and termination @Verma1995
are well-studied within this field @Backens2014 @Backens2019 @Biamonte2023.
These results have in turn formed the basis for software implementations of
circuit optimisations with soundness and performance
guarantees @Duncan2020 @Kissinger2020 @Sivarajah2020 @Borgna2023.

The field has furthermore made great theoretical advances recently
on GTS for quantum circuits:
Clément et al presented the first GTS that is complete for quantum
circuits @Clement2023 @Clement2024,
i.e. a set of graph rules such that for any two equivalent quantum circuits
there is a sequence of local transformations that rewrite one into the other.

However, there is an apparent tension in the integration of
diagrammatic calculi into compilers
between the search for abstract primitives admitting a simple rewriting
logic @Heurtel2024 @Booth2024 @Felice2023a @Carette2023
and the requirement for compilers to capture all the expressivity and constraints of
hardware targets.

An example of this is the ZX circuit extraction problem @Quanz2024 @Backens2021&#x200B;:
it is in general hard to recover an executable quantum circuit from a ZX
diagram as the latter is strictly more general and primitives cannot be mapped
one-to-one.
Similarly, while simple quantum-classical hybrid computations can be expressed
using extensions of ZX @Borgna2021 @Carette2021 @KoziellPipe2024, it will
never be possible to capture the full breadth and generality of classical CPU
instruction sets in a practical and extensible (and algebraically satisfying) way.

As an alternative to the very principled approach of elegant calculi, graph transformations
can also be used in the absence of theoretical guarantees, in a more ad hoc fashion.
Indeed, it could be argued that many existing (classical and quantum) compiler
optimisations can be recast as graph transformations.
Specifically, for as long as compilation has existed, compilers
have relied on peephole optimisations @McKeeman1965 @Tanenbaum1982 as an
optimisation strategy: local
transformations of the IR that are based on the heuristic that local
optimisations to the program will produce a well-optimised result overall.
Mature compiler ecosystems have developed tools for declarative definitions,
as well as automatic generation and correctness proving of peephole
optimisations @Menendez2017 @Lopes2015 @Riddle2021.
We refer to the classical compiler literature, e.g. @Muchnick2007, for more details
on the various types of common peephole optimisations.

Quantum compilers adopted peephole-style optimisations from the
beginning @Cheung2007 @Steiger_2018 @Sivarajah2020.
In fact, they encompass some of the most common optimisations in quantum
computing, including the Euler Angle reduction @Chatzisavvas2009,
the two-qubit KAK decomposition @Tucci2005 @Cross2019
and all gate set rebases @autorebase.
A quantum-specific flavour of peephole optimisation,
template matching @Maslov2008 @Iten2022, achieved
state of the art results for Clifford circuit optimisation @Bravyi2021a.
Recently, quantum peephole optimisations were also proposed that leverage
provable state information to perform contextual optimisations @Liu2021,
similar to strength reduction and optimisation with preconditions in classical
compilation @Lopes2015.

In practice, peephole optimisations are fast, general and scalable. However,
performance
is heavily dependent on well-designed transformation orderings and may vary
widely across input programs.
This is often refered to in compiler research as the phase ordering
problem @Click1995&#x200B;---and is known in graph transformation theory
as the rule control mechanism @Heckel2020&#x200B;: 
whenever a compiler can rewrite code in more than one way, it must
decide which transformations should be applied and in which order, to obtain
the most optimised result @Whitfield1997 @Liang2023.
This issue is also a key challenge within quantum compilation:
unitary sythesis tools can sometimes outperform current, mostly peephole-based
compilers @Sivarajah2020
by up to 50%[^cost] @Wu2020.
[^cost]: at the cost of many hours of compute, of course.

