+++
title = "Quantum Computing: a Computer Scientist's Perspective"
sort_by = "weight"
weight = 2
layout = "chapter"
slug = "chap:basics"
+++

Many (too many?) introductions to quantum computing have been written, so we will refrain from adding another entry to the collection. Instead, beyond the absolute basics, our focus is on the expressive power and _syntax_ of quantum programs. This demystifies quantum compilation into program transformation problems that amount to traditional compiler methods that will be very familiar to computer scientists.

Quantum computing is the computational model that arises from the quantum mechanical manipulation of finite dimensional physical systems[^particle]. Realising this new computing paradigm requires an entirely new technology stack: most obviously, new dedicated hardware, but also an extensive collection of software tools that transform the intents of a human user into a symphony of electric pulses that operate all components of the hardware installation (lasers, magnetic fields, currents, photodetectors, etc.).

Turning human-readable code into machine instructions is the realm of _compilers_, a problem as old as classical computer science itself[^classical]. By analogy, the same problem in the quantum world was named **quantum compilation**.

In this chapter, we lay the groundwork for this thesis by introducing what programs meant to run on quantum computers look like today, what we expect they will look like in the (near) future, and how quantum compilers have been built to optimise them. We start in {{< reflink "sec:compilation" >}} by highlighting how quantum compilation distinguishes itself from its established classical counterpart. {{< reflink "upper" "sec:basics" >}} then reviews the basic computation primitives of quantum computers and how they are composed to form quantum circuits, the simplest form of quantum programs. This is followed by a review of the leading quantum circuit optimisation techniques in {{< reflink "sec:quantum-sota" >}}. Finally, {{< reflink "sec:hybrid" "sec:need-help" >}} introduce and discuss the impact of _hybrid_ quantum computations, and how they challenge existing quantum compiler designs and optimisations.

[^particle]: Think of it as a particle (e.g. an atom or photon) that we constrain to live within a finite-dimensional space of states -- just as we encode the bits `0` and `1` by two voltage values.

[^classical]: To distinguish traditional computing from _quantum_ computing, the field refers to the former as _classical_ computing. We will adopt this term throughout, for lack of a better word.
