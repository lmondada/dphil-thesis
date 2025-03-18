+++ title = "Rewriting minIR graphs" weight = 4 layout = "section" slug = "sec:rewrite-def" +++

As discussed in {{% reflink "sec-compgraphs" %}}, computation graphs with linear values, such as minIR, must adopt strict graph transformations semantics to ensure that linear constraints are satisfied at all times. The definitions we propose generalise the double pushout (DPO) construction for graph transformations @Ehrig1976, as presented e.g. in @Bonchi2017&#x200B;---a well-studied formalism that can be generalised categorically to any adhesive category @Lack2005.

However, our presentation is not categorical and  we will impose injectivity and bijectivity conditions where required to guarantee existence and uniqueness of the transformation, as well as to handle linear types correctly. We leave it to future work to define a more solid categorical foundation for minIRs graphs.

The words graph _rewrite_ and _graph _transformation_ are often used interchangeably in the literature. In the context of this thesis, we will take these words to distinguish two slightly different problems:

The study of equivalences and other relations between graphs under well-defined graph semantics is the subject of **graph transformations**. For instance: - a _graph transformation rule_ $L \to R$ (Definition ??) expresses that an instance of $L$ can always be transformed into an instance of $R$, reflecting the semantics of the system that the graph is modelling. - a _graph transformation system_ (GTS) (Definition ??) uses known semantic relations, expressed for instance as graph transformation rules, to define how graphs can be transformed.

**Graph rewriting**, on the other hand, encapsulates the algorithmic procedures and data structures that mutate graphs. A _rewrite_ (Definition ??) is the tuple of data required to turn a graph $G$ into a new graph $G'$.

Given matches of patterns $L$ on a graph $G$, a _graph transformation system_ can consider the set of _graph transformation rules_ that define the semantics of $G$ to produce a set of _rewrites_ that can be applied to $G$ and mutate $G$ in a way that respects the semantics of $G$.

The term "rewriting" is also used in this thesis whenever we mention transformation systems that act not on graphs but on strings and terms, as this is the common terminology in those fields. String and term rewriting are never a topic of research in this work and will only be mentioned in the context of review of relevant past work.

In this section, we will start by introducing the relevant concepts in minIR graph rewriting, i.e. the mutation operations that can be applied to minIR graphs. In the second part, we will pass in review two approaches to define minIR graph transformation semantics, one based on the DPO construction and the other a generalisation of it that formalises the "equivalence classes of circuits" proposed in @Jia2019.

#### Graph gluings and rewrites All graph transformations that we consider operate through local graph rewrites, which we define in terms of graph gluings. Consider first the case of two arbitrary graphs $G_1 = (V_1, E_2)$ and $G_2 = (V_2, E_2)$, along with a relation $\mu\ \subseteq V_1 \times V_2$. Let $\sim_\mu \ \subseteq (V_1 \cup V_2)^2$ be the smallest equivalence relation on $V_1 \cup V_2$ such that for all $v_1 \in V_1$ and $v_2 \in V_2$, $$(v_1, v_2) \in \mu \Leftrightarrow v_1 \sim_\mu v_2.$$ Then we can define - $V = (V_1 \cup V_2)/\sim_\mu$ is the set of all equivalences classes of $\sim_\mu$, and -  $\alpha_\mu(v) \in V$ is the equivalence class of $\sim_\mu$ that $v$ belongs to, for all $v \in V_1 \cup V_2$.

{{% definition title="Graph gluing" %}} The gluing of $G_1$ and $G_2$ according to the gluing relation $\mu$ is given by the vertices $V = (V_1 \cup V_2)/\sim_\mu$ and the edges $$E = \{(\alpha_\mu(u), \alpha_\mu(v)) \mid (u,v) \in E_1 \cup E_2 \} \subseteq V^2.$$ We write the gluing graph as $(G_1 \cup G_2) / \sim_\mu$. {{% /definition %}} In other words, the gluing is the disjoint union of the two graphs, with identification (and merging) of vertices that are related in $\mu$.

