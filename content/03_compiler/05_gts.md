+++
title = "Graph transformation systems on minIR"
weight = 5
layout = "section"
slug = "sec-gts-def"
+++

We conclude this chapter by presenting two approaches to specifying graph
transformation systems (GTSs) on minIR. The first and simplest transformation
system uses graph transformation _rules_, ubiquitous in graph transformation
theories, to produce valid rewrites. The second generalises transformation rules
in the case that they express graph equivalences by storing sets of $n$
equivalent graphs to represent the $\Theta(n^2)$ transformation rules between
all pairs of equivalent graphs. This formalises the "equivalence classes of
circuits" construction proposed in @Jia2019. Unlike transformation rules, a GTS
based on equivalence classes cannot encode any transformation _directedness_ in
a rule set[^allandtheirinverse].

[^allandtheirinverse]:
    Meaning that for every rule in the system, there is another rule that is its
    inverse.

### Graph transformation rules

We define graph transformation rules on minIR using morphisms. Unlike the main
instance of minIR morphisms that we have seen so far---the $type$ morphism of
{{% reflink "sec:graph-defs" %}}---morphisms that define transformations must
preserve linearity. We define for this:

{{% definition title="MinIR linear morphism" id="def-linearmorph" %}}

A minIR morphism $\varphi: G \to H$ is _linear_ if the restriction of
$\varphi_V$ to linear values
$$\left.\varphi_V\right|_{(V_G)_L}: (V_G)_L \to (V_H)_L$$ is injective.

If the domain of definition of $\varphi$ is the subgraph associated with an
interface graph $\bar{G}$ with input and output operations $o_{in}$ and
$o_{out}$, then we further define:

- $\varphi$ is _use-injective_ if $\varphi_V$ is injective on the domain
  $\mathit{def}\,(o_{in})$,
- $\varphi$ is _def-injective_ if $\varphi_V$ is injective on the domain
  $use(o_{out})$,
- $\varphi$ is _def-surjective_ if the image of $\varphi_V(use(o_{out})) = B_D$,
  where $B_D$ is the def-boundary of the image of $V_G$ under $\varphi_V$:
  $$B_D = \{v \in \varphi(V_G) \mid v \in use(o)\textrm{ for some }o \in O_H \smallsetminus \varphi(O_G) \}.$$

{{% /definition %}}

The three properties in the above definition define different "flavours" of
injectivity and surjectivity on the boundary values of the interface graph $G$.
The mapping of the boundary values is important as it determines how the
interface of $G$ relates to the interface of the image subgraph
$\varphi(G) \subseteq H$.

Note that unless $H$ is itself an interface graph, it typically makes little
sense to define images for the input and output operations $o_{in}, o_{out}$ of
an interface graph $\bar{G}$. This is why
{{% refdefinition "def-linearmorph" %}} specifically refers to the associated
subgraph $G \subseteq \bar{G}$ obtained from an interface graph by removing the
input and output operations.

When, on the other hand, both domain and image of $\varphi$ are interface
graphs, we refer to the morphism as an _interface morphism_:

{{% definition title="MinIR interface morphism" id="def:minir-interface-morphism" %}}

Let $\bar{G}$ and $\bar{H}$ be two interface graphs. An interface morphism
$\varphi: \bar{G} \to \bar{H}$ is a linear minIR morphism that maps the input
and output operations $o_{in}$ and $o_{out}$ of $\bar{G}$ to the input and
output operations of $\bar{H}$.

{{% /definition %}}

