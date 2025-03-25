+++
title = "Graph transformation systems on minIR"
weight = 5
layout = "section"
slug = "sec-gts-def"
+++

In the second part, we will review two approaches to defining minIR graph
transformation semantics, one based on the DPO construction and the other a
generalisation of it that formalises the "equivalence classes of circuits"
proposed in @Jia2019.


We conclude this chapter by presenting two ways to specify the valid
transformations of minIR GTSs. The first and simplest are graph transformation
rules, ubiquitous in graph transformation theories; the second generalises
transformation rules in the case that they express graph equivalences by storing
sets of $n$ equivalent graphs to represent the $\Theta(n^2)$ transformation
rules between all pairs of equivalent graphs. Unlike transformation rules, a GTS
based on equivalence classes cannot encode any transformation _directedness_ in
a rule set[^allandtheirinverse].

[^allandtheirinverse]:
    Meaning that for every rule in the system, there is another rule that is its
    inverse.

### Graph transformation rules

We define graph transformation rules on minIR using _interface morphisms_.

<!-- prettier-ignore -->
{{% definition title="MinIR interface morphism" %}}
Let $G_I$ and $G$ be two $\Sigma$-typed minIR graphs with $G_I$ such
that it implements an interface $I$, with in/out operations $o_{in}$ and $o_{out}$.

A minIR morphism $\varphi: (G_I \smallsetminus \{o_{in}, o_{out}\}) \to G$ with
value map $\varphi_V$ is an interface morphism if the restriction of $\varphi_V$
to linear values $$\left.\varphi_V\right|_{(V_I)_L}: (V_I)_L \to V_L$$ is
injective. Furthermore, we say that

- $\varphi$ is _def-injective_ if $\varphi_V$ is injective on $use(o_{out})$,
- $\varphi$ is _use-injective_ if $\varphi_V$ is injective on
  $\mathit{def}\,(o_{in})$,
- $\varphi$ is _def-surjective_ if the image of $\varphi_V(use(o_{out})) = B_D$,
  where
  $$B_D = \{v \in \varphi(V_I) \mid v \in use(o)\textrm{ for some }o \in O \smallsetminus \varphi(O_I) \}.$$
- $\varphi$ _preserves IO_ if $G$ implements an interface $I'$ and $\varphi$ can
  be extended to a morphism mapping $o_{in}$ and $o_{out}$ to the corresponding
  in/out operations in $G$.

<!-- prettier-ignore -->
{{% /definition %}}

