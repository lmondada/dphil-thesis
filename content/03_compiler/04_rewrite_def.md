+++
title = "Rewriting minIR graphs"
weight = 4
layout = "section"
slug = "sec:rewrite-def"
+++

As discussed in {{% reflink "sec-compgraphs" %}}, computation graphs with linear
values, such as minIR, must adopt strict graph transformation semantics to
ensure that linear constraints are satisfied at all times. In this section, we
use graph glueings to define graph rewriting semantics that are similar to the
double pushout (DPO) construction for graph transformations rules @Ehrig1976, as
presented e.g. in @Bonchi2017.

DPO transformations can be formulated categorically in adhesive categories
@Lack2005. However, minIR rewriting requires additional bijectivity conditions
to guarantee that linear types are handled correctly and no cyclic dependencies
are created. On the other hand, minIR transformations should allow the implicit
discarding of non-linear values in rewrites, which DPO semantics would exclude.
We will return to the comparison between DPO and transformations on minIR in
{{% reflink "sec-gts-def" %}}.

For these reasons, our presentation does not adhere to DPO semantics and is
purely operational rather than categorical. This section introduces the graph
rewriting operations, i.e. the graph mutation operations that we will consider.
It then presents some sufficient conditions for graph rewrites to preserve the
minIR validity conditions of {{% refdefinition "minirdef" %}}, as well as a
discussion of how more complex rewrites can be achieved by composition.

#### Graph glueings and rewrites

<!-- prettier-ignore -->
{{% hint "info" %}}

Throughout, we consider graph glueings on disjoint vertex and (hyper)edge sets.
To underline this, we will use the $\sqcup$ symbol to denote disjoint set
unions.

<!-- prettier-ignore -->
{{% /hint %}}

All graph transformations that we consider operate through local graph rewrites,
which we define in terms of graph glueings. Consider first the case of two
arbitrary graphs $G_1 = (V_1, E_2)$ and $G_2 = (V_2, E_2)$, along with a
relation $\mu\ \subseteq V_1 \times V_2$. Let
$\sim_\mu \ \subseteq (V_1 \sqcup V_2)^2$ be the equivalence relation induced by
$\mu$, i.e. the smallest relation on $V_1 \sqcup V_2$ that is reflexive,
symmetric and transitive, and satisifes for all $v_1 \in V_1$ and $v_2 \in V_2$,

$$(v_1, v_2) \in \mu \Rightarrow v_1 \sim_\mu v_2.$$

Then, we can define

- $V = (V_1 \sqcup V_2)/\sim_\mu$ is the set of all equivalence classes of
  $\sim_\mu$, and
- for $v \in V_1 \sqcup V_2$, $\alpha_\mu(v) \in V$ is the equivalence class of
  $\sim_\mu$ that $v$ belongs to.

<!-- prettier-ignore -->
{{% definition title="Graph glueing" id="def-graphglueings" %}}
The glueing of $G_1$ and $G_2$ according to the glueing relation $\mu$ is
given by the vertices $V = (V_1 \sqcup V_2)/\sim_\mu$ and the edges

$$E = \{(\alpha_\mu(u), \alpha_\mu(v)) \mid (u,v) \in E_1 \sqcup E_2 \} \subseteq V^2.$$

We write the glueing graph as $(G_1 \sqcup G_2) / \sim_\mu$.

<!-- prettier-ignore -->
{{% /definition %}}

In other words, the glueing is the disjoint union of the two graphs, with
identification (and merging) of vertices that are related in $\mu$.

This allows us to define a rewrite on a graph $G$:

<!-- prettier-ignore -->
{{% definition title="Graph rewrite" id="minirrewrite" %}}
A rewrite $r$ on a graph $G = (V, E)$ is given by a tuple $r = (G_R, V^-, E^-, \mu)$,
with

- $G_R = (V_R, E_R)$ is a graph called the _replacement graph_,
- $V^- \subseteq V$ is the _vertex deletion set_,
- $E^- \subseteq E \cap dom(\mu)^2$ is the _edge deletion set_, and
- $\mu: V^- \rightharpoonup V_R$ is the _glueing relation_, a partial function
  that maps a subset of the deleted vertices of $G$ to vertices in the
  replacement graph.

