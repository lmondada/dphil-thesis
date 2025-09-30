+++
title = "A graph representation for quantum programs"
weight = 3
layout = "section"
slug = "sec:graph-defs"
+++

For the purposes of this thesis, we introduce a simplified graph-based IR for
quantum computations that we will call minIR. It captures all the expressiveness
that we require for hybrid programs whilst remaining sufficiently abstract to be
applicable to a variety of IRs and, by extension, quantum programming languages
and compiler frameworks.

MinIR can be thought of as being built from statements of the form

```python
x, y, ... := op(a, b, c, ...)
```

to be understood as an operation `op` applied on the SSA values `a, b, c, ...`
and producing the output values `x, y, ...`.

Computation and dataflow graphs are commonly defined with operations as vertices
and values as edges. To faithfully capture the function signature of `op`, this
requires storing and preserving an ordering of the incoming and outgoing edges
(also known as port graphs @Fernandez2018).

Instead, we adopt the hypergraph formalisation of computation graphs, which is
more common within category theory (see string diagrams @Selinger2010 and their
formalisation in the hypergraph category @Bonchi2022 @Wilson2022). This
definition is particularly well-suited for our purposes because it frames the
graph transformations of interest to us in the well-studied language of
rewriting within adhesive categories @Lack2004.

### Hypergraphs and minIR

At a minimum, a directed hypergraph---for simplicity sometimes in the following
referred to simply as _graph_---is defined by a set of vertices $\mathbf V$ and
a set of (hyper) edges $\mathbf E$. We will always consider hypergraphs where
the edges $e \in \mathbf E$ are directed and the vertices attached to $e$ are
given by ordered lists. We formalise this incidence relation between vertices in
$\mathbf V$ and edges in $\mathbf E$ by writing $\mathbf E$ as the partition
over the disjoint sets $\mathbf E_{st}$

$$\mathbf E = \bigsqcup_{s, t \in \mathbb{N}} \mathbf E_{st}$$

and introducing $s$ source and $t$ target maps for each $\mathbf E_{st}$. Why we
write sets in boldface will become clear in a moment.

<!-- prettier-ignore -->
{{% definition title="Directed hypergraph" id="def-hypergraph" %}}
A directed hypergraph is given by sets $\mathbf V$ and $\mathbf E_{st}$ for $s, t \in\mathbb{N}$,
along with maps

{{% centered numbered="eq-hypergraph" %}}

$$
\begin{aligned}
\textit{src}_{st,i}&: \mathbf E_{st} \to \mathbf V\quad&\textrm{for } 1 \leqslant i \leqslant s\\
\textit{tgt}_{st,j}&: \mathbf E_{st} \to \mathbf V&\textrm{for } 1 \leqslant j \leqslant t\\
\end{aligned}
$$

{{% /centered %}}

for all $s, t \in \mathbb{N}$.

<!-- prettier-ignore -->
{{% /definition %}}

Note that in this thesis, as in most common uses of hypergraphs, the sets
$\mathbf V$ and $\mathbf E = \bigsqcup \mathbf E_{st}$ will always be finite,
and thus $\mathbf E_{st} \neq \varnothing$ for a finite number of
$s, t \in \mathbb{N}$ only.

For simplicity, we can further omit the $st$ subscript of the source
$\textit{src}_{st,i}$ and target $\textit{tgt}_{st,j}$ maps whenever it can be
inferred from the domain of definition of the map. For $e \in \mathbf{E}_{st}$,
we call $\textit{src}_{1}(e), \dots, \textit{src}_{s}(e) \in \mathbf{V}$ the $s$
source vertices of $e$ and
$\textit{tgt}_{1}(e), \dots, \textit{tgt}_{t}(e) \in \mathbf{V}$ the $t$ target
vertices of $e$.

We introduce the notation $u \leadsto v$ to signify that there is an edge from
$u$ to $v$, i.e. there is $e \in \mathbf E_{st}$ for some $s, t \in \mathbb N$
and $1 \leqslant i \leqslant s, 1 \leqslant j \leqslant t$ such that
$u = src_i(e)$ and $v = tgt_j(e)$. We define the equivalence relation
$\sim \subseteq \mathbf V^2$ of connected vertices, given by the transitive,
symmetric and reflexive closure of $\leadsto$. The equivalence classes of $\sim$
are the connected components of the graph. We will write $[v]$, resp. $[e]$ for
the connected component that contains the vertex $v$, resp. the edge $e$.

To proceed, it is useful to frame the hypergraph definition in a categorical
setting. We write $[\mathbb{C}, \mathrm{Set}]$ for the presheaf topos of the
category $\mathbb{C}$, i.e. the category with functors
$\mathbb{C} \to \mathrm{Set}$ as objects and natural transformations as
morphisms. {{% refdefinition "def-hypergraph" %}} can be equivalently restated
as:

> hypergraphs are objects in the presheaf topos
> $\mathbb H = [\mathbb{C}, \mathrm{Set}]$,

