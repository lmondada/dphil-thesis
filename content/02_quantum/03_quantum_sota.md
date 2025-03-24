+++
title = "Quantum circuit optimisation: a review"
layout = "section"
weight = 3
slug = "sec:quantum-sota"
+++

Much of the foundations of classical computer science rely on boolean logic and
discrete mathematics @Lehman2017. In some regards, this is a poor man's maths,
as much of the structure that comes with continuous infinite mathematical
objects is lost along the way when discretised.

In contrast, quantum computation, on the other hand, encompasses the whole
breadth of (finite dimensional) quantum physical system evolution. Underlying
this is a rich mathematical theory steeped in the theory of Hilbert spaces and
Lie groups[^lie]. A direct consequence of the mathematics of quantum
computations is the flourishing of an entire field of research dedicated to
quantum circuit optimisations @Karuppasamy2025. They leverage the unique
structure and symmetries of quantum physics to reduce the noise and resource
requirements of quantum computations significantly.

[^lie]:
    If intrigued, look at this nice introduction @Kottmann2024 and the
    references therein. It's not as scary as it sounds.

In this section, we will review the main optimisation techniques that
established themselves within quantum compilers, focusing on the representation
of quantum computations they use and their assumptions about the computations
they are optimising.

#### Cost function

A key point to settle first when discussing circuit optimisations is the
objective of the optimisation---the cost function to be minimised. Unlike much
of classical compiler research, which can rely on an established set of hardware
targets and benchmarking datasets to profile the empirical, "real world"
performance of compiled programs, the quantum world must often contend with
simplified noise and architecture models to design proxy metrics, given the
limited scale and availability of current quantum devices.

The quantum compilers research community has mostly coalesced around cost
functions based on gate count statistics @Karuppasamy2025. Counting a type of
gate is a simple and popular choice. Making some additional assumptions on the
gate parallelism of future hardware, one may also consider cost functions based
on gate depth, i.e. the length of the longest chain of gates that cannot be run
simultaneously @Selinger_2013 @Basilewitsch2024.

Despite their simplicity, gate counts have served well as a cost function in
many use cases. Circuit optimisations typically target one of two hardware
regimes. In most current architectures, the major challenge is achieving high
accuracy on entangling operations, i.e. quantum gates that make two or more
qubits interact @Acharya2024 @Pino2021 @Koch_2007 @Blais_2007. In
superconducting qubit and ion trap architectures[^otherhard], for example, the
gate set is typically composed of one and two-qubit gate types, with error rates
dominated by an order of magnitude by the latter @Steiger_2018 @Sivarajah2020.
For near-term hardware, the number of two-qubit gates---typically the `CX` gate,
though many other two-qubit gates could be used equivalently---has thus become a
standard optimisation cost function

[^otherhard]:
    Experimental realisations of many-qubit interactions have also been
    demonstrated @Erhard2019 @Bluvstein2022 @Arrazola2021 @Evered2023 and are at
    the core of other proposed architectures @Bartolucci_2023 @Bourassa2021.

On the other hand, when considering error-corrected computations, an "expensive"
computation is no longer dictated by hardware noise but rather by the
affordances of the error-correcting code. Depending on how the quantum data is
redundantly encoded in the code space, the fault-tolerant execution of specific
operations may be anywhere between very straightforward and
nigh-impossible[^cliff]. Concretely, the bottleneck is widely expected to be the
execution of a single-qubit (non-Clifford) gate, such as the `T` gate.

[^cliff]:
    Indeed, much of quantum error correction theory is built on the Clifford
    group, a subset of quantum operations that preserve "Pauli errors" and can
    thus be corrected easily. The flip side of this is that correcting any
    non-Clifford operation is very hard, something that is resolved by
    constructing "error-free" _magic_ states ahead of time. For more details,
    refer to a quantum error correction textbook such as @Gottesman2024.

### The best: unitary synthesis

The _ne plus ultra_ of quantum circuit optimisation is **unitary synthesis**. It
leverages the representation of a quantum computation as a square,
complex-valued, unitary matrix, which is then _re-synthesised_ as a new,
equivalent (and hopefully optimised!) quantum circuit. This approach thus breaks
down quantum optimisation into two separate sub-problems:

