+++ title = "A graph representation for quantum programs" weight = 3 layout = "section" slug = "sec:graph-defs" +++

Describing the specifics of any one quantum programming language or compiler IR is beyond our scope and would force us to restrict our considerations to a narrow subset of the options that are still being actively explored and developed. For the purposes of this thesis, we instead introduce a simplified graph-based IR for quantum computations that we will call `minIR`. It captures all the expressiveness that we require for hybrid programs whilst remaining sufficiently abstract to be applicable to a variety of IRs and, by extension, programming languages.

MinIR can be thought of being built from statements of the form ```python x, y, ... := op(a, b, c, ...) ``` to be understood as an operation `op` applied on the SSA values `a, b, c, ...` and producing the output values `x, y, ...`.

Computation and dataflow graphs are commonly defined with operation as vertices and values as edges. To faithfully capture the function signature of `op`, this requires storing and preserving an ordering of the incoming and outgoing edges (also known as port graphs @Fernandez2018).

We adopt instead the hypergraph formalisation of computation graphs more common within category theory (see string diagrams @Selinger2010 and their formalisation in the hypergraph category @Bonchi2022 @Wilson2022). We will see that this definition is particularly well-suited for graph transformation because the graph transformations of interest to us correspond to graph gluing semantics, i.e. akin to double pushout (DPO) rewrites.

At a minimum, a hypergraph is defined by a set of vertices $V$ and a set of (hyper) edges $E \subseteq V^\ast$---we will always consider hypergraphs where the vertices attached to $e \in E$ are given by a list, i.e. are ordered. Equivalently, the edges can be defined by an arbitrary set $E$ along with a map $E \to V^\ast$. We opt for this latter formalism, as it allows us to distinguish between two types of edge endpoints: edge _sources_ and _targets_.

{{% definition title="Hypergraph" %}} A hypergraph is a tuple $G = (V, E, \mathit{src}, \mathit{tgt})$ where $V$ is a set of vertices, $E$ is a set of edges and $\mathit{src}$ and $\mathit{tgt}$ are functions that map edges to lists of sources and target vertices, respectively: $$\mathit{src}: E \rightarrow V^\ast \quad\quad\quad \mathit{tgt}: E \rightarrow V^\ast.$$ {{% /definition %}}

We write $u \leadsto v$ to say that there is an edge from $u$ to $v$, i.e. there is $e \in E$ such that $u \in src(e)$ and $v \in tgt(e)$. We also define the equivalence relation $u \sim v$ of connected vertices, i.e. either $u \leadsto v$, $v \leadsto u$, or there exists $w$ with $u \sim w$ and $w \sim v$.

In minIR, the hypergraph vertices are SSA values and edges are the operations. We will call the source of a value its definition and the target its uses---and hence rename the $\mathit{src}$ and $\mathit{tgt}$ functions to $\mathit{def}$ and $\mathit{use}$ respectively. Furthermore, we introduce additional constraints for a hypergraph to be a valid minIR graph: - we impose that a minIR program is in SSA form, i.e. all values in minIR must have a unique definition; - values may also be linear, in which case they must also have a unique use; - the graph must be acyclic, i.e. no value is defined in terms of itself.

Finally, minIR graphs have a concept of _regions_ encoded by a $parent$ partial function. It creates a hierarchy on the set of operations that we will use below to structure the program.

The right harpoon arrow $f: A \rightharpoonup B$ denotes a partial function from $A$ to $B$, i.e. with a domain of definition $dom(f) \subseteq A$.

