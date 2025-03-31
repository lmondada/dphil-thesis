+++
title = "Rise of hybrid quantum-classical computation"
weight = 3
layout = "section"
slug = "sec:hybrid"
+++

### Quantum measurements

We have, until now, skipped over a crucial part of the quantum computation
process: the role of quantum measurements. Quantum data, in isolation, is
inherently inaccessible to us and the broader macroscopic world. A result from a
quantum computation is only of value if we can probe it and get some readout
value that we can display to the user or return to whoever launched the quantum
computation.

Quantum physics measurements fundamentally differ from our classical
understanding of just "reading out" data that is already there. This is the
famous Schrödinger's cat thought experiment of quantum mechanics: what data is
within the qubits remains undefined until a measurement is performed. The act of
observation will transform the quantum data: looking inside the box will, at
random, either kill the cat or spare it[^schrcat].

[^schrcat]:
    It is ironic that Schrödinger's thought experiment @Schroedinger1935,
    intended to highlight the absurdity of quantum mechanics, has become the
    field's most famous PR campaign. Sorry to disappoint---you won't find
    felines occupying multiple states of existence (though qubits do!)

We thus need to add the measurement operation as a special case to our computer
scientist's model of quantum computing. Unlike purely quantum operations,
measurements inherently involve interaction with the environment to produce a
readout. Consequently, the no-delete and reversibility principles discussed
earlier do not apply. Indeed, measurement is a lossy (and therefore
irreversible) operation that projects the quantum state into one of a small
subset of classical states. Which state the quantum state is projected into is
non-deterministic. If one has access to an infinite supply of the same quantum
state, then the whole state can be reconstructed by repeating measurements and
analysing the distribution of outcomes[^tomography]. Given no-cloning, however,
this is unlikely to be the case, and so the full quantum result is hardly ever
known. Instead, we must rely on well-designed measurement schemes to extract
useful information from our partial access to the quantum states.

[^tomography]:
    This is known as _state tomography_ @Allahverdyan2004. One must perform
    measurements in multiple bases, i.e., different choices of classical states
    to project to.

We model measurement as an operation that takes one qubit and outputs one purely
classical bit[^disappear]. In the circuit formalism, measurements are often
implicitly added at the end of every qubit. Suppose we wish to make them
explicit or add them elsewhere in the computation. In that case, we must
introduce a graphical representation for the classical bit of data the
measurement produces. The field has adopted the double-wire
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 10" width="30" height="10"><line x1="2" y1="3" x2="28" y2="3" stroke="black" stroke-width="1.5"/><line x1="2" y1="7" x2="28" y2="7" stroke="black" stroke-width="1.5"/></svg>
for this, even though a "half" wire would arguably have been more appropriate to
reflect the reduced information content relative to quantum wires. Ladies and
gentlemen, I present to you the measurement box:

[^disappear]:
    Where did the qubit go? All the information in a qubit post-measurement is
    also contained in the classical bit of output data---it is, therefore,
    redundant and renders the qubit useless. In our model, we, therefore, bundle
    measurement and qubit discard into one operation.

{{% figure src="svg/meas.svg" nobg="true" width="20%" %}}

### Measurements as first-class citizens

It is very tempting to our feeble classical brains---and admittedly, we just did
it ourselves in the previous paragraphs---to view measurements as merely a
readout operation, an auxiliary operation that we are forced to perform at the
end of a computation for operative reasons. This could not be further from the
truth! In many ways, measurements are just as powerful tools as any other
quantum operation---if not more so!

One eye-opening perspective on this is the field of _measurement-based quantum
computing_ (MBQC). Raussendorf and Briegel showed indeed @Raussendorf_2001 that
arbitrary quantum computations can be reproduced in the MBQC framework using
only some resource quantum states that can be prepared ahead of time and
measurements! In other words, given entangled qubits, measurements are all you
need to perform quantum operations.

