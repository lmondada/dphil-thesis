+++
title = "Rise of hybrid quantum-classical computation"
template = "section.html"
weight = 3
+++

### Quantum measurements

Until now, we have skipped over a crucial part of the quantum computation 
process: the role of quantum measurements.
Quantum data, in isolation, is inherently inaccessible to humans:
we cannot consume it!
A result from a quantum computation is only of value if we can probe it
and get some readout value that we can display to the user or return to
whomever launched the quantum computation.
This is where the famous Schrödinger's cat thought experiment
of quantum mechanics comes in:
what data is within the qubits cannot be known until a measurement is performed.
This act of observation will transform the quantum data: as a result of
looking inside the proverbial box, the cat will either be killed or remain
alive.

We thus need to add the measurement operation as a special case to our computer
scientist's model of quantum computing.
Unlike purely quantum operations, measurements inherently involve interaction
with the environment to produce a readout.
Consequently, the no-delete and reversibility principles
discussed earlier do not apply.
Indeed, measurement is a lossy (and therefore irreversible) operation that
project the quantum state into one of a small subset of classical states.
Which state the quantum state is projected into is non-deterministic.
If one has access to an infinite supply of the same quantum state, then
the full state can be eventually reconstructed by repeating measurements and
analysing the distribution of outcomes[^tomography].
Given no-cloning, however, this is unlikely to be the case, and so the full
quantum result is hardly ever known. We must instead rely on well-designed
measurement schemes to extract useful information from the quantum result.

[^tomography]: This is known as _state tomography_. You will need to perform
measurements in more than one basis, i.e. different choices of classical
states to project to.

We model measurement as an operation that takes one qubit and outputs one
purely classical bit[^disappear].
In the circuit formalism, measurements are often implicitly added at the end
of every qubit. If we wish to make them explicit or add them elsewhere in the
circuit, we must introduce a graphical representation for the classical bit of
data that is produced by the measurement.
The field has adopted the double wire for this (SVG db-wire), even though
a "half" wire would arguably have been more appropriate to reflect the reduced
information density relative to quantum wires.
Ladies and gentlemen, I present to you, the measurement box:

[^disappear]: Where did the qubit go? It turns out that all the information
that is contained in a qubit post measurement is also contained in the classical
bit of output data---it is therefore redundant and renders the qubit useless.
In our model wee therefore bundle measurement and qubit discard into
one operation.

{{< qviz >}}
{
    "qubits": [{ "id": 0, "numChildren": 1 }],
    "operations": [
        {
            "gate": "Measure",
            "isMeasurement": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "type": 1, "qId": 0, "cId": 0 }]
        }
    ]
}
{{< /qviz >}}

### Measurements as first class citizens

It is very tempting to our feeble classical brains---and admittedly
we just did it ourselves in the previous paragraphs---to view measurements 
as merely a readout operation; an auxiliary operation that we are forced
to perform at the end of a computation for operative reasons.
This could not be further from the truth!
In many ways, measurements are just as powerful tools as any other quantum
operation---if not more so!

One eye-opening perspective on this is the field of _measurement-based
quantum computing_ (MBQC).
Raussendorf and Briegel showed indeed that arbitrary quantum computations can
be reproduced in the MBQC framework using only some resource quantum states
that can be prepared ahead of time and measurements!
In other words, given entangled qubits, measurements are all you need to perform
quantum operations.

We will not explore MBQC further in this chapter
(nor in this thesis, for that matter)---rather we will use this
as a motivation to explore further what we can achieve with measurements.
We have so far spared you from any mathematical alphabet soup. 
As we start discussing more concrete constructions of quantum computations,
some basic linear algebra and conventions around notation will
become unavoidable.

{{% hint info %}}
**Dirac formalism**. Quantum states are nearly unanimously
written using _kets_: instead of referring to a quantum state as
$\psi$, we write it wrapped in special brackets as $\ket{\psi}$.
This notation is also used when referring to the 0 and 1 states of qubits,
written $\ket{0}$ and $\ket{1}$.

