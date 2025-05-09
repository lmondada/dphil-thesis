+++
title = "Foundations of quantum computing"
weight = 1
layout = "section"
slug = "sec:basics"
+++

The most widespread computational model in quantum computing---and arguably its
simplest---is built on the qubit abstraction. As its name suggests, it is the
quantum analogue of the classical bit, i.e., a value that can take the values
`0` or `1`.

We will stick to our promise of not delving into the details of the physical
realisations of qubits in real-world architectures. Nonetheless, it is important
to note one fundamental difference with classical systems. Classical bit values
(the famous `0`s and `1`s of our computers) are typically encoded using two
voltages; another way of saying this is that bit values, and hence data,
correspond to electrical currents in the wires[^interconnect] of a chip. Gates,
i.e. the lowest level of operations that can be applied to bits, then correspond
to barriers that let the electrical current flow through to outgoing wires, or
block it.

[^interconnect]:
    In the case of integrated circuits and printed circuits boards, the _wires_
    we refer to here would be called "interconnects" or "traces".

We can thus picture a classical gate as a black box with `n` input wires going
into the box and `m` output wires leaving it. For any combination of on and off
voltages on the input wires, the box will turn on some of the output wires. The
vital point to take away from this classical state of affairs is that we can
think of input and output bits (i.e. the input and output wires) as physically
distinct objects (the wires).

This is not the case in implementations of qubits. Unlike their classical
counterparts, quantum gates must be understood as operations that _modify_---or
"mutate", to borrow a term from programming languages---the physical qubits
themselves. An input qubit to a gate is thus submitted to physical interactions
that change its internal state. After the gate execution is completed, the
qubits that held the input states now contain the operation's output.

This has several profound implications for quantum computing. First and
foremost, every quantum gate must have the same number of inputs as outputs.
Most iconic classical gates (AND, OR, XOR, etc.) are thus impossible to
implement on a quantum computer without some adjustments[^not]. This also means
that the number of qubits must remain unchanged throughout the computation. A
computation that starts with `n` qubits must also end in `n` qubits – and have
`n` qubits at every point throughout the computation.

[^not]:
    The NOT gate is the notable exception to this. It is often found in quantum
    programs and called X.

At this point, taking the preservation of qubits just described seriously, we
should be asking how a quantum computation can even come to be at all, given
that no qubit can be created out of thin air. In our attempt to remain
blissfully ignorant of physical realities, we suggest adopting the following
abstracted mental model of qubits: qubits can neither be created nor
deleted[^del], they simply _i)_ exist at all times, and _ii)_ can be reset to
the 0 state.

For our convenience, we can ignore qubits that are unimportant to us. If all we
need are `n` qubits, then we will limit our considerations to these and pretend
none other exists. Pushing further our myopic focus on qubits with a direct
utility, we can also adjust the window of qubits of interest as we progress
through the computation. If, for instance, a new qubit becomes useful halfway
through our program execution, we can enlarge the set of qubits we are keeping
track of and refer to this as "creating" a qubit. Conversely, qubits often
become irrelevant, in which case we move them outside of our field of
consideration and say that the qubits were discarded.

[^del]:
    This is true physically: the carriers of quantum information, typically
    atoms or photons, live forever in the absence of interactions with their
    environment. However, we would be seriously deluding ourselves if we
    believed that the control systems we use to manipulate and keep these
    particles trapped could do so for any significant amount of time. Instead,
    experimentalists must constantly devise creative ways to stop the qubits
    from escaping or interacting with their surroundings (and destroying
    themselves in the process).

A final consequence of mutating qubits that we will highlight is that once a
gate has been applied, the input states to the gate no longer exist! In other
words, any state that we reach throughout our execution can only be used at most
once. Here, your classical intuition might kick in:

<!-- prettier-ignore-start -->
{{% hint info %}}
Let us just maintain
a copy of the original state before modifying it!
{{% /hint %}}
<!-- prettier-ignore-end -->

This would allow us to do more than one computation from a temporary value.
However, copying is a big NO in quantum computing. It is a profound restriction
(or property, depending on your point of view) with deep roots in the physics of
quantum mechanics. This principle, the no-cloning theorem, is one of three
fundamental properties of quantum physics that quantum computing builds upon.

### The physical constraints of quantum computation

#### No-cloning theorem

The no-cloning principle @Wootters1982 provides a formal foundation for the
vague statement _"qubits live forever"_ we made earlier. It is a fundamental
tenet of quantum information, deserving a more rigorous treatment than we are
giving it here. We recommend that the curious reader refers themselves to more
respectful references such as @Nielsen2016.