We will not explore MBQC further in this chapter (nor in this thesis, for that
matter). Instead, we will use this as a motivation to explore what we can
achieve with measurements. We have so far spared you from any mathematical
alphabet soup. As we start discussing more concrete constructions of quantum
computations, some introductory linear algebra and conventions around notation
will become unavoidable.

<!-- prettier-ignore -->
{{% hint info %}}

**Dirac formalism**. Quantum states are nearly unanimously written using _kets_:
instead of referring to a quantum state as $\psi$, we write it wrapped in
special brackets as $\ket{\psi}$. This notation is also used when referring to
the $0$ and $1$ states of qubits, written $\ket{0}$ and $\ket{1}$.

Several states can be joined and considered together as one overall state. This
is expressed using the tensor $\otimes$ symbol:
$\ket{\psi_1} \otimes \ket{\psi_2}$ is the joint system of $\ket{\psi_1}$ and
$\ket{\psi_2}$. When the states in question are all explicitly qubit states, we
use the shorthand binary notation
$\ket{0} \otimes \ket{1} \otimes \ket{0} = \ket{010}$.

We will introduce more notation along the way.

<!-- prettier-ignore -->
{{% /hint %}}

With this out of the way, let us look in more details at the first smart use of
measurements: the block-encoding technique. Consider the following scenario: you
would like to perform an operation $A$ on an arbitrary quantum state
$\ket{\psi}$. Now, there are, unfortunately, many cases where implementing $A$
as a quantum circuit made of primitive gates that can be executed on hardware is
very expensive[^impossible].

[^impossible]:
    or outright impossible, in cases where $A$ is not a unitary linear
    operation, for example.

However, what we can always do is express $A$ as a matrix of dimensions
$2^n \times 2^n$, where $n$ is the number of qubits in the state $\ket{\psi}$.
Then, there is a neat trick that we can sometimes apply: instead of trying to
execute $A$, we enlarge the matrix to a bigger $\tilde{A}$:

$$\tilde{A} = \begin{pmatrix}A & G_1\\ G_2 & G_3 \end{pmatrix}$$

where $G_1, G_2$ and $G_3$ are "garbage" matrices that we do not care about, but
should combine into a matrix $\tilde{A}$ that we know how to execute on a
quantum computer. Quantum computations must be matrices with a row and column
number that is a power of two; so at a minimum, $\tilde{A}$ must be of size
$2^{n+1} \times 2^{n+1}$, i.e. be a computation on $n + 1$ qubits.

We restrict our considerations in the following to the case on $m = n + 1$
qubits---other cases are similar. We thus need to add a qubit to our $\ket\psi$
state to be able to pass it to our new operation. Such qubits that are added
temporarily to facilitate a computation are a recurring feature in quantum
computing and have thus earned themselves a name---ancilla qubits.

Let us take a look at the quantum states that result from executing $\tilde{A}$.
If we add to $\ket \psi$ a $\ket 0$ ancilla state, our quantum operation acts
as[^how]

{{% centered numbered="ablock" %}}
$$\tilde{A} (\ket 0 \otimes \ket \psi) = \ket 0 \otimes A \ket \psi + \ket 1 \otimes G_1 \ket \psi.$$
{{% /centered %}}

The expression $A \ket \psi$ means the operation $A$ applied to
$\ket \psi$---exactly the output state we are seeking. We can also input the
ancilla qubit in state $\ket 1$, but what we then get is pure garbage:

$$\tilde{A} (\ket 1 \otimes \ket \psi) = \ket 0 \otimes G_2 \ket \psi + \ket 1 \otimes G_3 \ket \psi.$$

So $\ket 0 \otimes \ket \psi$ is definitely the input state we are more
interested in.

[^how]:
    This is obtained by a simple matrix multiplication. The vector
    representation of the quantum state $\ket 0 \otimes \psi$ is obtained using
    the Kronecker product. You can also just trust me that this works out this
    way :)

