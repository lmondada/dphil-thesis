+++
title = "A graph representation for quantum programs"
weight = 3
layout = "section"
slug = "sec:graph-defs"
+++

We can now leverage minIR to capture the semantics of any classical-quantum
computation in a graph structure that we define formally in this section.

MinIR graphs closely resemble hypergraphs, with some added structure. Recall
that a hypergraph can be defined by a set of vertices $V$ and a set of
(hyper) edges $E \subseteq V^\ast$---this is a hypergraph where the vertices attached
to $e \in E$ are given by a list, i.e. are ordered.

Equivalently, the edges can be defined by an arbitrary set $E$ along with
a map $E \to V^\ast$.
We opt for this latter formalism, as it allows us to distinguish between two types
of edge endpoints: the edge source $\mathit{src}: E \rightarrow V^\ast$
and edge target $\mathit{tgt}: E \rightarrow V^\ast$.
We write $u \leadsto v$ to say that there is an edge from $u$ to $v$, i.e. there is
$e \in E$ such that $u \in src(e)$ and $v \in tgt(e)$.
We also define the equivalence relation $u \sim v$ of connected vertices,
i.e. either $u \leadsto v$, $v \leadsto u$,
or there exists $w$ with $u \sim w$ and $w \sim v$.

In our case, vertices are SSA values and edges are operations. We will
call the source of a value its definition and the target its uses---and hence
call the $\mathit{src}$ and $\mathit{tgt}$ functions $\mathit{def}$
and $\mathit{use}$ respectively.

{{% definition title="MinIR Graph" number="3.1" %}}
A minIR graph is given by a set of operations $O$ and a set of values $V$
along with the functions
$$\begin{aligned}\mathit{def}: O \rightarrow V^\ast && \mathit{use}: O \rightarrow V^\ast && \mathit{pred}: O \rightarrow O, \end{aligned}$$
satisfying the constraints
- for all $v \in V$, there exists a unique operation $o \in O$ such that $v \in \mathit{def}\,(o)$
- for all $o, o' \in O$ such that $o \sim o'$, $\ \mathit{pred}\,(o) = \mathit{pred}\,(o')$.
- the function $\mathit{pred}\,$ has a unique fixpoint $r \in O$ such that $\mathit{pred}\,(r) = r$.
- the relation $\preccurlyeq \, \subseteq O^2$ obtained by the transitive closure of 
$$\begin{cases}o \preccurlyeq o' &\textrm{if }o \leadsto o'\\ o \preccurlyeq o' &\textrm{if }o = \mathit{pred}(o')\end{cases}$$
is a partial order.
{{% /definition %}}
The first constraint ensures that each value is SSA, i.e. it is defined
in exactly one operation.
The $\mathit{prep}\,$ function encodes the hierarchy of regions in minIR.
The second constraint guarantees that there is always a root region that all other
regions are nested within, while the third enforces that all values are only
available within the region they were defined in.
Finally, the last constraint is equivalent to excluding any circular dependencies
in the graph, both within the data flow given by $\leadsto$ as well as in the region
hierarchy given by $\mathit{pred}\,$.

Given the existence of a unique root region and the acylicity constraint,
the function $\mathit{pred}\,$ defines a rooted tree structure on the set of
hyperedges (operations) of the graph.
Viewing the `in` and `out` statements of minIR regions as just another
operation and introducing a top level `main` region,
the minIR graph captures faithfully the structure of a minIR program that
we described in the last section.
For example, the following minIR program
```python
main := {
    in: q0, q1

    q0_1 := h(q0)
    q0_2, q1_1 := cx(q0_1, q1)

    m0 := measure(q0_2)

    ifregion := {
        in: q1
        out: q1
    }
    elseregion := {
        in: q1
        q1_1 := x(q1)
        out: q1_1
    }
    q1_2 := ifelse(m0, q1_1, ifregion, elseregion)

    out: q1_2, m0
}
```

can be interpreted as a minIR graph as follows:
{{% figure src="/svg/minir-graph-2.svg" width="70%" caption="An example minIR graph. Black and white circles are SSA values, with hyperedges spanning between them and labelled with operations. Hyperedges attaching on the white half circles are value definitions, while hyperedges attaching on the black half circles are value uses. Nested regions and their hierarchical dependencies are indicated by dashed rectangles and arrows." %}}

{{% hint info %}}
Our formalism represents SSA values as vertices and operations as edges.
This is the most convenient for graph transformation, as we will see, because
the graph transformations of interest to us correspond to graph gluing semantics,
i.e. akin to double pushout (DPO) rewrites.
{{% /hint %}}
However, in much of computer science, it is more common to define such
computation graphs using operations as vertices and data flow as edges.
The same computation would then look rather like the following:
{{% figure src="/svg/minir-graph.svg" width="70%" caption="The same computation as above, now representing operations as vertices and values as edges. Note that this formalism would require an edge ordering to be defined at each vertex." %}}

### Type Graph
It is time to formally model the type system of minIR---the last missing part
in our graph formalism.