1. Reduce a $n$-qubit quantum circuit into a $2^n \times 2^n$ matrix. This
   matrix is a _unique representation_ of the computation, meaning that any two
   equivalent computations will be mapped to the same matrix.
2. Find the optimal matrix decomposition into primitive quantum gates, which can
   be expressed as a new, equivalent quantum circuit.

The uniqueness of the unitary matrix representation makes it invaluable as a
resource for computation optimisation. Not only does it reduce any potentially
large collection of equivalent inputs to a single form; it
also---crucially---provides in the form of the Haar measure a sound distance
metric on the space of all circuits that can be used to measure the distance
between synthesised circuits and direct the search towards the optimal solution.

Early work explored general unitary decomposition schemes obtained analytically
from linear algebra. These express arbitrary unitaries as a product of unitaries
that typically correspond to one and two-qubit gates in the quantum circuit
model @Iten2016 @Iten2019. Approaches have been proposed using the Cosine-Sine
decomposition @Mottonen2004, the Quantum Shanon decomposition @Krol2021, and the
QR decomposition @Sedlak2008. While some schemes have been shown to be
asymptotically efficient for almost all unitaries @Item2016, such strategies
typically generate fixed-sized circuits and fail to synthesise short circuits
when such circuits exist. The size of synthesised circuits grows exponentially
with the number of qubits, making most such schemes impractical beyond three
qubits.

Unitary matrix decomposition can also be combined with tools from classical
circuit design: in @Loke2014, Loke et al. proposed an approach merging
reversible circuit (see below), a classical compilation problem, with unitary
matrix synthesis. They show that searching for decompositions $U = PU'Q$, where
$P$ and $Q$ are classical reversible circuits can yield shorter circuits when
using the Cosine-Sine decomposition for the unitaries $U$ and $U'$.

Search-based approaches have been developed to address the shortcomings of
analytical decompositions. Unlike the algebraic approaches, the circuit
decomposition problem is viewed as an optimisation problem in search-based
circuit synthesis. The space of all possible quantum circuits is explored to
find the one that implements the desired unitary whilst minimising the cost
function. The major challenge of such methods is the gigantic (typically
super-exponential) size of the search space of all possible programs. Without
mitigation, most work in this space struggles to scale beyond a handful of
qubits.

Up to 3 qubits, T-depth optimal circuits can be found using exhaustive brute
force search first proposed in @Amy2013 and improved in @Gheorghiu2022.
Asymptotic bounds on the number of T gates required for general unitary
synthesis were recently given in @Gosset2024.

Scaling to 4 qubits and handling gate sets with continuous parameters, required
for non-fault tolerant circuits, an A\* search with smart pruning heuristics was
proposed in @Davis2020. This approach's outputs are no longer provably optimal,
but the results match optimal decompositions in all known instances. This line
of work has subsequently been further refined with heuristics based on
pre-defined circuit templates @Smith2023 @Madden2022, parameter instantiation
@Younis2022 @qfast @Rakyta_2022, machine learning @Weiden2023 and tensor
networks @qfactor.

Some of these heuristics also make it possible to synthesise circuits with
device constraints in mind and to trade off decomposition accuracy for shallower
circuit depth and lower noise. In @Wu2020 @qfactor, the authors have also
explored partitioning the circuit into smaller parts optimised independently to
scale these techniques to large circuit sizes. Despite the reduced optimisation
performance that the boundaries of the partitioned circuits introduce, the
combination of circuit partitioning with the techniques listed above yields some
of the best-performing circuit optimisation techniques developed to date
@bqskit. Circuit synthesis schemes have also been extended to generate circuits
on a more expressive gate set, including elementary classical operations
@Alam2024 @Niu2024.

However, a fundamental flaw of all unitary synthesis schemes is the
$4^n$-scaling in the number of qubits $n$ of the unitary representation itself.
This means that no matrix-based synthesis method, however efficient, will ever
be able to handle computations with much more than a dozen qubits. Circuit
partitioning schemes effectively circumvent the problem, but they are heavily
dependent on the partitioning quality.

### The search for scalable representations

Our study of unitary synthesis introduced us to a convenient two-step approach
to quantum computation optimisation. First, the input circuit is transformed
into a "global" representation that captures the computation as a whole,
abstracting away the precise sequences of gates that compose the original
circuit. This representation is then the input for the second half of the
problem, which produces a circuit of the desired shape, equivalent to the
original input but with reduced cost.

