+++
title = "Quantum Computing: a Computer Scientist's Perspective"
sort_by = "weight"
weight = 2
layout = "chapter"
slug = "chap:basics"
+++

Many (too many?) introductions to quantum computing have been written, so we
will refrain from adding another entry to the collection. Instead, beyond the
absolute basics, our focus is on the expressive power and _syntax_ of quantum
programs. This demystifies quantum compilation into program transformation
problems, amounting to traditional compiler methods that will be very familiar
to computer scientists.

In this chapter, we lay the groundwork for this thesis by introducing what
programs meant to run on quantum computers look like today, what we expect they
will look like in the (near) future, and how quantum compilers have been built
to optimise them. We start in {{< reflink "sec:basics" >}} with a review of the
basic computation primitives of quantum computers and how they are composed to
form quantum circuits, the simplest form of quantum programs. This is followed
by a review of the leading quantum circuit optimisation techniques in
{{< reflink "sec:quantum-sota" >}}. Finally,
{{< reflink "sec:hybrid" "sec:need-help" >}} introduce and discuss the impact of
_hybrid_ quantum computations, and how they challenge existing quantum compiler
designs and optimisations.