Several states can be joined and considered together, as one overall state.
This is expressed using the tensor $\otimes$ symbol:
$\ket{\psi_1} \otimes \ket{\psi_2}$ is the joint system of 
$\ket{\psi_1}$ and $\ket{\psi_2}$.
When the states in question are all explicitly qubit states,
we use the shorthand binary notation
$\ket{0} \otimes \ket{1} \otimes \ket{0} = \ket{010}$.

We will introduce more notation along the way.
{{% /hint %}}

With this out of the way, let us look in more details at the first smart use 
of measurements: the block-encoding technique.
Consider the following scenario: you would like to perform an operation
$A$ on an arbitrary
quantum state $\ket{\psi}$.
Now, there are unfortunately many cases where implementing $A$
as a quantum circuit made of primitive gates that can be executed on hardware
is very expensive[^impossible].
[^impossible]: or outright impossible, in cases where $A$ is not a unitary
linear operation, for example.

However, what we can always do is express $A$
as a matrix of dimensions
$2^n \times 2^n$, where $n$ is the number of qubits
in the state $\ket{\psi}$.
Then, there is a neat trick that we can sometimes apply: instead of trying
to execute $A$, we enlarge the matrix to a bigger $\tilde{A}$:
$$\tilde{A} = \begin{pmatrix}A & G_1\\ G_2 & G_3 \end{pmatrix}$$
where $G_1, G_2$ and $G_3$ are garbage matrices that we do not care about, but
should combine into a matrix $\tilde{A}$ that we know how to execute
on a quantum computer.
Quantum computations must be matrices with a row and column number that is a 
power of two; so at a minimum, $\tilde{A}$ must be of size
$2^{n+1} \times 2^{n+1}$, i.e. be a computation on $n + 1$ qubits.
We thus need to add a qubit to our $\ket\psi$ state to be able to pass it to
our new operation.
Such qubits that are added temporarily to facilitate a computation are a
recurring feature in quantum computing and have thus earned themselves a
name---ancilla qubits.

Let us take a look at the quantum states that result from executing $\tilde{A}$.
If we add to $\ket \psi$ a $\ket 0$ ancilla state, our quantum operation
acts as[^how]
$$\tilde{A} (\ket 0 \otimes \ket \psi) = \ket 0 \otimes A \ket \psi + \ket 1 \otimes G_1 \ket \psi.$$
The expression $A \ket \psi$ means the operation $A$ applied to
$\ket \psi$---exactly the output state we are seeking.
We can also input the ancilla qubit in state $\ket 1$, but what we then
get is pure garbage:
$$\tilde{A} (\ket 1 \otimes \ket \psi) = \ket 0 \otimes G_2 \ket \psi + \ket 1 \otimes G_3 \ket \psi.$$
So $\ket 0 \otimes \ket \psi$ is definitely the input state we are more
interested in.

[^how]: This is obtained by a simple matrix multiplication. The vector
representation of the quantum state $\ket 0 \otimes \psi$ is obtained using
the Kronecker product. You can also just trust me that this works out
this way :)

How can we recover $A$ from (*)? This is precisely what measurements do!
When quantum states are expressed as sum of states, the terms of the sum
form the possible measurement outcomes[^orthogonal].
If we only measure a subset of the qubits, then the term corresponding to that
measurement is isolated and all other terms disappear.
Hence, if we measure the first qubit (that we introduced ourselves) in the
zero state, then the remaining $n$ qubits will be precisely in the desired
state $A \ket \psi$. Success!

[^orthogonal]: This is simplifying slightly.
There is a necessary condition for this to be a valid measurement:
the states in the sum must form a measurement basis, i.e.
they must be orthogonal. This is satisfied here.