How can we recover $A$ from {{% refcentered "ablock" %}}? This is precisely what
measurements do! When quantum states are expressed as sum of states, the terms
of the sum form the possible measurement outcomes[^orthogonal]. If we only
measure a subset of the qubits, then the term corresponding to that measurement
is isolated and all other terms disappear. Hence, if we measure the first qubit
(that we introduced ourselves) in the zero state, then the remaining $n$ qubits
will be precisely in the desired state $A \ket \psi.$ Success!

[^orthogonal]:
    This is simplifying slightly. There is a necessary condition for this to be
    a valid measurement: the states in the sum must form a measurement basis,
    i.e. they must be orthogonal. This is satisfied here.

Using this "term isolating" property of measurements, known as _state collapse_,
we can thus effect computations that would have been otherwise difficult or
impossible to perform. There is however one important wrinkle that we cannot
forget about: measurements are non-deterministic! We cannot assume that all
measurements of the ancilla qubit will return the zero state. When $\ket 1$ is
measured on the ancilla, the remaining qubits are left in the $G_1 \ket\psi$
state. The computation has thus failed, and the execution must be aborted and
restarted. How often the block-encoding protocol that we have presented fails
depends on the details of $A$ and the choices of $G_1, G_2$ and $G_3$ and is the
main disadvantage of an otherwise very powerful quantum technique.

We will now explore two strategies to deal with "fails" in measurements. At the
core of them is the idea of hybrid quantum-classical programs.

### Who said quantum computers could not fix their mistakes

Failed computations are an expensive mistake in quantum computing as the
no-cloning theorem prevents us from keeping a "backup" of the initial state. The
fact that failures are in fact unlucky measurement outputs makes matters worse,
given that measurements are the only irreversible quantum operation. It is
therefore impossible in general to recover from a "wrong" measurement.

There are, however, prominent cases in which the computation _can_ be corrected
based on the measurement outcome, thus yielding deterministic results. Recall
equation {{% refcentered "ablock" %}} of the previous section: there is a
computation $A$ on $n$ qubits, that can be probabilistically computed using
$m = n + 1$ qubits using $\tilde{A}$:

$$\tilde{A} (\ket 0 \otimes \ket \psi) = \ket 0 \otimes (A\ket\psi) + \ket 1 \otimes (G\ket\psi),$$

for some "garbage" $G$. What if $G$ is a reversible operation, i.e. there is an
operation $G^{-1}$ to undo $G$? Well then, we can still, at least in theory,
recover $A\ket \psi$ by applying $A \circ G^{-1}$:

$$G \ket \psi \mapsto (A \circ G^{-1}) \circ G \ket \psi = A \ket \psi,$$

but _only if_ `1` was measured on the ancilla qubit[^closeid]!

[^closeid]:
    Notice that, informally, we would hope to get a computation $G$ such that
    $G \approx A$ in the sense that it should somehow be closely related to $A$.
    This way, the resulting correction $A \circ G^{-1} \approx Id$ would be
    close to the identity, and would be cheap to compute.

This is the beginning of quantum-classical hybrid computing: we start by
performing quantum operations followed by measurements, the outcomes of which
dictate what further quantum operations must be applied. We define for this
purpose a _classically controlled gate_: a quantum operation that is only
executed if a certain classical bit (the _condition_) is set. This bit will
typically be a value derived from a previous measurement: it could be as simple
as the outcome that a previous measurement yield, or a function of multiple past
outcomes that must be evaluated on classical hardware (e.g. a CPU).

Mixing classical and quantum operations is a sure way to bring the quantum
circuit representation to its knees. We adopt the following representation, in
which a quantum gate that has an additional classical bit wire attached to it
represents a classically controlled operation that is only executed if the bit
value is `1`.

{{% figure src="svg/meas-correct.svg" width="70%" nobg="true" %}}

#### Quantum Teleportation

