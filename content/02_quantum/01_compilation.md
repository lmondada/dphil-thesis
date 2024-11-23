+++
title = "A new compilation regime"
template = "section.html"
weight = 1
+++

We have introduced quantum compilation by drawing an analogy with the
well-developed field of classical compilers.
However, what makes quantum compilation so incredibly exciting is
the novel directions it is taking the field in.
Of the many new challenges that are arising, let us discuss here three that
together form the core motivation for this work.

### Large variations in architecture

A first distinguishing characteristic of current quantum computing developments
is the vast differences between proposed hardware architectures.
Unlike classical computing 
where silicon-based transistors have become the definitive physical foundation
for all electronic chips, the search for the most scalable and reliable 
technology for quantum computing is ongoing -- and doubtless one of the most
burning questions for the nascent industry.

Quantum hardware designs are dictated on the one hand by the choice of the
quantum physical system used to encode the data of the computation, and
by the technology that serves to control and manipulate the system on the other.
Suggestions for the former include charged or neutral atoms, photons, transmons
or Majorana particles.
The control systems that drive the desired operations on these particles
is then built using some jolly mixture of lasers, magnetic fields, microwaves,
dilution fridges etc.

Each of these combinations result in different tradeoffs: some will render a 
certain computation particularly easy; others hold the promise to scale well
to large systems but are very error-prone and unreliable; others still achieve,
high fidelities at the expense of slow operations.

From the perspective of a compiler engineer, this means that we must equip
quantum compilers to handle a large variety of instruction sets and optimisation
goals.
This is a huge challenge that traditional compilation is ill-equipped to handle.

A comparison of machine code for different architectures illustrates well
the difference between the quantum and classical worlds.
Classical CPUs are dominated by two architectures *x86*, used mainly by Intel
and AMD, and *ARM*, used by a wide range of desktop and mobile chip
manufacturers[^cpu].

{{% columns ratio="1:1" %}}
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

There are noticeable differences between the two architectures, mostly around
variable naming conventions, as well as explicit memory loads `ldr` and
stores `str` instructions in the case of ARM, which in x86 are handled
implicitly by `mov`.
This simplistic example naturally ignores some of the more fine-grained
considerations that can make translations hard in certain edge cases. A
discussion of these can be found in
[Migrating Software from x86 to ARM Architecture: An Instruction Prediction Approach](https://ieeexplore.ieee.org/document/9605443).
However, overall the instructions and capabilities that the two platforms are
broadly equivalent, as is confirmed by the existence of translation tools 
such as [Apple Rosetta](https://developer.apple.com/documentation/apple-silicon/about-the-rosetta-translation-environment).

Let us contrast this with the difference between two quantum architectures.
TODO: photons VS some qubits.

It is worthwhile to note that current trends in the classical world are also
pushing compilers towards more heterogenous architectures.
Nonetheless, this shift has so far mostly taken the form of new hardware
specific compilation tools developed by the hardware manufacturers themselves,
rather than a fundamental reorganisation of existing tools.
The breadth of technologies and trade-offs that quantum compilers must face have
for the time being no equivalent in the classical world.

- [x] change in instruction set
- [ ] change in cost function
- [ ] change in constraints
- [ ] change in noise

[^cpu]: x86 and ARM are really the only game in town for everything from mobile
phones to laptops, desktops and all the way to data centres. See the [Steam
Hardware and Software survey](https://store.steampowered.com/hwsurvey/processormfg/)
for detailed hardware market share, focused on gaming.
Details on mobile market share can be found in
[this survey](https://www.counterpointresearch.com/insight/global-smartphone-apsoc-market-share-quarterly) -- all of the listed
manufacturers use the ARM architecture.

### Asymmetric computational resources

A second exciting paradigm shift in compilation that quantum is driving forward
is cross-compilation.
A common assumption in compilation is that the program is executed on the same
machine (or at least the same architecture) that it was compiled on.
By contrast, in cross-compilation the compiler and the compiled binary program
run on different machines, possibly with different architecture.
An instance of this would be using a recent MacOS ARM machine to create a
binary program for a PC running Windows on an Intel chip.
While this is a supported feature in most modern compilers, such tasks are the
exception rather than the norm and are often [laborious to get working well in
practice](https://preshing.com/20141119/how-to-build-a-gcc-cross-compiler/).

The situation is very different for quantum computing.
Quantum computational resources are so limited that native compilation,
in which the program is compiled and run on the same machine, is unfeasible
-- and will remain so for the foreseeable future[^qcomp].

Cross-compilation comes with its challenges, notably how to run and debug
compiled programs in the absence of immediate (and inexpensive) access to
the target hardware -- 
this is the topic of quantum simulation, which is the topic for a (at least one)
thesis in itself.
But it also comes with a giant opportunity for compilers: the computational
resources available to the compiler are many orders of magnitude larger
(and cheaper!) than the hardware that the compiled program is destined to.
We can today execute tens to hundreds of billions of operations per second
(GFLOPS) on desktop computers, scaling all the way up to exascale
(i.e. 10^15 FLOPS) for the largest supercomputers ([top500 list](https://top500.org/lists/top500/2024/11/)).
Wuantum hardware on the other hand will not be executing more than 1000
error-corrected gates, or 10,000 physical gates, for another three years –-
that is believing the most optimistic roadmaps in the industry ([Quantinuum](https://www.quantinuum.com/press-releases/quantinuum-unveils-accelerated-roadmap-to-achieve-universal-fault-tolerant-quantum-computing-by-2030), [IBM](https://www.ibm.com/quantum/blog/ibm-quantum-roadmap-2025)).

We clearly cannot compare apples with oranges: fast floating point operations
are no replacement for a quantum computer.
However, it is a beautiful corollary of the mathematics that govern quantum
mechanics that whilst the quantum operations themselves are very expensive to
execute on classical hardware, in many cases the simplification and
optimisation of quantum programs can very well be done on the laptops, servers
and supercomputers that we have in abundance today.

It is expected that even a few thousand quantum gates will suffice to solve
problems that our largest supercomputers struggle with.
On the flip side, every gate that must be performed comes at a high cost:
it may fail, introduce errors or simply take a long time to complete.
It therefore behooves us to use all the classical resources at our disposal
to reduce quantum operations to a minimum: given the harsh hardware constraints
that we are facing, performant optimising compilers will be required to
synthesise runnable quantum programs for otherwise unsolvable problems.

### The confluence of classical and quantum compilation

Finally, quantum compilation also stands in front of some momentous engineering
challenges.
Until recently, the great majority of research efforts in the field were focused
on the compilation and optimisation of quantum programs expressed as quantum
circuits –- more of these in section XY.
This formalism has its roots in quantum information theory, the field that gave
birth to quantum computing.
It makes for an ideal framework to develop the theory as well as optimisation
techniques. However it does not include any of the fundaments of compiler
and programming language design that make classical software engineering
as compostable and scalable as it is today.
For example there is no concept of subroutine or function calls; neither
can a program execution branch or loop based on runtime values.
This makes code reuse impossible, resulting in huge program sizes and
unsurmountable challenges for scaling up compilation to problems of
real world interest.

The community is thus moving away from circuit-based representations to
incorporate learnings from the decades of experience that have been gathered in
computer science.
Many of the tools and software that were originally developed for the classical
community are now being adopted and adapted to the specificities of quantum.
We are thus finding ourselves at the confluence of two fascinating fields,
heralding great future developments. TODO


[^qcomp]: Quantum compilation on quantum hardware is not a thing.