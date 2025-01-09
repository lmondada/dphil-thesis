+++
title = "Review of quantum compiler optimisations"
template = "section"
weight = 4
+++

Much of the foundations of classical computer science relies
on boolean logic and discrete mathematics @Lehman2017.
This is in some regards a poor man's
maths, as much of the structure that comes with continuous infinite mathematical
objects is lost along the way when discretised.
Quantum computing on the other hand encompasses the whole breadth of quantum
physical system evolution, with the underlying mathematics steeped in the theory
of Hilbert spaces and Lie groups[^lie].
[^lie]: If you are intreagued have a look at this
nice introduction @Kottmann2024 and references therein.
It's not as scary as it sounds.

A direct consequence of the rich mathematics of quantum computations is
the flourishing of an entire field of research dedicated to quantum-specific
compiler optimisations @Karuppasamy2025.
Using all the assumptions and theory of quantum physics to design smart
optimisations is the strength of these techniques, but also their weakness:
in the face of rising hybrid classical-quantum computations, it is a priority
that the performant algorithms that have been developed for this purpose be
adapted to handle intermingled classical computations.

In this section, we will pass in review the main optimisation techniques---and
closely related, the representation of quantum computations they use
respectively---that have established themselves, with a particular focus on
how they intersect with classical compiler design and how they 
generalise to work on quantum programs expressed in an IR such as
`minIR`. 

#### Cost function

A key point to settle first when discussing quantum optimisations is what
cost function it is we are "optimising".
Unlike much of classical compiler research, which can rely on an established set
of hardware targets and benchmark programs to use as optimisation objective,
there is as of yet no settled answer on the "right" quantum metric that must
be optimised.

Most work can however be clustered in one of two buckets: the cost measure
of a quantum program is either designed to approximate the amount
of noise
(i.e. errors) that would be introduced by current and near-term hardware,
or it models the resource requirements for the program execution on a more
distant large scale
device, with the assumption that all hardware errors will be suppressed using
error correction @Karuppasamy2025.

In many current architectures, the major challenge is to achieve high accuracy
on entangling operations, i.e. quantum gates that make two or more qubits
interact @Acharya2024 @Pino2021 @Koch_2007 @Blais_2007.
While experimental realisations of many-qubit interactions have been
demonstrated @Erhard2019 @Bluvstein2022 @Arrazola2021 @Evered2023
and are at the core
of certain proposed architectures @Bartolucci_2023 @Bourassa2021, the most
common computation primitives exposed by current hardware
are one and two-qubit gates, with error rates dominated typically by an order
of magnitude by the latter @Steiger_2018 @Sivarajah2020.
It has thus become standard to use the number of two-qubit entangling gates
as the cost function for near-term programs---typically the `CX` gate, though
many other two-qubit gates could be used equivalently.

When considering error-corrected computations, on the other hand,
what is an "expensive" computation is no longer dictated by hardware noise,
but rather by the affordances of the error correcting code: depending on how
the quantum data is redundantly encoded in the code space, the fault tolerant
execution of specific operations 
may be anywhere between very straight forward and nigh-impossible[^cliff].
Concretely, the bottleneck is widely expected to be the execution of a 
single-qubit gate, such as the `T` gate.
[^cliff]: Indeed, much of quantum error correction theory is built on
the Clifford group, a subset of quantum operations that preserve
"Pauli errors"---and can thus be corrected easily. The flip side of this is
that correcting any non-Clifford operation is very hard, something
that is resolved by constructing "error-free" _magic_ states ahead of time.
For more details, refer to a quantum error correction textbook such as @Gottesman2024.

In summary, whilst much of the hardware design, the error correcting codes
and what programs will actually be executed is still in flux,
the research community has mostly coallesced around cost functions based
on gate count statistics @Karuppasamy2025.
Counting a type of gate is a simple and popular choice.
Making some additional assumptions on the gate parallelism of
future hardware,
one may also consider cost functions based on gate depth, i.e. the length
of the longest chain of gates that cannot be run
simultaneously @Selinger_2013 @Basilewitsch2024.
These may model run times more closely,
but come at the price of non-local cost function: whether local 
transformations of the program will have an effect on a depth-based cost function
can only be decided by recomputing the cost over the program globally.


