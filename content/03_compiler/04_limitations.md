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
makes it invaluable as a resource for computation optimisation.
Not only does it reduce any potentially large collection of equivalent
inputs to a single form;
it also---crucially---provides a sound metric on the space of all circuits
that can be used to measure the distance between synthesised
circuits and direct the search towards the optimal solution.

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
reversible circuit (see below), a classical compilation problem,
with unitary matrix synthesis.
They show that searching for decompositions $U = PU'Q$, where $P$ and $Q$ are
classical reversible circuits can yield shorter circuits when
using the Cosine-Sine decomposition for the unitaries $U$ and $U'$.

To address the shortcomings of analytical decompositions,
search-based approaches have been developed.
Unlike the algebraic approaches, 
in search-based circuit synthesis the circuit decomposition problem is viewed
as an
optimisation problem. The space of all possible quantum 
circuits is explored to find the one that implements the desired unitary whilst
minimising the cost function.
The major challenge of such methods is the gigantic (typically super-exponential)
size of the search space of all possible programs:
without mitigation, most work in this space struggle to scale
beyond a handful of qubits.

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

However, a fundamental flaw of all unitary synthesis schemes is the
$4^n$-scaling in the number of qubits $n$ of the unitary
representation itself. This
means that no matrix-based synthesis method, however efficient, will ever be
able to handle computations with much more than a dozen qubits.
Circuit partitioning schemes do not solve this problem as much as they avoid
it, by considering only a subset of the computation---at the cost of inferior
performance.

Closer to the concerns of this thesis, the unitary representation is also
a poor candidate to express hybrid computations.
In an exciting recent development, first studies of synthesis
schemes in the presence of mid-circuit measurements have been performed
that generalise search-based circuit synthesis to reason about measurements
and conditional gates @Alam2024 @Niu2024.
They present promising results, with significant reductions in circuit
depth for state preparation and circuit synthesis.
However, the expressiveness of the programs considered in these recent advances
remains limited to circuit-based representations.
It is unclear if and how these techniques could be extended to synthesise
more complex hybrid programs, such as repeat-until-success schemes, let alone
the kind of arbitrary hybrid programs expressible in `minIR`.

{{% hint danger %}}
See @Ge2024 for a recent review of work in this space. IS THIS ANY GOOD? Should I just read it?
{{% /hint %}}


### The search for scalable representations

Our study of unitary synthesis introduced us to a convenient two-step approach
to quantum computation optimisation. The input computation
(circuits, for the most part) is first transformed into a "global" 
representation that captures the computation as a whole, abstracting away
the precise sequences of gates that composed the original circuit.
This representation is then the input for the second half of the problem, which
produces a circuit of the desired shape, equivalent to the original input but
with reduced cost.

In addition to simplifying the original problem, such global intermediate
representations are also well positioned to leverage the quantum-specific
structure and symmetries in the computation.
They can thus enable more advanced optimisations
and are robust to varying circuit representation and local optimisation landscape.

The unitary matrix is the most common representation of quantum computations,
but as we have seen it suffers from severe scaling problems in the number of
qubits.
The problem is not so much that arbitrary quantum computations require
exponential space to be described---the space of all $n$-qubit unitaries
$SU(2^n)$ is after all exponentially large.
Rather, the issue is that the set of unitaries implementable in practice
will be restricted to quantum computations
with a polynomial number of gates;
these only form a tiny subset of $SU(2^n)$[^su2n].
[^su2n]: Polynomial sized quantum circuits constitute a polynomial-dimensional submanifold of the exponential-dimensional $SU(2^n)$ Lie group. They are hence
a measure zero subset of $SU(2^n)$ with respect to the Haar measure.

Another fruitful avenue of work for quantum optimisation has thus been
the development of alternative representations for quantum computations that
can encode polynomially sized quantum programs efficiently 
whilst enabling novel optimisations.

#### Phase Polynomials and Pauli Gadgets

A particularly convenient global representation of many quantum computations
is as products of Pauli exponentials, also known as Pauli "Gadgets" @Cowtan2019.
These unitaries are of the form
$$U = \prod_{s \in P} exp(i \alpha_s \cdot s)$$
where $\alpha_s \in \mathbb [0, 2\pi)$ are real coefficients and
$s \in \{I, X, Y, Z\}^n$ are strings of length $n$ of the four Pauli
matrices---so called Pauli strings.
In this formulation, $n$ fixes the number of qubits of the computation.

