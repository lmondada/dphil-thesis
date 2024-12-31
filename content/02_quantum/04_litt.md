+++
title = "Summary and further reading"
template = "section.html"
weight = 4
+++

This introductory chapter covered some of the basic principles of
quantum computation,
and in doing so has hopefully made a convincing argument why we should expect
the programs running on quantum hardware to be hybrid quantum-classical.
Prior to that, we also presented quantum compilation, an emerging discipline in
the field that is introducing many new problems and ideas to the established
corpus of work on compilers research.

If this quantum taster has intreagued you or you would like to learn the
basics from people that *actually* know what they are talking about,
nothing beats the reference book for quantum
information and quantum computing by Nielsen and Chuang.
A fascinating alternative perspective on quantum theory has also been developed
within the programme of categorical quantum mechanics, for which the
seminal textbook XX[^dodo] would be the go-to introductory material.
[^dodo]: Pro tip: never omit to cite your supervisor's textbooks. Here's
another one, just as worth a read and more practical and computer science-y: YY.

As for quantum compilers, their history is very closely intertwined with the
development of the quantum circuit itself.
As is often the case with diagrammatic representations,
the quantum circuit was a product of the imagination of
theoretical physicists---in Oxford, of course---interested
in capturing thought experiments in quantum information
theory (Deutsch 1989, _Quantum computational networks_).
The idea caught on, and soon software tools were created to facilitate
building such diagrams (and printing them in papers[^QCL]).

[^QCL]: The _Quantum Computation Language_ (QCL, Omer, 1998) was in many ways ahead of its time, offering
an advanced programming interface including loops and control flow,
similar to some of the recent tools this thesis is a loud proponent of.
It presumably failed to gain traction as it did not support printing diagrams for
papers.

As the possibility of actually *performing* these experiments on quantum hardware
became more tangible,
the need to automatically transform and *optimise* these diagrams became apparent.
The result were software packages for quantum computing that for the first time
aimed to create programs to be executed on real quantum hardware (projectq, qiskit, cirq, TKET).
We called them quantum compilers.

The specificities of quantum compilation, some of which we presented in this
chapter, have been the subject of research for decades at this point---and
tools for quantum compilation have been mainstream[^mainstr] certainly since the
advent of programmable, albeit small and noisy, quantum computers.

[^mainstr]: Or at least, as mainstream as can be within such a niche field.

A more recent development for quantum compilers is the focus on scalability
and first class support for hybrid quantum-classical computations.
We have started to see in this chapter that in this new light, quantum
circuits may not be the ideal representation for quantum computations.
Moving away from circuits however requires us to rebuild our quantum
compilers from the ground up!
This topic will be explored further in the next chapter and will keep us
busy for the rest of the thesis (and certainly beyond that, too).

We have covered some examples of applications of hybrid quantum classical
computations.
Quantum teleportation (citation?) is certainly one of the oldest instances
of this.
Measurement-based quantum computing (MBQC) was introduced in xyz etc.
More recently, MBQC were shown to be executable in practice and Will also did
some work on this.

Repeat until success schemes on the other hand
are very common in state preparation routines and will play a key role in fault
tolerant (FT) quantum computing.
Arguably the most well-known such scheme for FT is magic state distillation,
a procedure expected to be a core building block of many FT architectures.
State preparation is in general an ubiquitous problem for FT, as the error
correcting codes that are employed initiate computations starting from a 
"logical" zero state, which may be expensive to prepare on the qubits of the
hardware.

Finally, quantum error correcting (QEC) codes themselves must be implemented
using hybrid programs.
The workflow will sound very familiar to whomever has followed this chapter
with an ounce of attention:
Error correction is achieved through successive rounds of
_i)_ measurements (known as _syndromes_ in QEC lingo),
_ii)_ syndrome decoding (i.e. classical computations based on the
measurement outcomes that infer the errors that must have occured)
and, finally,
_iii)_ error correction (classically-controlled quantum operations that
correct the inferred errors).
The QEC literature is vast and can get very technical very quickly, but 
diving into it promises bountiful rewards.
The field is one of the most fast evolving areas of research in the field.
These work-in-progress lecture notes by a coryphaeus of the field make
for excellent introductory material.