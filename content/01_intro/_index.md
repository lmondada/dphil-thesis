+++
title = "Introduction"
sort_by = "weight"
weight = 1
layout = "chapter"
+++

Quantum computing is the computational model that arises from the quantum
mechanical manipulation of finite dimensional physical systems. Realising this
new computing paradigm requires an entirely new technology stack: most
obviously, new dedicated hardware, but also an extensive collection of software
tools that transform the intents of a human user into a symphony of electric
pulses that operate all components of the hardware installation (lasers,
magnetic fields, currents, photodetectors, etc.).

Turning human-readable code into machine instructions is the realm of
_compilers_, a problem as old as classical[^classical] computer science itself.
By analogy, the same problem in the quantum world was named **quantum
compilation**.

[^classical]:
    To distinguish traditional computing from _quantum_ computing, the field
    refers to the former as _classical_ computing. We will adopt this term
    throughout, for lack of a better word.

Interestingly, whereas the term quantum compilation has been in use for the
longest part of the existence of quantum computing as a field, it is only
recently that the quantum compilation community has started to adopt tools,
ideas and results from our classical counterparts.

Meanwhile, quantum computing has a long history of adopting diagrammatic and
graph-based representations to model and reason about computations and their
quantum mechanical properties. The most famous example of this is undoubtedly
the _quantum circuit_, a quantum analogue to boolean circuits that visualises
how data flows from one operation to the next (cf.
{{% reflink "sec:basics" %}}).

Going beyond circuits, the field of categorical quantum mechanics has embraced
and extended diagrammatic formalisms to model a variety of quantum processes and
computations. Particularly noteworthy in this line of work are the numerous
advances in quantum circuit optimisation (e.g. @Duncan2020 @Gogioso2022),
quantum simulations (e.g. @Kissinger_2022 @Sutcliffe2025), error correction
(e.g. @Beaudrap2020 @Cowtan2024) and many more related subjects (e.g.
@Simmons2021 @Felice2023) that the family of ZX-like calculi have enabled in the
last five years alone.

A challenge in quantum compilation has been to combine the principled and
abstract graph-based transformation semantics of diagrammatic reasoning with the
feature set and performance requirements of practical compilation tools. General
purpose tools graph rewriting tools such as Quantomatic @Fagan2018 proved too
slow for quantum circuit optimisation and other tools from the graph
transformation community such as GROOVE @Rensink2004 and GrGen.NET @Geiss2006
have not been adopted.

Instead, successful graph-based tools such as PyZX @Kissinger2020 and its faster
re-implementation QuiZX @Kissinger2022 focused on performant rewriting for a
restricted subdomain (in this case, the ZX calculus). This specialisation makes
it difficult to expand these approaches to new primitives and constraints that
are emerging from hardware advances within quantum computing. It also limits the
interaction and sharing across field boundaries and impedes the development of
tools applicable to a broader range of graph transformation domains.

The ambitious aim of this thesis is to advocate graph transformation as a robust
basis for a _scalable_ and _modular_ compiler platform for quantum
computations---and hope that in the process, our contributions will strengthen
the bridge between research in classical compilation, quantum computing and
graph transformations.

**Scalable.** The compiler should handle quantum computations of the kind we
realistically expect to execute within the coming decade: thousands of logical
qubits, relying on possibly millions of physical qubits. Just as importantly,
the compiler architecture should scale to take advantage of large classical
computational resources, in order to maximise the optimisation potential when
available.

**Modular.** The computational primitives available on present quantum hardware
are wide-ranging and evolving rapidly, the programming models for end users are
adapting, and hardware constraints and characteristics change from device to
device. A future-proof compiler platform must therefore imperatively be
extensible in its supported instruction set, its optimising cost function and
the program transformation strategies.

Why is now the time for such a compiler and why are these qualities so
important? We develop some arguments in {{% reflink "sec:compilation" %}}. Our
concrete contributions to this goal are then summarised in
{{% reflink "sec:contributions" %}}, along with an outline of the thesis.

{{% figure src="/img/butterfly-bridge.jpg"
           width="60%"
           caption="Just like this thesis: a three-legged bridge---the Butterfly Bridge in Copenhagen. Image credits: Christian Lindgren, [archdaily.com](https://www.archdaily.com/620622/butterfly-bridge-dietmar-feichtinger-architectes)." %}}
