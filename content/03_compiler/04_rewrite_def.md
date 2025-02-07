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

We first define a notion of compatible type strings---and by extension, type signatures.
Consider type strings $U, D \in T^\ast$.
We say that a map
$g: \{1, \ldots, |U|\} \to \{1, \ldots, |D|\}$
_generalises_
$U$ to $D$, written $D \geqslant_g U$, if $g$ is
such that $U_i = D_{g(i)}$ for all $1 \leqslant i \leqslant |U|$
and the restriction of $g$ to linear types is bijective
$$g: \{1 \leqslant i \leqslant |U| \mid U_i \in T_L\} \overset{\simeq}{\longrightarrow} \{1 \leqslant i \leqslant |D| \mid D_i \in T_L\}.$$

For all type strings $U, D \in T^\ast$, we define a minIR `hole<U, D>: U -> D`
operation---a black box operation that consumes values of type $U$ and
defines new values of type $D$.
A hole can then be _filled_ by a `Region<U', D'>` using familiar graph gluings
whenever there are maps $g$ and $g'$ such that $U' \geqslant_g U$ and $D \geqslant_{g'} D'$.
For a minIR graph $(V, O, \mathit{def}, \mathit{use}, \mathit{parent})$,
- let $h \in O$ be a hole $type(o) = hole_{UD}$
- let $r \in V$ be a region $type(r) = Region_{UD}$ with no use, i.e. for all $o \in O$, $r \not\in use(o)$.

Let $r_{in}$ and $r_{out}$ be the `in` and `out` operations of the region $r$, i.e.
the children of the unique $r_{\mathit{def}}$ operation such that
$\mathit{def}\,(r_{\mathit{def}}) = r$.
Define the equivalence relation $\eqsim$ on $V^2$ by the transitive, symmetric
and reflexive
closure of
- $v \eqsim v'$ if there exists $1 \leqslant i \leqslant |U|$ such that
$v = \mathit{use}(h)[i]$ and $v' = \mathit{def}\,(r_{in})[g_1(i)]$,
- $v \eqsim v'$ if there exists $1 \leqslant i \leqslant |D'|$ such that
$v = \mathit{def}\,(h)[g_2(i)]$ and $v' = \mathit{use}(r_{out})[i]$.

Then $\eqsim$ defines the gluing of $h$ and $r$:
{{% definition title="MinIR gluings" number="3.4" %}}
The gluing in a minIR graph $G$ of a hole $h$ and region $r$ with compatible
signatures and such that $r$ has no uses is the graph
obtained from
- vertices $V' = (V / \eqsim)\smallsetminus \{r\}$,
- operations $O' = O \smallsetminus \{h, r_{\mathit{def}}, r_{\mathit{in}}, r_{\mathit{out}}\}$,
- the function $\mathit{parent}$ restricted to the domain $O'$, and
- the functions $\mathit{def}\textrm{ }', \mathit{use}'$
obtained from their equivalent in $G$ by mapping strings in the codomain $V^\ast$
elementwise to strings of equivalence classes in $(V')^\ast$.
{{% /definition %}}
We first show that the result of a gluing is always a well-defined minIR
graph, and will then proceed to some examples that illustrate the definition.

_Well-definedness of link functions._
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
of $\eqsim$ that all values within an equivalence class are of the same type.

_Single definition of values_.
Suppose there is an equivalence class $\alpha \in V'$ and $v, v' \in \alpha$
such that there exists $o, o' \in O'$ with $v \in \mathit{def}\,(o)$
and $v' \in \mathit{def}\,(o')$.
Given that $r_{in}, h \not\in O'$, it must hold by the definition of $\eqsim$
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
Both operations cannot be in the _tbd_.

{{% hint info %}}
Examples.
{{% /hint %}}

#### Pattern matching
Gluing establishes a way to transform minIR graphs---provided there are
holes within them.
The second half of the minIR GTS consists in creating
these holes from matching pattern graphs.

Inserting a hole in place of a subgraph is straightforward, provided some
constraints are met, using a similar graph gluing construction as above.
For a minIR graph $(V, O, \mathit{def}, \mathit{use}, \mathit{parent})$,
a subgraph is defined by vertices and edges $V_S \subseteq V$ and $O_S \subseteq O$.
We define the boundary values of the subgraph $(V_S, O_S)$ by the
set of values
$$B = \{v \in V \mid v \in \mathit{def}\,(o)\textrm{ or }v \in \mathit{use}(o)\textrm{ for some }o \in O \smallsetminus O_S \}.$$
{{% definition title="Hole insertion" number="3.5" %}}
A hole can be inserted in a minIR graph $(V, O, \mathit{def}, \mathit{use}, \mathit{parent})$
in place of a subgraph given by vertices and edges
$V_S \subseteq V$ and $O_S \subseteq O$ if:
- the subgraph is convex, i.e. for all $v_1, v_2 \in V_S$, any path along
$\leadsto$ from $v_1$ to $v_2$ contains only vertices in $V_S$,
- parent-child relations are contained within the subgraph, i.e.
for all $v \in dom(\mathit{parent})$, $v \in V_S$ if and only if $\mathit{parent}(v) \in V_S$.
- for all boundary values $b_1, b_2 \in B$, $b_1 \sim b_2$, i.e. all boundary values
are in the same region.
{{% /definition %}}