Using this "term isolating" property of measurements, known as state collapse,
we can thus effect computations that would have been otherwise difficult or
impossible to perform.
There is however one important wrinkle that we cannot forget about: measurements
are non-deterministic!
We cannot assume that all measurements of the ancilla qubit will return the 
zero state. When $\ket 1$ is measured, the computation has failed and
the execution must be aborted and restarted.
How often the block-encoding protocol that we have presented fails depends
on the details of $A$ and the choices of $G_1, G_2$ and $G_3$ and is the main
disadvantage of an otherwise very powerful quantum technique.

We will now explore two strategies to deal with "fails" in measurements.
At the core of them is the idea of hybrid quantum-classical programs.

SOTA: LCU, QSVT, etc.

### Who said quantum computers could not fix their mistakes
Failed computations are an expensive mistake in quantum computing as the
no-cloning theorem prevents us from keeping a "backup" of the initial state.
The fact that "failures" are in fact unlucky measurement outputs 
makes matters worse, given that measurements are the only irreversible
quantum operation.
It is therefore impossible in general to recover from a "wrong" measurement.

There are, however, prominent cases in which the computation _can_ be corrected
based on the measurement outcome, thus yielding deterministic results.
Recall the general framework we introduced in the previous section: there is
a computation $A$ on $n$ qubits, that can be probabilistically computed 
using $m > n$ qubits using $\tilde{A}$:
$$\tilde{A} (\ket 0 \otimes \ket \psi) \mapsto \ket 0 \otimes (A\ket\psi) + \ket 1 \otimes (G\ket\psi).$$
for some "garbage" $G$.
What if $G$ is a reversible operation, i.e. there is an operation $G^{-1}$
to undo $G$?
Well then, we can still, at least in theory, recover $A\ket \psi$ by applying
$A \circ G^{-1}$:
$$G \ket \psi \mapsto (A \circ G^{-1}) \circ G \ket \psi = A \ket \psi,$$
but _only if_ `1` was measured on the ancilla qubit[^closeid]!

[^closeid]: Notice that, informally, we would hope to get a computation $G$ such that
$G \approx A$ in the sense that it should somehow be closely related to $A$.
This way, the resulting correction $A \circ G^{-1} \approx Id$ would
be close to the identity, and would be cheap to compute.

This is the beginning of quantum-classical hybrid computing: we start by 
performing quantum operations followed by measurements, the outcomes of which
dictate what further quantum operations must be applied.
We define the **classically controlled gate**, a quantum operation that
is only executed if a certain classical bit (the _condition_) is set.
This bit will typically be a value derived from a previous measurement: it
could be as simple as the outcome that a previous measurement yield, or a
function of multiple past outcomes that must be evaluated on classical
hardware (e.g. a CPU).

Mixing classical and quantum operations is a sure way to bring the quantum
circuit representation to its knees.
In this thesis, we adopt the following interactive representation to show
the circuit and classically controlled operations that result from
various measurement outcomes.
{{< qviz file="figs/blockenc.json" />}}
Clicking on the blue bill toggles the measurement outcome between `0` and `1`,
and the corresponding classically controlled operations.

#### Quantum Teleportation

Quantum teleportation is a beautifully simple example of 
performing classically controlled quantum operation to perform corrections
in the circuit based on measurement outcomes.
Coincidentally, it is one of the most fundamental protocols of quantum theory.
Its name is slightly misleading.
Think of it as data transfer for quantum data, with a slightly mind bending
twist: at the time of the transfer, only classical data must be
communicated between the sending and receiving parties.
As a result of this protocol, quantum information can be transfered
using plain old school classical communication channels!

This is predicated on one crucial action being performed before the
start of the communication: for every qubit that should be transmitted, the
parties must beforehand create and share among themselves a pair of qubits 
that will serve as the quantum resource during the protocol execution.
This resource state is widespread enough that is
got its own name, the Bell pair state.
It is written in Dirac notation as $\ket{00} + \ket{11}$.
As the notation indicates, it as a state with perfectly correlated measurements:
when measured, the two qubits  will always yield the same outcome, either both
`0` or both `1`.