where the category $\mathbb{C}$ has objects $V$ and $E_{st}$ for
$s, t \in \mathbb{N}$ and arrows given by {{% refcentered "eq-hypergraph" %}},
now interpreted as morphisms in $\mathbb{C}$ rather than as functions in
$\mathrm{Set}$. In this framing, a graph is a functor that defines a set for
each object of $\mathbb{C}$ and specifies functions between these sets---one for
each arrow in $\mathbb{C}$.

This is where the distinction between bold and non-bold typeface comes from: we
use bold letters to refer to images in $\mathrm{Set}$ of a hypergraph functor,
whereas the non-bold typeface is refers to objects in the indexing category
$\mathbb C$. The distinction between $\mathbb C$ and $\mathrm{Set}$ is less
important for morphisms---it will typically be clear from the context. We thus
use the same symbols for both.

#### Linearity constraints

The introduction of $\mathbb H$ not only gives us a notion of hypergraph
homomorphisms---maps between hypergraphs that preserve the structure of the
graph. It also provides us with a way to express the linearity constraints that
arise from our discussion in {{% reflink "sec-compgraphs" %}}, and which we must
enforce on our computation graphs.

The definition that follows adds the coproduct $E$ explicitly as an object of
the category (which we did not need to do in
{{% refdefinition "def-hypergraph" %}}), as we need it as the codomain of the
new morphisms $\textit{use}$ and $\textit{def}$. The adhesitivity of the
category does no longer comes for free---we will get back to this in
{{% reflink "sec:rewrite-def" %}}.

<!-- prettier-ignore -->
{{% definition title="Hypergraph with linearity constraints" id="def-linearity" %}}
The category
$\textrm{lin-}\mathbb{C}$ is the category given by objects
$$\{V, V_\textit{src}, V_\textit{tgt}\} \cup \{ E \} \cup \{ E_{st}\, |\, s, t \in \mathbb{N}\}.$$
Its arrows are the incidence morphisms given in {{% refcentered "eq-hypergraph" %}},
along with

$$
\begin{aligned}
\mathit{use}&: V_\textit{src} \to E\quad&
\mathit{def}&: V_\textit{tgt} \to E\\
\lambda_\mathit{src}&: V_\textit{src} \rightarrowtail V&
\lambda_\mathit{tgt}&: V_\textit{tgt} \rightarrowtail V\\
\end{aligned}
$$

and $\iota_{st}: E_{st} \rightarrowtail E$ for all $s, t \in \mathbb{N}$. The
morphisms $\lambda_\mathit{src}, \lambda_\mathit{tgt}, \iota_{st}$ are split
monomorphisms and the following diagrams commute for all $s, t \in \mathbb{N}$
and $1 \leqslant i \leqslant s, 1 \leqslant j \leqslant t$:

<!-- prettier-ignore-start -->
{{% centered numbered="eq-linearity" %}}
{{% figure
    src="/svg/linearity-cd.svg"
    width="60%"
    nobg=true
%}}
{{% /centered %}}
<!-- prettier-ignore-end -->

Directed hypergraphs with linearity conditions are objects in the full
subcategory $\textrm{lin-}\mathbb H$ given by objects
$H_\mathrm{lin} \in [\textrm{lin-}\mathbb{C}, \mathrm{Set}]$ such that
$$\mathbf E = \bigsqcup \mathbf E_{st}$$ is the coproduct in $\mathrm{Set}$ and
$H_\mathrm{lin}(\iota_{st}): H_\mathrm{lin}(E_{st}) \to H_\mathrm{lin}(E)$ are
the injections into $H_\mathrm{lin}(E)$.

<!-- prettier-ignore -->
{{% /definition %}}

We probably owe an explanation for this definition---at least for the sake of
the few computer scientists that are still following us.

First of all, notice that every hypergraph with linearity constraint corresponds
to a hypergraph in the sense of {{% refdefinition "def-hypergraph" %}}: there is
an obvious functor $\mathcal{L}: \mathbb{C} \to \textrm{lin-}\mathbb{C}$ that
maps each object and morphism in $\mathbb{C}$ to the object or morphism with the
same name in $\textrm{lin-}\mathbb{C}$. By contravariance, we can thus
(functorially) map every hypergraph with linearity constraints
$H_\mathrm{lin} \in \textrm{lin-}\mathbb{H}$ to the hypergraph
$H = H_\mathrm{lin} \circ \mathcal{L} \in \mathbb{H}$.

Another way of looking at this is to realise that by requiring that
$\lambda_\mathit{src}, \lambda_\mathit{tgt}$ be split monomorphisms, we obtain
that the resulting functions in $\mathrm{Set}$ are injective. Up to isomorphism,
we can consider that
$\mathbf{V}_\textit{src}, \mathbf{V}_\textit{tgt} \subseteq \mathbf{V}$ are
subsets of vertices in $H_\mathrm{lin}$. A hypergraph with linearity constraints
is thus a directed hypergraph with two selected subsets of vertices
$\mathbf{V}_\textit{src}$ and $\mathbf{V}_\textit{tgt}$.