Quantum teleportation is a simple example of performing classically controlled
quantum operations to do circuit corrections based on measurement outcomes. It
is also coincidentally one of the most fundamental protocols of quantum theory.
Its name is slightly misleading. Think of it as data transfer for quantum data,
with a mind-bending twist: at the time of the transfer, only classical data must
be communicated between the sending and receiving parties. As a result of this
protocol, quantum information can be transferred using plain old-school copper
wires (or any other classical communication channels)!

This is predicated on one crucial action being performed before the start of the
communication. For every qubit that should be transmitted, the parties must
beforehand create and share among themselves a pair of qubits that will serve as
the quantum resource during the protocol execution. This resource state is
widespread enough that it got its name: the Bell pair state. It is written in
Dirac notation as $\ket{00} + \ket{11}$. As the notation indicates, it is a
state with perfectly correlated measurements: when measured, the two qubits will
always yield the same outcome, either both `0` or both `1`.

There turns out to be a straightforward circuit that maps the two-qubit
$\ket {00}$, which every two-qubit computation starts in, into the Bell pair
state:

{{% figure src="svg/bell-circ.svg" width="50%" nobg="true" %}}

It is enough for us to think of it as a black box---or a grey box in this case.

We are interested in "teleporting" an arbitrary, single-qubit quantum state.
Such a state can always be expressed as
$\ket \psi = \alpha \ket 0 + \beta \ket 1$, i.e. in the most general case, a
one-qubit state will be in some superposition of the states $\ket 0$ and
$\ket 1$. The paramenters $\alpha$ and $\beta$ are complex coefficients that
encode the probabilities of measuring `0` or `1`---we can view them as the
weights of a weighted sum.

We are now interested in combining a Bell resource state in a joint system with
the arbitrary state $\ket \psi$. The resulting three-qubit state is obtained
with the $\otimes$ operation, which distributes over sums just like usual
multiplication:

{{% centered numbered="bell-state" %}}
$$\begin{aligned} &\underbrace{(\ket {00} + \ket {11})}_{\text{first two qubits}} \otimes \underbrace{(\alpha \ket 0 + \beta \ket 1)}_{\text{third qubit}}\\=\ &\alpha \ket {000} + \alpha \ket {110} + \beta \ket {001} + \beta \ket {111}.\end{aligned}$$
{{% /centered %}}

We chose to place the Bell pair on the first two qubits and the arbitrary state
on the third. The goal is to move the data that sits on that last qubit to the
first qubit. Looking at the first qubit in the above expression, notice that the
desired state $\ket \psi = \alpha \ket 0 + \beta \ket 1$ appears in the first
qubit if we can discard the second and third terms:

$$\alpha \ket{\underline{\mathbf{0}}00} + {\color{gray}(\alpha \ket {110} + \beta \ket {001})} + \beta \ket{\underline{\mathbf{1}}11} $$

This sounds very much like the measurement operations we have used before to
isolate terms---but we need to isolate two terms simultaneously. We can resolve
this issue by reorganising the expression[^reorg]

$$\begin{aligned}&\alpha \ket{000} + \alpha \ket{110} + \beta \ket {001} + \beta \ket {111}\\ =\ &\underbrace{(\alpha \ket 0 + \beta \ket 1)}_{= \ket \psi}\otimes \underbrace{( \ket {00} + \ket {11})}_{\text{Bell pair}}\\&+(\beta \ket 0 + \alpha \ket 1) \otimes (\ket {01} + \ket {10})\\&+(\alpha\ket 0 - \beta \ket 1) \otimes (\ket{01} - \ket {10})\\&+(\beta \ket 0 - \alpha \ket 1) \otimes (\ket {00} - \ket {11})\end{aligned}$$

Obtaining the $\ket \psi$ state on the first qubit is thus as simple as
isolating the first of these four terms. We do not know a priori how to measure
$\ket {00} + \ket{11}$ but we do know how to map that state to $\ket {00}$:
that's the inverse of the Bell pair state preparation circuit! This results in
the following circuit:

{{% figure src="svg/bell-bellinv-circ.svg" width="70%" nobg="true" %}}

This brings us to the same situation as we had for the block encoding
application above: conditioned on the measurement outcome of the second and
third qubits being 0, the computation performs a state "teleportation", moving
$\ket \psi$ from the third to the first qubit. We can compute the effect of
$\textit{Bell}^{-1}$ on the overall expression of
{{% refcentered "bell-state" %}} to find all possible output states:
$$\begin{aligned}\alpha \ket {000} + \alpha \ket {110} + \beta \ket {001} + \beta \ket {111} \overset{\textit{Bell}^{-1}}{\mapsto}&(\alpha \ket 0 + \beta \ket 1) \otimes \ket {00} \\&+ (\beta \ket 0 + \alpha \ket 1) \otimes \ket {01} \\& + (\alpha \ket 0 - \beta \ket 1) \otimes \ket {10} \\&+ (\beta \ket 0 - \alpha \ket 1) \otimes \ket {11}\end{aligned}$$

As expected, we do get $\ket \psi$ on the first qubit for the measurement `00`
(corresponding to the state $\ket {00}$), but as it stands, this only has a
$\frac{1}{4}$ probability of success.

[^reorg]:
    Apologies, it seems at this point that we are conjuring up a complex
    expression out of nowhere. It is in fact just a change of basis---plain old
    linear algebra. The formula can be obtained easily by writing out the basis
    change matrix.

You might notice, however, that the other states in which the first qubit can
end up look remarkably similar, up to some sign flips and swaps
$\ket 0 \leftrightarrow \ket 1$. In particular, all states still have the
amplitudes $\alpha$ and $\beta$ somewhere, so it does not seem unfathomable that
these "wrong" states can be mapped back to $\psi$.

We can use the measurement outcomes of the second and third qubit to infer which
of the "mistakes" occurred, and hence what state the first qubit has ended in.
The `01` measurement outcome, for instance, results in the
$\beta \ket 0 + \alpha \ket 1$ state---this is just a bit flip away from
$\ket \psi$! This gate is known as $X$. Its colleague the $Z$ gate on the other
hand leaves $\ket 0$ states untouched but flips the _sign_ of $\ket 1.$ This
would fix the `10` outcome. Finally, `11` requires both a `Z` and a `X`
correction.

Putting these observations together, we can leverage classically controlled
operations to obtain a fully deterministic protocol! The correct circuit
implementing quantum teleportation is given by

{{% figure src="svg/teleportation-circ.svg" width="90%" nobg="true" %}}

In the scenario where a first party (Alice) wants to send a one-qubit quantum
state to Bob, they can achieve that by creating a Bell pair state, the first
qubit of which is given to Bob and the second to Alice. When Alice then gets in
possession of another qubit $\ket \psi$ whose data she wants to transmit to Bob,
she can achieve that by executing $\textit{Bell}^{-1}$, measuring her two qubits
and communicating the (classical) measurement outcomes to Bob. Bob can perform
the necessary corrections and will then have state $\ket \psi$.

It is beautiful and often overlooked how one of the most fundamental protocols
of quantum information theory is, in fact, a hybrid classical-quantum
computation. Quantum teleportation without classical communication is physically
impossible: it would let Alice communicate with Bob instantly, even though he
could be light years away---in other words, it would fundamentally break
relativity.

### Repeat until success: If you fail, retry!

Classical computer science has a straightforward solution whenever probabilistic
computations that can fail are used: probability amplification or boosting
@Scheideler2018. The idea is so simple that it barely deserves a name: execute
several independent runs of the computation and choose the most common outcome.
If the probability of failure is below a certain threshold (e.g. 50% for a
binary output), then with basic statistics, one can extrapolate the number of
runs required to obtain any desired accuracy[^Hoeffding].

