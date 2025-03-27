+++
title = "Related work"
layout = "section"
weight = 1
slug = "sec:sota-pattern-matching"
+++

Our proposed solution can be seen as a specialisation of RETE networks
@Forgy1982 @Varro2013 and derivatives @Ian2003 @Armstrong2014 @Miranker1987 to
the case of graph pattern matching. The additional structure obtained from
restricting our considerations to graphs results in a simplified network design
that allows us to derive worst-case asymptotic runtime and space bounds that are
polynomial in the parameters relevant to our use
case[^spaceefficiency]---overcoming a key limitation of RETE.
[^spaceefficiency]: RETE networks have been shown to have exponential worst-case
space (and thus time) complexity @Rakib2018, although performance in practical
use cases can vary widely @Uddin2016.

Another well-studied application of large-scale pattern matching is in the
context of stochastic biomolecular simulations @Sneddon2010 @Bachman2011,
particularly the Kappa project @Danos2004. Stochastic simulations depend on
performing many rounds of fast pattern-matching for continuous Monte Carlo
simulations @Yang2008. However, unlike our use case, the procedure typically
does not need to scale well to a large number of patterns. In @Danos2007, Danos
et al. introduced a pre-computation step to accelerate matching by establishing
relations between patterns that activate or inhibit further patterns. This idea
was later expanded upon and formalised in categorical language in
@Boutillier2017. The ideas presented in @Boutillier2017 are similar to ours;
their formalism has the advantage of being more general but does not present any
asymptotic complexity bounds and suffers from similar worst-case complexities as
RETE.

A similar problem has also been studied in the context of multiple-query
optimisation for database queries @Sellis1988 @Ren2016, but it has limited
itself to developing caching strategies and search heuristics for specific use
cases. Finally, using a pre-compiled data structure for pattern matching was
already proposed in @Messmer1999. However, with a $n^{\Theta(m)}$ space
complexity---$n$ is the input size and $m$ the pattern size---it does not scale
to large input graphs, even for small patterns.