This allows us to define a rewrite on a graph $G$: {{< definition title="Graph rewrite" >}} A rewrite $r$ on a graph $G = (V, E)$ is given by a tuple $r = (G_R, V^-, E^-, \mu)$, with - $G_R = (V_R, E_R)$ is a graph called the replacement graph, - $V^- \subseteq V$ is the vertex deletion set, - $E^- \subseteq E \cap dom(\mu)^2$ is the edge deletion set, and - $\mu: V^- \rightharpoonup V_R$ is the _gluing relation_, a partial function that maps a subset of the deleted vertices of $G$ to vertices in the replacement graph.

The domain of definition $dom(\mu)$ is known as the boundary values of $r$.

Define the subgraph $G_L = (V_L, E_L)$ of $G$ given by $$\begin{aligned}V_L &= (V \smallsetminus V^-) \ \cup\ dom(\mu)\\E_L &= (E \cap V_L^2) \smallsetminus E^-.\end{aligned}$$ The partial function $\mu$ is a special case of a gluing relation $V_L \times V_R$, and thus defines a gluing of $G_L$ with $G_R$. The rewritten graph resulting from applying $r$ to $G$ is $$r(G) = (G_L \cup G_R) / \sim_\mu.$$ {{< /definition >}} When there are no edges between $V \smallsetminus V^-$ and $V^- \smallsetminus dom(\mu)$, this definition corresponds to graph rewrites that can be produced using DPO transformations (see discussion in {{% reflink "sec-gts-def" %}}). Otherwise, such edges are deleted.

The notion of graph gluing and graph rewrite can straightforwardly be lifted to hypergraphs, and by extension, to minIR graphs---notice importantly that in this case, it is _values_ that are glued together, not operations (the latter were defined as the hyperedges of the graph).

However, the gluing of two valid minIR graphs---as well as the result of applying a valid rewrite---may not itself be a valid minIR graph. Gluing two values of a linear type, for instance, is a sure way to introduce multiple uses (or definitions) of it. We thus need to be careful to only consider gluings and rewrites of minIR graphs that preserve all the constraints we have imposed on the data structure.

#### Ensuring rewrite validity: interfaces

As a sufficient condition for valid minIR rewrites, we introduce minIR _interfaces_, a concept closely related to the "hypergraph with interfaces" construction of @Bonchi2017 or the supermaps of quantum causality @Hefford2024. We eschew the presentation of holes as a slice category in favour of a "dumbed down" definition that fits naturally within minIR and is sufficient for our purposes.

Let $G$ be $\Sigma$-typed minIR graph with set of data types $T$ and consider type strings $S, S' \in T^\ast$. We define the index sets $$\begin{aligned}\mathrm{Idx}(S) &= \{i \in \mathbb{N} \mid 1 \leq i \leq |S|\}\\\mathrm{Idx}_L(S) &= \{i \in \mathrm{Idx}(S) \mid S_i \in T_L\} \subseteq \mathrm{Idx}(S)\end{aligned}$$ corresponding respectively to the set of all indices into $S$ and the subset of indices of linear types. For any $i \in \mathrm{Idx}(S)$, we denote by $S_i$ the type at position i in $S$.

We define a partial order $\preccurlyeq$[^uptoisopreorder] on $T^\ast$ where $S \preccurlyeq S'$ if there exists a index map $\rho: \mathrm{Idx}(S) \to \mathrm{Idx}(S')$ such that - types are preserved: $S_i = S'_{\rho(i)}$, and - $\rho$ is well-defined and bijective on the restriction to indices of linear types $$\left.\rho\right|_{\mathrm{Idx}_L(S)}: \mathrm{Idx}_L(S) \to \mathrm{Idx}_L(S').$$ [^uptoisopreorder]: To be precise, $\preccurlyeq$ is a partial order on the type strings _up to isomorphism_.

{{% definition title="Interface" %}} Let $G$ be $\Sigma$-typed minIR graph with set of data types $T$. An interface $I = (U, D)$ for $G$ is a pair of type strings $U, D \in T^\ast$.

We say that an interface $I' = (U', D')$ _generalises_ an interface $I = (U, D)$, written $I' \triangleright I$, if $U' \preccurlyeq U$ and $D' \succcurlyeq D$. {{< /definition >}}