In addition to simplifying the original problem, such global intermediate
representations are well-positioned to leverage the quantum-specific structure
and symmetries in the computation. They can thus enable more advanced
optimisations and are robust to varying circuit representation and local
optimisation landscape.

The unitary matrix is the most common representation of quantum computations,
but as we have seen, it suffers from severe scaling problems in the number of
qubits. The problem is not so much that arbitrary quantum computations require
exponential space to be described---the space of all $n$-qubit unitaries
$SU(2^n)$ is, after all, exponentially large. Instead, the issue is that the set
of unitaries implementable in practice will be restricted to quantum
computations with a polynomial number of gates; these only form a tiny subset
$poly \subseteq SU(2^n)$[^su2n].

[^su2n]:
    Polynomial-sized quantum circuits constitute a polynomial-dimensional
    submanifold of the exponential-dimensional $SU(2^n)$ Lie group. They are,
    hence, a measure zero subset of $SU(2^n)$ with respect to the Haar measure.

Another fruitful avenue of work for quantum optimisation has thus been the
development of alternative representations for quantum computations that can
encode polynomially sized quantum programs efficiently whilst enabling novel
optimisations.

#### Phase Polynomials and Pauli Gadgets

A particularly convenient global representation of many quantum circuits is as
products of Pauli exponentials, also known as Pauli "Gadgets" @Cowtan2019. These
unitaries are of the form

$$U = \prod_{s \in P} exp(i \alpha_s \cdot s)$$

where $\alpha_s \in \mathbb [0, 2\pi)$ are real coefficients and
$s \in \{I, X, Y, Z\}^n$ are strings of length $n$ of the four Pauli
matrices---so called Pauli strings. In this formulation, $n$ fixes the number of
qubits of the computation.

These exponentials are always valid $n$-qubit unitaries and can express
entangling operations across any number of qubits: the qubits on which an
operation $exp(i \alpha \cdot s)$ acts non-trivially are given by the indices of
the characters in $s$ that are not the identity $I$. For instance, the
exponential

$$exp(i \frac\pi2 XIZ)$$

is a valid quantum computation on 3 qubits, entangling the first and third
qubits. Beyond useful abstractions for optimisation, such entangling operations
appear naturally when simulating quantum systems, for example in quantum
chemistry @McClean2016.

The use of these primitives for quantum compilation was first explored in
@Cowtan2019, and further generalised in @Cowtan2020. Starting from an
(unordered) sequence of Pauli gadgets, the gadgets are clustered into sets of
mutually commuting gadgets. These can then be jointly synthesised into a
circuit, markedly reducing the number of entangling operations as compared to
naively implementing one exponential at a time.

Further improvements to this work have since been presented in @Huang2024 and
@Schmitz2024, where new heuristics are introduced to choose the Pauli gadget
ordering. In @Huang2024, the hardware-specific connectivity constraints between
qubits are also taken into account to produce programs that can be executed on
the targetted architecture without overhead.

A close relative of Pauli gadgets---a strict smaller subset of it, to be
precise---are the so-called phase polynomials @Amy2018, obtained when
restricting the Pauli strings $s \in \{I, Z\}^n$ to combinations of Z Pauli
matrices and identities. These are particularly amenable to optimisation as in
this case, all exponential terms commute. This gives the compiler a lot of
freedom during circuit synthesis.

The action of phase polynomials on quantum states is quite easy to understand.
Instead of the exponentials of $I$ and $Z$-based Pauli string, the computation
can equivalently be given by its action on the basis states

$$\ket{b_1 \cdots b_n} \mapsto \underbrace{\exp(i \cdot \sum_{s \in P} a_s \cdot (s_1 b_1 \oplus \cdots \oplus s_n b_n))}_{\in\,\mathbb{R}} \ket{b_1 \cdots b_n}$$

where $b_1 \cdots b_n$ is a bitstring of booleans $b_i \in \{0, 1\}$,
$s_i \in \{0, 1\}$ is also a boolean with value `1` if and only if the $i$-th
character in $s$ is $Z$, and $\oplus$ denotes the boolean XOR operation.

The exponential expression is just a real number---indeed each term in the sum
simply evaluates to either $a_i$ or $0$. A phase polynomial is thus a diagonal
unitary matrix: it maps every basis state $\ket {b_1 \cdots b_n}$ to itself,
multiplied by some phase $e^{i \theta}$.

