+++
title = "Overview"
layout = "section"
weight = 1
+++

The framework we propose can be summarised by the diagram below.
It is composed of two main components: _pattern matching_
is tasked with finding all possible applications of rewrite rules from
the set of pre-defined rules.
Importantly, for this computation, we introduce an offline pre-processing step
that builds a data structure that is amenable to pattern matching from the
supplied set of rewrite rules. This allows us to obtain significant speedups
in the exploration phase of the framework.
The design of the pattern matching engine is described in more detail
in section [4.2](/04_rewriting#sec2), while the original contributions
with a detailed presentation of the pre-processing computation and an analysis of the
asymptotic speedup are presented in {{< reflink "/05_matching" >}}.

The second component is charged with the application and prioritisation
of the discovered rewrites.
Depending on the cost function and heuristics employed, it may select a subset
of rewrites or any combination of multiple rewrites to produce zero, one or many
new candidate programs that are equivalent to the input program.
We discuss several rewriting strategies in section [4.3](/04_rewriting#sec3).
Beyond that, we argue that optimisation based on local rewriting must be
done in parallel to scale to large input sizes.
For this purpose, section [4.3](/04_rewriting#sec3) presents a refinement of
our framework for the distributed setting.
To enable this, a new distributed data structure inspired by equality saturation
is presented in {{< reflink "/06_parallel" >}}. 

The simple heuristic driving our optimisation loop, consisting
of pattern matching and rewrite application, relies on a
priority queue, which orders all candidate programs by increasing
cost function.
This allows us to keep track of all the best candidates seen so
far, with the top of the queue always containing the current best
optimised program.
Optimisation can thus be terminated at any time based on a timeout.
This corresponds to a simple backtracking search, which greedily
chooses the best candidate at each step, and retreats to optimising
previous candidates once all better candidates have been exhausted.
Improvements to the search heuristic are an obvious area for future work, which we do not explore in this thesis but briefly
discuss in our concluding chapter, {{< reflink "/07_conclusion" >}}.

{{< figure
  src="svg/overview-matcher.svg"
  alt="Proposed quantum compiler optimisation framework"
  caption="Overview of the proposed quantum compiler optimisation framework. The two main components (white square boxes in the figure) are discussed in details in sec. [4.2](/04_rewriting#sec2) and [4.3](/04_rewriting#sec3) respectively."
  width="95%"
>}}