Vertices within these subsets are special. For every
$v \in \mathbf{V}_\textit{src}$, there exist unique indices
$s, t \in \mathbb{N}$, $1 \leq i \leq s$ and edge
$use(v) = e \in \mathbf{E}_{st}$ such that $\textit{src}_i(e) = v$. In words,
for every $v\in \mathbf{V}_\textit{src}$ there is a unique edge in the
hypergraph that has $v$ as one of its sources. We then say that $e$ is the
unique _use_ of vertex $v$. Similarly, vertices in $\mathbf{V}_\textit{tgt}$
have a unique edge $e$ in the hypergraph with $v$ as one of its targets---it is
the unique _definition_ of $v$.

#### Typed graphs

MinIR graphs are strongly typed. We introduce _typed_ graphs for this purpose, a
concept for which graph transformation was first formalised in @Ehrig2004. A
_type system_ for directed hypergraphs is just another object
$\Sigma \in \mathbb H$. A _typed graph_ is then an object of the slice category
$\mathbb H \searrow \Sigma$, that is to say, typed graphs are morphisms
$H \to \Sigma$ of $\mathbb{H}$ and morphisms between typed graphs are given by
the subset of morphisms $H_1 \rightarrow H_2$ of $\mathbb H$ that make the
triangle diagram formed by $H_1$, $H_2$ and $\Sigma$ commute.

To type hypergraphs with linearity constraints, we do not pick the type system
$\Sigma$ in $\textrm{lin-}\mathbb H$, as the existence of $use$ and $def$
morphisms impose restrictions that are too strict. We consider instead the
category $\textrm{lin-}\mathbb C_\textrm{type}$ given by the same objects as
$\textrm{lin-}\mathbb C$, as well as the same morphisms, with the omission of
$use$ and $def$. There is an obvious functor
$\textrm{lin-}\mathbb C_\textrm{type} \to \textrm{lin-}\mathbb C$ and thus, by
contravariance, every hypergraph with linearity constraints
$H_\textrm{lin} \in \textrm{lin-}\mathbb H$ can be mapped to a hypergraph in
$\textrm{lin-}\mathbb H_\textrm{type}$. We say that a hypergraph with linearity
constraints $H_\textrm{lin} \in \textrm{lin-}\mathbb H$ is $\Sigma$-_typed_ for
a type system $\Sigma \in \textrm{lin-}\mathbb H_\textrm{type}$ if there is a
morphism $\Sigma \to H_\textrm{lin}$, when interpreting $H_\textrm{lin}$ is as
an object of $\textrm{lin-}\mathbb H_\textrm{type}$.

{{% figure src="/svg/hypergraph-example.svg"
           width="70%"
           enlarge="full"
           caption="Two example hypergraphs. Vertices (labelled with capital letters) are circles and hyperedges (labelled with small letters) span between them. Vertices that are attached to an edge in the black half of the circle correspond to source vertices of the edge; those in the white half correspond to target vertices. The functions $src_i$ and $tgt_j$ map edges to the incident vertices, defining the directed hypergraph. On the left, there are further functions $\textit{use}$ and $\textit{def}$ that map vertices to the unique edge that uses or defines them. This defines a hypergraph with linearity constraints, with $V_\textit{tgt} = \{A_1, A_2\}$ and $V_\textit{src} = \{A_3\}$. These cannot be defined on the graph on the right. On the other hand, the edges `b` and `c` are in $F_{11}$, and are in the domain of functions $in_{11}$ and $out_{11}$, thus defining a child region of a hierarchical graph. Note that it would be invalid to have any edge connecting $i_1$ or $o_1$ to $i_2$ or $o_2$. The $i$ and $o$ vertices also have incidence morphisms, not displayed here." %}}

#### Hierarchical hypergraphs

A final bit of structure that minIR graphs require is a notion of hierarchy
between regions of the graph. This will be useful to define functions, control
flow blocks such as `if-else`, or any subroutine that can itself be viewed as an
operation in the computation.

Hierarchical hypergraphs were first proposed in @Drewes2002 and further
generalised in @BUSATTO2005 @Palacz2004. However, we opt to use a more
restrictive definition, closer to the notion of flattened hypergraphs of
@Drewes2002. The reason for this is twofold. Firstly, hierarchical (hyper)graphs
are typically defined recursively. It is not obvious under which conditions (and
if) such definitions form adhesive categories, although progess in this
direction was made in @Padberg2017 with the introduction of coalgebraic graphs.
As a result, to the extent that graph transformation results can be applied to
such structures, it must be done so carefully.

The second, more practical, reason is that the notion of typed graph introduced
above cannot be directly lifted to the hierarchical graph setting: while some
subset of the hierarchical relation in minIR should be enforced by the type
system, the type graph of a nested graph should be identical to the parent's (as
opposed to being itself nested within the type graph of the parent).

It is therefore more convenient for us to encode hierarchy in directed
hypergraphs as follows. Note that it is not clear that our definition is
adhesive either[^itisnot]---but at least it is framed as a subcategory of a base
category that is.

[^itisnot]:
    And in fact, we will see in {{% reflink "sec:rewrite-def" %}} that it is
    not.

