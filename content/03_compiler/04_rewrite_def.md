+++
title = "Rewriting minIR graphs"
weight = 4
layout = "section"
slug = "sec:rewrite-def"
+++

We define transformations of minIR in terms of graph transformations, or
rewrites, of the graph minIR.
The definitions we propose are very close to double pushout (DPO)
rewriting @Ehrig1976, as presented e.g. in @Bonchi2017&#x200B;---a
well-studied formalism that can be generalised categorically to any
adhesive category @Lack2005.
However, our presentation is not categorical and is not entirely equivalent
to DPO, as we will permit implicit edge deletions more akin to single pushout
(SPO) @Loewe1991 in certain cases.
We leave it to future work to define a more solid categorical foundation for minIRs
graphs[^interestmaybe].
[^interestmaybe]: should that be of interest to anyone.

#### Graph gluing
The simplest way to present DPO rewriting operationally is through graph gluings:
two graphs $G_1$ and $G_2$ are glued together by considering the union of
vertices and (hyper)edges and identifying ("gluing") vertices from $G_1$
with vertices from $G_2$ using some vertex relation $V_1 \times V_2$.
In our case, we need to be careful to define gluing of minIR graphs in a way
that preserves all the constraints we have imposed on the data structure.
Gluing two values of a linear type, for instance, is a sure way to introduce
multiple uses (and definitions) of it.

s