Polynomially-sized circuits that implement diagonal matrices correspond to phase
polynomials with $k = \mathcal{O}(n^p) \ll 2^n$, i.e. they can represent quantum
computations efficiently and scale well with the number of qubits---thus
allowing efficient algorithms that scale polynomially in the number of qubits
$n$.

The Graysynth algorithm, as presented in @Amy2018, has become _the_ reference
synthesis method for phase polynomials. The key observation that the authors
made was that all terms of the sum within the exponential can be cycled through
and obtained following the binary Gray codes @Gray1953. The Hamming distance of
one that separates successive bitstrings in the code translates into a single
two-qubit CX gate in Graysynth.

This approach was adapted to work with hardware connectivity constraints in
@Degriend2020, @Gogioso2022 and @Vandaele2022. An up-to-date study of the
performance of phase polynomial-based compiler optimisations and comparisons
with standard approaches is performed in @Griend2025.

The study of phase polynomials can also be generalised to arbitrary diagonal
operators. Tight asymptotic bounds on the resource requirements for arbitrary
diagonal operator synthesis and their implementation were recently given in
@Sun_2023. The authors propose using a smart meshing of different Gray codes in
parallel and, where available, additional qubits as ancilla registers to
parallelise computations further and minimise circuit depth. The resulting
general-purpose decomposition of arbitrary diagonal operators yields circuits of
depth $\mathcal O(\frac{2^n}{n})$ and size
$\mathcal O(\frac{n^2}{\log n}) + 2^{n+3}$, as well as improved bounds in the
presence of $m \geq 2n$ ancilla qubits.

#### Clifford synthesis

The group of all $n$-qubit unitaries $SU(2^n)$ contains a subgroup that has
become an object of study across many domains of quantum computing science: the
Clifford group. We have already mentioned that it is at the centre of quantum
error correction theory @Bravyi2005; it is also a cornerstone of
measurement-based quantum computing @Raussendorf_2001 and graph states
@Hein2004, as well as one of the most promising approaches for fast quantum
simulations @Gottesman1999 @Bravyi_2019 @Kissinger_2022.

The Clifford subgroup of quantum circuits admits an efficient
$\Theta(2n^2)$-sized program representation known as **Clifford tableau**
@Aaronson_2004. This has been used profusely for compiler optimisation. In
@Aaronson_2004 the first Clifford circuit synthesis procedure is given, using an
analytical decomposition of Clifford tableaus into $O(n^2 /\log n)$ one and
two-qubit gates. An improved, Bruhat-based decomposition that is optimal in the
number of Hadamard gates was subsequently proposed in @Maslov2018. In the case
of a Clifford fragment directly followed by measurements, the procedure can be
further refined to replace gates with classical computation on the measurement
outcomes @Bravyi_2021. Finally, an alternative normal form that is well-suited
to hardware with limited nearest neighbours connectivity was also derived using
a diagrammatic approach @Maslov2023.

Just as in unitary synthesis, circuit decompositions more efficient than the
general analytical expressions can be obtained case-by-case using search and
optimisation. The pendant to the provably optimal decompositions of unitaries
obtained through brute force search @Amy2013 also exists for Clifford circuits
@Kliuchnikov2013. Due to the more efficient representation and smaller search
space, all optimal Clifford circuits could be found up to 6 qubits. Using modern
SAT solvers, optimal Clifford synthesis has recently been pushed much further,
with known optimal circuits beyond 20 qubits @Peham2023 @Schneider2023.

Heuristic optimisation approaches have also been shown to be effective on
Clifford optimisation @Bravyi_2021 @Fagan2018 and scale to larger systems. For
Clifford computations on devices with restricted connectivity, an
architecture-aware synthesis method was proposed in @Winderl2024.

#### Diagrammatic representations

Quantum computer science and quantum mechanics have a rich history in
diagrammatic representations @Feynman1949 @Coecke2017 @Backens2019. These have
allowed one to picture complex physical processes as intuitive operations in a
graphical language and have---as a nice side effect---led to a plethora of
state-of-the-art quantum circuit optimisation techniques!

