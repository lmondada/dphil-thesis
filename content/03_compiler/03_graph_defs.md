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
formalisation in the hypergraph category @Bonchi2022 @Wilson2022). We will see
that this definition is particularly well-suited for graph transformation
because the graph transformations of interest to us correspond to graph glueing
semantics, akin to double pushout (DPO) rewrites.

At a minimum, a hypergraph is defined by a set of vertices $V$ and a set of
(hyper) edges $E \subseteq V^\ast$---we will always consider hypergraphs where
the vertices attached to $e \in E$ are given by a list, i.e. are ordered.
Equivalently, the edges can be defined by an arbitrary set $E$ along with a map
$E \to V^\ast$. We opt for this latter formalism, as it allows us to distinguish
between two types of edge endpoints: edge _sources_ and _targets_.

<!-- prettier-ignore -->
{{% definition title="Hypergraph" id="def-hypergraph" %}}
A hypergraph is a tuple $G = (V, E, \mathit{src}, \mathit{tgt})$
where $V$ is a set of vertices, $E$ is a set of edges and $\mathit{src}$ and $\mathit{tgt}$
are functions that map edges to lists of sources and target vertices, respectively:
$$\mathit{src}: E \rightarrow V^\ast \quad\quad\quad \mathit{tgt}: E \rightarrow V^\ast.$$

<!-- prettier-ignore -->
{{% /definition %}}

We write $u \leadsto v$ to say that there is an edge from $u$ to $v$, i.e. there
is $e \in E$ such that $u \in src(e)$ and $v \in tgt(e)$. We also define the
equivalence relation $u \sim v$ of connected vertices, i.e. either
$u \leadsto v$, $v \leadsto u$, or there exists $w$ with $u \sim w$ and
$w \sim v$.

In minIR, the hypergraph vertices are the values of the computation, while the
hyperedges define the operations. We call values that are target endpoints of an
operation $o$ the _definitions_ of $o$, and those that are source endpoints its
_uses_---and hence rename the adjacency functions $\mathit{src}$ and
$\mathit{tgt}$ to $\mathit{use}$ and $\mathit{def}$ respectively. For a
hypergraph to be a valid minIR graph, some constraints must further be
satisfied:

- all values in minIR must have a unique operation that _defines_ them;
- values that are _linear_ must also have a unique operation that _uses_ them;
- the graph must be acyclic, meaning that no value can be defined in terms of
  itself.

These requirements result in the first three conditions of
{{% refdefinition "minirdef" %}}. Finally, minIR graphs have a concept of
_regions_ that create a hierarchy on the set of operations that captures the
structure the program.

Regions are defined by a partial function $parent$. Partial functions
$f: A \rightharpoonup B$ are functions that may only be defined on a subset of
$A$, i.e. with a domain of definition $dom(f) \subseteq A$.

<!-- prettier-ignore -->
{{% definition title="MinIR graph" id="minirdef" %}}

A minIR graph $(V, V_L, O, \mathit{def}, \mathit{use}, \mathit{parent})$ is
given by a set of values $V$, a subset of which $V_L \subseteq V$ are linear
values, and a set of operations $O$, along with the (partial) functions
$$\begin{aligned}\mathit{def}: O \rightarrow V^\ast && \mathit{use}: O \rightarrow V^\ast && \mathit{parent}: O \rightharpoonup O, \end{aligned}$$
satisfying the constraints

- for all $v \in V$, there exists a unique operation $o \in O$ such that
  $v \in \mathit{def}\,(o)$
- for all $v \in V_L$, there exists a unique operation $o \in O$ such that
  $v \in \mathit{use}\,(o)$
- the relation $\preccurlyeq \, \subseteq O^2$ obtained by the transitive
  closure of
  $$\begin{cases}o \preccurlyeq o' &\textrm{if }o \leadsto o'\\ o \preccurlyeq o' &\textrm{if }o = \mathit{parent}(o')\end{cases}$$
  is a partial order.
