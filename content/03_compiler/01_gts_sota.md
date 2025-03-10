+++
title = "Related work"
weight = 1
layout = "section"
slug = "sec:gts-sota"
+++

**Graph rewriting on computation graphs.**&emsp;
Optimisation of computation graphs is a long-standing problem in computer science
that is seeing renewed interest in the compiler @Lattner_2021,
machine learning (ML) @Jia2019 @Fang2020
and quantum computing communities @Xu2022 @Xu2023.
In all of these domains, graphs encode computations that are either expensive to execute or that are
evaluated repeatedly over many iterations,
making optimisation of cost functions over graphs a primary concern.

Domain-specific heuristics are the most common approach in compiler
optimisations @pytorch @Sivarajah2020&#x200B;---a more
flexible alternative are optimisation engines based on declarative sets of
graph transformations @Bonchi2022 @Bonchi2022a.
In such systems,
a graph transformation system (GTS) is used to find a sequence of allowed transformations that rewrite
a computation graph given as input
into a computation graph with minimal cost.

GTSs are a special case of rewriting systems, first studied on
strings @Dershowitz1990, then
generalised to trees and terms @Bezem2003, before being applied
in the context of graph transformations @Ehrig1973 @Rozenberg1997 @Koenig2018.
Their use in quantum computing is part of a long tradition of diagrammatic
reasoning in physics @Penrose1964 @Feynman1949, and particularly in
quantum mechanics and computing with the advent of categorical quantum
mechanics @Abramsky2008 @Coecke2012 @Coecke2017.

**GTS in quantum computing.**&emsp;
In the context of quantum computing, the ZX calculus @Coecke2008 and its
derivatives are of particular importance.
Properties of GTSs such as completeness, confluence and termination @Verma1995
are well-studied within this field @Backens2014 @Backens2019 @Biamonte2023.
These results have in turn formed the basis for software implementations of
circuit optimisations with soundness and performance
guarantees @Duncan2020 @Kissinger2020 @Sivarajah2020 @Borgna2023.

Great strides are also being made on rewriting theories for quantum circuits.
Recently, Clément et al established for the first time completeness of a GTS
for quantum circuits @Clement2023 @Clement2024,
i.e. a set of circuit transformation rules such that for any two
equivalent quantum circuits
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

**Peephole optimisations.**&emsp;
As an alternative to the very principled approach of elegant calculi, graph transformations
can also be used in the absence of theoretical guarantees, in a more ad hoc fashion.
Indeed, it could be argued that many existing (classical and quantum) compiler
optimisations admit a formalisation as graph transformations.
Specifically, for as long as compilation has existed, compilers
have relied on local transformations of the IR, typically referred to
as peephole optimisations @McKeeman1965 @Tanenbaum1982.
Such optimisation strategies are based on the heuristic that local
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
A quantum-specific flavour of peephole optimisation with close links to GTSs,
template matching @Maslov2008 @Iten2022, achieved
state of the art results for Clifford circuit optimisation @Bravyi2021a.
Recently, quantum peephole optimisations were also proposed that leverage
provable state information to perform contextual optimisations @Liu2021,
similar to strength reduction and optimisation with preconditions in classical
compilation @Lopes2015.


**Internal representations.**&emsp;
The graph formalisation of quantum computations we will define
in this chapter also draws a lot from the
internal representations (IRs) of programs in classical compilers.
The classical compilation community has found great advantages in
sharing a common standardised IR format. Indeed, while the exact
syntax constructs and abstractions vary across programming languages,
and, at the other end of the compiler stack, the specific assembly
instructions emitted differ between hardware targets, much of the
compiler middleware can be broadly shared across use cases.
This gave rise to the LLVM @Lattner2004, and more recently,
the MLIR @Lattner_2021 projects, which provide common compiler IRs,
along with all the infrastructure compilers typically require:
IR transformation tooling, translation into hardware-specific
assembly, efficient serialisations, in-memory formats etc.

The idea of adopting LLVM for quantum was championed by QIR @qir, a standard
introducing quantum primitives into the LLVM IR.
This was subsequently adopted by many quantum hardware providers for its
superior expressive power compared to circuit-based formats @qirall.
Building on top of QIR, an IR specifically for quantum-classical programs was
proposed in @Hugr, with additional soundness guarantees based among others
on the no-cloning principle of quantum information.
In parallel, projects with similar aims have also emerged @McCaskey2021 @Ittah_2022
that make use of the full MLIR and LLVM toolchain.

**Challenges of GTS for compilation.**&emsp;
Peephole optimisations of compiler IRs have proven to be a fast, general and scalable
approach to compilation and code optimisation in practice.
However, the optimisation results
are heavily dependent on well-designed transformation orderings and may vary
widely across input programs.
This is commonly known in compiler research as the phase ordering
problem @Click1995&#x200B;:
when a compiler can modify code in multiple ways, it must determine
which transformations to apply and in what sequence to achieve
optimal results @Whitfield1997 @Liang2023.
This is a common design challenge in GTSs, often addressed through
mechanisms such as rule controls @Heckel2020.
This issue is also a key challenge within quantum compilation:
unitary sythesis tools can sometimes outperform current, mostly peephole-based
compilers @Sivarajah2020
by up to 50%[^cost] @Wu2020.
[^cost]: at the cost of many hours of compute, of course.
