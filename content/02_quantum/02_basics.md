+++
title = "Foundations of Quantum Computing"
weight = 2
+++

The most widespread computational model in quantum computing
-- and arguably its simplest -- is built on the qubit abstraction.
As its name suggests, it is the quantum analogue of the classical bit
i.e. a value that can take the values `0` or `1`.

Whilst we do not want to delve to deeply into the details of the physical
realisations of qubits in real world architectures, it is important to note
one fundamental difference with classical systems.
Classical bit values (the famous `0`s and `1`s of our computers) are typically
encoded using two voltages; another way of saying this is that bit values, and
hence data, correspond to electrical currents on the chip.
Gates, i.e. the lowest level of operations that can be applied to bits,
then correspond to barriers that either let the electrical current flow through,
or block it.
Generalising slightly, we can hence picture a classical gate as a box with
`n` input wires going into the box and `m` output wires leaving it.
For any combination of on and off voltages on the input wires,
the box will turn on some of the output wires. The important points to take away
from this classical state of affairs is that we can think of input and output
bits (i.e. the input and output wires) as physically distinct objects (the wires).

This is not the case in implementations of qubits.
Unlike their classical counterparts, quantum gates must be understood as
operations that modify -- or "mutate", to borrow a term from programming languages --
the physical qubits themselves.
An input qubit to a gate is thus submitted to physical interactions that change
its internal state.
After the gate execution is completed, the qubits that held the input states
now contain the output of the operation.

This has several profound implications for quantum computing.
First and foremost, every quantum gate must have the same number of inputs as outputs.
Most of the iconic classical gates (AND, OR, XOR etc.) are thus impossible
to implement on a quantum computer without some adjustments[^not].
This also means that the number of qubits must remain unchanged throughout the
computation. A computation that starts with `n` qubits must also end in `n`
qubits – and have `n` qubits at every point throughout the computation.

[^not]: The NOT gate is the notable exception to this. It is often found in
quantum programs and called X.

At this point, taking the preservation of qubits just described seriously,
we should justifiably be asking how a quantum computation can even come to be
at all, given that no qubit can be created out of thin air.
In keeping with our promise to remain blissfully ignorant of physical realities,
we suggest to adopt the following abstracted mental model of qubits. Qubits
can neither be created nor deleted[^del]; they simply exist at all times.
For our convenience however, we can choose to ignore qubits that are of no
importance to us.
If all we need are `n` qubits, then will limit our considerations to these and
pretend none other exist.
Pushing further our myopic focus on qubits with a direct utility, we can
also adjust the window of qubits of interest as we progress through the computation.
If for instance a new qubit becomes useful halfway through our program execution,
we can enlarge the set of qubits we are keeping track of and refer to this as
"creating" a qubit.
Conversely, it often happens that qubits become irrelevant, in which case we 
drop them and say that the qubits were discarded.

[^del]: This is indeed true physically: the carriers of quantum information,
typically atoms of protons, live forever in the absence of interactions
with their environment.
However we would be seriously deluding ourselves if we believed that the control
systems we use to manipulate and keep these particles trapped can do so for
any significant amount of time.
Instead, experimentalists have to constantly come up with creative ways to stop
the qubits from escaping or interacting with their surroundings
(and destroying themselves in the process). 

A final consequence of mutating qubits that we will highlight is that once a
gate has been applied, the input states to the gate no longer exist!
In other words, any state that we reach throughout our execution can only be
used at most once.
Here, your classical intuition might kick in: can't we just make sure we maintain
a copy of the original state before modifying it?
This would allow us to do more than one computation from a temporary value.

No, big no no!
This is a profound restriction (or property, depending on your point of view)
with deep roots in the physics of quantum mechanics.
This principle, known as the no-cloning theorem, is closely linked to many of
the observations and properties that we have described so far.

### No-cloning theorem

We are now entering the (short) section of the thesis where we discuss some
ideas from quantum information theory -- so depending on your disposition, 
either indulge yourself, or bear with me for a moment.
The no-cloning theorem justifies and provides some semblance of a formalism to
many of the ideas and observations that we have introduced so far without
much rigour.

