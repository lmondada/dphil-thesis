+++
title = "A new compilation regime"
weight = 1
layout = "section"
slug = "sec:compilation"
+++

We have introduced quantum compilation by drawing an analogy with the
well-developed field of classical compilers. The novel direction in which it
takes the field makes quantum compilation incredibly exciting. Let's discuss
three of the many new challenges that form the core motivation for this work.

#### Large variations in architecture

The vast differences between proposed hardware architectures are a first
distinguishing characteristic of current quantum computing developments. Unlike
classical computing, where silicon-based transistors have become the definitive
physical foundation for all electronic chips, the search for the most scalable
and reliable technology for quantum computing is ongoing---and doubtless one of
the most burning questions for the nascent industry. This introduces an
incredible variety of compilation problems.

Quantum hardware designs are dictated on the one hand by the choice of the
quantum physical system used to encode the computation data and by the
technology that controls and manipulates the system on the other. Suggestions
for the former include charged ions @Kielpinski_2002 @Pellizzari_1995, neutral
atoms @Jaksch_2000 @Deutsch_2000, photons @Knill_2001, transmons @Blais_2007 and
even Majorana @Sau_2010 particles. The control systems that drive the desired
operations on these particles are then built using some jolly mixture of lasers,
magnetic fields, microwaves, dilution fridges, etc.

Each combination results in different tradeoffs: some will render a specific
computation particularly easy; others promise to scale well to large systems but
are very error-prone and unreliable; others still achieve high fidelities at the
expense of slow operations.

From the perspective of a compiler engineer, this means we must equip quantum
compilers to handle a wide variety of hardware primitives, multiple optimisation
goals, and hardware-specific program constraints. Traditional compilation is
ill-equipped to handle this considerable challenge.

A comparison of machine code for different architectures illustrates the
difference between the quantum and classical worlds. Classical CPUs are
dominated by two architectures, _x86_, used mainly by Intel and AMD, and _ARM_,
used by a wide range of desktop and mobile chip manufacturers[^cpu].

<!-- prettier-ignore-start -->
{{% columns ratio="1:1" enlarge="full" %}}
**x86 CPU (Intel and AMD)**
```asm
mov eax, 5        ; Load 5 into EAX
add eax, 3        ; Add 3 to EAX
mov [result], eax ; Store the result in memory

```
<--->

**ARM CPU (mobile, Apple M-series)**
```asm
ldr r0, =5        ; Load 5 into R0
add r0, r0, #3    ; Add 3 to R0
ldr r1, =result   ; Load address of result
str r0, [r1]      ; Store the result in memory
```
{{% /columns %}}
<!-- prettier-ignore-end -->

There are noticeable differences between the two architectures, mostly around
variable naming conventions, as well as explicit memory loads `ldr` and stores
`str` instructions in the case of ARM, which in x86 are handled implicitly by
`mov`. This simplistic example naturally ignores some of the more fine-grained
considerations that can make translations hard in certain edge cases. A
discussion of these can be found in @Ford2021. However, overall, the
instructions and capabilities of the two platforms are broadly equivalent, as is
confirmed by the existence of translation tools such as
[Apple Rosetta](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment).

Let us contrast this with the difference between two quantum architectures.
Consider, on the one hand, an architecture that can natively perform CX and H
gates on qubits (e.g. superconducting qubits, ion traps, etc.) and, on the other
hand, a platform based on photons and optical components.

<!-- prettier-ignore-start -->
{{% columns ratio="1:1" enlarge="full" %}}
**Quantum circuit (qubits)**
```asm
h q[0];
cz q[0],q[1];
```
<--->
**Linear circuit (photons)**
```asm
bs.h(5*pi/2, pi, pi, 2*pi) m[0], m[1];
bs.h m[2], m[3];
perm([2, 1, 3, 0]) m[1], m[2], m[3], m[4];
barrier m[0], m[1], m[2], m[3], m[4], m[5];
bs.h(1.910633) m[0], m[1];
bs.h(1.910633) m[2], m[3];
bs.h(1.910633) m[4], m[5];
perm([1, 0]) m[2], m[3];
bs.h m[3], m[4];
perm([3, 0, 1, 2]) m[1], m[2], m[3], m[4];
```
{{% /columns  %}}
<!-- prettier-ignore-end -->

On the left is a quantum circuit expressed in the OpenQASM2 standard @Cross2017.
The right-hand side is the equivalent linear optics circuit computed by Perceval
@Heurtel2023, expressed in an OpenQASM2-like format. The conversion is by no
means straightforward! Some of the challenges include encoding qubits into
multiple photon modes and mapping quantum operations to an optically realisable
procedure made of optical components and measurements @Felice2023.

Other architectures, such as neutral atoms, may broadly support qubit-based
operations but might not offer control over individual qubits and, instead
require any operations to be applied in parallel to large groups of qubits
@Bluvstein2022. Finally, it is to be expected that error-correcting codes that
individual platforms will introduce to reduce error rates at the hardware level
will introduce further constraints and new instruction sets yet again.

It is worthwhile to note that current trends in the classical world are also
pushing compilers towards more heterogenous architectures that may include GPUs,
FPGAs and other accelerators. This has led to significant changes in the design
of current compilers, which we will touch upon later. Nonetheless, this shift
has, so far, mostly "limited" itself to new forms of parallelism and the
introduction of more specialised instruction sets rather than a fundamental
redesign of existing tools and computing paradigms. The breadth of technologies
and trade-offs that quantum compilers must face have no equivalent in the
classical world for the time being.

