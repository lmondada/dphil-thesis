+++
title = "Evolving Quantum Programming"
template = "chapter.html"
sort_by = "weight"
weight = 2
+++

This chapter is the story of how the expression and transformation of quantum computations is changing.
As is often the case, this journey started with physicists in Oxford capturing thought experiments
in quantum information theory as diagrams (Deutsch 1989, _Quantum computational networks_).
The idea caught on, and soon software tools were created to facilitate
building such diagrams (and printing them in papers)
{% footnote(id="qcl") %}
The _Quantum Computation Language_ (QCL, Omer, 1998) was in many ways ahead of its time, offering
an advanced programming interface including loops and control flow, similar to some of
the languages developed today.
It presumably failed to gain traction as it did not support printing diagrams for
papers :D
{% end %}.

As the possibility of actually *performing* these experiments on quantum hardware
became more tangible,
the need to automatically transform and *optimize* these diagrams became apparent.
The result were software packages for quantum computing that for the first time
aimed to create programs to be executed on real quantum hardware (projectq, qiskit, cirq, TKET).
We called them quantum compilers.

The analogy between traditional and quantum compilers holds up to the extent that
both are concerned with abstracting away some of the low-level assembly-like details
of the underlying hardware
{% footnote(id="test3") %}
I am tempted to say these quantum compilers were more akin to assemblers of the 1960s (IBM FAP 1960),
but that might be pushing it too far.
{% end %}
 -- more on this below.
However, there are also important differences; the majority of the
quantum software stacks were developped within the Python ecosystem, with limited
concerns for performance on large-scale quantum programs (Ittah, 2021) and interoperability with other
toolchains, and in particular with the mature classical compiler ecosystem (LLVM, MLIR).

A new generation of quantum compilers is starting to address these concerns (QCOR, QIRO, Catalyst, CUDAQ, Guppy, HUGR).
We will see that this is opening up new ways to program quantum computers,
that enable quantum error correction as well as seamless integration
with heterogenous classical computing (CPUs, GPUs, etc) used in high-performance computing (HPC).

## At the beginning was the Quantum Circuit
s

## Qiskit & Co: Static compilation

## Dynamic compilation

This is a test of the footnote shortcode.
{% footnote(id="test2") %}
This is a test of the footnote shortcode.
{% end %}