The domain of definition $dom(\mu)$ is known as the boundary values of $r$.

<!-- prettier-ignore -->
{{% /definition %}}

Define the _context_ subgraph $G_C = (V_C, E_C)$ of $G$ given by

{{% centered numbered="rewrite-result" %}}
$$\begin{aligned}V_C &= (V \smallsetminus V^-) \ \cup\ dom(\mu)\\E_C &= (E \smallsetminus E^-)\ \cap\ V_C^2.\end{aligned}$$
{{% /centered %}}

The partial function $\mu$ is a special case of a glueing relation
$\mu \subseteq V_C \times V_R$, and thus defines a glueing of $G_C$ with $G_R$.
The rewritten graph resulting from applying $r$ to $G$ is
$$r(G) = (G_C \sqcup G_R) / \sim_\mu.$$

An example of a graph rewrite is given in the next figure.

{{% figure src="/svg/graph-rewrite.svg" width="90%" enlarge="full"
    caption="Application of a graph rewrite. On the left, the original graph $G$ along with the replacement graph $G_R$  (grey box). On the right, the rewritten graph $r(G)$. Only the vertex $g$ has been deleted, as other vertices in $V^-$ are in the boundary $dom(\mu)$ (in orange). The (singleton) edge deletion set is red. The blue edge connects a vertex of $V \smallsetminus V^-$ to a boundary vertex, and is thus also present on the right-hand side. The purple edge, on the other hand, connects a vertex of $V \smallsetminus V^-$ to a non-boundary vertex of $V^-$, and is thus deleted." %}}

When there are no edges between $V \smallsetminus V^-$ and
$V^- \smallsetminus dom(\mu)$ (purple in the example above), this definition
corresponds to graph rewrites that can be produced using DPO transformations
(see discussion in {{% reflink "sec-gts-def" %}}). Otherwise, such edges are
deleted.

