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
Aymptotic bounds on the number of T gates required for general unitary
synthesis was recently given in @Gosset2024.

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

This approach was adapted to work with hardware connectivity constraints
in @Degriend2020, @Gogioso2022 and @Vandaele2022.
An up-to-date study of performance of phase polynomial-based compiler
 optimisations and comparisons with standard approaches is performed in @Griend2025.

The study of phase polynomials can also be generalised to arbitrary
diagonal operators.
Tight asymptotic bounds on the resource requirements
for arbitrary diagonal operator synthesis, along with their implementation,
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
The group of all $n$-qubit unitaries $SU(2^n)$ contains a subgroup that has
become an object of study across
many domains of quantum computing science: the Clifford group.
We have already mentioned that it is at the centre of quantum error correction
theory @Bravyi2005;
it is also a cornerstone of measurement-based quantum computing @Raussendorf_2001
and graph states @Hein2004, as well as one of the most promising approaches
for fast quantum simulations @Gottesman1999 @Bravyi_2019 @Kissinger_2022.

It has also given rise to a quantum program representation that has been used
profusely for compiler optimistaion.
Indeed, the Clifford fragment, i.e. the quantum circuits with unitaries
in the Clifford group,
admit an efficient, $\Theta(2n^2)$-sized representation,
known as a **Clifford tableau** @Aaronson_2004.

In @Aaronson_2004 the first Clifford circuit synthesis procedure is given, using
an analytical decomposition of clifford tableaus 
into $O(n^2 /\log n)$ one and two-qubit gates.
An improved, Bruhat-based decomposition that is optimal in the number
of Hadamard gates was subsequently proposed in @Maslov2018.
In the case of a clifford fragment directly followed by measurements, 
the procedure can be further refined to replace gates with classical
computation on the measurement outcomes @Bravyi_2021.
Finally, an alternative normal form that is well-suited to hardware with
limited nearest neighbours connectivity was also derived using a diagrammatic
approach @jk.

Just as in unitary synthesis, circuit decompositions more efficient than the
general analytical expressions can be obtained
on a case-by-case basis using search and optimisation.
The pendant to the provably optimal decompositions of unitaries obtained through
brute force search @Amy2013 also exists for Clifford circuits @Kliuchnikov2013.
Due to the more efficient representation and smaller search space, all optimal
Clifford circuits could be found up to 6 qubits.
Using modern SAT solvers, optimal clifford synthesis has recently been pushed
much further, with known optimal circuits beyond 20 qubits @Peham2023 @Schneider2023.

Heuristic optimisation approaches have also been shown to be effective on 
Clifford optimisation @Bravyi_2021 @Fagan2018 and scale to larger systems.
For Clifford computations on devices with restricted connectivity, an
architecture-aware synthesis method was proposed in @Winderl2024.

#### Diagrammatic representations
Quantum computer science and quantum mechanics in general
have a rich history in diagrammatic
representations @Feynman1949 @Coecke2017 @Backens2019.
These have allowed to picture complex physical processes as intuitive operations
in a graphical language and have---as a nice side-effect---led to a plethoral of
state of the art quantum circuit optimisation techniques!

A diagrammatic representation of a quantum computation is obtained
by lifting the gates 
that form a quantum circuit into the nodes of a more abstract graph-based 
graphical calculus.
The most commonly used flavour of calculus used for circuit optimisation
is the ZX calculus @Coecke2008 @Coecke2012 @vandewetering2020 @Yeung2024.

By breaking up multi-qubit gates into several non-unitary tensors, the ZX
calculus and related variants @Roy2011 @Backens2019 @Felice2023
expose some of the
symmetry and structure of quantum physics in the form of simple and intuitive
 graphical rules.
