+++
title = "Factorising the GTS search space"
layout = "section"
weight = 3
slug = "sec:factor-gts"
+++

Equality saturation introduces a persistent data structure
that encodes not only a single computation (term), but
all equivalent computations that can be obtained from sequences
of rewrites applied to it.
The result of this compact representation is a _factorisation_
of the term rewriting search space:
the same solution space (in fact, a strictly greater one) can be
covered by a much smaller search space.

The tradeoff is a non-trivial extraction procedure: whereas
in the naive search tree, the optimal solution corresponds to
a node in the tree, finding the cost minimising computation
among all terms saved in the persistent data structure requires
finding and selecting a subset of the stored expressions.

Whilst the exact data structure of equality saturation does not
apply to computation graphs with linear resources, it turns out
that a similar factorisation of the search space is also
obtainable for GTS search space exploration.
