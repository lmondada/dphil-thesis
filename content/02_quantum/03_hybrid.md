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

{{< mermaid >}}
graph LR
  psi --> measurement --> bit
{{< /mermaid >}}

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
the block within the loop that many times:

yyy
```goat
  .---.     .---.
--+ A +-----+ B +--
  .---.     .---.
```

The resulting program is not only very hard to read, it also suffers
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

### Quantum teleportation

### MBQC

### RUS-type stuff: magic state distillation

### Error detection + correction