These exponentials are always valid $n$-qubit unitaries and can
express entangling operations across any number of
qubits: the qubits on which an operation $exp(i \alpha \cdot s)$ acts 
non-trivially are given by the indices of the characters in $s$ that are
not the identity $I$. For instance, the exponential
$$exp(i \frac\pi2 XIZ)$$
is a valid quantum computation on 3 qubits, entangling the first and third
qubits.
Beyond useful abstractions for optimisation, such entangling operations
appear naturally when simulating quantum systems, for example in quantum
chemistry @McClean2016.

The use of these primitives for quantum compilation was first explored
in @Cowtan2019, and further generalised in @Cowtan2020.
Starting from an (unordered) sequence of Pauli gadgets, the gadgets
are clustered into sets of mutually commuting gadgets. 
These can then be jointly synthesised into a circuit, markedly reducing
the number of entangling operations as compared to naively implementing
one exponential at a time.

Further improvements to this work have since been presented in @Huang2024
and @Schmitz2024, where new heuristics are
introduced to choose the Pauli gadget ordering. In @Huang2024,
the hardware-specific connectivity constraints between qubits is also taken
into account to produce programs that can be executed on the targetted
architecture without overhead.

A close relative of Pauli gadgets---a strict smaller subset of it, to
be precise---are the so-called phase polynomials @Amy2018,
obtained when restricting
the Pauli strings $s \in \{I, Z\}^n$ to combinations of Z Pauli matrices and
identities.
These are particularly amenable to optimisation as in this case, all
exponential terms commute. This gives the compiler a lot of freedom during
circuit synthesis.

The action of phase polynomials on quantum states is actually quite easy
to understand. Instead of the exponentials of $I$ and $Z$-based Pauli string,
the computation can equivalently be given by its action on the basis states
$$\ket{b_1 \cdots b_n} \mapsto \underbrace{\exp(i \cdot \sum_{s \in P} a_s \cdot (s_1 b_1 \oplus \cdots \oplus s_n b_n))}_{\in\,\mathbb{R}} \ket{b_1 \cdots b_n}$$
where $b_1 \cdots b_n$ is a bitstring of booleans $b_i \in \{0, 1\}$,
$s_i \in \{0, 1\}$ is also a boolean with value `1`
if and only if the $i$-th character in $s$ is
$Z$, and $\oplus$ denotes the boolean XOR operation.

The exponential expression is just a real number---indeed each term in the
sum simply evaluates to either $a_i$ or $0$.
A phase polynomial is thus a diagonal unitary matrix: it maps
every basis state $\ket {b_1 \cdots b_n}$ to itself, multiplied by 
some phase $e^{i \theta}$.

Polynomially-sized circuits that implement diagonal matrices
correspond to phase polynomials with $k = \mathcal{O}(n^p) \ll 2^n$,
i.e. they can represent quantum computations efficiently and scale well
with the number of qubits---thus allowing
efficient algorithms that scale polynomially in the number of qubits $n$.

The Graysynth algorithm, as presented in @Amy2018, has become _the_ reference
synthesis method for phase polynomials.
The key observation that the authors made was that all terms of the sum within
the exponential can be cycled through and obtained following the binary
Gray codes @Gray1953.
The Hamming distance of one that separates successive bitstrings in the code
translate into a single two-qubit CX gate in Graysynth.

This approach was adapted to work with hardware connectivity constraints @Degriend2020 and @Vandaele2022.
An up-to-date study of performance of phase polynomial-based compiler
 optimisations and comparisons with other approaches is performed in @Griend2025.

The study of phase polynomials can also be generalised to arbitrary
diagonal operators.
An asymptotically tight bound of the resource requirements
for arbitrary diagonal operator implementations
was recently given in @Sun_2023.
The authors propose using a smart meshing of different Gray codes in parallel,
as well as,
where available, additional qubits as ancilla registers to further parallelise
computations and minimise circuit depth.
The resulting general purpose decomposition of arbitrary
diagonal operators yields circuits of depth $\mathcal O(\frac{2^n}{n})$
and size $\mathcal O(\frac{n^2}{\log n}) + 2^{n+3}$, as well as
improved bounds in the presence of $m \geq 2n$ ancilla qubits.

#### Clifford synthesis

#### Reversible circuit synthesis

#### Diagrammatic representations


In summary, phase polynomials and Pauli gadgets offer a good balance between
non-local optimisations that such global representations of quantum computation
 enable and efficient synthesis perforance.
However, they are just as vulnerable to hybrid computation 


### Resorting to peephole optimisations