There turns out to be a very simple circuit that maps the two-qubit $\ket {00}$,
which every computation starts in, into the Bell pair state:
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1 }],
    "operations": [
        {
            "gate": "Bell",
            "children": [
                {
                    "gate": "H",
                    "targets": [{ "qId": 0 }]
                },
                {
                    "gate": "X",
                    "isControlled": true,
                    "controls": [{ "qId": 0 }],
                    "targets": [{ "qId": 1 }]
                }
            ],
            "targets": [{"qId": 0 }, { "qId": 1 }],
            "conditionalRender": 1
        }
    ]
}
{{< /qviz >}}
It is enough for us to think of it as a black box---or a blue box in this case.

We are interested in "teleporting" an arbitrary, single-qubit quantum state.
Such a state can always be expressed as
$\ket \psi = \alpha \ket 0 + \beta \ket 1$, i.e. in the most general case,
a one-qubit state will be in some superposition of the states
$\ket 0$ and $\ket 1$.
The paramenters $\alpha$ and $\beta$ are complex coefficients that encode the
probabilities of measuring `0` or `1`---we can view them as the weights of a
weighted sum.

We are now interested in combining a Bell resource state in a joint system with
the arbitrary state $\ket \psi$.
The resulting three-qubit state is obtained with the $\otimes$ operation, which
distributes over sums just like usual multiplication:
$$ \underbrace{(\ket {00} + \ket {11})}_{\text{first two qubits}} \otimes \underbrace{(\alpha \ket 0 + \beta \ket 1)}_{\text{third qubit}} = \alpha \ket {000} + \alpha \ket {110} + \beta \ket {001} + \beta \ket {111}.$$
We chose to place the Bell pair on the first two qubits
and the arbitrary state on the third.
The goal is to move the data that sits on that last qubit to the first qubit.
Looking at the first qubit in the above expression, notice that the desired
state $\ket \psi = \alpha \ket 0 + \beta \ket 1$ appears in the first qubit
if we can discard the second and third terms:
$$\alpha \ket{\underline{\mathbf{0}}00} + {\color{gray}(\alpha \ket {110} + \beta \ket {001})} + \beta \ket{\underline{\mathbf{1}}11} $$
This sounds very much like the measurement operations we have used before
to isolate terms---but we need to isolate two terms simultaneously.
We can resolve this issue by reorganising the expression[^reorg]
$$\begin{aligned}\alpha \ket{000} + \alpha \ket{110} + \beta \ket {001} + \beta \ket {111}=\ &\overbrace{(\alpha \ket 0 + \beta \ket 1)}^{= \ket \psi}\otimes \overbrace{( \ket {00} + \ket {11})}^{\text{Bell pair}}\\&+(\beta \ket 0 + \alpha \ket 1) \otimes (\ket {01} + \ket {10})\\&+(\alpha\ket 0 - \beta \ket 1) \otimes (\ket{01} - \ket {10})\\&+(\beta \ket 0 - \alpha \ket 1) \otimes (\ket {00} - \ket {11})\end{aligned}$$
Obtaining the $\ket \psi$ state on the first qubit is thus as simple as
isolating the first of these four terms.
We do not know a priori how to measure $\ket {00} + \ket{11}$ but we do know
how to map that state to $\ket {00}$: that's the inverse of the Bell pair state
preparation circuit!
This results in the following circuit:
{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1, "numChildren": 1 }, { "id": 2, "numChildren": 1 }],
    "operations": [
        {
            "gate": "Bell",
            "children": [
                {
                    "gate": "H",
                    "targets": [{ "qId": 0 }]
                },
                {
                    "gate": "X",
                    "isControlled": true,
                    "controls": [{ "qId": 0 }],
                    "targets": [{ "qId": 1 }]
                }
            ],
            "targets": [{"qId": 0 }, { "qId": 1 }],
            "conditionalRender": 1
        },
        {
            "gate": "Bell-inv",
            "children": [
                {
                    "gate": "X",
                    "isControlled": true,
                    "controls": [{ "qId": 1 }],
                    "targets": [{ "qId": 2 }]
                },
                {
                    "gate": "H",
                    "targets": [{ "qId": 1 }]
                }
            ],
            "targets": [{"qId": 1 }, { "qId": 2 }],
            "conditionalRender": 1
        },
        {
            "gate": "Measure",
            "isMeasurement": true,
            "controls": [{ "qId": 1 }],
            "targets": [{ "type": 1, "qId": 1, "cId": 0 }]
        },
        {
            "gate": "Measure",
            "isMeasurement": true,
            "controls": [{ "qId": 2 }],
            "targets": [{ "type": 1, "qId": 2, "cId": 0 }]
        }
    ]
}
{{< /qviz >}}
This brings us to the same situation as we had for the block encoding
application above: conditioned on the measurement outcome of the second and
third qubits being 0, the computation performs a state "teleportation", moving
$\ket \psi$ from the third to the first qubit.
We can compute the effect of $\text{Bell}^{-1}$ on the overall expression of
(*) to find all possible output states:
$$\begin{aligned}(\ast) \overset{\text{Bell}^{-1}}{\mapsto}&(\alpha \ket 0 + \beta \ket 1) \otimes \ket {00} \\&+ (\beta \ket 0 + \alpha \ket 1) \otimes \ket {01} \\& + (\alpha \ket 0 - \beta \ket 1) \otimes \ket {10} \\&+ (\beta \ket 0 - \alpha \ket 1) \otimes \ket {11}\end{aligned}$$
As expected, we do get $\ket \psi$ on the first qubit for the measurement `00`
(corresponding to the state $\ket {00}$),
but as it stands, this only has a $\frac{1}{4}$ probability of success.