[^cpu]:
    There are other architectures, such as Risc-V @Waterman2016 and MIPS
    @Hennessy1982, but as of 2025 the quasi totality of consumer and
    professional CPUs run on x86 or ARM from mobile phones to laptops, desktops,
    and data centres. See @Valve2024 for a detailed hardware market share
    analysis, albeit focused on gaming. Details on mobile market share can be
    found in
    [this survey](https://www.counterpointresearch.com/insight/global-smartphone-apsoc-market-share-quarterly)---all
    of the listed manufacturers use the ARM architecture.

#### Asymmetric computational resources

A second exciting paradigm shift in compilation that quantum is driving forward
is cross-compilation. A common assumption in compilation is that the program is
executed on the same machine (or at least the same architecture) on which it was
compiled. By contrast, in cross-compilation, the compiler and the compiled
binary program run on different machines, possibly with different architectures.
An instance of this would be using a recent MacOS ARM machine to create a binary
program for a PC running Windows on an Intel chip. While this is a supported
feature in most modern compilers, such tasks are the exception rather than the
norm and may be
[laborious to get to work well in practice](https://preshing.com/20141119/how-to-build-a-gcc-cross-compiler/)[^zig].
[^zig]: Yes---fine---there is
[Zig](https://zig.guide/build-system/cross-compilation/).

The situation is very different for quantum computing. Quantum computational
resources are so limited that native compilation, in which the program is
compiled and run on the same machine, is unfeasible---and will remain so for the
foreseeable future[^qcomp]. When we put the possibility of pure-quantum
compilation aside, we are left with a purely classical cross-compilation
problem, the output of which happens to be destined to run on a quantum
computer.

[^qcomp]:
    First valiant efforts at defining optimisation problems relevant to quantum
    compilation that could be run on quantum hardware has been recently
    presented in @Rattacaso2408. However, this concerns only specific
    optimisation subroutines of the overall compilation problem. It is hard to
    imagine today that deploying an entire compilation stack such as LLVM on
    quantum hardware would ever be sensible. Why tooling so close to the
    classical compiler frameworks will be required for quantum compilation is a
    topic we will return to in {{<reflink "sec:need-help" >}}.

Cross-compilation presents significant challenges. As quantum programs grow in
size and complexity, debugging and verifying their correctness without access to
the target hardware becomes increasingly difficult @Rovara2024, as we hit the
limits of what can be simulated classically. Quantum simulation is a vibrant
research area that has been---and will continue to be---the subject of theses
(e.g. @Flannigan2020 @Azad2024) in its own right.

On the flip side, using classical hardware for quantum program compilation comes
with a giant opportunity for compilers: the classical computational resources
available to the compiler are many orders of magnitude larger (and cheaper!)
than on the hardware to which the compiled program is destined. We can today
execute tens to hundreds of billions of operations per second (GFLOPS) on
desktop computers, up to the "exascale", i.e. $10^{15}$ FLOPS, for the largest
supercomputers @Dongarra2024. Quantum hardware, on the other hand, will not be
executing programs with sizes beyond 1000 error-corrected gates, or 10,000
physical gates, for another three years---that is believing the most optimistic
roadmaps in the industry @IBM2024 @Quantinuum2024.

It is expected that even a few thousand quantum gates will suffice to solve
problems that our largest supercomputers struggle with. Meanwhile, every gate
that must be performed comes at a high cost: it may fail, introduce errors, or
take a long time to complete. It therefore behoves us to use all the classical
resources at our disposal to reduce quantum operations to a minimum.

Given the strict hardware limitations, all near-term architectures are expected
to face, quantum compilation must evolve into cross-compilers that are able to
utilise the full power of classical hardware available to them; doing so will
push the boundaries of what is possible with quantum computing just a bit
further---in a field where every marginal gain may unlock new applications.

#### The confluence of classical and quantum compilation

Finally, quantum compilation also stands in front of some momentous engineering
challenges. As we will see in {{% reflink "sec:quantum-sota" %}}, significant
research efforts have focused on the compilation and optimisation of quantum
programs expressed as [quantum circuits](#the-quantum-circuit-representation).
This formalism has its roots in quantum information theory, the field that gave
birth to quantum computing. It makes for an ideal framework to develop the
theory and optimisation techniques. However, it does not include any of the
fundaments of compiler and programming language design that make classical
software engineering as composable and scalable as it is today.

For example, there is no concept of subroutine or function calls; neither can a
program execution be branching or looping based on runtime values. This makes
code reuse impossible, resulting in huge program sizes and unsurmountable
challenges for scaling up compilation to problems of real-world interest
@Ittah_2022. Another motivation for these code abstractions are the emergence of
hybrid quantum-classical computations, discussed in
{{% reflink "sec:hybrid" %}}.

With applications of quantum computing that cannot be expressed as quantum
circuits proliferating, a move away from circuit-based representations is
becoming unavoidable @openqasm3 @qir. This is also an opportunity to incorporate
learnings from the decades of experience that have been gathered in computer
science. Many of the tools and software that were originally developed for the
classical community are thus being adopted and adapted to the specificities of
quantum. This convergence of quantum computing and classical compiler
technologies is heralding new opportunities---but also pose important questions
around how to represent quantum programs and optimise them.
