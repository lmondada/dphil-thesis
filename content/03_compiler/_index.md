+++
title = "Quantum Compilation as a Graph Transformation System"
sort_by = "weight"
weight = 3
layout = "chapter"
slug = "chap:compiler"
+++

BITS AND BOBS TO COMBiNE:

Using all the assumptions and theory of quantum physics to design smart
optimisations is the strength of these techniques, but also their weakness:
in the face of rising hybrid classical-quantum computations, it is a priority
that the performant algorithms that have been developed for this purpose be
adapted to handle intermingled classical computations.

---

Closer to the concerns of this thesis, the unitary representation is also
a poor candidate to express hybrid computations.
However, the expressiveness of the programs considered in these recent advances
remains limited to circuit-based representations.
It is unclear if and how these techniques could be extended to synthesise
more complex hybrid programs, such as repeat-until-success schemes, let alone
the kind of arbitrary hybrid programs expressible in `minIR`.

---

Rewriting systems were first introduced on strings @Dershowitz1990, then
generalised to trees and terms @Bezem2003.
From a formal point of view, GTS endow quantum compilation with
well-defined semantics and strong theoretical foundations @Lack2005.
Just as importantly (or more so), they establish a practical, purely
declarative framework in which compiler transformations can be defined, debugged
and analysed.
System properties such as completeness, confluence and termination
of rewriting systems @Verma1995 @Backens2014 @Biamonte2023
can be analytically studied, proven and then be relied on by compilers
for soundness and performance guarantees @Duncan2020 @Kissinger2020 @Sivarajah2020 @Borgna2023.

However, there is an apparent tension in the integration of
diagrammatic calculi into compilers
between the search for abstract primitives admitting a simple rewriting
logic  @Heurtel2024 @Booth2024 @Felice2023a @Carette2023
and the requirement to capture all the expressivity and constraints of
hardware targets.

An example of this is the ZX circuit extraction problem @Quanz2024 @Backens2021&#x200B;:
it is in general hard to recover an executable quantum circuit from a ZX
diagram as the latter is strictly more general and primitives cannot be mapped
one-to-one.
Similarly, while simple quantum-classical hybrid computations can be expressed
using extensions of ZX @Borgna2021 @Carette2021 @KoziellPipe2024, it will
never be possible to capture the full breadth and generality of classical CPU
instruction sets in a practical and extensible (and algebraically satisfying) way.

---


However, this specialisation comes with trade-offs. These representations and
techniques target purely unitary computations and rely on strict assumptions
about the primitives they support. While efficient for the scenarios they
were designed for, these methods can struggle to incorporate new primitives and
are hard to adapt to hybrid programs. 
In order to develop more versatile and adaptable compilation platforms,
a foundation built on more general purpose tooling is required.


### Resorting to peephole optimisations

We have so far considered quantum-specific compiler optimisations, which can
attain near-optimal results (unitary synthesis) as well as perform scalable
non-local program resynthesis and optimisation (phase polynomials,
Clifford tableaus etc.).
We have however seen that these techniques struggle to generalise to hybrid
programs and require custom program representations, which carry with them
a high implementation burden for compilers.
In contrast, peephole optimisations @McKeeman1965 @Tanenbaum1982 are a
general purpose optimisation technique
as old as compilation itself that act directly on the program IR
and come with wide support within classical compiler
ecosystems @Menendez2017 @Lopes2015 @Riddle2021.

Peephole optimisations are local transformations of the IR, based on the
heuristic that local optimisations to the program will produce a well-optimised
result overall.
The principle is very simple:
a sliding window traverses the IR and considers a few operations at a time.
Once established which peeophole optimisations would apply on the current
window, one optimisation is selected and applied.
Finally, the result obtained is used to replace
the operations within the window.
We refer to classical compiler literature, e.g. @Muchnick2007, for more details.

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

There have further been advances in the theoretical underpinnings of peephole optimisations
for quantum optimisation: Clement et al recently presented the first
complete equational theories for quantum circuit @Clement2023 @Clement2024,
proving that for any two equivalent quantum circuits there is a sequence
of local transformations that rewrite one into the other.
In other words, it is in principle possible to achieve optimal circuit compilation
using peephole transformations only.

Peephole optimisation is fast, general and scalable. However, its performance
is heavily dependent on well-designed heuristics and may vary widely across
input programs.
This is often refered to in compiler research as the phase ordering
problem @Click1995&#x200B;: 
whenever a compiler can rewrite code in more than one way, it must
decide which transformations should be applied and in which order, to obtain
the most optimised result @Whitfield1997 @Liang2023.
This issue is also a key challenge within quantum compilation:
unitary sythesis tools can sometimes outperform current, mostly peephole-based
compilers @Sivarajah2020
by up to 50%[^cost] @Wu2020.
[^cost]: at the cost of many hours of compute, of course.

--- 

We come away from our review having explored two competing worlds.
On the one hand, using custom quantum-specific program representations,
it is possible to capture quantum semantics precisely and enable global program
transformations.
On the other hand, one can rely on standard compiler techniques and its dedicated
mature infrastructure to drive scalable and extensible quantum optimisation
techniques.
So far, the latter has always come at the cost of some performance, making
tailored solutions the preferred approach.

We argue that going forward, however, the scaling and engineering challenges
that will come with building out custom compiler tooling will prove difficult,
given the large variations in quantum architectures and the unavoidable
integration with classical hardware such as CPUs, GPUs and FPGAs.
The remainder of this thesis presents contributions that aim to close the gap
in performance, so as to enable state of the art compilation of large scale,
hybrid quantum classical programs based on standardised IR formats.

Before proceeding with that, however, we propose one more section reviewing
past work. It focuses on two advanced classical compilation techniques that
form the foundation of the quantum compiler architecture we will propose
in {{< reflink "chap:rewriting" >}}.