**No-cloning theorem:** it is impossible to copy an arbitrary unknown state onto
another (possibly known) qubit, or to copy a (possibly known) qubit to a qubit
with unknown arbitrary state.

If we use $\ket{\psi}$ to denote an arbitrary state and $\ket{0}$ to denote a
known state, the principle can be restated as: there are no quantum computations
mapping $\ket{\psi}\ket{0} \mapsto \ket{\psi}\ket{\psi}$, nor
$\ket{\psi}\ket{0} \mapsto \ket{0}\ket{0}$. The consequences of this are
profound.

A consequence of the first half is what we alluded to in the previous section:
any qubit states can only be used once in a computation. This statement also
justifies why every quantum gate implementation, no matter the hardware
specifics, will mutate its input qubits to produce the output states.

The second half of the statement is often referred to as the "no delete"
theorem. Indeed, if we view $\ket{\psi}$ as a state encoding some data, we can
interpret it as some amount of information. The state $\ket{0}$, on the other
hand, is a fixed state and thus cannot store any information. From the
perspective of information theory, the map
$\ket{\psi}\ket{0} \mapsto \ket{0}\ket{0}$ thus destroys information: it turns
an information storing left-hand side into a product of $\ket{0}$ states, devoid
of any information.

We can also revisit the first map
$\ket{\psi}\ket{0} \mapsto \ket{\psi}\ket{\psi}$ and understand it from an
information theoretic perspective as an attempt to create information out of
thin air! Using this interpretation, the no-cloning theorem is thus the
statement that quantum information is a preserved quantity in quantum
computations: its amount will never increase or decrease.

#### Reversibility

The fact that the amount of quantum information can never increase by
transforming quantum states matches our intuition: if no new information is
added from outside the system, then the total information encoded should not be
increasing. Why, however, is it impossible to erase some information and thus
reduce its total? The answer is reversibility: it is another foundation of
quantum physics that every quantum of operation must be undoable, i.e. a
computation must have an inverse operation that recovers the input when applied
to the output.

If a quantum operation were thus to erase any information, then an inverse
operation would exist that creates information from nothing! The two halves of
the no-cloning theorem, as we presented it, thus state the same principle once
we consider that every operation must be reversible.

#### Universality

<!-- prettier-ignore -->
Finally, a third distinguishing property of quantum computation is how
arbitrarily large computations can be generated from single-qubit gates and
pairwise entangling interactions between qubits (two-qubit gates) @Barenco_1995.
It is furthermore the case that the choice of a _fixed_ two-qubit gate, along
with single-qubit gates, is sufficient to generate any arbitrary quantum
computation. We call a set of gates that can be used to construct any arbitrary
quantum computation a **universal gate set**.

This is a boon for hardware design, as manipulating single-qubit systems is
often much more manageable than controlling physical interactions between
multiple entities. This decomposition into single-qubit and (a fixed) two-qubit
gates means that the architecture _i)_ does not need to support interactions
between $n > 2$ qubits, and _ii)_ can be specialised and hand-tuned to execute
the two-qubit interaction of choice as faithfully as possible. Having a
two-qubit gate as the entangling operation is not the only choice. Some
architectures, such as neutral atoms, choose instead to replace it with a global
entangling operation that applies to many qubits simultaneously @Evered2023,
resulting in a universal gate set that is more convenient to implement
experimentally in their system.

Gate set universality can be generalised further to approximate universality,
which is at the centre of the development of error-correcting codes. Indeed, any
quantum computations can be approximated to arbitrary precision using only
discrete finite sets of one and two-qubit gates @Kitaev2002 @Dawson_2006. This
represents a significant simplification for error correction, as it removes the
need for continuously parametrised gates and discretises the problem space.

### Leveraging quantum properties for compilation

We have introduced the universality, reversibility and no-cloning properties of
quantum computations for a reason: these laws of physics that govern quantum
computations and are absent from classical computer science are an excellent
foundation for developing quantum-specific computation optimisations and
compilation techniques in general.

As we have just discussed, the wide variety of universal gate sets are degrees
of freedom that the compiler can use. Using universality to translate
computations between universal gate sets, enabling programmers to seamlessly
target different hardware, is one of quantum compiler's first and most
fundamental functions @Sivarajah2020.

Reversibility is also a source of flexibility when expressing quantum programs.
Suppose the user wants to execute an operation $A$ but it is more convenient, or
the hardware is only capable of executing a different gate $B$. Then, using the
inverse $B^{-1}$ of $B$, it is always possible to rewrite the program as