[^reorg]: Apologies, it seems at this point that we are conjuring up a complex
expression out of nowhere.
It is in fact just a change of basis---plain old linear algebra.
The formula can be obtained easily by writing out the basis change matrix.

You might notice, however, that the other states the first qubit can end
up in look remarkably similar, up to some sign flips and
swaps $\ket 0 \leftrightarrow \ket 1$.
In particular, all states still have the amplitudes $\alpha$ and $\beta$
somewhere, so it does not seem unfathomable that these "wrong" states can be
mapped back to $\psi$.

We can use the measurement outcomes of the second and third qubit to infer
which of the "mistakes" occurred, and hence what state the first qubit has
ended in.
The `01` measurement outcome, for instance, results in the
$\beta \ket 0 + \alpha \ket 1$ state---this is just a bit flip away from
$\ket \psi$!
This gate is known as $X$.
Its colleague the $Z$ gate on the other hand leaves $\ket 0$ states untouched
but flips the _sign_ of $\ket 1$.
This would fix the `10` outcome. Finally, `11` requires both a `Z` and a `X`
correction.

Putting these observations together, we can leverage classically controlled
operations to obtain a protocol that is fully deterministic!
The correct circuit implementating quantum teleportation is given by
{{< qviz file="figs/teleportation.json" />}}
In the scenario where a first party (Alice) wants to send a
one-qubit quantum state to Bob, they can achieve that by
creating a Bell pair state, the first qubit of which is given to Bob and the
second to Alice.
When Alice then gets in possession of another qubit $\ket \psi$ whose data she
wants to transmit to Bob, she can achieve that by executing $\text{Bell}^{-1}$,
measuring her two qubits and finally communicating the (classical) measurement
outcomes to Bob.
Bob can perform the necessary corrections and will then be in possession of
state $\ket \psi$.

It is beautiful and often overlooked how one of the most fundamental protocols
of quantum information theory is in fact a hybrid classical-quantum computation.
Quantum teleportation without classical communication is physically impossible:
it would let Aice communicate with Bob instantly, even as he could be light
years away---in other words, it would fundamentally break relatively.