<!-- prettier-ignore -->
{{% definition title="Hierarchical hypergraph" id="def-hier-hypergraph" %}}

The category $\textrm{hier-}\mathbb C$ is the category with objects and arrows
of $\mathbb C$ along with additional objects $F_{st}$ for $s, t \in \mathbb{N}$
and arrows:

- $F_{st} \rightarrowtail E_{st}$ that are split monomorphisms,
- input arrows $F_{st} \xrightarrow{in_{st}} E_{0s}$, and output arrows
  $F_{st} \xrightarrow{out_{st}} E_{t0}$.

Hierarchical hypergraph are the objects in the full subcategory
$\textrm{hier-}\mathbb H$ given by objects
$H_\textrm{hier} \in [\textrm{hier-}\mathbb{C}, \mathrm{Set}]$ such that

- for any edge $e \in \mathbf{E}$ of $H_\textrm{hier}$, the set
  $P([e]) = \overline{in}^{-1}([e]) \cup \overline{out}^{-1}([e])$ has at most
  one element.
- the transitive and reflexive closure of $[e] \preccurlyeq [P([e])]$ for
  $e \in \mathbf E$ is a partial order on the connected components of
  $H_\textrm{hier}$.

Here $\overline{in}$ and $\overline{out}$ are the functions with domain
$\mathbf E$ defined piecewise as $in_{st}$ and $out_{st}$ for all $s, t$ on
their respective (disjoint) domains of definition.

  <!-- prettier-ignore -->

{{% /definition %}}

The same definition can also be applied to $\textrm{lin-}\mathbb H$ to obtain
the category of hierarchical directed hypergraphs with linearity constraints
$\textrm{hier-lin-}\mathbb H$. Similarly, we define the associated category for
type systems; however, we do not impose any of the two conditions related to
$P(\cdot)$ for the type category, i.e.
$\textrm{hier-lin-}\mathbb H_\textrm{type} = [\textrm{hier-lin-}\mathbb C_\textrm{type}, \mathrm{Set}]$
is the full presheaf category, rather than a subcategory of it.

As with the incidence morphisms $\textit{src}$ and $\textit{tgt}$, we will drop
the $st$ subscript for the IO arrows $\textit{in}$ and $\textit{out}$ when it
can be inferred from the domain of definition.

Just as in the discussion of {{% refdefinition "def-linearity" %}}, we interpret
the split monomorphisms as equivalent to requiring
$\mathbf{F}_{st} \subseteq \mathbf{E}_{st}$. Taking over terminology from
@Drewes2002, we call elements $f \in \mathbf{F}_{st}$ the _frames_ of
$H_\textrm{hier} \in \textrm{hier-}\mathbb H$. For each frame $f$, there is thus
a unique _input_ edge $in(f)$ and a unique _output_ edge $out(f)$ in
$H_\textrm{hier}$ that have respectively $s$ targets and zero sources, and $t$
sources and zero targets.

By the first condition we imposed on $P(\cdot)$, the partial function $parent$
mapping connected components to their _parent_ edge:

$$
parent([e]) = \begin{cases}
p\quad&\textrm{ if there exists } p \in P(e)\\
\bot&\textrm{ otherwise.}
\end{cases}
$$

is well-defined. We call the subgraphs of $H_\textrm{hier}$ that share a same
parent a _region_ of $H_\textrm{hier}$[^regconnected]. The subgraph of vertices
and edges without parent is the _root region_ of $H_\textrm{hier}$.

[^regconnected]:
    Note that a region may not be a connected subgraph. Albeit, it is a simple
    exercice to convince yourself that any non-root region contains either one
    or two connected components.

#### The minIR computation graph

In minIR, the vertices are the values of the computation, while the hyperedges
define the operations. This imposes some constraints for a hypergraph to be a
valid minIR graph:

- all values in minIR must have a unique operation that _defines_ them;
- values that are _linear_ must also have a unique operation that _uses_ them;
- the graph must be acyclic, meaning that no value can be defined in terms of
  itself.

This can be expressed as a hypergraph with linearity constraints by choosing
$\mathbf V_\textit{tgt} = \mathbf V$ and $\mathbf V_\textit{src} = \mathbf V_L$,
where $\mathbf V_L \subseteq \mathbf V$ is the subset of linear values.

The following definition then comes as no surprise:

<!-- prettier-ignore -->
{{% definition title="MinIR graph" id="minirdef" %}}

Let $\Sigma \in \textrm{hier-lin-}\mathbb H_\textrm{type}$ be a type system. A
minIR graph $H$ typed in $\Sigma$ is an object of $\textrm{hier-lin-}\mathbb H$
that is $\Sigma$-typed and such that the adjacency relation $\leadsto$ is
acyclic. We call $\mathbf V_\textit{src} = \mathbf V_L$, the linear values of
$H$.

  <!-- prettier-ignore -->

{{% /definition %}}

