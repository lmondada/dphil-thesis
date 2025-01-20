+++
title = "Programming languages and Internal Representations"
weight = 2
layout = "section"
+++

Before jumping into what merging with classical compiler technologies means
for quantum program optimisation, let us address the program representation
challenge that we touched on in the previous chapter.

Quantum circuits are very limited in their expressiveness: they are well
suited to present sequences of purely quantum operations as well as how the
computation is parallelised across qubits, but they quickly become limiting
once both quantum and classical data types are mixed and any type of control
flow (conditionals, loops, function calls, etc.) is introduced.

How users express programs in the front end has deep implications on the kind
of computations that the compiler must be capable of reasoning about---and hence
on the architecture of the compiler itself.
The great merging of classical and quantum compilers is the perfect opportunity
to reconcile program representations and to integrate the learnings
from decades of classical programming languages research into quantum computing.

There have been several trailblazing initiatives to create quantum programming
languages, such as QCL @Oemer2000, Q# @Qsharp and Silq @Bichsel2020.
It has to be said, however, that their impact and adoption in the quantum
ecosystem has so far remained limited,
overshadowed by the popularity of python-based APIs for quantum circuit-based
representations, as offered by Qiskit @JavadiAbhari2024,
Pennylane @Bergholm2022 and Cirq @CirqDevelopers2024.
There is as a result a justified dose of scepticism in the quantum community
on how well the ideas from classical programming really translate to
quantum.

It is thus all the more notable that we are seeing a new generation of quantum
programming tooling being developed @Koch2024 @Ittah_2024 @Cudaq, driven by 
the need to write more expressive programs for the improving hardware
(as we have been discussing), as well
as for performance reasons, to scale quantum compilation to
large scale @Ittah_2022, accelerate quantum simulations @Ittah_2024
and integrate with
classical high performance computing (HPC) @CudaqHpc.

The history of programming is first and foremost a masterclass
in constructing abstractions. Many of the higher level primitives,
that have proven invaluable classically, solve problems that
we expect to encounter very soon in our hybrid programs---when we
have not already.
Examples include
1. **structured control flow** to simplify reasoning about branching
in quantum classical hybrid programs,
2. **type systems** to encode program logic and catch errors at compile
time---this is particularly important for quantum programs as there is
no graceful way of handling runtime errors on quantum hardware: by the
time the error has been propagated to the caller, all
quantum data stored on qubits is probably corrupted and lost,
3. **memory management** such as reference counting and data ownership models. Current hardware follows a static memory model, in which the 
number of available qubits is fixed and every operation acts on a set
of qubits assigned at compile time.
This becomes impossible to keep track of in instances such as
qubit allocations within loops with an unknown number of
iterations at compile time.
It thus becomes necessary to manage qubits dynamically, just
like classical memory.


To facilitate such a large swath of abstractions, the first step
quantum compilers must take 
is to make a distinction between the language frontend and
the **internal representation** (IR) that the compiler uses to
reason about the program and perform optimisations.
Today in most frameworks, the frontend and the IR are one and the same: the user is given an API that can be used to create and
mutate quantum circuits, which is the same data structure the compiler
leverages and transforms to produce (another) circuit, which is in
turn sent to and executed on hardware or a simulator---it is circuits
all the way down!

### LLVM and MLIR
The classical compilation community has found great advantages in
sharing a common standardised IR format. Indeed, whilst the exact
syntax and constructs vary from language to language, and whilst,
at the other end of the compiler stack,
the specific assembly instructions
that are emitted differ between hardare targets,
much of the compiler middleware can be broadly shared between use
cases.


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