{{% definition title="MinIR Graph" number="3.1" %}} A minIR graph $(V, V_L, O, \mathit{def}, \mathit{use}, \mathit{parent})$ is given by a set of values $V$, a subset of which are linear $V_L \subseteq V$, and a set of operations $O$, along with the (partial) functions $$\begin{aligned}\mathit{def}: O \rightarrow V^\ast && \mathit{use}: O \rightarrow V^\ast && \mathit{parent}: O \rightharpoonup O, \end{aligned}$$ satisfying the constraints - for all $v \in V$, there exists a unique operation $o \in O$ such that $v \in \mathit{def}\,(o)$ - for all $v \in V_L$, there exists a unique operation $o \in O$ such that $v \in \mathit{use}\,(o)$ - the relation $\preccurlyeq \, \subseteq O^2$ obtained by the transitive closure of $$\begin{cases}o \preccurlyeq o' &\textrm{if }o \leadsto o'\\ o \preccurlyeq o' &\textrm{if }o = \mathit{parent}(o')\end{cases}$$ is a partial order. - for all $o, o' \in dom(\mathit{parent}\,)$ such that $o \sim o'$, $\ \mathit{parent}\,(o) = \mathit{parent}\,(o')$. {{% /definition %}} In the context of minIR, $\leadsto$ relations encode the data flow of values across the computation. The $\sim$ equivalence relation, which we will call the _usedef_ relation, groups values that are connected by chains of $\mathit{use}$s and $\mathit{def}$s.

The lack of explicit operation ordering differentiates minIR (and HUGR) from most classical IRs, which, unless specified otherwise, typically assume that instructions may have side effects and thus cannot be reordered. All quantum operations (and the classical operations we are interested in) are side-effect free, which significantly simplifies our IR.

### Regions and Structured Control Flow The operations and values of a minIR graph define the data flow of a program. However, a program must also be able to control and change the data flow at run time in order to express loops, conditionals, function calls etc. This is the program _control flow_, which minIR expresses using regions and so-called **structured control flow**.

We can define for all operations $o \in O$ $$region(o) = \begin{cases}r & \textrm{if there exists } o' \in dom(parent) \\& \textrm{ with }o \sim o' \textrm{ and }parent(o') = r,\\ \mathit{root} & \textrm{otherwise,}\end{cases}$$ where $root$ is a new symbol disjoint from $O$. The $region$ function is well-defined by the fourth constraint in Definition 3.?. We call $region(o)$ the parent of $o$. With the acyclicity constraint of minIR graphs, this defines a tree structure rooted in $root$ on the set $O \cup \{root\}$ and a hierarchy of regions. If a region $r$ is a parent of another region $r'$, we say that $r'$ is nested in $r$.

Using regions, any non-trivial control flow (function calls, conditionals, loops etc.) is abstracted away by a high-level "black box" operation that can be inserted within the data flow of the program. One or several nested regions then define the implementation of the black box, such as the branches of the control flow. A simple function call, that unconditionally redirects the control flow to the operations within a nested region, could for example be represented as follows[^figureconventions]:

{{% figure     src="/svg/call-minir.svg"     width="40%"     nobg=true %}} [^figureconventions]: In this figure and below, circles are SSA values, with hyperedges spanning between them and labelled with operations. Hyperedges attached to the white half of circles are value definitions, while hyperedges attached to the black half of circles are value uses. Hierarchical dependencies are indicated by dashed arrows; the dashed rectangles are the equivalence classes of $\sim$, i.e. the regions.

Note that importantly, the outer "black box" `call` operation must specify a list of input and output values, which must match the inputs and outputs that the nested region expects. Passing function arguments and retrieving returned values in this fashion will be very familiar to anyone that has every called a function in their programming language. Unlike most programming languages, this is also how in minIR values are passed to and from _any_ control flow constructs that we would wish to model. In fact, the constraints we have imposed on minIR graphs restrict every value to only be available within its defining region. An if-else statement might then look as follows:

{{% figure     src="/svg/ifelse-minir.svg"     width="80%"     nobg=true %}}

The `if` and `else` blocks must expect the same input and output values! This is key to respecting any linearity constraints that values passed to `ifelse` might be subject to. Note as an aside that by introducing multiple code blocks within a single region, we created the possibility for invalid graphs that might use values of the `if` block in the `else` block. We present a better approach that forbids this in the expanded example below.

With some imagination, one can also model arbitrary loops! Consider for instance the following `dowhile` construction. tbd

#### Why not plain branch statements?

There is a simpler---and at least as popular---way of expressing control flow in IRs _without_ regions, with the use of branch statements[^goto]. For instance, LLVM IR provides a conditional branch statement ```llvm br i1 %cond, label %iftrue, label %iffalse ``` that will jump to the operations under the `iftrue` label if `%cond` is true and to the `iffalse` label otherwise. [^goto]: You may know this from prehistoric times as the `goto` statement, in languages such as Fortran, C, and, yes, [even Go](http://golang.org/ref/spec#Goto_statements).

This is a both simple and versatile approach to control flow that can be used to express any higher level language constructs. Unfortunately, conditional branching combined with linear values is a toxic brew.

While linearity, as defined in Definition 3.1, is a simple constraint to impose on our IR in the absence of conditional branching, the constraint would have to be relaxed to allow for a single use _in each mutually exclusive branch_ of control flow. For instance, the following two uses of `b` should be allowed (in pseudo-IR): ```python b := h(a) <if cond> c := x(b) <else>    d := h(b) ``` This is a much harder invariant to check on the IR: linearity would no longer be enforceable as a syntactic constraint on the minIR graph as in Definition 3.?, but would instead depend on the semantics of the operations to establish mutual exclusivity of control flow[^nophinodes]. Forbidding arbitrary branching in minIR and resorting instead to structured control flow as described above to express control flow is just as expressive and gives the linearity constraint a much simpler form. [^nophinodes]: You might be thinking "_oh, but all that is required here are phi nodes!_", if you are familiar with those. No---you'd also need a sort of "phi inverse". Besides, see [this discussion](https://mlir.llvm.org/docs/Rationale/Rationale/#block-arguments-vs-phi-nodes) for more arguments on why no phi nodes.

### An example minIR program Taking a step back, let us make the ideas just introduced more concrete through an example. Instead of defining nested regions on each control flow construct, let us simplify our syntax and define all regions using a single operation `regiondef`: it takes no input and returns a single output value. This also removes the possibility of invalid graphs mentioned in the `ifelse` example above, where operations of distinct code blocks, e.g. `if` and `else` blocks, use values invalid in their branch of control flow.

The value returned by `regiondef` can then be passed as inputs to other control flow operations, effectively defining the same data but without nested regions on the control flow operation[^llvmblock]. [^llvmblock]: This is like the label of a block of code in LLVM IR. You can also view the value as aking to a function pointer, though as defined the pointer would always be a known constant at compile time.

As in our previous examples, the region nested within a `regiondef` always has an unique `in` and `out` operation corresponding to the input and output values of the region. Using curly bracket scopes to define the nested region of a `regiondef`, we can easily describe a minIR program in a textual form:

```python {linenos=inline} main := regiondef {     q0, q1 := in()

    q0_1 := h(q0)     q0_2, q1_1 := cx(q0_1, q1)

    m0 := measure(q0_2)

    ifregion := regiondef {         q1 := in()         out(q1)     }     elseregion := regiondef {         q1 = in()         q1_1 := x(q1)         out(q1_1)     }     q1_2 := ifelse(m0, q1_1, ifregion, elseregion)

    out(q1_2, m0) } ``` It corresponds to the following minIR graph: {{% figure     src="/svg/minir-graph-2.svg"     width="70%"     caption="An example minIR graph. Coloured (half) circles are SSA values, with hyperedges spanning between them and labelled with operations. Hyperedges attached to lighter half circles are value definitions, while hyperedges attached to the darker half circles are value uses. Hierarchical dependencies are indicated by dashed arrows; the dashed rectangles are the equivalence classes of $\sim$, i.e. the regions. The value colours refer to their types, see below." %}}

The wiggly hyperedges stretching between SSA values look a bit unusual, especially when you are used to computation graphs. If we opt to draw the same graph with boxes for hyperedges and wires for values, we obtain a more familiar representation:

{{% figure     src="/svg/minir-graph.svg"     width="70%"     caption="An equivalent representation of the computation above, now representing operations as boxes and values as wires. Arrow direction indicates the flow from value definition to value use(s). Dashed arrows have been changed to point to regions instead of individual operations." %}} The two representations are equivalent, but the rewriting semantics are clearest when viewing values as vertices.


### Type Graph As we start using minIR graphs to model operations with _actual_ semantics, we must ensure additional constraints on the graph for the resulting computation to be well-defined: in the example above, each operation must have a fixed number of inputs and outputs, `regiondef` operations must have a nested region with exactly one `in` and one `out` operation, etc. This is best captured by a _type system_---last missing part in our graph formalism. Graph-based modelling frameworks admit an elegant approach to typing given by graph morphisms and type graphs.

Graph morphisms on hypergraphs are maps of vertices and edges that preserve the structure of the graph, i.e. the endpoints of mapped edges must be the mapped endpoints of the original edges. We extend this definition to the case of minIR graphs by also imposing preservation of the $parent$ relation. The map $\mathit{children}: O \to \mathcal{P}(O)$ refers to all children $$\{o' \in O \mid parent(o') = o\}$$ of an operation $o \in O$.

{{% definition title="MinIR graph morphism" number="3.2" %}} Given two minIR graphs $$\begin{aligned}G_1 &= (V_1, V_{L,1}, O_1, \mathit{def}_1, \mathit{use}_1, \mathit{parent}_1)\\G_2 &= (V_2, V_{L,2}, O_2, \mathit{def}_2, \mathit{use}_2, \mathit{parent}_2).\end{aligned}$$ A graph morphism $\varphi: G_1 \to G_2$ is given by maps $$\begin{aligned}\varphi_V: V_1 \to V_2 \quad&& \varphi_O: O_1 \to O_2,\end{aligned}$$ such that - $\varphi_V$ preserves linear values, i.e. for all $v \in V_1$, $$v \in V_{L,1} \Leftrightarrow \varphi_V(v) \in V_{L,2},$$ - $\varphi_V$ and $\varphi_O$ are compatible with the three graph functions, i.e. for all $o \in O_1$, we have $$o \in dom(parent_1) \Leftrightarrow \varphi_O(o) \in dom(parent_2)$$ and the commuting diagrams $$\begin{aligned}\mathit{def}_2(\varphi_O(o)) &= \varphi_V(\mathit{def}_1(o)),\quad\\\mathit{use}_2(\varphi_O(o)) &= \varphi_V(\mathit{use}_1(o)), \quad\\\mathit{parent}_2(\varphi_O(o)) &= \varphi_O(\mathit{parent}_1(o)),\end{aligned}$$ where the domain of definition of $\varphi_V$ was expanded to $V^\ast$ elementwise. - $\varphi_O$ is bijective on all children sets, i.e. for all $o \in O_1$, $$\varphi_O|_{children(o)}: children(o) \to children(\varphi_O(o))$$ is a bijection. {{% /definition %}}

This definition would be the standard extension of graph morphisms to minIR graphs, if it were not for the third constraint that we impose on the $\mathit{parent}$ relation. This ensures that the existence (and uniqueness) of nested regions of any operation is always preserved by graph morphisms---and we will thus be able to make it a property of the type system (e.g. a `regiondef` operation _must have a unique_ nested region, with a unique `in` and unique `out` operation).

A type system for a minIR graph $G$ is then given by a minIR graph $\Sigma$ and a graph morphism $\mathit{type}: G \to \Sigma$[^slicecat]. The set of values of $\Sigma$ are called the (data) types $T$ of $G$ and the set of operations of $\Sigma$, the operation types $\Gamma$, or optypes. A valid type system for our example minIR graph above is the following. [^slicecat]: A construction known in category theory as the slice category. {{% figure     src="/svg/minir-graph-types.svg"     width="100%"     caption="The minIR type graph for the example above. Value vertices with the same label (and same colour) form a single vertex in the type graph. They have been split into multiple vertices in this representation for better readability. We used two types for regions differentiated by parameters within `<>`, as well as two region definition operations (`regiondefQB` and `regiondefQQ`). This distinguishes region type signatures, each with their respective nested region as well as separate `in` and `out` operations." %}}

This type graph encodes all the structure that the example minIR graph above requires to be valid.

{{< definition title="$\Sigma$-typed minIR graph" number="3.3" >}} Consider a minIR graph $\Sigma$ with values $T$, linear values $T_L \subseteq T$ and operations $\Gamma$. A minIR graph $G = (V, V_L, O, \mathit{def}, \mathit{use}, \mathit{parent})$ is $\Sigma$-typed if there exists a graph morphism $type: G \to \Sigma$.

We call $\Sigma$ the type system of $G$, $T$ ($T_L$) the types (linear types) of $G$ and $\Gamma$ the optypes of $G$. {{< /definition >}}

From here onwards, we always consider minIR graphs that are $\Sigma$-typed.




### Differences to the Quantum Circuit model

We conclude this presentation of minIR by highlighting the differences between this IR-based representation and the quantum circuit model that most quantum computing and quantum information scientists are familiar with.

When restricted to purely quantum operations and no nested regions, the string diagram representation of a minIR graph (i.e. operations as boxes and values as wires) _looks_ very similar to a quantum circuit. There is however a fundamental shift under the hood from [_reference_ to _value_ semantics](https://isocpp.org/wiki/faq/value-vs-ref-semantics)---to borrow terminology from C++.

In the reference semantics of quantum circuits, operations are typically thought of as "placed" on a qubit (the "lines" in the circuit representation), for instance by refering to a qubit index. This qubit reference exists for the entire duration of the computation, and the quantum data it refers to will change over time, as operations are applied to that qubit.

In the value semantics of SSA, on the other hand, qubits only exist in the form of the data they encode: when applying an operation, the (quantum) data is consumed by the operation and new data is returned. Given that the input data then no longer exists, linearity conditions are required to ensure that no other operation can be fed the same value.

To make the difference clear, compare the program representations of the following computation:

{{% columns ratio="4:5" %}} **Quantum circuit (pytket)[^pipinstall]** ```python import pytket as tk circ = tk.Circuit(2) circ.H(0) circ.CX(0, 1) circ.X(1) ``` [^pipinstall]: This is python code: `pip install pytket`. <---> **SSA (minIR)**<br/> ```python q0_0, q1_0 := in() q0_1       := h(q0_0) q0_2, q1_1 := cx(q0_1, q1_0) q1_2       := x(q1_1) out(q0_2, q1_2) ``` {{% /columns %}}

In value semantics, it becomes much harder to track physical qubits across their life span. This has very practical implications: without the convenient naming scheme, it would for example be non-trivial to count how many qubits are required in the SSA representation of the computation above. However, it is a drastically simpler picture from the point of view of the compiler and the optimiser---hence its popularity in classical compilers. When operations are defined based on qubit references, the compiler must carefully track the ordering of these operations: operations on the same qubit must always be applied in order. Through multi-qubit gates, this also imposes a (partial) ordering on operations across different qubits.

SSA values remove this dependency tracking altogether: the notion of physical qubit disappears and the ordering of statements becomes irrelevant. All that matters is to connect each use of a value (i.e. occurrence as an input on the right hand side of an IR statement) with its _unique_ definition on the left hand side of another statement.

---

All the concepts of minIR embed themselves very easily within the MLIR-based quantum IRs, as well as the Hugr IR @Hugr. In this sense, our toy IR serves as the minimum denominator across IRs and compiler technologies, so that proposals and contributions we are about to make can be applied regardless of the underlying technical details.

By waiving goodbye to the circuit model, we have been able to integrate much of the theory of traditional compiler design and has brought us much closer to traditional compiler research and the large scale software infrastructure that is already available. This naturally gives us access to all the classical optimisation and program transformation techniques that were developed over decades. Using structured control flow, we were also able to model linear resources such as qubits well---by using value semantics and SSA, checking that no-cloning is not violated is as simple as checking that each linear value is used exactly once.

Finally, this new design is also extremely extensible. Not only does it support arbitrary operations, the type system is very flexible, too. There is dedicated support for linear types, but this does not have to be restricted to qubits: lists of qubits could be added or even, depending on the target hardware, higher dimensional qudits, continuous variable quantum data, etc. 