In the context of minIR, $\leadsto$ relations encode the data flow of values
across the computation. The lack of explicit operation ordering differentiates
minIR (and HUGR) from most classical IRs, which, unless specified otherwise,
typically assume that instructions may have side effects and thus cannot be
reordered. All quantum operations (and the classical operations we are
interested in) are side-effect free, which significantly simplifies our IR.

#### Input and output values

Notice that in {{% refdefinition "minirdef" %}}, it is not enforced that _every_
value has a definition, i.e. there might be
$v \in \mathbf V \setminus \mathbf V_\textrm{tgt}$; nor that every value with a
linear type is in $\mathbf V_L$, i.e. if $\tau: H \to \Sigma$ is the typing
morphism and $\mathbf T_L$ are the linear types in the type system, there might
be $v \in \tau^{-1}(\mathbf T_L) \setminus \mathbf V_L$.

This would be easy to fix: we could on the one hand enforce the equality
$\mathbf V_\textrm{tgt} = \mathbf V$, thus guaranteeing that every value has a
unique definition in the graph. On the other hand, we could define $\mathbf V$
as the coproduct $\mathbf V = \mathbf V_L \sqcup \mathbf V_\textit{NL}$, where
$V_\textit{NL}$ is a new object introduced to explicitly capture the set of
non-linear values. Morphisms in this category would guarantee that the linearity
of values is always preserved, and thus in particular the type morphism would
map a value to a linear type if and only if it is linear.

Instead, we opt to allow undefined values and unused linear values to be able to
express rewrite rules that match sugraphs of minIR graphs within the same
category.

<!-- prettier-ignore -->
{{% definition title="Inputs and outputs of minIR graphs" id="def-input-output" %}}
For a minIR graph $H$ with typing morphism $\tau: H \to \Sigma$, we call the set
$I = \mathbf V \setminus \mathbf V_\textit{tgt}$ the _input values_ of $H$ and
$O = \tau^{-1}(\mathbf T_L) \setminus \mathbf V_L$ its _output values_, where
$\mathbf T_L$ are the linear values in $\Sigma$.

If $I = O = \varnothing$, we say that $H$ is IO-free.

<!-- prettier-ignore -->
{{% /definition %}}

Note that by this definition, an output value in $O$ always has a linear type!
This is because non-linear values do not need to be treated specially when they
are outputs: unlike linear values that must always be used in a non-output
position, non-linear values may have no outgoing edge, in which case they are
simply discarded in the computation.

### Structured control flow

The operations and values of a minIR graph define the data flow of a program.
However, a program must also be able to control and change the data flow at run
time in order to express loops, conditionals, function calls etc. This is the
program _control flow_, which minIR expresses using regions and so-called
_structured control flow_.

Using regions, any non-trivial control flow (function calls, conditionals, loops
etc.) is captured by a frame, a "black box" operation within the data flow of
the program. Its implementation is then defined in the nested region of the
frame. This can be used for function calls, but also for branches of control
flow. A simple function call, that unconditionally redirects the control flow to
the operations within a nested region, could for example be represented as
follows:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/call-minir.svg"
    width="40%"
    nobg=true
%}}
<!-- prettier-ignore-end -->

In this figure and below, circles are SSA values (the vertices of the
hypergraph), while the edges spanning between them are the operations. Edges
attached to the white half of circles are value definitions, while hyperedges
attached to the black half of circles are value uses. The `call` and `+`
operation can be read left to right: for instance, the two values `x` and `y` on
the left of `call` are inputs (the operation _uses_ those values, and is thus
attached to the black half of the circles), whereas the `x + y` value on the
right is the output of the `call` operation (the operation _defines_ this value,
which is thus attached to the white half of the circle).

Dashed arrows indicate hierarchical dependencies that map the frame edge to the
two input and output edges in the child region; dashed rectangles mark the
non-root regions of the graph.

Importantly, the frame edge representing the `call` operation must intuitively
"forward" all its input values to the `in` operation of the child region, and
similarly passes on the value at the `out` operation to the output value of the
`call` output in the parent graph. Passing function arguments and retrieving
returned values in this fashion will be very familiar to any computer scientist.
Unlike most programming languages, this is also how in minIR values are passed
to and from _any_ control flow constructs we would wish to model.

In terms of graph structure, this relation between values in parent and child
regions means that the arity and types of the inputs and outpus of `call` fix
the signatures of the child `in` and `out` operations.
{{% refdefinition "def-hier-hypergraph" %}} already ensures that the input and
output arities of `in` and `out` are correct. The correct typing of these input
and output values will be ensured by the type system, which we discuss in a
separate section below.

To handle constructs that require more than one child region, such as an
`if-else` statement, we can use frames that have zero input and one output:

{{% figure src="/svg/ifblock.svg" width="30%" nobg=true %}}

The output of the `ifblock` is intuitively a higher-order type representing an
operation that takes two inputs and ouputs the sum.

An if-else statement might then look as follows:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/ifelse-minir.svg"
    width="65%"
    nobg=true
%}}
<!-- prettier-ignore-end -->

