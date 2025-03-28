+++
title = "Open source implementation of pattern matching"
sort_by = "weight"
weight = 2
layout = "section"
slug = "app:portmatching"
+++

The code is available at
[github.com/lmondada/portmatching](https://github.com/lmondada/portmatching/).
All benchmarking can be reproduced using the tooling and instructions at
<a href="https://github.com/lmondada/portmatching-benchmarking">
github.com/lmondada<wbr />/portmatching-benchmarking</a>.

We represent all the pattern matching logic within a generalised finite state
automaton, composed of states and transitions. This formalism is used to
traverse the graph input and express both the prefix tree of the string prefix
matching problem and the (implicit) recursion tree of `AllAnchors` in
{{% reflink "sec:anchors" %}}. We sketch here the automaton definition. Further
implementation details can be obtained from the `portmatching` project directly.

In the pre-computation step, the automaton is constructed based on the set of
patterns to be matched. It is then saved to the disk; a run of the automaton on
an input graph $G$ is the solution the pattern independent matching problem for
the input $G$. To run the automaton, we keep track of the set of current states,
initialised to a singleton root state and updated following allowed transitions
from one of the current states. Which transitions are allowed is computed using
predicates on the input graph stored at the transitions. This is repeated until
no further allowed transitions exist from a current state.

At any one state of the automaton, zero, one or several transitions may be
allowed depending on the input graph. As the automaton is run for a given input
graph $G$, we keep track of the vertices that have been matched by the automaton
so far with an injective map between a set of unique symbols and the vertices of
$G$. Vertices in this map are the known vertices of $G$. There are three main
types of transitions:

- A **constraint** transition asserts that a property of the known vertices
  holds. This can be checking for a vertex or edge label, or checking that an
  edge between two known vertices and ports exists.
- A **new vertex** transition asserts that there is an edge between a known
  vertex $v$ at a port $p$ and a new vertex at a port $p'$. The new vertex must
  not be any of the known vertices. When the transition is followed, a new
  symbol is introduced and the vertex is added to the symbol vertex map.
- A **set anchor** transition is an $\epsilon$-transition, i.e. a
  non-deterministic transition that is always allowed. Semantically, it
  designates a known vertex as an anchor.

  By requiring that all constraint transitions from a given state assert
  mutually exclusive predicates (such as edges starting from a given vertex and
  port, or the vertex label of a given vertex), we can ensure that constraint
  transitions are always deterministic. New vertex transitions are also
  deterministic in finite depth patterns[^cyclenonconvex], so that in the regime
  explored in this paper, the only source of non-determinism is the choice of
  anchors. Intuitively, this corresponds to the facts that the prefix tree
  traversal of {{% reflink "sec:automaton" %}} is deterministic while the
  anchors enumeration in `AllAnchors` returns a multitude of options to be
  explored exhaustively.

  [^cyclenonconvex]:
      In cyclic and non-convex cases, it can happen that a vertex is both a
      known vertex of a large % pattern and a new vertex within a smaller
      subpattern.

To obtain a set of matching patterns from a run of the automaton, we store
pattern matches as lists at the automaton states. When a state is added to the
set of current states, its list of matches are added to the output. To build the
automaton, we consider one pattern at a time, convert it into a chain of
transitions of the above types that is then added to the state transition graph.
At the target state of the last transition, we then add the pattern ID to the
list of matched patterns.
