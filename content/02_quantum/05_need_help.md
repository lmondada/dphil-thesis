+++
title = "Quantum compilers cannot do it alone"
weight = 5
layout = "section"
slug = "sec:need-help"
+++

We have (hopefully!) by now convinced our readership that quantum programs must
interface with our established classical infrastructure and should rather be
understood as an interleaved execution of both classical and quantum operations.
The obvious question that thus poses itself is

<!-- prettier-ignore -->
{{% hint info %}}
How do we equip quantum compilers to deal with classical operations?

<!-- prettier-ignore -->
{{% /hint %}}

The simplest solution is to adopt the extended quantum circuit formalism with
support for classically controlled operations, as we have introduced in the
previous section. Using this representation, the basic types available for
computation are the qubit and the classical bit. We can also, at that point,
introduce purely classical operations on bits, for instance, to compute boolean
logic on measurement outcomes, such as "if both the first AND the second
measurement outcomes are `1`, then ...".

However, the circuit model is inherently designed with the no-cloning principle
in mind: specifically, with the assumption that at any one time, there are
exactly $n$ (for some fixed value of $n$) resources available for computation.
This for example means that in the following program

{{% figure src="svg/overwrite-bit.svg" width="40%" nobg="true" %}}

in which two measurements write to the same classical bit, it would be
impossible to append a gate controlled on the first measurement outcome after
the $Z$ gate, as that value was overwritten on the classical wire by the second
measurement. The solution could be to introduce[^alloc] a new, fresh classical
wire for each measurement and avoid overwriting outcomes. However, there are
also many other ways to break this wires-based representation: suppose you have
an operation with one input and two outputs, such as a copy operation
$x \mapsto (x,x)$. We would need two wires for the output, but the input would
only provide us with one... We now have to start creating additional wires ahead
of time for this purpose and solve memory allocation problems to decide which
wire should be given to which operation.

[^alloc]: Or, as we would say in programming parlance, to _allocate_.

These are run-of-the-mill classical compiler problems! One might at first hope
that the set of overlapping problems between classical and quantum compilers is
manageably small. After all, in all the use cases we have covered so far, the
amount of classical computation was very minimal, limiting itself to
conditionals and loops based on simple boolean expressions. Surely the
full-blown powers of a classical compiler are not required!

You bet.

Scientists have shown no lack of imagination in this field---and so have found
very compelling use cases for complex classical computations within quantum
programs. To drive this point home, let us consider the concrete example of
quantum error correction.

### The quantum error correction use case

Error-correcting protocols do as their name suggests: they detect whenever data
is subjected to errors and thus modified in an unexpected way. They then attempt
to recover the intended valid state. In the classical world, such schemes are
employed whenever the hardware is not reliable enough: this is hardly the case
for computations themselves but is widespread in communications (e.g. within the
TCP/IP protocol for the internet @rfc9293) or for memory and storage in critical
applications.

For quantum hardware, no one expects to be able to manipulate qubits without
introducing errors for a very long time[^majorana], and so error correction will
be absolutely everywhere as soon as our quantum computers have managed to
implement such protocols.

[^majorana]:
    We should at this point---at the risk of stoking controversy--- acknowledge
    the commendable efforts of scientists chasing the Majorana particle
    @Sau_2010 @Haaf2024 @Mourik_2012. The topological quantum computers these
    would enable are, to our knowledge, the only quantum architecture proposed
    that could do away with error correction.

A sketch of quantum error correction goes roughly as follows: the data that
would be stored on $k$ qubits is instead encoded in a redundant way on a larger
number $n > k$ of qubits. Thus, when errors occur on a subset of the $n$ qubits,
the data can be restored using the qubits that have not been corrupted. Before
errors can be corrected, they must be detected. To this end, we first add fresh
ancilla qubits to the program. Through smartly designed interactions with the
data qubits, the ancilla qubits pick up the errors from the data. When we
subsequently perform measurements on the ancilla qubits, these errors result in
modified outcomes, called the error _syndrome_.

The challenging bit comes next: from a run of syndrome measurements, one must
infer the most likely errors---a step known as _syndrome decoding_. This is a
purely classical maximum likelihood problem that requires a non-trivial amount
of compute to resolve. For small problem instances, all possible input syndromes
can be tabled, and the outputs precomputed---in which case the problem at
runtime is reduced to fast table lookups. However, the higher the fault
tolerance we require, the more qubits must be used in the encodings, and so
invariably, the problem quickly becomes very demanding computationally.

Meanwhile, these "cycles" of error detection and correction are under strict
latency constraints: idling qubits waiting for corrections to be applied will
accumulate new errors that must themselves be corrected---for error correction
to be workable, we must be capable of detecting and correcting for errors faster
than they are being introduced. The entire error correction cycle just described
can be summarised by the following diagram:

<!-- prettier-ignore-start -->
```goat
           .---------.   .-------------.                        .------------.
        ---+         +---+             +------------------------+            +---
qubits  ---+ circuit +---+             +------------------------+ correction +---
        ---+         +---+    error    +------------------------+            +---
           '---------'   | propagation |   .-------------.      '------+-----'
ancilla -----------------+             +---+  syndrome   |             ^
        -----------------+             +---+ measurement |             |
                         '-------------'   '------+------'             |
                                                  |     .-----------.  |
                                                   '--> | syndrome  +-'
                                                        | detection |
                                                        '-----------'
```
<!-- prettier-ignore-end -->