- for all $o, o' \in dom(\mathit{parent}\,)$ such that $o \sim o'$,
  $\ \mathit{parent}\,(o) = \mathit{parent}\,(o')$.
  <!-- prettier-ignore -->
  {{% /definition %}}

In the context of minIR, $\leadsto$ relations encode the data flow of values
across the computation. The _regions_ of the graph are then given by the sets

$$R_p = \{ o \in O \mid \textrm{there exists } o' \sim o \textrm{ with }parent(o') = p \}$$

for all $p \in im(parent)$ in the image of $parent$. We also define the _root_
region $R_{root}$, containing all operations not in any other region. Regions
form a tree hierarchy: any non-root region $R_p$ has a _parent_ region, given by
the region $p$ belongs to. If $R_{p_1}$ is an ancestor of $R_{p_2}$, we say that
$R_{p_2}$ is nested within $R_{p_1}$. At times, it will be more convenient to
view regions equivalently as partitions of the _values_ of a minIR graph.

The lack of explicit operation ordering differentiates minIR (and HUGR) from
most classical IRs, which, unless specified otherwise, typically assume that
instructions may have side effects and thus cannot be reordered. All quantum
operations (and the classical operations we are interested in) are side-effect
free, which significantly simplifies our IR.

### Structured control flow

The operations and values of a minIR graph define the data flow of a program.
However, a program must also be able to control and change the data flow at run
time in order to express loops, conditionals, function calls etc. This is the
program _control flow_, which minIR expresses using regions and so-called
_structured control flow_.

Using regions, any non-trivial control flow (function calls, conditionals, loops
etc.) is captured by "black box" operation within the data flow of the program.
One or several nested regions then define the implementation of the black box,
such as the branches of the control flow. A simple function call, that
unconditionally redirects the control flow to the operations within a nested
region, could for example be represented as follows[^figureconventions]:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/call-minir.svg"
    width="40%"
    nobg=true
%}}
<!-- prettier-ignore-end -->

[^figureconventions]:
    In this figure and below, circles are SSA values, with hyperedges spanning
    between them and labelled with operations. Hyperedges attached to the white
    half of circles are value definitions, while hyperedges attached to the
    black half of circles are value uses. Dashed arrows indicate hierarchical
    dependencies; the dashed rectangles mark the regions of the graph.

Importantly, the outer "black box" `call` operation is connected to _use_ and
_def_ values which must match the inputs and outputs that the nested region
expects. Passing function arguments and retrieving returned values in this
fashion will be very familiar to any computer scientist. Unlike most programming
languages, this is also how in minIR values are passed to and from _any_ control
flow constructs we would wish to model. An if-else statement might then look as
follows:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/ifelse-minir.svg"
    width="80%"
    nobg=true
%}}
<!-- prettier-ignore-end -->

The `if` and `else` blocks must expect the same input and output values. This is
key to respecting any linearity constraints that values passed to `ifelse` might
be subject to. By definition, all operations that use or define a value $v$ will
be in the same region---in other words, values are only available within their
defining region. This in effect implements "variable scoping", though note that
in the `ifelse` example above, by introducing multiple code blocks within the
child region of `ifelse`, we have created the possibility of invalid
computations: a graph that uses the values of the `if` block in the `else` block
would be a valid minIR graph. A better approach that scopes different code
blocks and forbids this is proposed in the expanded example below.

With some imagination, this construction can easily be adapted to model loops,
complex control flow graphs, or any other control flow structures.

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

### An example minIR program

Taking a step back, let us make the introduced ideas more concrete through an
example. Instead of defining nested regions on each control flow construct, let
us simplify our syntax by dedicating the definition of nested region to a single
operation `regiondef`: it takes no input and returns a single output value---a
handle to the defined region. This also removes the possibility of invalid
graphs mentioned in the `ifelse` example above, where operations of distinct
code blocks, e.g. `if` and `else` blocks, use values that are invalid in their
branch of control flow.

