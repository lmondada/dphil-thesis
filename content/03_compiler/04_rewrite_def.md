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
On the other hand, we impose injectivity and bijectivity conditions in some cases
to guarantee existence and uniqueness of the transformation, as well as to
handle linear types correctly.
We leave it to future work to define a more solid categorical foundation for minIRs
graphs[^interestmaybe].
[^interestmaybe]: should that be of interest to anyone.

#### Graph gluing
The simplest way to present DPO rewriting operationally is through graph gluings:
two graphs $G_1$ and $G_2$ are glued together by considering the union of
vertices and (hyper)edges and identifying ("gluing") vertices from $G_1$
with vertices from $G_2$ using some vertex relation $V_1 \times V_2$.

{{< definition title="MinIR gluings" number="3.4" >}}
Consider a minIR graph $G$ with values $V$ and operations $O$,
a value equivalence relation $\eqsim \subseteq V^2$,
along with sets of values $V^- \subseteq V$ and operations $O^- \subseteq O$
such that
$\mathit{parent}(O \smallsetminus O^-) \subseteq O \smallsetminus O^-$,
$\mathit{def}\,(O') \subseteq (V \smallsetminus V^-)^\ast$
and
$\mathit{use}(O') \subseteq (V \smallsetminus V^-)^\ast$.

The gluing of $G$ along $\eqsim$ is the graph
obtained from
- vertices $V' = (V \smallsetminus V^-)/ \eqsim$,
- operations $O' = O \smallsetminus O^-$,
- the function $\mathit{parent}$ restricted to the domain $O'$, and
- the functions $\mathit{def}\textrm{ }', \mathit{use}'$
obtained from their equivalent in $G$ by mapping strings in the codomain $V^\ast$
elementwise to strings of equivalence classes in $(V')^\ast$.
{{< /definition >}}

In our case, we need to be careful to only consider gluing of minIR graphs
that preserve all the constraints we have imposed on the data structure.
Gluing two values of a linear type, for instance, is a sure way to introduce
multiple uses (or definitions) of it.

This makes the usual approach of DPO, which informally
consists of two steps (the "D" in DPO)---first deleting vertices and edges,
and then adding new ones---problematic for minIRs.
Instead, we introduce minIR _holes_, a concept closely related to the
"hypergraph with interfaces" construction of @Bonchi2017 or the supermaps
of quantum causality @Hefford2024.
We eschew the presentation of holes as a slice category in favour
of a _dumbed down_ definition that fits naturally within minIR and is sufficient
for our purposes.

For all type strings $U, D \in T^\ast$, we define a minIR `hole<U, D>: U -> D`
operation---a black box operation that consumes values of type $U$ and
defines new values of type $D$.
A hole can then be _filled_ by a `Region<U', D'>` using familiar graph gluings.
We define for that the notion of _hole-compatible replacement_ regions.

{{< definition title="Hole-compatible regions" number="3.5" >}}
Consider a minIR graph $G$, with a region $r \in V$ of type `Region<U', D'>`.
$r$ is said to be a compatible region with a hole type `hole<U,D>` if there exist boundary maps, i.e. partial maps
$$\begin{aligned}\rho_U&: \{1 \leqslant i \leqslant |U|\} \rightharpoonup \{1 \leqslant i \leqslant |U'|\}, \\\rho_D&: \{1 \leqslant i \leqslant |D|\} \rightharpoonup \{1 \leqslant i \leqslant |D'|\}.\end{aligned}$$
such that
- both maps preserve types: $U[i] = U'[\rho_U(i)]$ as well as $D[i] = D'[\rho_D(i)]$, and
- both maps are bijective on their restrictions to linear types
$$\begin{aligned}\rho_U&: \{1 \leqslant i \leqslant |U| \mid U[i] \in T_L\} \overset{\simeq}{\longrightarrow} \{1 \leqslant i \leqslant |U'| \mid U'[i] \in T_L\},\\\rho_D&: \{1 \leqslant i \leqslant |D| \mid D[i] \in T_L\} \overset{\simeq}{\longrightarrow} \{1 \leqslant i \leqslant |D'| \mid D'[i] \in T_L\}.\end{aligned}$$

We say that the compatible region is "use-injective" if $\rho_U$ is injective,
and that it is "definition-injective" if $\rho_D$ is injective.
{{< /definition >}}
This compatibility definition will provide sufficient condition minIR constraints preservation
in graph gluings.

For a minIR graph $(V, O, \mathit{def}, \mathit{use}, \mathit{parent})$,
- let $h \in O$ be a hole $type(o) = $ `hole<U,D>`;
- let $r \in V$ be a $h$-compatible region $type(r) = $`Region<U',D'>`,
that is use-injective and with no use, i.e. for all $o \in O$, $r \not\in use(o)$;
- let $r_{in}$ and $r_{out}$ be the `in` and `out` operations of the region $r$, i.e.
the children of the unique $r_{\mathit{def}}$ operation such that
$\mathit{def}\,(r_{\mathit{def}}) = r$.

Define the equivalence relation $\eqsim_R$ on $V^2$ by the transitive, symmetric
and reflexive closure of
- $v \eqsim_R v'$ if there exists $1 \leqslant i \leqslant |U|$ such that
$v = \mathit{use}(h)[i]$ and $v' = \mathit{def}\,(r_{in})[\rho_U(i)]$,
- $v \eqsim_R v'$ if there exists $1 \leqslant i \leqslant |D|$ such that
$v = \mathit{def}\,(h)[i]$ and $v' = \mathit{use}(r_{out})[\rho_D(i)]$.

Then $\eqsim_R$ defines the gluing of $h$ and $r$:
{{% proposition title="Replacement region gluings" number="3.1" %}}
Given a hole $h$ and $h$-compatible region $r$ in a minIR graph $G$
that is use-injective and has no uses, the graph obtained from the gluing given by
- the equivalence relation $\eqsim_R$ defined above,
- the value deletion set $V^- = \{r\}$,
- the operation deletion set $O^- = \{h, r_{\mathit{def}}, r_{\mathit{in}}, r_{\mathit{out}}\}$,

is a valid minIR graph.
{{% /proposition %}}
We first show that the result of a gluing is always a well-defined minIR
graph, and will then proceed to some examples that illustrate the definition.

_Proof_. tbd.
<!-- _Well-definedness of link functions._
We verify that the images of the
$\mathit{parent}$, $\mathit{def}\textrm{ }'$ and $\mathit{use}'$
functions are within their codomains:
among the removed operations $O \smallsetminus O'$, only $r_{\mathit{def}}$
has children, both of which ($r_{in}$ and $r_{out}$) are deleted. So
$\mathit{parent}$ is well-defined on $O' \rightharpoonup O'$.
The unique definition of $r$ by $r_{\mathit{def}}$ implies
$\mathit{def}\,(O \smallsetminus \{r_{\mathit{def}}\}) \subseteq (V \smallsetminus \{r\})^\ast$
and $use(O) \subseteq (V \smallsetminus \{r\})$ by hypothesis.

_Typing_.
The $\geqslant_g$ conditions for signature compatibility
ensure that the glued graph is well-typed: it follows indeed from the definition
of $\eqsim_R$ that all values within an equivalence class are of the same type.

_Single definition of values_.
Suppose there is an equivalence class $\alpha \in V'$ and $v, v' \in \alpha$
such that there exists $o, o' \in O'$ with $v \in \mathit{def}\,(o)$
and $v' \in \mathit{def}\,(o')$.
Given that $r_{in}, h \not\in O'$, it must hold by the definition of $\eqsim_R$
_tbd_.

_Single use of linear values_.
Similar argument as above.

_Acyclicity_.
Consider the partition of the values of $G$ into $V_1$ and $B_2$ obtained by
splitting the values in regions $r$ and its descendants from the remainder.
_tbd_.

_Values belong to a single region_.
Suppose there were a path from an input operation to an output operation
with different parents.
Both operations cannot be in the _tbd_. -->

{{% hint info %}}
Examples. TODO.
{{% /hint %}}

#### Pattern matching
Replacement region gluing establishes a way to transform minIR graphs---provided there are
holes within them.
Holes in minIR graphs are formed from subgraphs of minIR graphs.

For a minIR graph $(V, O, \mathit{def}, \mathit{use}, \mathit{parent})$,
a subgraph is defined by vertices and edges $V_S \subseteq V$ and $O_S \subseteq O$.
We define the sets of input and output boundary values $B_I, B_O \subseteq V$
of the subgraph $(V_S, O_S)$ by the list of values in $V_S^\ast$
$$\begin{aligned} B_I &= [v \in V_S \mid v \in \mathit{def}\,(o)\textrm{ for some }o \in O \smallsetminus O_S ],\\B_O &= [v \in V_S \mid v \in \mathit{use}(o)\textrm{ for some }o \in O \smallsetminus O_S ],\end{aligned}$$
where the ordering of the values can be fixed arbitrarily.
This defines the boundary type strings $U_S, D_S \in T^\ast$ by taking their types.

{{% proposition title="Subgraph outlining" number="3.2" %}}
A subgraph $S = (V_S, O_S)$ of a minIR graph $G$ with boundary type strings $U_S$ and $D_S$
and such that:
- the subgraph is convex, i.e. for all $v_1, v_2 \in V_S$, any path along
$\leadsto$ from $v_1$ to $v_2$ contains only vertices in $V_S$,
- parent-child relations are contained within the subgraph, i.e.
for all $v \in dom(\mathit{parent})$, $v \in V_S$ if and only if $\mathit{parent}(v) \in V_S$,
- the input and output boundary values are disjoint $B_I \cap B_O = \varnothing$, and
- for all boundary values $b_1, b_2 \in B_I \cup B_O$, $b_1 \sim b_2$, i.e. all boundary values
are in the same region,

can always be outlined, i.e. there is an equivalent minIR graph $G'$ such that
the subgraph $S$ is nested within a region $r \in V'$ of type `Region<U_S, D_S>` and the subgraph
is replaced by a `call` operation.

We call the region $r$ of type `Region<U_S, D_S>` the _equivalent outlined region_ of the subgraph $S$.
{{% /proposition %}}
_Proof_. tbd.

Using region outlining, it is always possible to insert a hole in place of a subgraph that satisfies
the conditions of proposition 3.2.
{{% proposition title="Hole insertion" number="3.3" %}}
Consider a subgraph $S = (V_S, O_S)$ of a minIR graph $G$ with boundary type strings $U_S$ and $D_S$
and type strings $U$ and $D$.
If the equivalent outlined region of $S$ is compatible with a hole of type `hole<U, D>` and is
definition-injective, then the graph obtained from the outlined graph by removing the outlined region
and replacing the `call` operation by a hole operation is a valid minIR graph.

We call the resulting graph the hole-substitution of $S$ in $G$.
{{% /proposition %}}
_Proof_. tbd.

Combining hole insertion with replacement region gluings, we can finally define the semantics
of graph transformation in minIR.
Given a subgraph $S$ of a minIR graph $G$, the subgraph can be outlined and then removed.
The `call` operation is replaced by a `hole` operation. After inserting the new region definition,
the final minIR graph is obtained by gluing the hole with the new region.

A figure illustrates this graph transformation with an example below.
This simple and limited graph transformation framework captures a remarkably large set of minIR
program transformations.
In particular, the restrictions on subgraph convexity,
containment of boundary values within a single region as well as
containment of parent-child relations
do not represent
any limitation on the expressivity of the graph transformations.

Non-convex subgraphs can always be made convex by taking the convex hull
and outlining any parts within that are not part of the subgraph.
The `call` operations within the subgraph then redirect the control flow to regions
that are passed through as inputs to the subgraph.
Step 1 of the figure below illustrates this transformation.

Similarly, a subgraph that includes operations without their parent can be extended
to cover the entire region and its parent, outlining any parts of the region that are not
part of the subgraph.
Finally, input and output boundary values to nested regions can always be hoisted and
passed through
from the top level region, so that subgraphs can always be transformed to only have input
and output boundary values at the top level region.
To do so, a value that is required within a nested region is recursively passed as argument to
each of its ancestor regions.
Step 2 of the figure below illustrates this transformation.

{{% figure src="/svg/rewrite.svg" width="95%" caption="A minIR graph transformation for a non-convex pattern, using outlining and hoisting. We use (nested) boxes to represent operations and regions within them and coloured edges for (typed) values." %}}

#### Equivalence classes and rewrite rules

We complete our GTS by introducing equivalence classes of minIR graphs.
Instead of relying on rewrite rules of the form $L \to R$, with a left-hand and a right-hand side,
we define equivalence classes $\mathcal{E}$ of minIR graphs that implicitly capture
the $\Theta(|\mathcal{E}|^2)$ rewrite rules between pairs of elements of $\mathcal{E}$.

{{< definition title="Equivalence classes" number="3.6" >}}
Let $U$ and $D$ be type strings that define the hole type `hole<U, D>`.
A minIR equivalence class $\mathcal{E}$ is a set of minIR regions that are compatible with
the hole type `hole<U, D>`.

The equivalence class defines a transition relation $\to_{\mathcal{E}}$ on minIR graphs.
For two graphs $G_1$ and $G_2$, $G_1 \to_{\mathcal{E}} G_2$ holds if:
- there exists a subgraph $S$ of $G_1$,
- there exists a region $L \in \mathcal{E}$
that is definition-injective such that $L$ is the equivalent outlined
region of $S$, and
- there exists a region $R \in \mathcal{E}$ that is use-injective
such that $G_2$ is the graph obtained by gluing $R$ with the hole-substitution of $L$ in $G_1$,
- $dom(\rho_U) \subseteq dom(\sigma_U)$ and $dom(\sigma_D) \subseteq dom(\rho_D)$, where
$\sigma_U, \sigma_D$ and $\rho_U, \rho_D$ are the boundary maps from the hole type
to $L$ and $R$, respectively.
{{< /definition >}}
With equivalence classes, we can thus fully capture the semantics of minIR operations
in a concise and graphical form that is very amenable to graph transformation-based optimisations,
as well as formal methods for correctness verification.

The following example illustrates a set of equivalent minIR graphs that
a minIR equivalence class could capture.
Any valid transformation will preserve minIR constraints such as linearity,
whilst allowing the copying and discarding of non-linear values, which arise
from non injective boundary maps.

{{% hint info %}}
TODO: figure
{{% /hint %}}