{{% figure src="svg/abbinv.svg" width="70%" nobg="true" %}}

where these diagrams should be read as operations to be executed from left to
right. This is nothing but the mathematical trick of multiplying the left-hand
side with the identity operation expressed as $B \circ B^{-1}$[^matmul].

Now, of course, this rewrite is only sensible if the operation $B^{-1} \circ A$
is reasonably cheap to perform. There are plenty of instances where this is
indeed the case. Morally, the quantum compiler always has the freedom to execute
any quantum operation---at the risk of producing very inefficient code---given
that reversibility always guarantees that the operation can be reversed and the
competition undone whenever necessary.

[^matmul]:
    The $\circ$ denotes the composition of functions, so unlike the
    left-to-right diagram, it must be read from right to left.

Finally, no-cloning is a very useful guarantee that the compiler can use to
simplify reasoning about computations[^noalias]. In
{{% reflink "chap:matching" %}} we will see that it dramatically simplifies
pattern matching, which helps identify all possible optimisations quickly. More
generally, no-cloning restricts the set of programs that the compiler must
consider, resulting in elegant graph transformation semantics---a topic we
explore in {{% reflink "chap:compiler" %}}.

[^noalias]:
    In particular, no-cloning resolves the problem of
    [aliasing](https://blog.regehr.org/archives/1307) once and for all!

### The quantum circuit representation

We could not conclude our overview of the basics of quantum computing without
mentioning the quantum circuit, a representation of quantum computation
ubiquitous in the field. With the understanding that we have gained in this
section, the two building blocks of the circuit model and the conventions around
their graphical representation should be of no surprise to the reader:

1. Qubits are represented by straight, horizontal lines. Their evolution through
   time can be followed along the line from left to right: At the leftmost point
   on the line, the qubit is in its input state; when the qubit reaches its
   rightmost point, operations have mutated it into the output state of the
   circuit.
2. Gates on qubits are boxes placed vertically across one or multiple qubit
   lines. The qubits it is on represents the set that the gate may act on (and
   mutate), whereas the left-to-right ordering of the gates reflects their
   ordering in time.

A simple circuit composed of two qubits and three gates $A$, $B$ and $C$ could
for instance look like this

{{% figure src="svg/abccirc.svg" width="30%" nobg="true" %}}

The previous diagram was in fact also a circuit, in which each arrow pointing to
the right was a segment of a qubit line. In this case, $A$ would be executed
before $B$ and $C$; $A$ would act on both qubits, whereas $B$ and $C$ would only
modify the first and second qubits, respectively. Note that there is no ordering
specified between $B$ and $C$: because they act on disjoint sets of qubits,
their relative ordering makes no difference. It is thus common to display them
as acting at the same time. We could have equivalently chosen to draw them as:

{{% figure src="svg/abcoracb.svg" width="90%" nobg="true" %}}

All these circuits represent the same computation.

Certain quantum gates are particularly useful and appear very regularly in
practice. These have standard names that are widely used in the field. The most
common single qubit gates are arguably the Hadamard, represented in circuits by
a $H$ box, and the $X$, $Y$ and $Z$-axis rotations, drawn as $R_x(\theta)$,
$R_y(\theta)$ and $R_z(\theta)$ boxes respectively. Note that rotation gates are
parametrised by an angle $0 \leqslant \theta < 4\pi$ that must be specified to
execute the rotation.

There are also commonly used multi-qubit gates. For these, it becomes slightly
awkward to draw them as boxes, as they may act on qubits that are not drawn next
to each other in the circuit[^drawit] or might be applied to qubits in a
specified order. As a solution, common gates were given representations that do
not spell out their name but mark which qubit they are acting on and in what
order. Here are the representations of three of the most famous ones, in order:
the $\mathit{CX}$ (also known as CNOT) gate, the $\mathit{CZ}$ and the
$\mathit{CCX}$ (also known as the three-qubit Toffoli):

[^drawit]:
    This becomes immediately apparent if you attempt to draw a gate that should
    act on the first and third qubit line of a circuit, but leave the second one
    untouched.

{{% figure src="svg/cx-cz-ccx.svg" width="30%" nobg="true" %}}

You will probably notice that there seems to be a system to this graphical
notation. There is, but unfortunately, explaining it would require us to discuss
Pauli matrices and commutation relations and quickly lead us astray. The
references in {{% reflink "sec:litt" %}} are a good starting point for further
reading.