This has enabled the discovery of many quantum optimisation
techniques (e.g @Duncan2019 @Wetering2024),
some of which we have already reviewed
@Huang2024 @Gogioso2022 @Degriend2020 @Cowtan2019 @Cowtan2020.
This selection of papers is not _quite_ exhaustive[^arb]---there are currently
over 300 hundred papers on the topic as indexed by
[zxcalculus.com](https://zxcalculus.com/).
[^arb]: and arbitrary

Aside from being an invaluable tool for research and compiler pass design,
a major contribution of these diagrammatic representations
is the introduction of graph rewriting systems @Ehrig1973 @Rozenberg1997 @Koenig2018
to quantum computing.
Rewriting systems were first introduced on strings @Dershowitz1990, then
generalised to trees and terms @Bezem2003.

From a formal point of view, rewrite systems endow quantum compilation with
well-defined semantics and strong theoretical foundations @Lack2005.
Just as importantly (or more so), they establish a practical, purely
declarative framework in which compiler transformations can be defined, debugged
and analysed.
System properties such as completeness, confluence and termination
of rewriting systems @Verma1995 @Backens2014 @Biamonte2023
can be analytically studied, proven and then be relied on by compilers
for soundness and performance guarantees @Duncan2020 @Kissinger2020 @Sivarajah2020 @Borgna2023.

However, there is an apparent tension in the integration of
diagrammatic calculi into compilers
between the search for abstract primitives admitting a simple rewriting
logic  @Heurtel2024 @Booth2024 @Felice2023a @Carette2023
and the requirement to capture all the expressivity and constraints of
hardware targets.

An example of this is the ZX circuit extraction problem @Quanz2024 @Backens2021&#x200B;:
it is in general hard to recover an executable quantum circuit from a ZX
diagram as the latter is strictly more general and primitives cannot be mapped
one-to-one.
Similarly, while simple quantum-classical hybrid computations can be expressed
using extensions of ZX @Borgna2021 @Carette2021 @KoziellPipe2024, it will
never be possible to capture the full breadth and generality of classical CPU
instruction sets in a practical and extensible (and algebraically satisfying) way.

#### Reversible classical circuits
There are many more representations, that have either been taken over from
classical compiler optimsations or were developed for specific purposes.
The last we will mention is reversible circuits synthesis, a
fully classical circuit design problem
which can draw from results of decades of research.
From a quantum perspective, reversible classical circuits correspond
to unitaries (and more generally,
isometries) that send basis states to basis states---and thus do not
introduce any entanglement @Shende2002.
We highlight a selection of the more recent work in the field and
refer the reader to the
much more complete, albeit ageing, survey of @Saeedi2013.

Up to 4 (qu)bits, all reversible circuits and their optimal synthesis can
be generated by brute force @Li2014.
Viewing reversible circuits as a permutation of all $2^n$ bitstrings, 
Susam et al. pre-compute optimal circuits only
for swaps of two bitstrings (transpositions).
These can then be used as part of a standard selection sort to synthesise arbitrary permutations.
The number of such permutations scales much more favourably compared to
arbitrary permutation, allowing for fast circuit synthesis up to 20+ (qu)bits
in a fraction of a second, with good performance.

Truth-table or matrix representations of reversible circuits suffer from the
same exponential scaling as unitaries.
To address these, other representations that have been used include
exclusive sums of product terms (ESOP) @Fazel2007 @Bandyopadhyay2014, 
positive polarity Reed-Müller codes (PPRM) @Jegier2017 and
decision diagrams @Stojkovic2019 @Wille2010 @Pang2011.

The quantum framework is strictly more general than the classical regime
the problem was originally studied in.
This affords additional freedom for decomposition schemes, such as decompositions
of CCX gates on 3 qubits into single and two-qubit gates @Shende2008.
Various optimised decompositions for sequences of Toffoli gates
have also been similarly
developed @Scott2008 @Arabzadeh2010 @Datta2013 @Rahman2014 @Datta2015 @Arpita2015 @Abdessaied2016 @Gado2021.
Mohammadi and Eshghi introduced 4-valued truth tables to extend classical
circuit synthesis to include $\sqrt{X}$ (also known as V) gates @Mohammadi2008.
References @Soeken2012 as well as @Rahman2012 incorporated controlled-V gates
into template matching strategies and showed significant improvements
in synthesised gate count .
Finally, @Maslov2016 proposed decomposing Toffolis only up to relative
phase, introducing  a lot of freedom in the quantum decompositions
that are required compared to the traditional
classical decompositions.

---

In summary, our exploration of various quantum computation representations and 
synthesis techniques highlights both their remarkable strengths and inherent
limitations. On the positive side, a variety of scalable representations---such as
phase polynomials, Pauli gadgets, Clifford tableaus, diagrammatic calculi, and
reversible circuits---have been developed to abstract computations and
enable highly tailored optimisation methods. These approaches leverage the
unique structure and symmetries of quantum computations, achieving significant 
reductions in circuit size, depth, and hardware-specific overheads. Techniques
such as phase polynomial synthesis and Clifford tableau representations
are widely applicable and are a cornerstore of modern quantum
compilers @Amy2019 @Griend2025.
Meanwhile, diagrammatic calculi, such as the ZX calculus, provide a flexible
and theoretically robust framework for optimisations, often revealing
simplifications invisible in the traditional gate-based model.

However, this specialisation comes with trade-offs. These representations and
techniques target purely unitary computations and rely on strict assumptions
about the primitives they support. While efficient for the scenarios they
were designed for, these methods can struggle to incorporate new primitives and
are hard to adapt to hybrid programs. 
In order to develop more versatile and adaptable compilation platforms,
a foundation built on more general purpose tooling is required.


### Resorting to peephole optimisations

We have so far considered quantum-specific compiler optimisations, which can
attain near-optimal results (unitary synthesis) as well as perform scalable
non-local program resynthesis and optimisation (phase polynomials,
Clifford tableaus etc.).
We have however seen that these techniques struggle to generalise to hybrid
programs and require custom program representations, which carry with them
a high implementation burden for compilers.
In contrast, peephole optimisations @McKeeman1965 @Tanenbaum1982 are a
general purpose optimisation technique
as old as compilation itself that act directly on the program IR
and come with wide support within classical compiler
ecosystems @Menendez2017 @Lopes2015 @Riddle2021.

Peephole optimisations are local transformations of the IR, based on the
heuristic that local optimisations to the program will produce a well-optimised
result overall.
The principle is very simple:
a sliding window traverses the IR and considers a few operations at a time.
Once established which peeophole optimisations would apply on the current
window, one optimisation is selected and applied.
Finally, the result obtained is used to replace
the operations within the window.
We refer to classical compiler literature, e.g. @Muchnick2007, for more details.

Quantum compilers adopted peephole-style optimisations from the
beginning @Cheung2007 @Steiger_2018 @Sivarajah2020.
In fact, they encompass some of the most common optimisations in quantum
computing, including the Euler Angle reduction @Chatzisavvas2009,
the two-qubit KAK decomposition @Tucci2005 @Cross2019
and all gate set rebases @autorebase.
A quantum-specific flavour of peephole optimisation,
template matching @Maslov2008 @Iten2022, achieved
state of the art results for Clifford circuit optimisation @Bravyi2021a.
Recently, quantum peephole optimisations were also proposed that leverage
provable state information to perform contextual optimisations @Liu2021,
similar to strength reduction and optimisation with preconditions in classical
compilation @Lopes2015.

There have further been advances in the theoretical underpinnings of peephole optimisations
for quantum optimisation: Clement et al recently presented the first
complete equational theories for quantum circuit @Clement2023 @Clement2024,
proving that for any two equivalent quantum circuits there is a sequence
of local transformations that rewrite one into the other.
In other words, it is in principle possible to achieve optimal circuit compilation
using peephole transformations only.

Peephole optimisation is fast, general and scalable. However, its performance
is heavily dependent on well-designed heuristics and may vary widely across
input programs.
This is often refered to in compiler research as the phase ordering
problem @Click1995&#x200B;: 
whenever a compiler can rewrite code in more than one way, it must
decide which transformations should be applied and in which order, to obtain
the most optimised result @Whitfield1997 @Liang2023.
This issue is also a key challenge within quantum compilation:
unitary sythesis tools can sometimes outperform current, mostly peephole-based
compilers @Sivarajah2020
by up to 50%[^cost] @Wu2020.
[^cost]: at the cost of many hours of compute, of course.

--- 

We come away from our review having explored two competing worlds.
On the one hand, using custom quantum-specific program representations,
it is possible to capture quantum semantics precisely and enable global program
transformations.
On the other hand, one can rely on standard compiler techniques and its dedicated
mature infrastructure to drive scalable and extensible quantum optimisation
techniques.
So far, the latter has always come at the cost of some performance, making
tailored solutions the preferred approach.

We argue that going forward, however, the scaling and engineering challenges
that will come with building out custom compiler tooling will prove difficult,
given the large variations in quantum architectures and the unavoidable
integration with classical hardware such as CPUs, GPUs and FPGAs.
The remainder of this thesis presents contributions that aim to close the gap
in performance, so as to enable state of the art compilation of large scale,
hybrid quantum classical programs based on standardised IR formats.

Before proceeding with that, however, we propose one more section reviewing
past work. It focuses on two advanced classical compilation techniques that
form the foundation of the quantum compiler architecture we will propose
in {{< reflink "/04_rewriting" >}}.