We can define the interface associated with an operation $o$ in a minIR graph $G$ by considering the inputs and outputs of $o$. Recalling that $type$ designates the type morphism on $G$, define the interface of $o$ in $G$ as $$I_o = (use(type(o)), \mathit{def}\,(type(o))).$$

Similarly, we can define a specific kind of minIR graph that  _implements_ an interface $I = (U, D)$. A graph $G_R$ implements $I$ if it contains an unique `in` operation $o_{in}$ and an unique `out` operation $o_{out}$ in the root region of $G_R$ such that $$I_{o_{in}} = (\varepsilon, U) \quad\textrm{and}\quad I_{o_{out}} = (D, \varepsilon),$$ where here $\varepsilon$ denotes the empty string in $T^\ast$. In other words, $G_R$ looks like one of the nested regions within `regiondef` operations that we were considering in the example of the previous section.

Consider - an operation $o$ with interface $I_o = (U_o, D_o)$ in a minIR graph $G$ with values $V,$ and - a minIR graph $G_R$ with values $V_R$ which implements an interface $(U, D) = I \triangleright I_o$.

Let $\rho_U: \mathrm{Idx}(U) \to \mathrm{Idx}(U_o)$ and $\rho_D: \mathrm{Idx}(D_o) \to \mathrm{Idx}(D)$ be the index maps that define the generalisation $I \triangleright I_o$. We can define a gluing relation $\mu_o \subseteq V \times V_R$ {{% centered numbered="mu0" %}} $$\begin{aligned}\mu_o =\ & \{ \left(use(o)_{\rho_U(i)}, \mathit{def}\,(o_{in})_{i}\right) \mid i \in \mathrm{Idx}(U) \}\ \cup \\& \{ \left(\mathit{def}\,(o)_{i}, use(o_{out})_{\rho_D(i)}\right) \mid i \in \mathrm{Idx}(D_o) \}.\end{aligned}$$ {{% /centered %}}

This is almost enough to define a rewrite that replaces the operation $o$ in $G$ with the operations of $G_R$---the interface compatibility constraints that we have imposed between $o$ and $G_R$ should ensure that the resulting minIR graph is valid. Unfortunately $\mu_o$ is not a partial function as required by definition 3.?. Furthermore, the graph $G_R$ still contains $o_{in}$ and $o_{out}$ operations that should not be present in the rewritten graph.

This is resolved in the following proposition:

{{% proposition title="MinIR operation rewrite" %}} Let $o$ with interface $I_o$ be an operation in a minIR graph $G$, let $G_R$ such that it implements an interface $I \triangleright I_o$ and let $\mu_o$ be defined as in {{% refcentered "mu0" %}}.

There is a graph $G_R'$ with values $V_R'$ and a partial function $\mu_o': V \rightharpoonup V_R'$ such that the graph $r_o(G)$ obtained from the rewrite $$r_o = (G_R', dom(\mu_o), \{o\}, \mu_o')$$ is a valid minIR graph and is equivalent to the graph obtained by removing the operations $\{o, o_{in}, o_{out}\}$ from $(G \cup G_R) / \sim_{\mu_o}$.

We call $r_o$ the rewrite of $o$ into $G_R$. {{% /proposition %}} The definition of the rewrite of $o$ into a graph $G_R$ behaves as one would expect---the only subtleties relate to the handling of non-linear (i.e. copyable) values at the boundary of the rewrite. The following example illustrates some of these edges cases.

{{% figure     src="/svg/rewrite-minir.svg"     width="95%"     caption="Rewriting operation $o$ in the graph $G$ (top left) into the operations $o_1$ and $o_2$ of the graph $G_R$ (bottom left). Coloured dots indicate the index maps $\rho_U$ and $\rho_D$ from inputs of $G_R$ to inputs of $o$, respectively from outputs of $o$ to outputs of $G_R$." %}} When the index maps $\rho_U$ and $\rho_D$ are not injective (yellow and green dots), values are merged, resulting in multiple uses of the value (i.e. copies). This is why the index maps must be injective on linear values (dots in shades of blue). Value merging also happens when a value is used multiple times in $o$ (yellow and red dots). This will never happen with linear values (as they can never have more than one use in $o$), nor with any value definitions (the same value can never be defined more than once). Finally, values not in the image of $\rho_U$ or $\rho_D$ (purple dot) are discarded. This case is also excluded for linear values by requiring surjectivity.

