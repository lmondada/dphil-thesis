+++
title = "Rise of hybrid quantum-classical computation"
template = "section.html"
weight = 3
+++

### Quantum measurements

Our dicussion thus far has omitted one crucial step of the quantum computation
story. Per se, quantum data is useless to humans: we cannot consume it!
A result from a quantum computation is only of value if we can probe it
and get some readout value that we can display to the user or return to
whomever launched the quantum computation.
This is where the famous Schrödinger's cat of quantum mechanics comes in:
we cannot know what data is within your qubits without performing a measurement,
which is an action that will transform the quantum data: as a result of
looking inside the proverbial box, the cat will either be killed or remain
alive.

We thus need to add the measurement operation as a special case to our computer
scientist's model of quantum computing.
Unlike every other "pure quantum" operation, measurements must by definition
interact with their environment to obtain a readout and so the no-delete
and the reversibility principles that we introduced in the previous section
do not apply here.
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

[^disappear]: Where did the qubit go? It turns out that all the information
that is contained in a qubit post measurement is also contained in the classical
bit of output data---it is therefore redundant and renders the qubit useless.
In our model wee therefore bundle measurement and qubit discard into
one operation.


### Quantum teleportation

### MBQC

### RUS-type stuff: magic state distillation

### Error detection + correction