The notions of graph glueing and graph rewrite can straightforwardly be lifted
to hypergraphs and, by extension, to minIR graphs. Notice that in this case,
values are glued together, not operations (the former were defined as the
graph's vertices, the latter as its hyperedges).

However, the glueing of two valid minIR graphs---and the result of applying a
valid rewrite---may not be a valid minIR graph. Glueing two values of a linear
type, for instance, is a sure way to introduce multiple uses (or definitions) of
it. Thus, we must be careful to only consider glueings and rewrites of minIR
graphs that preserve all the constraints we have imposed in
{{% refdefinition "minirdef" %}}.

#### Ensuring rewrite validity: interfaces

As a sufficient condition for valid minIR rewrites, we introduce minIR
_interfaces_, a concept closely related to the "hypergraph with interfaces"
construction of @Bonchi2017 or the supermaps of quantum causality @Hefford2024.
We eschew the presentation of holes as a slice category in favour of a
definition that fits naturally within minIR and is sufficient for our purposes.

Let $G$ be a $\Sigma$-typed minIR graph with data types $T$ and linear types
$T_L \subseteq T$. Consider type strings $S, S' \in T^\ast$. We define the index
sets

$$\begin{aligned}\mathrm{Idx}(S) &= \{i \in \mathbb{N} \mid 1 \leq i \leq |S|\}\\\mathrm{Idx}_L(S) &= \{i \in \mathrm{Idx}(S) \mid S_i \in T_L\} \subseteq \mathrm{Idx}(S)\end{aligned}$$

corresponding respectively to the set of all indices into $S$ and the subset of
indices of linear types. For any $i \in \mathrm{Idx}(S)$, we denote by $S_i$ the
type at position i in $S$.

We define a partial order $\preccurlyeq$[^uptoisopreorder] on $T^\ast$ where
$S \preccurlyeq S'$ and say that $S'$ can be coerced into $S$ if there exists an
_index map_ $\rho: \mathrm{Idx}(S) \to \mathrm{Idx}(S')$ such that

- types are preserved: $S_i = S'_{\rho(i)}$, and
- $\rho$ is well-defined and bijective on the restriction to indices of linear
  types
  $$\left.\rho\right|_{\mathrm{Idx}_L(S)}: \mathrm{Idx}_L(S) \to \mathrm{Idx}_L(S').$$

[^uptoisopreorder]:
    To be precise, $\preccurlyeq$ is a partial order on the type strings _up to
    isomorphism_.

<!-- prettier-ignore -->
{{% definition title="Interface" id="def-interface" %}}

Let $T$ be a set of data types. An interface $I = (U, D)$ is a pair of type
strings $U, D \in T^\ast$.

We say that an interface $I' = (U', D')$ can be _coerced_ into an interface
$I = (U, D)$, written $I \triangleleft I'$, if $U \succcurlyeq U'$ and
$D \preccurlyeq D'$.

<!-- prettier-ignore -->
{{< /definition >}}

We can define the interface associated with an operation $o$ in a minIR graph
$G$ by considering the values used and defined by $o$. Recall that $type$
designates the type morphism on $G$. We lift $type$ to be defined on ordered
list of values $V^\ast$ by element-wise application of the map and define the
interface of $o$ in $G$ as

$$I(o) = (type(use(o)), type(\mathit{def}\,(o))).$$

Similarly, we can assign interfaces to _subgraphs_ of minIR graphs:

<!-- prettier-ignore -->
{{% definition title="MinIR subgraph" id="def-subgraph" %}}

Consider a subset of values and operations $V_H \subseteq V$ and
$O_H \subseteq O$. Define the _use_ and _define_ boundary sets

{{% centered numbered="bdef" %}}
$$\begin{aligned} B_U &= \{v \in V_H \mid v \in \mathit{def}\,(o)\textrm{ for some }o \in O \smallsetminus O_H \},\\B_D &= \{v \in V_H \mid v \in use(o)\textrm{ for some }o \in O \smallsetminus O_H \}.\end{aligned}$$
{{% /centered %}}

The tuple $H = (V_H, O_H)$ of $G$ is called a _minIR subgraph_ of $G$ if there
exists a region $R$ of $G$ such that all boundary values of $H$ are in $R$:

$$ B= B_U \cup B_D \subseteq R.$$

We write $H \subseteq G$ to indicate that $H$ is a minIR subgraph of $G$.

<!-- prettier-ignore -->
{{% /definition %}}

Notice that in {{% refcentered "bdef" %}}, we lifted the $\in$ notation to
ordered list types $V^\ast$: we write $v \in S$ if there is
$i \in \mathrm{Idx}(S)$ such that $v = S_i$.

Unlike interfaces, subgraph boundary values are not ordered. An _ordering_ of
$B \subseteq V$ is a string $S \in V^\ast$ along with a bijective map

$$\mathrm{ord}: B \to \mathrm{Idx}(S) \quad\textrm{such that}\quad v = S_{\mathrm{ord}(v)}.$$

If there are strings $S_U, S_D \in V^\ast$ and orderings of $B_U$ and $B_D$

{{% centered numbered="ord" %}}
$$\begin{aligned}\textrm{ord}_U:\ &B_U \to \mathrm{Idx}(S_U)&\quad\textrm{ord}_D:\ &B_D \to \mathrm{Idx}(S_D),\end{aligned}$$
{{% /centered %}}

then we can set $\textit{use}\,(H) = S_U$ and $\textit{def}\,(H) = S_D$ in
complete analogy to operations. We say that the subgraph $H$ _implements_ the
interface

$$I_H = (type(\textit{use}\,(H), type(\textit{def}\,(H)).$$

Remark, though, that unlike operations, the same subgraph may implement more
than one interface as a result of various choices of orderings $\textrm{ord}_U$
and $\textrm{ord}_D$.

Importantly, a minIR subgraph $H$ is a graph but is in general _not_ a valid
minIR graph. A non-empty $B_U$ use-boundary corresponds to values $v\in B_U$
without definitions in $H$, and a non-empty $B_D \cap T_L$ set corresponds to
linear values in $H$ without uses. We can however always construct a valid minIR
graph from $H$ by adding two operations $o_{in}$ and $o_{out}$ in the root
region, defined by

$$\begin{aligned}\textit{def}\,(o_{in}) &= use(H),\quad&\quad use(o_{out}) &= \textit{def}\,(H),\\use(o_{in}) &= \varepsilon,\quad&\quad\textit{def}\,(o_{out}) &= \varepsilon.\end{aligned}$$

where $\varepsilon$ denotes the empty string in $V^\ast$. We call the resulting
graph $\bar{H}$ an _interface graph_. It _implements_ the interface $I_H$ if $H$
implements $I_H$. Calling to mind the illustrations of
{{% reflink "sec:graph-defs" %}}, $\bar{H}$ looks like one of the nested regions
within `regiondef` operations that we were considering.

#### MinIR operation rewrite

Consider

- an operation $o$ in a minIR graph $G$ with values $V,$
- an interface graph $\bar{H}$ with values $V_H$ and its associated subgraph
  $H \subseteq \bar{H}$, such that $H$ implements an interface
  $$I(o) \triangleleft I_H = (type(\textit{use}\,(H)), type(\textit{def}\,(H)),$$
- the index maps $\rho: \mathrm{Idx}(use(H)) \to \mathrm{Idx}(use(o))$ and
  $\sigma: \mathrm{Idx}(\textit{def}\,(o)) \to \mathrm{Idx}(\textit{def}\,(H))$
  that define the generalisation $I(o) \triangleleft I_H$ (per
  {{% refdefinition "def-interface" %}}).

We can define a glueing relation $\mu_o \subseteq V \times V_H$

<!-- prettier-ignore -->
{{% centered numbered="mu0" %}}
$$\begin{aligned}\mu_o =\ & \{ \left(use(o)_{\rho(i)}, use(H)_{i}\right) \mid i \in \mathrm{Idx}(use(H)) \}\ \cup \\& \{ \left(\mathit{def}\,(o)_{i}, \mathit{def}\,(H)_{\sigma(i)}\right) \mid i \in \mathrm{Idx}(\textit{def}\,(o)) \}.\end{aligned}$$

<!-- prettier-ignore -->
{{% /centered %}}

This is almost enough to define a rewrite that replaces the operation $o$ in $G$
with the values and operations of $H$---the interface compatibility constraint
$I(o) \triangleleft I_H$ that we have imposed ensures that the resulting minIR
graph is valid. Unfortunately, $\mu_o$ is not a partial function as required by
{{% refdefinition "minirdef" %}}.

This is resolved in the following proposition:

<!-- prettier-ignore -->
{{% proposition title="MinIR operation rewrite" id="prop-oprewrite" %}}
Let $G$, $o$ and $H$ such that $I(o) \triangleleft I_H$, as defined above.
Then

{{% centered numbered="oprewrite" %}}
$$\big((G \sqcup H) / \sim_{\mu_o}\!\big) \smallsetminus \{o\},$$
{{% /centered %}}

i.e. the graph obtained by removing the operation $o$ from the glueing of $G$
and $H$ along $\mu_o$, is a valid minIR graph.

There is a graph $G_R$ with values $V_R$ and a partial function
$\mu_o': V \rightharpoonup V_R$ such that the graph
{{% refcentered "oprewrite" %}} is the graph $r_o(G)$, obtained from the rewrite

{{% centered numbered="def-ro" %}} $$r_o = (G_R, dom(\mu_o), \{o\}, \mu_o').$$
{{% /centered %}}

We call $r_o$ the rewrite of $o$ into $H$.

<!-- prettier-ignore -->
{{% /proposition %}}

The definition of the rewrite of $o$ into a graph $H$ behaves as one would
expect---the only subtleties relate to handling non-linear (i.e. copyable)
values at the boundary of the rewrite. The following example illustrates some of
these edge cases.

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/rewrite-minir.svg"
    width="80%"
    enlarge="full"
    caption="Rewriting operation $o$ in the graph $G$ (top left) into the operations $o_1$ and $o_2$ of the graph $\bar{H}$ (bottom left). Coloured dots indicate the index maps $\rho$ and $\sigma$ from inputs of $\bar{H}$ to inputs of $o$, respectively from outputs of $o$ to outputs of $\bar{H}$."
%}}
<!-- prettier-ignore-end -->

When the index maps $\rho$ and $\sigma$ are not injective (yellow and green
dots), values are merged, resulting in multiple uses of the value (i.e. copies).
This is why the index maps must be injective on linear values (dots in shades of
blue). Value merging also happens when a value is used multiple times in $o$
(yellow and red dots). This will never happen with linear values (as they can
never have more than one use in $o$), nor with any value definitions (the same
value can never be defined more than once). Finally, values not in the image of
$\rho$ or $\sigma$ (purple dot) are discarded. This case is also excluded for
linear values by requiring surjectivity.

<!-- prettier-ignore -->
{{% proof collapse="true" %}}

We start this proof with the explicit construction of $G_R$ and $\mu_o'$. Define
$\sim_R \subseteq (V_H)^2$ as the smallest equivalence relation such that

$$use(o)_{\rho(i)} = use(o)_{\rho(j)} \Rightarrow \textit{def}\,(o_{in})_i \sim_R \textit{def}\,(o_{in})_j.$$

Then we define $\bar{G}_R = \bar{H} / \sim_R$, the graph obtained by glueing
together values within the same equivalence class of $\sim_R$.

_Claim 1:_ $\bar{G}_R$ is a valid minIR graph.

Claim 1 follows from the observation that only values of non-linear types are
glued together. If $v \sim_R v'$, then either $v = v'$ or there exist $i \neq j$
such that $$\textit{def}\,(o_{in})_i \sim_R \textit{def}\,(o_{in})_j.$$ If
$\rho(i) = \rho(j)$, then $\rho$ is not injective on $i$ and $j$, and by the
definition of $\rho$, $type(v)\notin T_L$ and $type(v') \notin T_L$. Otherwise,
there are $i' = \rho(i) \neq use(o)_{\rho(j)} = j'$ such that
$use(o)_{i'} = use(o)_{j'}$. The same value is used twice, which is only a valid
minIR graph if $v$ and $v'$ are not linear, thus proving Claim 1.

Define $G_R$ as the subgraph obtained from $\bar{G}_R$ by removing the
operations $\{o_{in}, o_{out}\}$. Let $V_R = V_H / \sim_R$ be the set of values
of $G_R$ (and of $\bar{G}_R$). Writing $\alpha_R(v) \in V_R$ for the equivalence
class of $\sim_R$ that $v \in V_H$ belongs to, we can define
$\mu_o' \in V \times V_R$ as:

$$(v, w) \in \mu_o \Leftrightarrow (v, \alpha_R(w)) \in \mu_o'.$$

_Claim 2:_ $\mu_o'$ is a partial function $V \rightharpoonup V_R$.

In other words, for all $(v, \alpha_1), (v, \alpha_2) \in \mu_o'$, then
$\alpha_1 = \alpha_2$. Let $w_1 \in \alpha_1$ and $w_2 \in \alpha_2$ be values
in $V_H$. First of all, $use(o)_i \neq \textit{def}\,(o)_j$ for all $i, j$,
otherwise $G$ is not acyclic. So either $v \in use(o)$, or
$v \in \textit{def}\,(o)$, but not both.

The simpler case: if $v \in \textit{def}\,(o)$, then there exists $i$ such that
$\textit{def}\,(o)_i = v$. Furthermore $i$ is unique because by minIR
definition, $v$ has a unique definition in $G$. It follows from
{{% refcentered "mu0" %}} that $w_1 = use(o_{out})_{\rho(i)} = w_2$ and hence
$\alpha_1 = \alpha_2$.

Otherwise, there exists $i$ and $j$ such that
$v = use(o)_{\rho(i)} = use(o)_{\rho(j)}$ and $\textit{def}\,(o_{in})_i = w_1$
as well as $\textit{def}\,(o_{in})_j = w_2$. By definition of $\sim_R$, we have
$w \sim_R w'$, and thus

$$\alpha_1 = \alpha_R(w_1) = \alpha_R(w_2) = \alpha_2,$$

proving Claim 2.

_Claim 3:_ $r_o(G)$ is given by
$((G \sqcup H) / \sim_{\mu_o}) \smallsetminus \{o\}$.

It follows directly from our construction of $\sim_R$ and $\mu_o'$ that the
equivalence classes of (the smallest equivalence relation closure of)
$\mu_o' \circ \alpha_R$ is equal to the equivalence classes of (the smallest
equivalence relation closure of) $\mu_o$. The claim follows by
{{% refdefinition "def-graphglueings" %}} and the definition of $r_o$.

And finally, _Claim 4:_ $r_o(G)$ is a valid minIR graph.

Per {{% refdefinition "minirdef" %}}, We must check four properties: _(i)_ every
value is defined exactly once, _(ii)_ every linear value is used exactly once,
_(iii)_ the graph is acyclic, and _(iv)_ every region has (at most) one parent.

_(iii)_ follows from the fact that $G$ and $H$ are acyclic and a single
operation $o$ in $G$ is replaced: any cycle across $G$ and $H$ would also be a
cycle in $G$ by replacing the subpath in $H$ with $o$. _(iv)_ follows from the
fact that $o_{in}$ and $o_{out}$ are in the root region of $\bar{H}$, by
definition of interface implementation. _(i):_ removing $o$ from $G$ removes the
unique definitions of all values in $\mathit{def}\,(o)$. Each such value $v$ is
glued to a unique value $\mathit{use}\,(o_{out})_i$ in $H$---the new and unique
definition of $v$ in $r_o(G).$ _(ii)_ follows from the same argument as in
_(i)_, but relying on injectivity of $\rho$ on linear values to establish
uniqueness.

<!-- prettier-ignore -->
{{% /proof %}}

#### Arbitrary minIR rewrites

We have so far defined rewrites of single operations into graphs $H$. We can
generalise these rewrites to rewrite subgraphs $P \subseteq G$, provided the
minIR subgraphs satisfy some constraints. We require for this a notion of
convexity, as discussed in @Bonchi2022a.

As usual, let us consider a minIR graph
$G = (V, V_L, O, \mathit{def}, \mathit{use}, \mathit{parent}),$ along with a
subgraph of $G$ that we will now call $P = (V_P, O_P) \subseteq G$, to
distinguish from $H$.

<!-- prettier-ignore -->
{{% definition title="Convex minIR subgraph" id="def-convexsubgraph" %}}
A minIR subgraph $P \subseteq G$ is _convex_ if the following conditions hold:

- for all $v_1, v_2 \in V_P$, any path along $\leadsto$ from $v_1$ to $v_2$
  contains only vertices in $V_P$,
- parent-child relations are contained within the subgraph, i.e.
  $$v \in V_P \cap dom(\mathit{parent}) \Leftrightarrow \mathit{parent}(v) \in V_P.$$

<!-- prettier-ignore -->
{{% /definition %}}

Define the sets of boundary values $B_U, B_D$ and $B = B_U \cup B_D$, as in
{{% refcentered "bdef" %}}; then fix the boundary orderings $use(P)$ and
$\textit{def}\,(P)$ as in {{% refcentered "ord" %}}. The subgraph $P$ implements
the interface

$$I_P = (type(use(P)), type(\textit{def}\,(P))).$$

Consider an interface graph $\bar{H}$ that implements $I_H$ such that
$I_P \triangleleft I_H$. Instead of defining a gluing relation from values of an
operation $o$ to values of $H$, we replace the interface $I(o)$ with $I_P$. This
generalises the definition of $\mu_o$ from {{% refcentered "mu0" %}} to a
glueing $\mu\subseteq B \times V_H$ defined as

<!-- prettier-ignore -->
{{% centered numbered="mu1" %}}
$$\begin{aligned}\mu =\ & \{ \left((use(P))_{\rho(i)}, use\,(H)_{i}\right) \mid i \in \mathrm{Idx}(use(H)) \}\ \cup \\& \{ \left((\textit{def}\,(P))_{i}, \textit{def}\,(H)_{\sigma(i)}\right) \mid i \in \mathrm{Idx}(\textit{def}\,(P)) \},\end{aligned}$$

<!-- prettier-ignore -->
{{% /centered %}}

With the set of _boundary operations_ defined as[^understood]

$$O_B = \left\{o \in O_P \mid \left(\mathit{def}\,(o) \cup use(o)\right) \subseteq B\right\},$$

[^understood]:
    The set operations $\subseteq$ and $\cup$ are again understood to apply to
    the unordered set of elements contained in the lists $\mathit\,{def}(o)$ and
    $\mathit{use}\,(o)$.

we are able to define minIR rewrites in their most general form.

<!-- prettier-ignore -->
{{% proposition title="MinIR subgraph rewrite" id="prop-fullrewrite" %}}

Let $P \subseteq G$ and $H$ such that $I_P \triangleleft I_H$ and $P$ is convex,
as defined above. Then,

{{% centered numbered="fullrewrite" %}}
$$\big((G \sqcup H) / \sim_{\mu}\!\big) \smallsetminus (V_P \smallsetminus B, O_B),$$
{{% /centered %}}

i.e. the graph obtained by removing the values $V_P \smallsetminus B$ and
operations $O_B$ from the glueing of $G$ and $H$ along $\mu$, is a valid minIR
graph.

There is a graph $G_R$ with values $V_R$ and a partial function
$\mu': V_P \rightharpoonup V_R$ such that the graph
{{% refcentered "fullrewrite" %}} is the graph $r_P(G)$, obtained from the
rewrite

$$r_P = (G_R, V_P, O_B, \mu').$$

We call $r_P$ the rewrite of $P$ into $H$.

<!-- prettier-ignore -->
{{% /proposition %}}

<!-- prettier-ignore -->
{{% proof %}}
Consider an operation $o$ that implements $I_P = (U_P, D_P)$. We can define the interface
graph $\bar{H}_o$ given by three operations $o_{in}$, $o_{out}$ and $o$.
Its associated subgraph $H_o \subseteq \bar{H}_o$ only includes $o$.
Let $\tilde \mu$ be the glueing relation

$$\begin{aligned}\tilde \mu =\ &\{ (use(P)_i, use(o)_i) \mid i \in \mathrm{Idx}(U_P) \}\ \cup \\& \{ (\textit{def}\,(P)_i, \textit{def}\,(o)_i) \mid i \in \mathrm{Idx}(D_P) \}.\end{aligned}$$

Consider the rewrite $r = (H_o, V_P \smallsetminus B, O_B, \tilde\mu)$. If we
write $G' = (V', O')$ for the subgraph of $G$ given by
$$\begin{aligned}V' &= (V \smallsetminus (V_P \smallsetminus B)) \\O' &= (O \smallsetminus O_B) \cap (V')^\ast,\end{aligned}$$
then according to {{% refcentered "rewrite-result" %}}, the graph resulting from
applying $r$ to $G$ can be expressed as the glueing

$$G_o = r(G) = (G' \sqcup H_o) / \sim_{\tilde \mu}.$$

Our claim is that $G_o$ is a valid minIR graph.

The graph {{% refcentered "fullrewrite" %}} is then obtained by applying the
rewrite $r_o$ as given by {{% refcentered "def-ro" %}} to $G_o$. Defining the
rewrite $r_P$ as the composition of $r$ followed by $r_o$, the result follows
from our claim and {{% refproposition "prop-oprewrite" %}}.

We now prove the claim, by showing the four properties of minIR graphs as per
{{% refdefinition "minirdef" %}}. Property _i)_ requires showing that every
value is defined exactly once. As $G'$ is obtained by removing values and
operations from a valid minIR graph $G$, no value in $V'$ can be defined more
than once. A value $v \in V'$ that is not defined in $G'$ must be in the
boundary $v \in B$ of $P$. By the boundary definitions of
{{% refcentered "bdef" %}}, $v$ cannot be in $B_U$ and thus must be in $B_D$. It
follows by the definition of the glueing $\tilde \mu$ that in $G_o$, $v$ will be
in the definitions of $o$: $v \in \textit{def}\,(o)$. The glueing $\tilde \mu$
is bijective between the values of $P$ and $o$ and thus we can conclude that $v$
has a unique definition in $G_o$.

The same argument applies to property _ii)_. Property _iii)_ follows from the
convexity requirement of $P$. Finally, property _iv)_ (every region has at most
one parent) follows from two observations. First, by convexity of $P$, no
deleted value or operation could be the parent of any value not in $P$, and thus
the $parent$ relation is well-defined on $G'$: $im(parent) \subseteq O'$.
Secondly, all new values and operations added to the boundary region of $G'$ are
from the root region of $H$, and thus do not have a parent, ensuring that parent
uniqueness is preserved.

<!-- prettier-ignore -->
{{% /proof %}}

This simple and limited graph transformation framework captures a remarkably
large set of minIR program transformations. It may seem at first that the
restriction to boundary values within a single region of
{{% refdefinition "def-subgraph" %}}, as well as the convexity requirements of
{{% refdefinition "def-convexsubgraph" %}} represent significant limitations on
the expressivity of the rewrites. In practice, however, the semantics of minIR
operations can be used to decompose more complex rewrites into a sequence of
simple rewrites to which {{% refproposition "prop-fullrewrite" %}} applies.

Consider minIR graphs with a type system that includes `regiondef` and `call`
operations as discussed in examples of the previous section---respectively
defining a code block by a nested region and redirecting control flow to a code
block defined using a `regiondef`. Then all constraints that we impose on
rewriting can be effectively side-stepped using the _region outlining_ and
_value hoisting_ transformations.

**Region outlining** moves a valid minIR subgraph into its own separate region,
and replaces the hole left by the subgraph in the computation by a `call`
operation to the newly outlined region.

**Value hoisting** moves a value definition within a region to its parent region
and passes the value down to the nested region through an additional input. In
case of linear values, we can similarly hoist the unique _use_ of the value to
the parent region.

Using these transformations, non-convex subgraphs can always be made convex by
taking the convex hull and outlining any parts within it that are not part of
the subgraph. Outlined regions can then be passed as additional inputs to the
subgraph. Step 1 of the figure below illustrates this transformation. Similarly,
a subgraph that includes operations without their parent can be extended to
cover the entire region and its parent, outlining any parts of the region that
are not part of the subgraph.

Finally, whenever a boundary value $v$ belongs to a region that is not the top
level region of the subgraph[^assumeconnected], we can repeatedley hoist $v$ to
its parent region until it is in the top level region. The value is then
recursively passed as argument to descendant regions until the region that it is
required in. Subgraphs can thus always be transformed to only have input and
output boundary values at the top level region. Step 2 of the figure below
illustrates this transformation.

[^assumeconnected]:
    We can always extend a subgraph to contain more ancestor regions, until
    there is indeed a unique top-level region in the subgraph.

<!-- prettier-ignore-start -->
{{% figure src="/svg/rewrite.svg"
           width="80%"
           enlarge="full"
           caption="A non-convex minIR graph rewrite, obtained by decomposition into valid convex rewrites, using outlining and hoisting. For simplicity, `regiondef` operations were made implicit and represented by nested boxes: a region within an operation corresponds to a region definition that is passed as an argument to the operation. Edge colours correspond to value types. Step 1 _outlines_ the `...` operations into a dedicated region, which step 2 _hoists_ outside of the region being rewritten. Step 3 and 4 together correspond to a minIR sugraph rewrite. They have been split into two steps following the proof strategy. Step 4 is an instance of a minIR operation rewrite."
%}}
<!-- prettier-ignore-end -->