The `if` and `else` blocks must expect the same input and output values. This is
key to respecting any linearity constraints that values passed to `ifelse` might
be subject to. By definition, all operations that use or define a value $v$ will
be in the same region---in other words, values are only available within their
defining region. This in effect implements "variable scoping". With some
imagination, this construction can easily be adapted to model loops, complex
control flow graphs, or any other control flow structures.

#### Why not plain branch statements?

There is a simpler---and at least as popular---way of expressing control flow in
IRs without requiring regions and operation hierarchies, using _branch_
statements[^goto]. For instance, LLVM IR provides a conditional branch statement

```llvm
br i1 %cond, label %iftrue, label %iffalse
```

that will jump to the operations under the `iftrue` label if `%cond` is true and
to the `iffalse` label otherwise.

[^goto]:
    You may know this from prehistoric times as the `goto` statement, in
    languages such as Fortran, C, and, yes,
    [even Go](http://golang.org/ref/spec#Goto_statements).

This is a simple and versatile approach to control flow that can be used to
express any higher-level language constructs. Unfortunately, conditional
branching does not mix well with linear values.

Linearity, as defined in {{% refdefinition "minirdef" %}}, is a simple
constraint to impose on minIR graphs. In the presence of conditional branching,
however, the constraint would have to be relaxed to allow for single use _in
each mutually exclusive branch_ of control flow. For instance, the following two
uses of `b` should be allowed (in pseudo-IR):

```python
b := h(a)
<if cond> c := x(b)
<else>    d := h(b)
```

This is a much harder invariant to check on the IR: linearity would no longer be
enforceable as a syntactic constraint on the minIR graph as in
{{% refdefinition "minirdef" %}}, but would instead depend on the semantics of
the operations to establish mutual exclusivity of control flow[^nophinodes].
Forbidding arbitrary branching in minIR and resorting instead to structured
control flow as described above to express control flow is just as expressive
and gives the linearity constraint a much simpler form.

[^nophinodes]:
    You might be thinking "_oh, but all that is required here are phi nodes!_",
    if you are familiar with those. No---you'd also need a sort of "phi
    inverse". Besides, see
    [this discussion](https://mlir.llvm.org/docs/Rationale/Rationale/#block-arguments-vs-phi-nodes)
    for more arguments on why no phi nodes.

### Type graph

We have seen how minIR graphs impose _some_ structure on the types of
computations that can be expressed: a linear value cannot be used by two (or
zero) operations, frames will always have a unique `in` and `out` operation in
their child region with correct arities, etc.

However, without a "good" type system and associated semantics, it is still
possible to express nonsensical programs: we have mentioned for instance earlier
that it is up to the type system to enforce that the types of the `in` and `out`
operations match the types of the frame. Similarly, it is possible to construct
programs that break linearity: take the `ifelse` operation discussed in the
previous section, but now replace its semantics to be `do-in-parallel`, i.e. it
will execute both the `if-block` and `else-block` in parallel on the inputs that
it is given. This would violate the linearity of its inputs, but would
nonetheless be a syntactically valid minIR graph!

To resolve this we present here some typed operations, along with their
semantics, that can be used to construct well-behaved type systems: programs
typed in this system model the kind of quantum programs that we are interested
in expressing and are guaranteed to be valid computations. Categorising all
valid constructions or an exhaustive enumeration of conditions that type systems
must satisfy to guarantee the validity of programs is beyond the scope of this
thesis. It is in practice often straightforward to combine and extend the
elements presented here to support further custom syntactic constructs and
types.

#### Basic types and operations

The most elementary types in our computations are `Bit`s and `Qubit`s. The
former is typically known as a Boolean and represents the purely classical
values `0` and `1`. The latter is the canonical quantum example of a _linear
type_. Indeed, just like values in minIR graphs, the type system in
$\textrm{hier-lin-}\mathbb H_\textrm{type}$ distinguishes between linear and
non-linear types.

Other typical classical types such as integers, floats, strings, custom
algebraic data types (ADT) etc could also be introduced as required. In the
figure below, we for instance introduce the `Angle` type to represent rotation
angles that parametrise quantum gates. Further examples of linear types, on the
other hand, include higher-dimensional qudits, but also any ADT that contains a
linear type within it.

As we saw in {{% reflink "sec:basics" %}}, the number of input qubits in pure
quantum operations will match the number of output qubits: the single-qubit `h`
(hadamard gate) and two-qubit `cx` (controlled NOT) operations thus have one or
two `Qubit`s as both inputs and outputs `rz` (Z rotation) is also a single-qubit
operation, but it takes an additional input of type `Angle` to specify the
rotation angle.

On the pure classical side, we are free to add any side-effect free operations
on our types; in our example we model addition `+` on `Angle`s and negation
`not` on `Bit`s. In the type system
$\Sigma \in \textrm{hier-lin-}\mathbb H_\textrm{type}$, each type is represented
by a single vertex.

In our example, we thus have three vertices:

{{% figure src="/svg/type-simple.svg" width="70%" nobg=true %}}

We introduce a different colour for each type. Operations such as `cx` are
represented by a hyperedge with two sources on `Qubit` and two targets on
`Qubit`. As in the previous diagrams, we can distinguish operation inputs from
outputs by whether they are attached to the dark or light half of the type
vertex: the `rz` operation thus has one `Qubit` input, one `Angle` input and one
`Qubit` output.

As you can tell from the diagram, whilst `Qubit` is a linear type in the type
system, it is not a linear value in the sense of a minIR graph: the `Qubit` type
has multiple uses and defines in the `cx` operation alone. This is the key
difference between $\textrm{lin-}\mathbb H_\textrm{type}$ and
$\textrm{lin-}\mathbb H$.

#### Qubit allocation and measurement

We also introduce non-pure quantum operations `qalloc` and `measure` which
respectively "create" a qubit (so no input, one `Qubit` output) and "destroy" it
(one `Qubit` input, one `Bit` output---depending on whether the qubit was
projected onto the $\ket{0}$ or $\ket{1}$ state). Remember that the reason these
operations seem to "break" the laws of pure quantum physics is because they
result from interactions with the classical environment.

{{% figure src="/svg/type-qalloc.svg" width="55%" nobg=true %}}

`measure` is fundamental, as it connects quantum values with classical ones!

#### Region definition and structured control flow

Our type system is so far missing a crucial aspect of minIR: the hierarchical
structures. For this we need frame types, i.e. frames in the type graph. We must
introduce a distinct type for each possible type signature of a frame. To keep
this as simple as possible, we will introduce exactly one type for each
signature.

If we write $T$ for the set of types in our type system (i.e. `Bit`, `Qubit` and
`Angle` in our example), then a type signature of an edge is given by a pair
$(I, O)$ of ordered lists of types $I, O \in T^\ast$. For each such $(I, O)$
pair, we introduce

- the frame type `regiondef<I, O>`,
- the in and out types `in<I,O>` and `out<I,O>`,
- along with a new non-linear type `Region<I, O>`, the higher-order type
  representing a region with inputs $I$ and outputs $O$.

The `regiondef<I, O>` op takes zero inputs and returns one output
`Region<I, O>`, whereas `in<I,O>` takes zero inputs and returns values of type
$I$ and `out<I,O>` takes inputs of type $O$ and returns nothing. For instance,
for $I = ($`Qubit`, `Qubit`$)$ and $O = ($`Qubit`, `Bit`$)$, we have the
following type graph.

{{% figure src="/svg/type-regiondef.svg" width="60%" nobg=true %}}

Note that there is an important distinction in
$\textrm{hier-lin-}\mathbb H_\textrm{type}$ in comparison to
$\textrm{hier-lin-}\mathbb H$: there is no notion of regions in the type system:
the `Qubit` and `Bit` types in the above diagram would be in the child region of
`regiondef<I, O>` if it were a graph in $\textrm{hier-}\mathbb H$, but in the
type system, they might also be used by other operations in other regions (such
as `cx`, `rz`, `h` etc. defined earlier).

Using the `Region<I,O>` types, it is then easy to define typed operations for
any structured control flow of interest, such as the `if-else` example above.
The following figure gives an overview of the entire type system of our example.
For display purposes, we have included multiple copies of each type vertex; we
remind the reader that in the actual type graph, all circles of the same type
(colour) are one and the same.

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/minir-graph-types.svg"
    width="90%"
    enlarge="full"
    caption="A complete minIR type graph, following the example in this section. Value vertices with the same label (and same colour) form a single vertex in the type graph. They have been split into multiple vertices in this representation for better readability. The data types and op types with the `<I,O>` suffix are parametrised on the signature type $(I,O)$ for $I,O \in T^\ast$."
%}}
<!-- prettier-ignore-end -->