{{% proof collapse="true" %}} We start this proof with the explicit construction of $G_R'$ and $\mu_o'$. Define $\sim_R \subseteq (V_R)^2$ as the smallest equivalence relation such that $$use(o)_{\rho_U(i)} = use(o)_{\rho_U(j)} \Rightarrow \textit{def}\,(o_{in})_i \sim_R \textit{def}\,(o_{in})_j.$$ Then we define $G_R'' = G_R / \sim_R$, the graph obtained by gluing together values within the same equivalence class of $\sim_R$.

_Claim 1:_ $G_R''$ is a valid minIR graph.

Claim 1 follows from the observation that only values of non-linear types are glued together. If $v \sim_R v'$, then either $v = v'$ or there exist $i \neq j$ such that $$\textit{def}\,(o_{in})_i \sim_R \textit{def}\,(o_{in})_j.$$ If $\rho_U(i) = \rho_U(j)$, then $\rho_U$ is not injective on $i$ and $j$, and by the definition of $\rho_U$, $type(v)\not\in T_L$ and $type(v') \not\in T_L$. Otherwise, there are $i' = \rho_U(i) \neq use(o)_{\rho_U(j)} = j'$ such that $use(o)_{i'} = use(o)_{j'}$. The same value is used twice, which is only a valid minIR graph if $v$ and $v'$ are not linear, thus proving Claim 1.

Define $G_R'$ as the graph obtained from $G_R''$ by removing the operations $\{o_{in}, o_{out}\}$. Let $V_R'$ be the set of values of $G_R'$ (and of $G_R''$). Writing $\alpha(v)$ for the equivalence class of $\sim_R$ that $v \in V_R' = V_R/\sim_R$ belongs to, we can define $\mu_o' \in V \times V_R'$ as: $$(v, w) \in \mu_o \Leftrightarrow (v, \alpha(w)) \in \mu_o'.$$

_Claim 2:_ $\mu_o'$ is a partial function $V \rightharpoonup V_R'$.

In other words, for all $(v, \alpha_1), (v, \alpha_2) \in \mu_o'$, then $\alpha_1 = \alpha_2$. Let $w_1 \in \alpha_1$ and $w_2 \in \alpha_2$ be values in $V_R$. First of all, $use(o)_i \neq \textit{def}\,(o)_j$ for all $i, j$, otherwise $G$ is not acyclic. So either $v \in use(o)$, or $v \in \textit{def}\,(o)$, but not both.

The simpler case: if $v \in \textit{def}\,(o)$, then there exists $i$ such that $\textit{def}\,(o)_i = v$. Furthermore $i$ is unique because by minIR definition, $v$ has an unique definition in $G$. It follows from {{% refcentered "mu0" %}} that $w_1 = use(o_{out})_{\rho_D(i)} = w_2$ and hence $\alpha_1 = \alpha_2$.

Otherwise, there exists $i$ and $j$ such that $v = use(o)_{\rho_U(i)} = use(o)_{\rho_U(j)}$ and $\textit{def}\,(o_{in})_i = w_1$ as well as $\textit{def}\,(o_{in})_j = w_2$. By definition of $\sim_R$, we have $w \sim_R w'$, and thus $$\alpha_1 = \alpha(w_1) = \alpha(w_2) = \alpha_2,$$ proving Claim 2.

_Claim 3:_ $r_o(G)$ is equivalent to the graph obtained by removing the operations $\{o, o_{in}, o_{out}\}$ from $(G \cup G_R) / \sim_{\mu_o}$.

It follows directly from our construction of $\sim_R$ and $\mu_o'$ that the equivalence classes of (the smallest equivalence relation closure of) $\mu_o' \circ \alpha$ is equal to the equivalence classes of (the smallest equivalence relation closure of) $\mu_o$. The claim follows by Definition ?? (graph gluings) and the definition of $r_o$.

And finally, _Claim 4:_ $r_o(G)$ is a valid minIR graph.

Per Definition ??, We must check four properties: _(i)_ every value is defined exactly once, _(ii)_ every linear value is used exactly once, _(iii)_  the graph is acyclic, and _(iv)_ every region has (at most) one parent.

_(iii)_ follows from the fact that $G$ and $G_R$ are acyclic and a single operation $o$ in $G$ is replaced: any cycle across $G$ and $G_R$ would also be a cycle in $G$ by replacing the subpath in $G_R$ with $o$. _(iv)_ follows from the fact that $o_{in}$ and $o_{out}$ are in the root region of $G_R$, by definition of interface implementation. _(i):_ removing $o$ from $G$ removes the unique definitions of all values in $\mathit{def}\,(o)$. Each such value $v$ is glued to a unique value $\mathit{use}\,(o_{out})_i$ in $G_R$---the new and unique definition of $v$ in $r_o(G)$.  _(ii)_ follows from the same argument as in _(i)_, but relying on injectivity of $\rho_U$ on linear values to establish uniqueness. {{% /proof %}}


#### Arbitrary minIR rewrites

We have so far defined rewrites of operations into graphs $G_R$. We can generalise these rewrites to rewrite subgraphs $H$ of $G$, provided the minIR subgraphs satisfy some constraints.

As usual, let us consider a minIR graph $G = (V, V_L, O, \mathit{def}, \mathit{use}, \mathit{parent})$,

{{< definition title="MinIR subgraph" >}} Consider a subset of values and operations $V_H \subseteq V$ and $O_H \subseteq O$. Define the sets $$\begin{aligned} B_D &= \{v \in V_H \mid v \in use(o)\textrm{ for some }o \in O \smallsetminus O_H \},\\B_U &= \{v \in V_H \mid v \in \mathit{def}\,(o)\textrm{ for some }o \in O \smallsetminus O_H \},\end{aligned}$$

The tuple $H = (V_H, O_H)$ of $G$ is called a valid minIR subgraph of $G$ if the following conditions hold: - the subgraph is convex, i.e. for all $v_1, v_2 \in V_H$, any path along $\leadsto$ from $v_1$ to $v_2$ contains only vertices in $V_H$, - parent-child relations are contained within the subgraph, i.e. $$v \in V_H \cap dom(\mathit{parent}) \Leftrightarrow \mathit{parent}(v) \in V_H,$$ - for all boundary values $v_1, v_2 \in B_D \cup B_U$, we have $v_1 \sim v_2,$ i.e. all boundary values are in the same region. {{< /definition >}}

We say that $H$ implements an interface $I_H = (U_H, D_H)$ if orderings $$\textrm{ord}(B_D), \textrm{ord}(B_U) \in T^\ast$$ of the boundary values in $B_D$ and $B_U$ can be fixed such that the graph obtained from the subgraph $H$ of $G$ by adding an $o_{in}$ and $o_{out}$ operation with $$\textit{def}\,(o_{in}) = \textrm{ord}(B_U)\quad\textrm{and}\quad use(o_{out}) = \textrm{ord}(B_D)$$ and $use(o_{in}) = \textit{def}\,(o_{out}) = \varepsilon$ is a minIR graph that implements $I$. Note that the same subgraph may implement more than one interface as a result of various orderings of the boundary values.

Define the boundary values $B = B_D \cup B_U \subseteq V_H$, as well as the boundary operations $$O_B = \{o \in O_H \mid v \in B\textrm{ for all }v \in \mathit{def}\,(o) \cup use(o)\}.$$

Consider a minIR graph $G_R$ with values $V_R$ which implements an interface $(U, D) = I \triangleright I_H$ at the `in` and `out` operations $o_{in}$ and $o_{out}.$ We can generalise the definition of $\mu_o$ from {{% refcentered "mu0" %}} to a gluing $\mu\subseteq B \times V_R$ defined as {{% centered numbered="mu1" %}} $$\begin{aligned}\mu =\ & \{ \left(\textrm{ord}(B_U)_{\rho_U(i)}, \mathit{def}\,(o_{in})_{i}\right) \mid i \in \mathrm{Idx}(U) \}\ \cup \\& \{ \left(\mathrm{ord}(B_D)_{i}, use(o_{out})_{\rho_D(i)}\right) \mid i \in \mathrm{Idx}(B_D) \},\end{aligned}$$ {{% /centered %}} obtained simply by replacing the values $o$ uses and defines with the values that $H$ uses and defines (i.e. values in $B_U$ and $B_D$ respectively).

{{% proposition title="MinIR subgraph rewrite" number="3.2" %}} Consider a valid minIR subgraph $H = (V_H, O_H)$ of a minIR graph $G$ that implements an interface $I_H$ and a minIR graph $G_R$ which implements an interface $I \triangleright I_H$.

There is a graph $G_R'$ with values $V_R'$ and a partial function $\mu': V_H \rightharpoonup V_R'$ such that the graph $r_H(G)$ obtained from the rewrite $$r_H = (G_R', V_H, O_B, \mu')$$ is a valid minIR graph and is equivalent to the graph obtained by removing the values $V_H \smallsetminus B$ and operations $O_H \cup \{o_{in}, o_{out}\}$ from $(G \cup G_R) / \sim_{\mu}$.

We call $r_H$ the rewrite of $H$ into $G_R$. {{% /proposition %}}

{{% proof %}} Let $G_o$ be the unique minIR graph given by three operations $o_{in}$, $o_{out}$ and an operation $o$ such that $G_o$ implements $I_H$ and let $\tilde \mu$ be the gluing relation given by {{% refcentered "mu1" %}} for $G_R = G_o$.

Because of Proposition ??, it is sufficient to show that there is a rewrite $r$ that replaces $H$ with $G_o$ such that - $r(G)$ is a valid minIR graph, and - $r(G)$ is equivalent to the graph obtained by removing the values $V_H \smallsetminus B$ and operations $O_H \cup \{o_{in}, o_{out}\}$ from $$(G \cup G_o) / \sim_{\tilde\mu}.$$

The rewrite $r_H$ is then the composition of $r$ and $r_o$ (it is easy to see that the composition of two rewrites is again a rewrite).

to be continued... {{% /proof %}}

A figure illustrates this graph transformation with an example below. This simple and limited graph transformation framework captures a remarkably large set of minIR program transformations. It may seem at first that the restrictions by Definition (subgraph) on subgraph convexity, containment of boundary values within a single region as well as containment of parent-child relations represent significant limitation on the expressivity of the rewrites. In practice, however, the semantics of minIR operations can be used to decompose more complex rewrites into a sequence of simple rewrites of the kind of Proposition ??.

Consider in particular the case of minIR graphs with a type system that includes `regiondef` and `call` operations as discussed in examples of the previous section---respectively defining a code block by a nested region and redirecting control flow to a code block defined using a `regiondef`. Then all constraints that we impose on valid minIR subgraphs can be effectively side-stepped using the _region outlining_ and _value hoisting_ transformations.

**Region outlining** moves a valid minIR subgraph into its own separate region, and replaces the hole left by the subgraph in the computation by a `call` operation to the newly outlined region.

**Value hoisting** moves a value definition within a region to its parent region and passes the value down to the nested region through an additional input. In case of linear values, we can similarly hoist the unique _use_ of the value to the parent region.

Using these transformations, non-convex subgraphs can always be made convex by taking the convex hull and outlining any parts within that are not part of the subgraph. Outlined regions can then be passed as additional inputs to the subgraph. Step 1 of the figure below illustrates this transformation. Similarly, a subgraph that includes operations without their parent can be extended to cover the entire region and its parent, outlining any parts of the region that are not part of the subgraph.

Finally, whenever a boundary value $v$ belongs to a region that is not the top level region of the subgraph[^assumeconnected], we can repeatedley hoist $v$ to its parent region until it is in the top level region. The value is then recursively passed as argument to descendant regions until the region that it is required in. Subgraphs can thus always be transformed to only have input and output boundary values at the top level region. Step 2 of the figure below illustrates this transformation. [^assumeconnected]: We can always extend a subgraph to contain more ancestor regions, until there is indeed a unique top-level region in the subgraph.

{{% figure src="/svg/rewrite.svg" width="95%" caption="A minIR graph transformation for a non-convex pattern, using outlining and hoisting. We use (nested) boxes to represent operations and regions within them and coloured edges for (typed) values." %}} 