The value returned by `regiondef` can then be passed as inputs to other control
flow operations, effectively defining the same data without nested regions on
the control flow operation[^llvmblock].

[^llvmblock]:
    This is similar to a label of a code block in LLVM IR. You can also view the
    handle as akin to a function pointer, though, as defined, the pointer would
    always reference a fixed block of code, i.e. it would be a known constant at
    compile time.

As in our previous examples, the region nested within a `regiondef` always has a
unique `in` and `out` operation corresponding to the input and output values of
the region. Using curly bracket scopes to define the nested region of a
`regiondef`, we can easily describe a minIR program in a textual form:

```python {linenos=inline}
main := regiondef {
    q0, q1 := in()

    q0_1 := h(q0)
    q0_2, q1_1 := cx(q0_1, q1)

    m0 := measure(q0_2)

    ifregion := regiondef {
        q1 := in()
        out(q1)
    }
    elseregion := regiondef {
        q1 = in()
        q1_1 := x(q1)
        out(q1_1)
    }
    q1_2 := ifelse(m0, q1_1, ifregion, elseregion)

    out(q1_2, m0)
}
```

<!-- prettier-ignore -->
It corresponds to the following minIR graph:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/minir-graph-2.svg"
    width="60%"
    enlarge="full"
    caption="An example minIR graph. Coloured (half) circles are values, with hyperedges spanning between them and labelled with operations. Hyperedges attached to lighter half circles are value definitions, while hyperedges attached to the darker half circles are value uses. Dashed arrows indicate hierarchical dependencies; the dashed rectangles mark the regions of the graph. The value colours refer to their types. See below."
%}}
<!-- prettier-ignore-end -->

The wiggly hyperedges stretching between values look unusual, especially when
you are used to computation graphs. If we opt to draw the same graph with boxes
for hyperedges and wires for values, we obtain a more familiar representation:

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/minir-graph.svg"
    width="58%"
    enlarge="full"
    caption="An equivalent representation of the computation above, now representing operations as boxes and values as wires. The arrow direction indicates the flow from value definition to value use(s). Dashed arrows have been changed to point to regions instead of individual operations."
%}}
<!-- prettier-ignore-end -->

The two representations are equivalent, but the rewriting semantics are most
explicit when viewing values as vertices.

### Type graph

We have started to see operations (`cx`, `ifelse`, `regiondef` etc.) that carry
semantics, and thus come with additional constraints on the graph in order to be
well-defined. In the example above, each operation must have a fixed number of
inputs and outputs, `regiondef` operations must have a nested region with
exactly one `in` and one `out` operation, etc. This is best captured by a _type
system_---the last missing part in our graph formalism. Graph-based modelling
frameworks admit an elegant approach to typing, given by graph morphisms and
type graphs.

Graph morphisms on hypergraphs are maps of vertices and hyperedges that preserve
the structure of the graph, i.e. the endpoints of mapped hyperedges must be the
mapped endpoints of the original hyperedges. We extend this definition to the
case of minIR graphs by also imposing the preservation of the $parent$ relation.
The map $\mathit{children}: O \to \mathcal{P}(O)$ refers to all children
$$\{o' \in O \mid parent(o') = o\}$$

of an operation $o \in O$.

<!-- prettier-ignore -->
{{% definition title="MinIR graph morphism" id="def-minir-morphism" %}}
Given two minIR graphs

$$\begin{aligned}G_1 &= (V_1, V_{L,1}, O_1, \mathit{def}_1, \mathit{use}_1, \mathit{parent}_1)\\G_2 &= (V_2, V_{L,2}, O_2, \mathit{def}_2, \mathit{use}_2, \mathit{parent}_2).\end{aligned}$$

A minIR morphism $\varphi: G_1 \to G_2$ is given by maps