### An example minIR program

Taking a step back, let us make the introduced ideas more concrete through an
example. We demonstrate how a simple program written in textual form can be
translated and expressed as a minIR graph. All statements are of the form

```python
x, y, ... := op(a, b, c, ...)
```

where `a`, `b`, `c` etc are the SSA values passed to `op` (or _used_ by `op`),
and `x`, `y` etc are the SSA values returned by `op` (or _defined_ by `op`). We
use curly bracket to define the child region of a `regiondef` operation. A valid
minIR program might then look as follows:

```python {linenos=inline}
main := regiondef<(Qubit, Qubit), (Qubit, Bit)> {
    q0, q1 := in()

    q0_1 := h(q0)
    q0_2, q1_1 := cx(q0_1, q1)

    m0 := measure(q0_2)

    ifregion := regiondef<(Qubit,), (Qubit,)> {
        q1 := in()
        out(q1)
    }
    elseregion := regiondef<(Qubit,), (Qubit,)> {
        q1 = in()
        q1_1 := h(q1)
        out(q1_1)
    }
    q1_2 := ifelse(m0, q1_1, ifregion, elseregion)

    out(q1_2, m0)
}
```

Note that the `in()` and `out(..)` operations are only allowed within nested
regions (as required by the type system). We have omitted the type parameters on
these operations, as it mirrors exactly the paremeter of the `regiondef`.