The decoding time is a crucial factor in determining the overall cycle time and,
thus, the clock rate of fault-tolerant quantum hardware. Consider, for example,
a 32-qubit Toric code @Kitaev_2003, one of the most well-studied quantum
error-correcting codes. Without going into the details of the code itself, we
can use the C++ implementation made available by the MQT toolkit
@Burgholzer_2021 to study the decoder performance for this code.

Consider first a "naive" compilation of the decoder---the kind of program that
we could hope to get from a quantum compiler that "understands" classical
operations but only implements optimisations directly relevant to quantum
computations. Such a compiler does not currently exist, but the decoder being a
C++ program, we can approximate what the compiled binary would look like by
turning off all optimisations from an established classical compiler[^clang].
[^clang]: Here we are using `Apple clang v15.0.0`, running macOS 14.7 on an
Apple M3 Max chip.

The runtime averaged over 1000 runs of the decoder is $0.73\pm0.06\,ms$. This is
within the latency requirements of certain trapped ion architectures
@RyanAnderson2021, but far beyond the sub-microsecond regime that will be
required to make error correction a reality on superconduction-based quantum
computers @Vazquez2024. this can be contrasted with the program output by the
same compiler, but with all compiler optimisations enabled: the average runtime
is reduced by a factor close to 10x to $0.078\pm0.004\,ms$---still a factor 100x
away from the required performance on superconductors, but huge gains
nonetheless! The details of the experiment with all build flags, the hardware
used and how to reproduce the results are available
[here](https://github.com/lmondada/dphil-thesis/tree/main/scripts-datagen).

There is no hope of obtaining these types of speedups without an in-depth
understanding of classical hardware and battle-tested implementations for every
optimisation pass under the sun---in short, the full thrust of a modern
state-of-the-art compiler such as `clang` or `gcc`.

These observations will hopefully leave the reader convinced that in order to
compile and realise the kind of hybrid quantum-classical programs that we expect
will become the norm in the field, quantum compilers will need to embrace and
encompass the full breadth and depth of classical compilers. This leaves us with
no choice but to fully transform and integrate the existing quantum tooling and
quantum optimisation research into the established compiler ecosystem. What this
means exactly is the subject of the rest of this chapter.

### A new quantum programming paradigm?

We have seen it---quantum circuits are very limited in their expressiveness.
They are well suited to presenting sequences of purely quantum operations and
how the computation is parallelised across qubits, but they quickly become
limiting once both quantum and classical data types are mixed and any type of
control flow (conditionals, loops, function calls, etc.) is introduced.

How users express programs in the front end has deep implications for the kind
of computations that the compiler must be capable of reasoning about and, hence,
for the compiler's architecture. The great merging of classical and quantum
compilers is the perfect opportunity to reconcile program representations and
integrate the learnings from decades of classical programming language research
into quantum computing.

There have been several trailblazing initiatives to create quantum programming
languages, such as QCL @Oemer2000, Q# @Qsharp and Silq @Bichsel2020. Admittedly,
their impact and adoption in the quantum ecosystem have so far remained limited,
overshadowed by the popularity of python-based APIs for quantum circuit-based
representations, as offered by Qiskit @JavadiAbhari2024, Pennylane @Bergholm2022
and Cirq @CirqDevelopers2024. There is, as a result, a justified dose of
scepticism in the quantum community on how well the ideas from classical
programming really translate to quantum.

It is thus all the more notable that we are seeing a new generation of quantum
programming tooling being developed @Koch2024 @Ittah_2024 @Cudaq, driven by the
need to write more expressive programs for the improving hardware (as we have
been discussing), as well as for performance reasons, to scale quantum
compilation to large scale @Ittah_2022, accelerate quantum simulations
@Ittah_2024 and integrate with classical high-performance computing (HPC)
@CudaqHpc.

The history of programming is, first and foremost, a masterclass in constructing
abstractions. Many of the higher-level primitives, that have proven invaluable
classically, solve problems that we expect to encounter very soon in our hybrid
programs---when we have not already. Examples include

- **structured control flow** to simplify reasoning about branching in
  quantum-classical hybrid programs,
- **type systems** to encode program logic and catch errors at compile
  time---this is particularly important for quantum programs as there is no
  graceful way of handling runtime errors on quantum hardware: by the time the
  error has been propagated to the caller, all quantum data stored on qubits is
  probably corrupted and lost,
- **memory management** such as reference counting and data ownership models.
  Current hardware follows a static memory model, in which the number of
  available qubits is fixed, and every operation acts on a set of qubits
  assigned at compile time. This becomes impossible to keep track of in
  instances such as qubit allocations within loops with an unknown number of
  iterations at compile time. It thus becomes necessary to manage qubits
  dynamically, just like classical memory.

To facilitate such a large swath of abstractions, the first step quantum
compilers must take is to make a distinction between the language frontend and
the _internal representation_ (IR) that the compiler uses to reason about the
program and perform optimisations. This will be the topic of
{{% reflink "chap:compiler" %}}. The graph-based IR that we introduce in that
chapter will then form the foundation for the new quantum compilation techniques
that will be developed throughout the remainder of the thesis.