### The best: unitary synthesis

The _ne plus ultra_ of quantum compilation is **unitary synthesis**.
It leverages the representation of a quantum computation as a square,
complex-valued, unitary matrix, which is then _re-synthetised_ as a new,
equivalent (and hopefully optimised!) quantum circuit.
This approach thus breaks down quantum optimisation into two separate
sub-problems:
1. Reduce a $n$-qubit quantum circuit into a $2^n \times 2^n$ matrix.
This matrix is a _unique representation_ of the computation, meaning that
any two equivalent computations will be mapped to the same matrix.
2. Find the optimal decomposition of matrix into primitive quantum gates,
which can be expressed as a new, equivalent quantum circuit.

The uniqueness of the unitary matrix representation
makes it invaluable as a resource for computation optimisation:
unlike most heuristic optimisation approaches whose
success might vary depending on the circuit representation,
the inital parameters and the local optimisation landscape @Wu2020,
circuits that are resynthesised from unitaries will always be unique.

Early work explored general unitary decomposition schemes obtained analytically 
from linear algebra.
These express arbitrary unitaries as a a product of unitaries that typically
correspond to one and two-qubit
gates in the quantum circuit model @Iten2016 @Iten2019.
Approaches using the Cosine-Sine decomposition @Mottonen2004, the Quantum Shanon decomposition @Krol2021
and the QR decomposition @Sedlak2008 have been proposed.
While some schemes have been shown to be asymptotically efficient for almost
all unitaries @Item2016, such strategies typically generate fixed-sized circuits
and fail to synthesise short circuits when such circuits exist.
The size of synthesised circuits grows exponentially with the number of qubits,
making most such schemes impractical beyond three qubits.

Unitary matrix decomposition can also be combined with tools from classical 
circuit design:
in @Loke2014, Loke et al. proposed an approach merging
reversible circuit, a classical compilation problem, with unitary
matrix synthesis .
They show that searching for decompositions $U = PU'Q$, where $P$ and $Q$ are
classical reversible circuits can yield shorter circuits when
using the Cosine-Sine decomposition for the unitaries $U$ and $U'$.

To address the shortcomings of analytical decompositions,
search-based approaches have been developed.
Search-based circuit synthesis explores the space of all possible quantum 
circuits and finds the one that implements the desired unitary whilst
minimising the cost function.
The major challenge of such methods is the gigantic (typically super-exponential)
size of the search space of all possible programs:
most work in this space struggle to scale beyond a handful of qubits.

Up to 3 qubits, T-depth optimal circuits can be found
using exhaustive brute force search first proposed in @Amy2013 and improved
in @Gheorghiu2022.
To scale to 4 qubits and handle gate sets with continuous parameters, required
for non-fault tolerant circuits, an A* search with smart pruning heuristics
was proposed in @Davis2020.
Outputs of this approach are no longer provably optimal but the results match
optimal decompositions in all known instances.
This line of work has subsequently be further refined with heuristics
based on pre-defined circuit templates @Smith2023 @Madden2022,
parameter instantiation @Younis2022 @qfast @Rakyta_2022, 
machine learning @Weiden2023 and tensor networks @qfactor.

Some of these heuristics also make it possible to synthesise circuits
with device constraints in mind and to trade off
decomposition accuracy for shallower circuit depth and lower noise.
In @Wu2020 @qfactor, the authors have also explored partitioning the circuit into smaller
parts that are optimised independently to scale these techniques to large
circuit sizes. Despite the reduced optimisation
performance that the boundaries of the partitioned circuits introduce,
the combination of circuit partitioning with the techniques listed above
yields some of the best performing circuit optimisation techniques developed to date @bqskit.

See @Ge2024 for a recent review of work in this space. IS THIS ANY GOOD? Should I just read it?



------ Take over here 
However, unitary decomposition (as well as unitary computation itself) is challenging and scales very poorly.
Finding any decomposition has exponential cost in the average case and finding efficient decompositions
is even harder.


### The search for scalable representations

#### Phase Polynomials and Pauli Gadgets

#### Clifford synthesis

#### Reversible circuit synthesis

#### Diagrammatic representations


### Resorting to peephole optimisations