It corresponds to the two minIR graphs on the following page. We use "wiggly
hyperedges" that stretch between values, as in the first figure. They may look
unusual if you are used to computation graphs. One can opt to draw the same
graph with boxes for hyperedges and wires for values, yielding the second
figure. The two representations are equivalent, but the rewriting semantics are
most explicit when viewing values as vertices.

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/minir-graph-2.svg"
    width="55%"
    enlarge="full"
    caption="An example of an IO-free minIR graph. The vertex colours indicate their types in the type system presented in the previous figure. The `main`, `ifregion` and `elseregion` ops are all of op type `regiondef` (with type parameters omitted), labelled here with custom names for clarity. The type parameters of the `ifelse`, `in` and `out` op type have similarly been omitted. All other operation types are given as labels on the edges."
%}}
<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/minir-graph.svg"
    width="58%"
    enlarge="full"
    caption="An equivalent representation of the computation above, now representing operations as boxes and values as wires. The arrow direction indicates the flow from value definition to value use(s). Dashed arrows have been changed to point to regions instead of individual operations."
%}}
<!-- prettier-ignore-end -->

### Differences to the quantum circuit model

We conclude this presentation of minIR by highlighting the differences between
this IR-based representation and the quantum circuit model that most quantum
computing and quantum information scientists are familiar
with[^circuitspecific].

[^circuitspecific]:
    Note that these comments apply specifically to characteristics of quantum
    _circuits_. Other diagrammatic representations of quantum processes in use,
    such as string diagrams, quantum combs etc may not share the same
    properties.

When restricted to purely quantum operations and no nested regions, the string
diagram representation of a minIR graph (i.e. operations as boxes and values as
wires) _looks_ very similar to a quantum circuit. There is, however, a
fundamental shift under the hood from
[_reference_ to _value_ semantics](https://isocpp.org/wiki/faq/value-vs-ref-semantics)---to
borrow terminology from C++.

In the reference semantics of quantum circuits, operations are typically thought
of as "placed" on a qubit (the "lines" in the circuit representation), for
instance, by referring to a qubit index. This qubit reference exists for the
entire computation duration, and the quantum data it refers to will change over
time as operations are applied to that qubit.

In the value semantics of computation graphs and SSA, on the other hand, qubits
only exist in the form of the data they encode. When applying an operation, the
(quantum) data is consumed by the operation and new data is returned. Given that
the input data no longer exists, linearity conditions are required to ensure
that no other operation can be fed the same value.

To make the difference clear, compare the program representations of the
following computation:

<!-- prettier-ignore-start -->
{{% columns ratio="1:1" %}}
**Quantum circuit (pytket)[^pipinstall]**
```python
import pytket as tk
circ = tk.Circuit(2)
circ.H(0)
circ.CX(0, 1)
circ.X(1)
```
[^pipinstall]: This is python code: `pip install pytket`.
<--->
**SSA (minIR)**<br/>
```python
q0_0, q1_0 := in()
q0_1       := h(q0_0)
q0_2, q1_1 := cx(q0_1, q1_0)
q1_2       := x(q1_1)
out(q0_2, q1_2)
```
{{% /columns %}}
<!-- prettier-ignore-end -->

In value semantics, it becomes much harder to track physical qubits across their
lifespan. This has very practical implications: without the convenient naming
scheme, it would, for example, be non-trivial to count how many qubits are
required in the SSA representation of the computation above. However, it is a
drastically simpler picture from the point of view of the compiler and the
optimiser---hence its popularity in classical compilers. When operations are
defined based on qubit references, the compiler must carefully track the
ordering of these operations: operations on the same qubit must always be
applied in order. Through multi-qubit gates, this also imposes a partial
ordering on operations across different qubits that must be respected.

SSA values remove this dependency tracking altogether: the notion of physical
qubit disappears, and the ordering of statements becomes irrelevant. All that
matters is connecting each _use_ of a value (i.e. an input to an operation) with
its _unique_ definition, the output of a previous operation. In other words, the
global ordering imposed by reference semantics is replaced by a causal order on
the diagram @Kissinger2019.

---

All the concepts of minIR embed themselves very easily within the MLIR-based
quantum IRs and the HUGR IR @Hugr. In this sense, our toy IR serves as the
minimum denominator across IRs and compiler technologies so that proposals and
contributions we are about to make can be applied regardless of the underlying
technical details.

By waiving goodbye to the circuit model, we have been able to integrate much of
the theory of traditional compiler design, bringing us in the process much
closer to traditional compiler research and the large-scale software
infrastructure that is already available. This gives us access to all the
classical optimisation and program transformation techniques developed over
decades. Using structured control flow, we were also able to model linear
resources such as qubits well---by using value semantics and SSA, checking that
no-cloning is not violated is as simple as checking that each linear value is
used exactly once.

Finally, this new design is also extremely extensible. Not only does it support
arbitrary operations, but the type system is also very flexible. There is
dedicated support for linear types, but this does not have to be restricted to
qubits: lists of qubits could be added or even, depending on the target
hardware, higher dimensional qudits, continuous variable quantum data, etc.
