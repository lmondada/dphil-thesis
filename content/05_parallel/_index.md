+++
title = "Concurrent Exploration in Graph Transformation Systems"
sort_by = "weight"
weight = 5
layout = "chapter"
slug = "chap:parallel"
+++
Persistent

Our goal is to run pattern matching on GTSs to optimise stuff
in a way that applies to many different regimes, i.e. remaining agnotic
to the graph semantics. Thus not rely too much on rewrite strategies.
This means we will need heuristics -- heuristics whose performance will
necessarily be dependent on the overall size of the search space.

This chapter contributes to this goal by introducing a data structure for
the _concurrent_ exploration of the state space of GTSs.
As the name implies, this will allow for a parallelised exploration of the state
space; but more importantly, we will see that it significantly reduces the
size of the total search space, whilst keeping the solution space
unchanged.