From here on, for all minIR graphs that we consider, it is tacitly assumed that
they share a common type system $\Sigma$. Using interface morphisms, we can
define transformation rules on minIR in the familiar way, using pairs of
morphisms with domain $G_I$, also known as
[_spans_](https://ncatlab.org/nlab/show/span#in_category_theory):

<!-- prettier-ignore -->
{{% definition title="MinIR transformation rule" id="minirtransfo" %}}
Let $G_I, G_L$ and $G_R$ be minIR graphs that implement interfaces $I, I_L$ and
$I_R$ respectively.

A minIR transformation rule is given by two IO preserving interface morphisms
$\varphi_L: G_I \to G_L$ and $\varphi_R: G_I \to G_R$ such that $\varphi_L$ is
def-injective and $G_R$ is use-injective. We write the transformation rule as
$G_L \leftarrow G_I \rightarrow G_R$.

<!-- prettier-ignore -->
{{% /definition %}}

A transformation rule along with an interface morphism of $G_L$ into a minIR
graph $G$ defines a rewrite on $G$:

<!-- prettier-ignore -->
{{< proposition title="Rule application" >}}
Let $G_L \leftarrow G \rightarrow G_R$ be a minIR transformation rule and let
$\varphi: G_L \to G$ be a (non-IO preserving) def-injective and def-surjective
interface morphism
such that the image $H = \varphi(G_L)$ of $G_L$ is a valid minIR subgraph of $G$
that implements an interface $I_H$.

Then, we have that the interface $I_R \triangleright I_H$.

_Corollary:_ Let $B$ be the boundary values of $\varphi(G_L)$ and let
$$O_B = \{o \in \varphi(O_L) \mid v \in B\textrm{ for all }v \in \mathit{def}\,(o) \cup use(o)\}.$$
It follows by {{% refproposition "prop-fullrewrite" %}} that there is $G_R'$ and
$\mu'$ such that the graph $r_\varphi(G)$ obtained from the rewrite
$$r_\varphi = (G_R', \varphi(V_L), O_B, \mu')$$ is a valid minIR graph.

<!-- prettier-ignore -->
{{< /proposition >}}

Note that {{% refproposition "prop-fullrewrite" %}} and its proof give an
explicit construction for $r_\varphi$ and $r_\varphi(G)$ that we do not repeat
here.

<!-- prettier-ignore -->
{{% proof %}}
The second half of the statement (under "corollary") follows directly from
{{% refproposition "prop-fullrewrite" %}}. All that remains to be shown is $I_R \triangleright I_H.$

Let $\varphi_L: G_I \to G_L$ and $\varphi_R: G_I \to G_R$ be the interface
morphisms that make up the transformation rule. By def-injectivity of
$\varphi_L$ and $\varphi$, as well as IO-preservation of $\varphi_L$ resp.
def-surjectivity of $\varphi$, the map $\varphi \circ \varphi_L$ defines a
bijective map on the restricted map from $use(o_{out}) \subseteq V_I$ to $B_D$,
where

$$B_D = \{v \in \varphi(V_L) \mid v \in use(o)\textrm{ for some }o \in O \smallsetminus \varphi(O_L) \}.$$

This follows from remarking that $\varphi_L(o_{out})$ is the out operation
$o_{L, out}$ in $G_L$ and that $\varphi(v) \in B_D$ if and only if
$v \in use(o_{L, out})$---otherwise it would hold $\varphi(v) \in use(o')$ for
some $o' \in \varphi(O_L)$.

Write $D = use(o_{out}),$ $D_L = \textrm{ord}(B_D)$ and $D_R = use(o_{R, out})$,
where $\textrm{ord}(B_D) \in T^\ast$ designates an arbitrary ordering of the set
$B_D$ and $o_{R, out}$ is the out operation in $G_R$. We can define
$$\rho_D^{(L)}: \mathrm{Idx}(D_L) \to \mathrm{Idx}(D),$$ which is bijective and
preserves value types by the definition of morphisms. The map $\varphi_R$ on the
other hand defines a map $$\rho_D^{(R)}: \mathrm{Idx}(D) \to \mathrm{Idx}(D_R)$$
that is bijective on linear values, where $o_{R, out}$ is the out operation in
$G_R$. It follows that $\rho_D = \rho_D^{(R)} \circ \rho_D^{(L)}$ is an index
map $\mathrm{Idx}(D_L) \to \mathrm{Idx}(D_R)$ that preserves types and is
bijective on linear types.

Similarly, consider
$$B_U = \{v \in V_H \mid v \in \mathit{def}\,(o)\textrm{ for some }o \in O \smallsetminus O_H \}$$
and write $U = def(o_{in}),$ $U_L = \textrm{ord}(B_U)$ and
$U_R = use(o_{R, in}).$ $o_{R, out}$ is the out operation in $G_R$. The map
$$\rho_U^{(R)}: \mathrm{Idx}(U_R) \to \mathrm{Idx}(U)$$ can be obtained from the
inverse of the use-injective and IO-preserving map $\varphi_R$ on the image
$\varphi_R(U)$ and the map
$$\rho_U^{(L)}: \mathrm{Idx}(U) \to \mathrm{Idx}(U_L)$$ is obtained from the
restriction of $\varphi \circ \varphi_L$ to the domain $U$. Defining
$\rho_U = \rho_U^{(L)} \circ \rho_U^{(R)}$ gives us a pair of index maps
$(\rho_D, \rho_U)$ that satisfy {{% refdefinition "def-interface" %}} and hence
we conclude that $I_R \triangleright I_H$.

<!-- prettier-ignore -->
{{% /proof %}}

The definitions of rewrites and transformation rules presented in these
paragraphs and in the last section overlap with the graph transformations
defined for arbitrary graphs resulting from the double pushout construction, as
presented in @Koenig2018. The definitions are equivalent _most of the time_, but
it is interesting to identify some of the edge cases where DPO and our minIR
rewriting formalism differ:

**Implicit edge removal.**&emsp; A DPO transformation is not defined when there
is an edge in $G$ that is not in the image of $\varphi$:
$$e \in E(G) \smallsetminus \varphi(E_L)$$

but has an endpoint $v \in e$ such that
$v \in \varphi(V_L \smallsetminus \varphi_L(V_I)),$ i.e. that is in the image of
$\varphi$ but not in the image of $\varphi \circ \varphi_L$. In minIR graphs,
this corresponds to the case of a boundary value $v \in B \subseteq G$ such that

$$v \not\in \varphi(use(o_{L, out}) \cup \textit{def}\,(o_{L, in})).$$

The case $v \in B_U$ is impossible because in a valid minIR there is a unique
$o_L \in O_L$ such that $v \in \varphi(\textit{def}\,(o_L))$---thus either
$v \in \textit{def}\,(\varphi(o_L))$ and it cannot be in $B_U$, or
$o_L = o_{L,in}\}$. The same argument holds for $v \in B_D$ when $v$ is linear.
Finally, the last case $v \in B_D$ and $v$ not linear is forbidden by requiring
that $\varphi$ be def-surjective.

**Non-injectivity of $\varphi$ on $B$.**&emsp; A DPO transformation is not
defined either when $\varphi$ identifies two vertices $v \in \varphi_L(V_I)$ and
$w \in V_L \smallsetminus \varphi_L(V_I)$. The case
$\varphi(v) = \varphi(w) \in B_D$ is excluded in minIR transformations by the
requirement of def-injectivity of $\varphi$. The case
$\varphi(v) = \varphi(w) \in B_U \smallsetminus B_D$ on the other hand is
permitted. In this case, by validity of minIR graph, there is a unique operation
$o in O$ such that $\varphi(v) \in \textit{def}\,(o)$. Because
$\varphi(v) \in B_U$, $o$ cannot have a preimage in $O_L$, and thus it follows
that both $v, w \in \textit{def}\,(o_{in})$, thus the case where DPO is
ill-defined is impossible in minIR.

**Non-injectivity of $\varphi_L$.**&emsp; The DPO construction exists in cases
where $\varphi_L: G_I \to G_L$ is non-injective, but the rewrite is not unique.
The definitions of transformation rule and rewrite in minIR, on the other hand,
are such that the application of a transformation rule is always unique.
Injectivity is required for linear values as well as for value definitions,
otherwise the resulting minIR graph is invalid (with either multiple value
definitions or copies of linear values). For non-injectivity of $\varphi_L$ on
$\textit{def}\,(o_{in}) \subseteq V_L$, the non-deterministic "vertex split"
that would occur in the DPO construction corresponds to a copy of a value $v$ in
minIR and is well-defined as long as $v$ is non-linear.

**Non-injectivity of $\varphi_R$.**&emsp; Finally, DPO is always well-defined on
non-injective $\varphi_R$. However, in minIR transformations we impose
use-injectivity as merging two values in $B_D$ would produce an invalid graph
with multiple definitions for the same value.

### Equivalence classes of graphs

An alternative definition of graph transformations in GTSs is using partitions
of graphs into equivalence classes. This is particularly useful in applications
where transformation rules encode graph equivalences (rather than, say, graph
evolution) and there is no obvious way to fix the direction in which
transformations should be applied. Such systems are good candidates for equality
saturation-like approaches as discussed in {{% reflink "chap:parallel" %}}.

Consider two graph $G$ and $G_I$, with $G_I$ implementing and interface $I$. The
values and operations of the graphs are $V_I, O_I$ and $V, O$ respectively. Two
maps $\overline{\varphi}_V: V_I \rightharpoonup V$ and
$\overline{\varphi}_O: O_I \rightharpoonup O$ define a _partial interface
morphism_ that we write $\overline{\varphi}: G_I \rightharpoonup G$ if the map
$\varphi$ that is obtained from the restrictions of $\overline{\varphi}_V$ and
$\overline{\varphi}_O$ to their respective domains of definition define a valid
interface morphism.

<!-- prettier-ignore -->
{{% definition title="Equivalence class" id="minireqclass" %}}
Let $G_I$ be a minIR graph that implements an interface $I$.
An equivalence class of graphs $\mathcal E$ is a set of partial interface morphisms
$$\mathcal E = \{\overline{\varphi}_\alpha: G_I \to G_\alpha\mid \alpha \in \mathcal A\}$$
for some collection of minIR graphs $G_\alpha$, $\alpha \in \mathcal A.$

We say that a transformation rule

$$G_L \overset{\varphi_L}{\longleftarrow} G_J \overset{\varphi_R}{\longrightarrow} G_R$$

is _contained_ in $\mathcal E$ if there are
$\overline{\varphi}_L, \overline{\varphi}_R \in \mathcal E$ and a minIR graph
$G_J$ with values $V_J \subseteq V_I$ and operations $O_J \subseteq O_I$ such
that
$$\begin{aligned}V_J &\subseteq dom((\overline{\varphi}_L)_V) \cap dom((\overline{\varphi}_R)_V)\\O_J &\subseteq dom((\overline{\varphi}_L)_O) \cap dom((\overline{\varphi}_R)_O)\end{aligned}$$
and such that the restrictions $\varphi_L$ and $\varphi_R$ of
$\overline{\varphi}_L$ and $\overline{\varphi}_R$ to the subgraph $G_J$ define
interface morphisms and are respectively def-injective and use-injective.

<!-- prettier-ignore -->
{{% /definition %}}

The following example illustrates a set of equivalent minIR graphs that a minIR
equivalence class could capture. Any valid transformation will preserve minIR
constraints such as linearity, whilst allowing the copying and discarding of
non-linear values, which arise from non injective boundary maps.

<!-- prettier-ignore-start -->
{{% hint info %}}
TODO: figure
{{% /hint %}}
<!-- prettier-ignore-end -->
