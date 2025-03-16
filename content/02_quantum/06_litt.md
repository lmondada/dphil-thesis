+++
title = "Summary and further reading"
weight = 6
layout = "section"
slug = "sec:litt"
+++

This introductory chapter covered some of the basic principles of
quantum computation,
and in doing so has hopefully made a convincing argument why we should expect
the programs running on quantum hardware to become more complex in the future,
with the intertwining of classical and quantum computations---processes we
refer to as hybrid quantum-classical programs.
Prior to that, we also presented quantum compilation, an emerging discipline
that is introducing many new problems and ideas to the established
corpus of work on compilers research.

If this quantum taster has intreagued you or you would like to learn the
basics from people that *actually* know what they are talking about,
nothing beats the reference book for quantum
information and quantum computing by Nielsen and Chuang @Nielsen2016.
A fascinating alternative perspective on quantum theory has also been developed
within the programme of categorical quantum mechanics, for which the
illustrious "Dodo book" @Coecke2017 would be the go-to introductory
material[^dodo].
[^dodo]: And while we're on the topic of my supervisor's brilliant work: there is also
a very recent textbook, a sort of spiritual successor to @Coecke2017, particularly
focused on quantum compilation @Kissinger2024.
It is just as worth a read and might appeal more to the computer science-y
compiler-y reader.

At the risk of turning this thesis into absolutely shameless
Oxford self-promotion:
guess what else was a product of the _world-class_ research of this university?
The quantum circuit itself!
These diagrams came from theoretical physicists (no surprise here), interested
in capturing thought experiments in quantum information
theory @Deutsch1989.

The idea caught on, and soon software tools were created to facilitate
building such diagrams. The Quantum Computation Language (QCL) was
one of the first @Oemer2000.
Quantum software[^actuallyclassical] has since proliferated,
especially as the possibility of actually *performing* these
thought experiments on quantum hardware became more tangible.
The result were software packages for quantum computing,
designed for the automatic transformation and *optimisation*
of quantum computations for execution
on real hardware @JavadiAbhari2024 @CirqDevelopers2024 @Steiger_2018 @Sivarajah2020---we
called them quantum compilers.
[^actuallyclassical]: That is, _classical_ software written to control
and optimise quantum computations.

A more recent development for quantum compilers is the focus on scalability
and first class support for hybrid quantum-classical computations.
Quantum circuits that include some form of classical control have been variously
called "dynamic circuits" (e.g. @Corcoles2021),
"adaptive circuits" (e.g. @Smith2024), "circuits with measurements
and feedforward" (e.g. @Graham2023), and "circuits assisted by
local operations and classical communication" (e.g. @Piroli2021).


Besides supporting advances in quantum hardware @Corcoles2021 @Graham2023 @Pino2021,
hybrid classical-quantum computations are central to many applications of quantum computing.
As put recently by Alam and Clark @Alam2024:
> "[...] dynamic quantum circuits
> are a crucial milestone on the roadmap to fault-tolerant
> quantum computers."

We have covered a small subset of applications of hybrid quantum classical
computations.
Quantum teleportation is certainly one of the oldest @Bennett1993.
The block-encoding technique that we discussed in {{}}
is the foundation of several algorithms include
the Quantum Singular Value Decomposition (QSVT) @Gilyen2019 and the
Linear Combination of Unitaries (LCU) @Chakraborty2024 @Sze2025.
Measurement-based quantum computing (MBQC) was introduced in @Raussendorf_2001
and is forming the base for some photonic quantum computing @Bartolucci_2023 @Bourassa2021.
Hybrid programs have also been shown to be useful for implementing
the Quantum Fourier Transform (QFT) @Baeumer2024 and the Quantum Phase Estimation (QPE)
algorithms @Corcoles2021, two of the most fundamental computation primitives
for quantum algorithms.
The block-encoding technique that we discussed is


Repeat until success schemes @Paetznick2014 on the other hand
are very common in state preparation routines and will play a key role in fault
tolerant (FT) quantum computing.
Arguably the most well-known such scheme for FT is magic state
distillation @Bravyi2005,
a procedure expected to be a core building block of many FT architectures.
State preparation is in general an ubiquitous problem for FT, as the error
correcting codes that are employed initiate computations starting from a
"logical" zero state, which may be expensive to prepare on the qubits of the
hardware @Fowler2012.

Finally, quantum error correcting (QEC) codes themselves must be implemented
using hybrid programs.
The quantum error correction (QEC) literature is vast and can get very technical very quickly, but
diving into it promises bountiful rewards.
The field is one of the most fast evolving areas of research in the field.
These work-in-progress lecture notes @Gottesman2024 by a coryphaeus
of the field make for excellent introductory material.