[^Hoeffding]:
    This is fiendishly effective: the
    [Hoeffding bounds](https://en.wikipedia.org/wiki/Hoeffding%27s_inequality)
    guarantee that the probability of success will converge to 1 exponentially
    with the number of runs.

We have been ignoring this approach so far since no-cloning prohibits us from
repeating a procedure more than once on an input state $\ket\psi$. However, in
the scenario that the computation should only be executed on a specific, known
input state and the computation that prepares that state is known, we can
recover from computation failures by just preparing a new state identically.

Suppose we know how to execute the quantum computation $P$ mapping
$$\ket{0\cdots 0} \mapsto P \ket {0\cdots0} = \ket \psi.$$

As before, we would like to compute $A$ given an implementation of the
computation $\tilde{A}$ that acts on a $n$-qubit state $\ket\psi$ and an ancilla
qubit in the $\ket 0$ state. If the measurement of
$\tilde{A}(\ket 0 \otimes \ket \psi)$ returns `1`, then the computation failed.
We can then discard all qubits and restart from the $\ket 0$ state, applying $P$
followed by $\tilde{A}$ and an ancilla measurement, repeating until we
measure 0. As a pseudo-quantum circuit, we could express this as:

<div class="highlight" data-ref="97e76d09-3a8a-42e3-be27-dcb8ee48c9d6"><pre tabindex="0" style="color:#4c4f69;background-color:#eff1f5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;" data-ref="d5a12886-79b0-43e0-84d4-be53c8bb3030" data-undisplayed="undisplayed"><code class="language-python" data-lang="python" data-ref="40cb6ecc-cade-4539-beee-15164d507cb2"><span style="display:flex;" data-ref="cf86f9bd-1960-4f55-9ab3-d730826dd95f"><span data-ref="5567a52e-9fa4-4a70-b657-7dd0c405d964">psi_qs <span style="color:#04a5e5;font-weight:bold" data-ref="0582128b-2f52-498e-971e-b6987728e05d" data-undisplayed="undisplayed">=</span> create_qubits(n)
</span></span><span style="display:flex;" data-ref="6f5718bf-c93f-46a4-b25e-d1c3b7258ee2"><span data-ref="c8c7699b-9ee5-4d22-978b-b24c0395e992"><span style="color:#8839ef" data-ref="9efab953-6821-43a8-a29e-92af6e6df300" data-undisplayed="undisplayed">while</span> <span style="color:#fe640b" data-ref="f9a4b21b-4d30-4e68-84bd-f059e9d1ebe5" data-undisplayed="undisplayed">True</span>:
</span></span><span style="display:flex;" data-ref="5dbcf82c-9c4d-4e2b-9f1e-7a6f544eacab"><span data-ref="9c7cc0f4-7d8d-4908-85c6-98cf7fbd68da">   ancilla_q <span style="color:#04a5e5;font-weight:bold" data-ref="3fb0c682-3d0c-4f84-9cd8-57d964d7a1fb" data-undisplayed="undisplayed">=</span> create_qubit()
</span></span><span style="display:flex;" data-ref="220307c2-2650-4fcf-a981-672114390967"><span data-ref="3efc46df-424a-46b3-b32d-e7b2123b6eb7">   obtain measurement m from:
</span></span><span style="display:flex;" data-ref="20057c4e-c406-421b-97a5-7d0b11fc8257"><span data-ref="e87d8814-0a36-4bda-a13e-51fa2db99938"></span></span>
<img src="/rus.svg" style="width: 65%; margin-left: 5em;"/>
</span></span><span style="display:flex;" data-ref="20057c4e-c406-421b-97a5-7d0b11fc8257"><span data-ref="e87d8814-0a36-4bda-a13e-51fa2db99938"></span></span>
<span style="display:flex;" data-ref="841db4cd-0cc7-47a9-b472-8477c42b5722"><span data-ref="54dc8de4-2d9c-4f54-b15d-d5bed674cc58">    <span style="color:#8839ef" data-ref="a1caaef3-32ca-435e-9aa7-11befe5899d5" data-undisplayed="undisplayed">if</span> m <span style="color:#04a5e5;font-weight:bold" data-ref="c21576db-a4f3-43c9-baf6-eb747420fb87" data-undisplayed="undisplayed">==</span> <span style="color:#fe640b" data-ref="be5bb673-9377-41e2-9477-9e90104ee425" data-undisplayed="undisplayed">0</span>:
</span></span><span style="display:flex;" data-ref="3e140979-3e9f-47cf-b37e-181b2053a4d8"><span data-ref="f483ac93-0423-4a0c-aa13-0366e59bc7cd">        <span style="color:#8839ef" data-ref="0ded6587-83b4-4703-b2d7-2faa93f8cc86" data-undisplayed="undisplayed">break</span>  <span style="color:#9ca0b0;font-style:italic" data-ref="26d3af22-8e45-40ce-a028-e327820efd04" data-undisplayed="undisplayed"># success! we can exit loop and proceed</span>
</span></span><span style="display:flex;" data-ref="193bcb98-4d52-4c14-aa74-9186678fcd1f"><span data-ref="5faa1ee3-f682-4960-958e-1f893f0fb0e7">    <span style="color:#8839ef" data-ref="0d98905d-7fc7-46b4-898b-916b4ab24cef" data-undisplayed="undisplayed">else</span>:
</span></span><span style="display:flex;" data-ref="c8503bb9-d166-4edd-98af-4ed836665028"><span data-ref="7770bd4e-5783-46d2-9492-43a842d0a2bc">        reset_qubits(psi_qs)
</span></span></code></pre></div>

At each iteration, we can either exit the loop if the state collapse was
successful (`m == 0`), or reset the qubits to zero and try again. But pseudo
circuits do not run on hardware! The only way to express this computation as an
actual circuit is to unroll the loop, i.e. repeat the block within the loop as
many times as we expect might be necessary[^maxiter]. The first two iterations
would look as follows:

[^maxiter]:
    In other words, we must pick a constant $M$ for the maximum number of times
    we expect the loop to be executed. If a single loop iteration has a failure
    probability of $p$, the failure probability of the program with $M$ unrolled
    iteration is then $p^M$.

{{% figure src="svg/rus-unrolled.svg" width="100%" nobg="true" %}}

It should be obvious why we haven't unrolled the loop any further---it quickly
becomes unweildy. The resulting program is not only hard to display and read,
but it also suffers from fundamental issues in practice. For one, the program
size becomes hugely bloated, and beyond slowing down the compiler, it will also
cause a host of issues on the control hardware in real-time, such as long load
times, inefficient execution, and low cache efficiency.

Even more worryingly, when picking the maximum number of iterations, we face an
impossible tradeoff: if the number of iterations is small, then the probability
of failure will remain non-negligible. As we scale this value up, however, we
are introducing more and more gates into the program to cover the odd case of
multiple successive repeated failures. We do not intend to execute these gates
on most computation runs. They come at a significant cost to the runtime. For
each gate listed in the circuit, the condition for the gate's execution must be
checked, whether or not the gate ends up being executed. Furthermore, hardware
schedulers might be forced to be pessimistic and schedule a time window for all
conditional operations ahead of time. This will significantly delay any
operation to be performed after the loop.

We, therefore, argue that the quantum circuit model is ill-suited as the
representation for quantum programs that combine classical and quantum data.
Such programs, however, are a fundamental building block towards developing
meaningful large-scale quantum computations and are bound to become the norm.
Beyond the examples discussed above—--including block-encodings,
repeat-until-success schemes, distributed quantum computing and
measurement-based quantum computing---one application of hybrid
quantum-classical operations stands out as critically important for the
large-scale deployment of quantum computing: quantum error correction (QEC)
schemes. We discuss this use case in the next section.