### Repeat until success: If you fail, retry!
Classical computer science has a very simple solution whenever probabilistic
computations that can fail are used: boosting.
The idea is so simple that it barely deserves a name:
execute several independent runs of the computation and choose the most common
outcome. If the probability of failure is below a certain threshold
(e.g. 50% for a binary output), then with basic statistics one can extrapolate
the number of runs required to obtain any desired accuracy[^Hoeffding].

[^Hoeffding]: This is fiendishly effective: the Hoeffding bounds guarantee
that the probability of success
will converge to 1 exponentially with the number of runs.

We have been ignoring this approach so far, since no-cloning prohibits us
from repeating a procedure more than once on an input state $\ket\psi$.
However, in the scenario that the computation should only be executed on a
specific, known input state and the computation that prepares that state is
known, then we _can_ recover from computation failures, by just prepare a new
state identically.

Suppose we know how to execute the quantum computation $P$
mapping $\ket 0 \mapsto P \ket 0 = \ket \psi$.
As before, we would like to compute $A$ given an implementation of
the computation $\tilde{A}$ that acts on $\ket\psi$ and an ancilla qubit in the
$\ket 0$ state.
If the measurement of $\tilde{A}(\ket 0 \otimes \ket \psi)$ returns `1`, then
the computation failed.
We can then discard all qubits and restart from the $\ket 0$ state, applying
$P$ followed by $\tilde{A}$ and an ancilla measurement, repeating until we
measure 0. As a pseudo-quantum circuit, we could express this as:

{{< qviz >}}
{
    "qubits": [{ "id": 0 }, { "id": 1, "numChildren": 1 }],
    "operations": [
        {
            "gate": "H",
            "targets": [{ "qId": 0 }]
        },
        {
            "gate": "X", 
            "isControlled": true,
            "controls": [{ "qId": 0 }],
            "targets": [{ "qId": 1 }]
        },
        {
            "gate": "Measure",
            "isMeasurement": true,
            "controls": [{ "qId": 1 }],
            "targets": [{ "type": 1, "qId": 1, "cId": 0 }]
        }
    ]
}
{{< /qviz >}}

But pseudo circuits do not run on hardware! The only way to express this
computation as an actual circuit is to set a `max_iter` constant and to repeat
the block within the loop that many times
(here `max_iter=3`---expand the boxes at your own risk):
{{< qviz file="figs/rus-unroll.json" />}}

The resulting program is not only hard to display and read, it also suffers
from real issues in practice.
For one, the program size becomes extremely bloated and beyond just slowing
down the compiler, it will also cause a host of issues on the control hardware
in real time,
such as long load times, inefficient execution and low cache efficiency.

Even more worryingly, when picking `max_iter` we are faced with an impossible
tradeoff:
if `max_iter` is small, then the probability of failure will remain
non-negligible. As we scale this value up, however, we are introducing more
and more gates into the program to cover the odd case of
mutliple successive repeated failures. These are gates that we do not
intend to execute on most runs of the computation, yet come at a significant
cost to the runtime: for each gate listed in the circuit, the condition for the
gate's execution must be checked, whether or not the gate ends up being
executed. Furthermore, hardware schedulers might be forced to be pessimistic
and schedule a time window for all conditional operations ahead of time.
This will significantly delay any operation to be performed after the loop.

We therefore argue that the quantum circuit model is ill-suited as the
representation for quantum programs that combine classical and quantum
data. Such programs, however, are a fundamental building block towards
developing meaningful large scale quantum computations and
are bound to become the norm.
Beyond the examples that we touched on in the above paragraphs, which
included
block-encodings, repeat-until-success schemes, distributed quantum computing
and measurement-based quantum computing,
a major application of measurement-dependent classical operations
in the coming years
will be the implementation of quantum error correction (QEC) schemes.
It is widely agreed that QEC will be critical to the large scale deployment
of quantum computing---now is the time to build the tooling that will support
these use cases.