**No-cloning theorem:** it is impossible to copy an arbitrary unknown state onto
another (possibly known) qubit, or to copy a (possibly known) qubit to a qubit
 with unknown arbitrary state.

 Using $\ket{\psi}$ to denote an arbitrary state and $\ket{0}$ to denote a known
 state, the principle can be restated as: there are no quantum computations
 mapping $\ket{\psi}\ket{0} \mapsto \ket{\psi}\ket{\psi}$, nor
$\ket{\psi}\ket{0} \mapsto \ket{0}\ket{0}$.
The consequences of this are profound.

A consequence of the first half is what we alluded to in the previous section:
any qubit states can only be used once in a computation.
This statement is also what allows to justify why every quantum gate
implementation, no matter the hardware specifics, will by necessity mutate its
input qubits to produce the output states.

The second half of the statement is often also referred to as to "no delete" theorem.
Indeed, if we view $\ket{\psi}$ as a state encoding some data, we can interpret
it as some amount of information.
The state $\ket{0}$, on the other hand, is a fixed state, and thus cannot store
any amount of information. From the perspective of information theory, the map
$\ket{\psi}\ket{0} \mapsto \ket{0}\ket{0}$ thus destroys information: it turns
an information storing left hand side into a product of $\ket{0}$ states, devoid
of any information.

We can also revisit the first map $\ket{\psi}\ket{0} \mapsto \ket{\psi}\ket{\psi}$
and understand it from an information theoretic perspective
as an attempt to create information out of thin air!
Using this interpretation, the no-cloning theorem is thus the statement
that quantum information is a preserved quantity in quantum computations:
its amount will never increase, nor will it ever decrease.

### Reversibility
That the amount of quantum information can never increase by
transforming quantum states matches our intuition:
if no new information is added from outside the system,
then the total information that is encoded should not be increasing.
Why however is it impossible to erase some information and thus reduce
the total amount of it?
The answer is reversibility: it is another tenant of quantum physics that
every quantum of operation must be undoable, i.e. it must have an
inverse operation that recovers the input when applied to the output.
If a quantum operation were thus to erase any information, then there
would exist an inverse operation that creates information from nothing!
The two halves of the no-cloning theorem as we presented it thus state
the same principle once we consider that every operation must be reversible.

---

We have just spent a long while discussing reversibility and no-cloning.
There is reason for it: these laws of physics
that govern quantum computations and are absent from classical computer science
turn out to be a great boon for quantum optimisation and compilation in general.
 reversibility is the source of a lot of flexibility when expressing quantum programs.

Reversibility is the source of a lot of flexibility when expressing quantum programs.
 Suppose the user wants to execute an operation _A_ but it is more convenient,
or the hardware is only capable of, executing a different gate _B_.
Then using the inverse {{< katex >}}B^{-1}{{< /katex >}} of _B_, it is always possible to rewrite the program as

{{< mermaid >}}
graph LR
  in --> G --> out
  in --> H --> Hinv --> G --> out
{{< /mermaid >}}

where these diagrams should be read as operations to be executed from left
to right.
This is nothing but the mathematical trick of multiplying the right
hand side with the identity operation expressed as
{{< katex >}}H^{-1} \cdot H{{< /katex >}}.

Now of course this rewrite is only sensible if the operation 
{{< katex >}}G \circ H^{-1} {{< /katex >}}
is reasonably cheap to perform.
There are plenty of instances where this is indeed the case.
Morally, the quantum compiler always has the freedom to execute
any quantum operation -– at the risk of course of producing very
inefficient code –- given that reversibility always guarantees that
the operation can be reversed and the competition undone whenever necessary.

No-cloning is also a very useful guarantee that the compiler can make use of.
In chapter X we will see that it greatly simplifies pattern matching,
useful to quickly identify all possible optimisations.
More generally, no-cloning restricts the set of programs that the compiler
must consider, resulting in simply compiler logic and better performance.
 we will see examples of this in chapter 3. To do: add some state of the art.

Universality?

### The quantum circuit representation

s