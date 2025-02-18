+++
title = "Introduction"
sort_by = "weight"
weight = 1
layout = "chapter"
+++

This thesis is, first and foremost, a story about compilers.
It is interesting to note that whereas the term *quantum compilation* has been in use for the longest part
of the existence of quantum computing as a field,
it is only recently that our community has started to adopt tools, ideas and results from our classical counterparts
{% footnote(id="test") %}
We use *classical* as a derogatory term to refer to any form of computing not advanced enough to be quantum.
{% end %}.

Strengthening the bridge between classical and quantum compilation research is one of the main motivations for this thesis -- and arguably its most ambitious goal.

### Other similar text


The analogy between traditional and quantum compilers holds up to the extent that
both are concerned with abstracting away some of the low-level assembly-like details
of the underlying hardware
{% footnote(id="test3") %}
I am tempted to say these quantum compilers were more akin to assemblers of the 1960s (IBM FAP 1960),
but that might be pushing it too far.
{% end %}
 -- more on this below.
However, there are also important differences; the majority of the
quantum software stacks were developed within the Python ecosystem, with limited
concerns for performance on large-scale quantum programs (Ittah, 2021) and interoperability with other
toolchains, and in particular with the mature classical compiler ecosystem (LLVM, MLIR).

A new generation of quantum compilers is addressing these concerns (QCOR, QIRO, Catalyst, CUDAQ, Guppy, HUGR).
We will see that this is opening up new ways to program quantum computers
that enable quantum error correction and seamless integration
with heterogeneous classical computing (CPUs, GPUs, etc.) used in high-performance computing (HPC).

## At the beginning was the Quantum Circuit
s

## Qiskit & Co: Static compilation

## Dynamic compilation

This is a test of the footnote shortcode.
{% footnote(id="test2") %}
This is a test of the footnote shortcode.
{% end %}
