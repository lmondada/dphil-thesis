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
We furthermore write $f: A \rightharpoonup B$ for a partial function from $A$ to
$B$, i.e. with a domain of definition $dom(f) \subseteq A$.

{{% definition title="MinIR Graph" number="3.1" %}}
A minIR graph $(V, O, \mathit{def}, \mathit{use}, \mathit{parent})$
is given by a set of values $V$ and a set of operations $O$, 
along with the (partial) functions
$$\begin{aligned}\mathit{def}: O \rightarrow V^\ast && \mathit{use}: O \rightarrow V^\ast && \mathit{parent}: O \rightharpoonup O, \end{aligned}$$
satisfying the constraints
- for all $v \in V$, there exists a unique operation $o \in O$ such that $v \in \mathit{def}\,(o)$
- for all $o, o' \in dom(\mathit{parent}\,)$ such that $o \sim o'$, $\ \mathit{parent}\,(o) = \mathit{parent}\,(o')$.
- the relation $\preccurlyeq \, \subseteq O^2$ obtained by the transitive closure of 
$$\begin{cases}o \preccurlyeq o' &\textrm{if }o \leadsto o'\\ o \preccurlyeq o' &\textrm{if }o = \mathit{parent}(o')\end{cases}$$
is a partial order.
{{% /definition %}}
In the context of minIR, $\leadsto$ relations encode the data flow of values
across the computation. The $\sim$ equivalence relation, which we will call
the _usedef_ relation, groups values that are connected
by chains of $\mathit{use}$s and $\mathit{def}$s.

The first constraint ensures that the IR is in SSA form, i.e. every value is
defined in exactly one operation and immutable.
The $\mathit{parent}\,$ function encodes the hierarchy of regions in minIR:
the second constraint guarantees that any connected component with respect
to the usedef relation belongs to (at most) one region.
Finally, the last constraint is equivalent to excluding any circular dependencies
in the graph, both within the usedef  as well as in the region
hierarchy given by $\mathit{parent}\,$.

Given the existence of a unique root region and the acylicity constraint,
the function $\mathit{parent}\,$ defines a rooted tree structure on the set of
hyperedges (operations) of the graph.
We use the map $\mathit{children}: O \to \mathcal{P}(O)$ to refer to all
children $\{o' \in O \mid parent(o') = o\}$ of an operation $o \in O$.

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
{{% figure src="/svg/minir-graph-2.svg" width="70%" caption="An example minIR graph. Black and white circles are SSA values, with hyperedges spanning between them and labelled with operations. Hyperedges attaching on the white half circles are value definitions, while hyperedges attaching on the black half circles are value uses. Hierarchical dependencies are indicated by dashed arrows; the dashed rectangles are the equivalence classes of $\sim$. The value colours refer to their types, see below." %}}

{{% hint info %}}
Our formalism represents SSA values as vertices and operations as edges.
This is the most convenient for graph transformation, as we will see, because
the graph transformations of interest to us correspond to graph gluing semantics,
i.e. akin to double pushout (DPO) rewrites.
{{% /hint %}}
However, in much of compilation (and computer) science, it is more common to define such
computation graphs using operations as vertices and data flow as edges.
The same computation would then look rather like the following:
{{% figure src="/svg/minir-graph.svg" width="70%" caption="The same computation as above, now representing operations as vertices and values as edges. Note that this formalism would require an edge ordering to be defined at each vertex." %}}
The two representations are equivalent, but the first has the simpler
rewriting semantics.

### Type Graph
It is time to formally model the type system of minIR and the linearity constraints
that we introduce alongside it. This is the last missing part in our graph formalism.
Graph-based modelling frameworks admit an elegant typing system given
as a graph morphism to the type graph.

{{% definition title="MinIR graph morphism" number="3.2" %}}
Given two minIR graphs $G_1 = (V_1, O_1, \mathit{def}_1, \mathit{use}_1, \mathit{parent}_1)$
and $G_2 = (V_2, O_2, \mathit{def}_2, \mathit{use}_2, \mathit{parent}_2)$,
a graph morphism $\varphi: G_1 \to G_2$ is given by maps
$$\begin{aligned}\varphi_V: V_1 \to V_2 \quad&& \varphi_O: O_1 \to O_2,\end{aligned}$$
that is compatible with the three graph functions, i.e. for all $o \in O_1$,
we have $o \in dom(parent_1) \Leftrightarrow \varphi_O(o) \in dom(parent_2)$ and
the commuting diagrams  
$$\begin{aligned}\mathit{def}_2(\varphi_O(o)) &= \varphi_V(\mathit{def}_1(o)),\quad\\\mathit{use}_2(\varphi_O(o)) &= \varphi_V(\mathit{use}_1(o)), \quad\\\mathit{parent}_2(\varphi_O(o)) &= \varphi_O(\mathit{parent}_1(o)),\end{aligned}$$
where the domain of definition of $\varphi_V$ was expanded to $V^\ast$ elementwise.
Furthermore, we require that $\varphi_O$ be bijective on all children sets,
i.e. for all $o \in O_1$, $$\varphi_O|_{children(o)}: children(o) \to children(\varphi_O(o))$$ is a bijection.
{{% /definition %}}
Remark that this definition would be a very standard one, if it were not for the
last constraint that we impose on the $\mathit{parent}$ relation.
This ensures that the number of nested regions, which the relation encodes, of
any operation is always preserfed by graph morphisms. This will allow for the number
of regions of an operation to be a property of the type system.

A type system for a minIR graph $G$ is then given by
a minIR graph $T$ and
a graph morphism $\mathit{type}: G \to T$[^slicecat].
The set of values of $T$ are called the data types of $G$ and the set of
operations of $T$, the operation types, or optypes.
A valid type system for our example minIR graph above is the following.
[^slicecat]: A construction known in category theory as the slice category.
{{% figure src="/svg/minir-graph-types.svg" width="100%" caption="The minIR type system for the example above. Value vertices with the same label (and same colour) form a single vertex in the type graph. They have been split into multiple vertices in this representation for better readability. Note that we used two types for regions to distinguish them by type signature, with their respective region definition of (`regiondefQB` and `regiondefQQ`) as well as separate `in` and `out` operations." %}}

This type graph encodes all the structure that a minIR graph requires to be
valid, with the exception of linearity.
This is captured in the following definition.

{{< definition title="$\Sigma$-typed minIR graph" number="3.3" >}}
Consider a minIR graph $\Sigma$ with values $T_L \cup T_N$ ($T_L$ and $T_N$ disjoint)
and operations $\Gamma$.
A minIR graph $G = (V, O, \mathit{def}, \mathit{use}, \mathit{parent})$
is $\Sigma$-typed if there exists a graph morphism
$type: G \to \Sigma$ and
- for all $v \in V$ such that $type(v) \in T_L$,
there exists a unique operation $o \in O$ such that $v \in \mathit{use}\,(o)$.

We call $\Sigma$ the type system of $G$, $T_L \cup T_N$ the types of $G$,
$\Gamma$ the optypes of $G$ and $T_L$ the linear types.
{{< /definition >}}