A diagrammatic representation of quantum computation is obtained by lifting the
gates that form a quantum circuit into the nodes of a more abstract graph-based
graphical calculus. The most commonly used flavour of calculus for circuit
optimisation is the ZX calculus @Coecke2008 @Coecke2012 @vandewetering2020
@Yeung2024.

By breaking up multi-qubit gates into several non-unitary tensors, the ZX
calculus and related variants @Roy2011 @Backens2019 @Felice2023 expose some of
the symmetry and structure of quantum physics in the form of simple and
intuitive graphical rules. This has enabled the discovery of many quantum
optimisation techniques (e.g. @Duncan2019 @Wetering2024), some of which we have
already reviewed @Huang2024 @Gogioso2022 @Degriend2020 @Cowtan2019 @Cowtan2020.
This selection of papers is not _quite_ exhaustive[^arb]---there are currently
over 300 hundred papers on the topic, as indexed by
[zxcalculus.com](https://zxcalculus.com/).

[^arb]: and totally arbitrary!

Aside from being an invaluable tool for research and compiler pass design, a
significant contribution of these diagrammatic representations is the
introduction of graph transformation systems (GTS) @Ehrig1973 @Rozenberg1997
@Koenig2018 to quantum computing. More on this in {{<reflink "chap:compiler" >}}
(and much of the rest of this thesis)!

#### Reversible classical circuits

Many more representations have either been taken over from classical compiler
optimisations or were developed for specific purposes. The last we will mention
is reversible circuit synthesis, an entirely classical circuit design problem
which can draw from the results of decades of research. From a quantum
perspective, reversible classical circuits correspond to unitaries (and more
generally, isometries) that send basis states to basis states---and thus do not
introduce any entanglement @Shende2002. We highlight a selection of the more
recent work in the field and refer the reader to the much more complete, albeit
ageing, survey of @Saeedi2013.

Up to 4 (qu)bits, all reversible circuits and their optimal synthesis can be
generated by brute force @Li2014. Viewing reversible circuits as a permutation
of all $2^n$ bitstrings, Susam et al. pre-compute optimal circuits only for
swaps of two bitstrings (transpositions). These can then be used as part of a
standard selection sort to synthesise arbitrary permutations. The number of such
permutations scales much more favourably compared to arbitrary permutation,
allowing fast circuit synthesis of up to 20+ (qu)bits in a fraction of a second,
with good performance.

Truth-table or matrix representations of reversible circuits suffer from the
same exponential scaling as unitaries. To address these, other representations
that have been used include exclusive sums of product terms (ESOP) @Fazel2007
@Bandyopadhyay2014, positive polarity Reed-Müller codes (PPRM) @Jegier2017 and
decision diagrams @Stojkovic2019 @Wille2010 @Pang2011.

The quantum framework is strictly more general than the classical regime in
which the problem was studied initially. This affords additional freedom for
decomposition schemes, such as decompositions of CCX gates on 3 qubits into
single and two-qubit gates @Shende2008. Various optimised decompositions for
sequences of Toffoli gates have also been similarly developed @Scott2008
@Arabzadeh2010 @Datta2013 @Rahman2014 @Datta2015 @Arpita2015 @Abdessaied2016
@Gado2021. Mohammadi and Eshghi introduced 4-valued truth tables to extend
classical circuit synthesis to include $\sqrt{X}$ (also known as V) gates
@Mohammadi2008. References @Soeken2012 as well as @Rahman2012 incorporated
controlled-V gates into template matching strategies and showed significant
improvements in synthesised gate count . Finally, @Maslov2016 proposed
decomposing Toffolis only up to relative phase, introducing a lot of freedom in
the quantum decompositions that are required compared to the traditional
classical decompositions.

---

In summary, a variety of scalable representations---such as phase polynomials,
Pauli gadgets, Clifford tableaus, diagrammatic calculi, and reversible
circuits---have been developed to abstract computations and enable highly
tailored optimisation methods. These approaches leverage the unique structure
and symmetries of quantum computations, achieving significant reductions in
circuit size, depth, and hardware-specific overheads. Techniques such as phase
polynomial synthesis and Clifford tableau representations are widely applicable
and are a cornerstore of modern quantum compilers @Amy2019 @Griend2025.
Meanwhile, diagrammatic calculi, such as the ZX calculus, provide a flexible and
theoretically robust framework for optimisations, often revealing
simplifications invisible in the traditional gate-based model.