$$\begin{aligned}\varphi_V: V_1 \to V_2 \quad&& \varphi_O: O_1 \to O_2,\end{aligned}$$

such that

- $\varphi_V$ preserves linear values, i.e. for all $v \in V_1$,
  $$v \in V_{L,1} \Leftrightarrow \varphi_V(v) \in V_{L,2},$$
- $\varphi_V$ and $\varphi_O$ are compatible with the three graph functions,
  i.e. for all $o \in O_1$, we have
  $$o \in dom(parent_1) \Leftrightarrow \varphi_O(o) \in dom(parent_2)$$ and the
  commuting diagrams
  $$\begin{aligned}\mathit{def}_2(\varphi_O(o)) &= \varphi_V(\mathit{def}_1(o)),\quad\\\mathit{use}_2(\varphi_O(o)) &= \varphi_V(\mathit{use}_1(o)), \quad\\\mathit{parent}_2(\varphi_O(o)) &= \varphi_O(\mathit{parent}_1(o)),\end{aligned}$$
  where the domain of definition of $\varphi_V$ was expanded to $V^\ast$
  elementwise.
- $\varphi_O$ is bijective on all children sets, i.e. for all $o \in O_1$,
  $$\varphi_O|_{children(o)}: children(o) \to children(\varphi_O(o))$$ is a
  bijection.

<!-- prettier-ignore -->
{{% /definition %}}

This definition would be the standard extension of graph morphisms to minIR
graphs, if it were not for the third constraint that we impose on the
$\mathit{parent}$ relation. This ensures that the existence (and uniqueness) of
nested regions of any operation is always preserved by graph morphisms---and we
will thus be able to make it a property of the type system (e.g. a `regiondef`
operation _must have a unique_ nested region, with a unique `in` and unique
`out` operation).

A _type system_ for a minIR graph $G$ is then given by a minIR graph $\Sigma$
with values $T$ and operations $\Gamma$ along with a graph morphism
$\mathit{type}: G \to \Sigma$[^slicecat]. The set of values $T$ are called the
(data) types of $G$ and the set of operations $\Gamma$ the operation types, or
optypes. A valid type system for our example minIR graph above is the following.

[^slicecat]: A construction known in category theory as the slice category.

<!-- prettier-ignore-start -->
{{% figure
    src="/svg/minir-graph-types.svg"
    width="100%"
    enlarge="full"
    caption="The minIR type graph for the example above. Value vertices with the same label (and same colour) form a single vertex in the type graph. They have been split into multiple vertices in this representation for better readability. We used two types for regions differentiated by parameters within `<>`, as well as two region definition operations (`regiondefQB` and `regiondefQQ`). This distinguishes region type signatures, each with their respective nested region as well as separate `in` and `out` operations."
%}}
<!-- prettier-ignore-end -->

This type graph encodes all the structure that the example minIR graph above
requires to be valid.

<!-- prettier-ignore -->
{{% definition title="$\Sigma$-typed minIR graph" id="def-sigmatyped" %}}
Consider a minIR graph $\Sigma$ with values $T$, linear values $T_L \subseteq T$
and operations $\Gamma$.
A minIR graph $G = (V, V_L, O, \mathit{def}, \mathit{use}, \mathit{parent})$
is $\Sigma$-typed if there exists a graph morphism
$type: G \to \Sigma$.

We call $\Sigma$ the type system of $G$, $T$ ($T_L$) the types (linear types) of
$G$ and $\Gamma$ the optypes of $G$.

<!-- prettier-ignore -->
{{% /definition %}}

From here onwards, we always consider minIR graphs that are $\Sigma$-typed.

### Differences to the quantum circuit model

We conclude this presentation of minIR by highlighting the differences between
this IR-based representation and the quantum circuit model that most quantum
computing and quantum information scientists are familiar with.

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
its _unique_ definition, the output of a previous operation.

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