From here on, we will assume that all minIR graphs that we consider share a
common type system $\Sigma$ that the minIR morphisms preserve. Using interface
morphisms, we can define transformation rules on minIR in the familiar way,
using pairs of morphisms with domain $\bar{G}_I$, also known as
[_spans_](https://ncatlab.org/nlab/show/span#in_category_theory):

<!-- prettier-ignore -->
{{% definition title="MinIR transformation rule" id="minirtransfo" %}}
Let $\bar{G}_I, \bar{G}_L$ and $\bar{G}_R$ be minIR interface graphs that implement $I, I_L$ and
$I_R$ respectively.

A minIR transformation rule is given by two interface morphisms
$\varphi_L: \bar{G}_I \to \bar{G}_L$ and $\varphi_R: \bar{G}_I \to \bar{G}_R$
such that $\varphi_L$ is def-injective and $\bar{G}_R$ is use-injective. We
write the transformation rule as
$\bar{G}_L \leftarrow \bar{G}_I \rightarrow \bar{G}_R$.

<!-- prettier-ignore -->
{{% /definition %}}

A transformation rule along with a linear morphism $G_L \to G$ on the associated
subgraph $G_L \subseteq \bar{G}_L$ defines a rewrite on $G$:

<!-- prettier-ignore -->
{{< proposition title="Rule application" id="prop:rule-application" >}}

Let $\bar{G}_L \leftarrow \bar{G}_I \rightarrow \bar{G}_R$ be a minIR
transformation rule and let $\varphi: G_L \to G$ be a def-injective and
def-surjective linear morphism such that the image $H = \varphi(G_L)$ of $G_L$
is a valid convex minIR subgraph of $G$.

If $I_H$ and $I_R$ are the interfaces of $H$ and $G_R$ respectively, then we
have $I_H \triangleleft I_R$.

_Corollary:_ Let $B$ be the boundary values of the subgraph
$\varphi(G_L) \subseteq G$ and let
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
{{% refproposition "prop-fullrewrite" %}}. All that remains to be shown is $I_H \triangleleft I_R.$

Let $\varphi_L: \bar{G}_I \to \bar{G}_L$ and
$\varphi_R: \bar{G}_I \to \bar{G}_R$ be the interface morphisms that make up the
transformation rule. By def-injectivity of $\varphi_L$ and the fact that it is
an interface morphism, as well as the def-injectivity and def-surjectivity of
$\varphi$, the map $\varphi \circ \varphi_L$ defines a bijective map on the
restricted map from $use(o_{out}) \subseteq V_I$ to $B_D$, where

$$B_D = \{v \in \varphi(V_L) \mid v \in use(o)\textrm{ for some }o \in O \smallsetminus \varphi(O_L) \}.$$

This follows from observing that $\varphi_L(o_{out})$ is the out operation
$o_{L, out}$ in $\bar{G}_L$ and that $\varphi(v) \in B_D$ if and only if
$v \in use(o_{L, out})$---otherwise it would hold $\varphi(v) \in use(o')$ for
some $o' \in \varphi(O_L)$.

Write $D = use(o_{out}),$ $D_L = \textrm{ord}(B_D)$ and $D_R = use(o_{R, out})$,
where $\textrm{ord}(B_D) \in T^\ast$ designates an arbitrary ordering of the set
$B_D$ and $o_{R, out}$ is the out operation in $\bar{G}_R$. We can define
$$\rho_D^{(L)}: \mathrm{Idx}(D_L) \to \mathrm{Idx}(D),$$ which is bijective and
preserves value types by the definition of morphisms. The map $\varphi_R$ on the
other hand defines a map $$\rho_D^{(R)}: \mathrm{Idx}(D) \to \mathrm{Idx}(D_R)$$
that is bijective on linear values, where $o_{R, out}$ is the out operation in
$\bar{G}_R$. It follows that $\rho_D = \rho_D^{(R)} \circ \rho_D^{(L)}$ is an
index map $\mathrm{Idx}(D_L) \to \mathrm{Idx}(D_R)$ that preserves types and is
bijective on linear types.

Similarly, consider
$$B_U = \{v \in V_H \mid v \in \mathit{def}\,(o)\textrm{ for some }o \in O \smallsetminus O_H \}$$
and write $U = def(o_{in}),$ $U_L = \textrm{ord}(B_U)$ and
$U_R = use(o_{R, in}).$ $o_{R, out}$ is the out operation in $\bar{G}_R$. The
map $$\rho_U^{(R)}: \mathrm{Idx}(U_R) \to \mathrm{Idx}(U)$$ can be obtained from
the inverse of the use-injective interface morphism $\varphi_R$ on the image
$\varphi_R(U)$ and the map
$$\rho_U^{(L)}: \mathrm{Idx}(U) \to \mathrm{Idx}(U_L)$$ is obtained from the
restriction of $\varphi \circ \varphi_L$ to the domain $U$. Defining
$\rho_U = \rho_U^{(L)} \circ \rho_U^{(R)}$ gives us a pair of index maps
$(\rho_D, \rho_U)$ that satisfy {{% refdefinition "def-interface" %}} and hence
we conclude that $I_H \triangleleft I_R$.

<!-- prettier-ignore -->
{{% /proof %}}

The definitions of rewrites and transformation rules presented in these
paragraphs and in the last section overlap with the graph transformations
defined for arbitrary graphs resulting from the double pushout construction, as
presented in @Koenig2018. The definitions coincide "most of the time", but it is
interesting to identify some of the edge cases where DPO and our minIR rewriting
formalism differ:

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
$o \in O$ such that $\varphi(v) \in \textit{def}\,(o)$. Because
$\varphi(v) \in B_U$, $o$ cannot have a preimage in $O_L$, and thus it follows
that both $v, w \in \textit{def}\,(o_{in})$. The case where DPO is ill-defined
is hence impossible in minIR.

**Non-injectivity of $\varphi_L$.**&emsp; The DPO construction exists in cases
where $\varphi_L: \bar{G}_I \to \bar{G}_L$ is non-injective, but the rewrite is
not unique. The definitions of transformation rule and rewrite in minIR, on the
other hand, are such that the application of a transformation rule is always
unique. Injectivity is required for linear values as well as for value
definitions, otherwise the resulting minIR graph is invalid (with either
multiple value definitions or copies of linear values). For non-injectivity of
$\varphi_L$ on $\textit{def}\,(o_{in}) \subseteq V_L$, the non-deterministic
"vertex split" that would occur in the DPO construction corresponds to a copy of
a value $v$ in minIR and is well-defined as long as $v$ is non-linear.

**Non-injectivity of $\varphi_R$.**&emsp; Finally, DPO is always well-defined on
non-injective $\varphi_R$. However, in minIR transformations we impose
use-injectivity as merging two values in $B_D$ would produce an invalid graph
with multiple definitions for the same value.

### Equivalence classes of graphs

An alternative definition of graph transformations in GTSs is using partitions
of graphs into equivalence classes. This specifies sets of graphs between which
transformations are always allowed.

This is particularly useful in applications where transformation rules encode
graph equivalences (rather than, say, graph evolution) and there is no obvious
way to fix the direction in which transformations should be applied. Such
systems are good candidates for equality saturation-like approaches as discussed
in {{% reflink "chap:parallel" %}}, and correspond to the transformations used
by the quantum superoptimiser presented in @Jia2019.

Consider two minIR interface graphs $\bar{G}$ and $\bar{H}$, with values
$V_G, V_H$ and operations $O_G, O_H$ respectively. Two partial maps
$\hat{\varphi}_V: V_G \rightharpoonup V_H$ and
$\hat{\varphi}_O: O_G \rightharpoonup O_H$ define a _partial interface morphism_
that we write $\hat{\varphi}: \bar{G} \rightharpoonup \bar{H}$ if the map
$\varphi$ that is obtained from the restrictions of $\hat{\varphi}_V$ and
$\hahatvarphi}_O$ to their respective domains of definition
$dom(\hat{\varphi}_V)$ and $dom(\hat{\varphi}_O)$ define a valid interface
morphism.

{{% definition title="Equivalence class" id="minireqclass" %}}

Let $G_I$ be a minIR interface graph. An equivalence class of graphs
$\mathcal E$ is a set of interface graphs $G_\alpha$ indexed by some
$\alpha \in \mathcal A$ along with a set of corresponding partial interface
morphisms
$$\mathcal E = \{\hat{\varphi}_\alpha: G_I \to G_\alpha\mid \alpha \in \mathcal A\}.$$

We say that a transformation rule

$$G_L \overset{\varphi_L}{\longleftarrow} G_J \overset{\varphi_R}{\longrightarrow} G_R$$

is _contained_ in $\mathcal E$ if there are
$\hat{\varphi}_L, \hat{\varphi}_R \in \mathcal E$ and a minIR graph $G_J$ with
values $V_J \subseteq V_I$ and operations $O_J \subseteq O_I$ such that

$$\begin{aligned}V_J &\subseteq dom((\hat{\varphi}_L)_V) \cap dom((\hat{\varphi}_R)_V)\\O_J &\subseteq dom((\hat{\varphi}_L)_O) \cap dom((\hat{\varphi}_R)_O)\end{aligned}$$

and such that the restrictions $\varphi_L$ and $\varphi_R$ of $\hat{\varphi}_L$
and $\hat{\varphi}_R$ to the subgraph $G_J$ define interface morphisms and are
respectively def-injective and use-injective.

{{% /definition %}}

The following example illustrates a set of equivalent minIR graphs that a minIR
equivalence class could capture. Any valid transformation will preserve minIR
constraints such as linearity, whilst allowing the copying and discarding of
non-linear values, which arise from non injective boundary maps.

{{% figure src="svg/eq-classes.svg"
           enlarge="full" width="85%"
           caption="Two examples of minIR equivalence classes. MinIR programs are expressed as hybrid quantum circuits; single lines represent qubit values, double lines are classical (solid for booleans and dashed for floats). The left-hand side shows a case where the classical inputs $\alpha$ and $\beta$ may be mapped non-injectively: transformations from C to A and B are allowed as the $\alpha = \beta$ input may be copied, but the inverse transformations are not. On the right-hand side, the transformation from F to D or E would be non-surjective on its outputs and correspond to discarding the boolean $b$. The inverse transformations are impossible as F does not produce a value for $b$."
%}}
