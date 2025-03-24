+++
title = "The extraction problem"
layout = "section"
weight = 5
slug = "sec:extraction"
+++

In this chapter, we have proposed a persistent data structure for graph rewriting; using its confluence properties, we have then shown that the search space that must be traversed in this new proposal for graph rewriting is super-exponentially smaller. However, unlike when exploring the "naive" search space, the optimal solution within the factorised search space stored in the persistent data structure $\mathcal{D}$ cannot simply be _read out_. Instead, we must solve an extraction problem similar to the second phase of equality saturation for term rewriting.

As we saw in {{% reflink "sec:persistent-ds" %}}, finding a graph $G'$ that is the result of a sequence of rewrites on an input graph $G$ is equivalent to finding a set of compatible edits $D \subseteq \mathcal{D}$---the graph $G'$ is then given by the flattened history of $D$.

There are $2^{|\mathcal{D}|}$ elements in $\mathcal{P}(\mathcal{D})$, which we encode as a boolean assignment problem by introducing a boolean variable $x_\delta$ for all edits $\delta \in \mathcal{D}$. We can constraint the space of valid solutions with a boolean formular

$$\neg (x_\delta \land x_{\delta'})$$

for all $\delta,\delta' \in \mathcal{D}$ such that their vertex deletion sets intersect $V^-(\delta) \cap V^-(\delta') \neq \varnothing$. This ensures that any assignment of $\{x_\delta \mid \delta \in \mathcal{D}\}$ that satisfies all constraints of this format defines a compatible set of edits

$$D = \{\delta \in \mathcal{D} \mid x_\delta\} \subseteq \mathcal{D}.$$

By definition of $parents$, two edits $\delta$ and $\delta'$ can only have overlapping vertex deletion sets if they share a parent. Assuming all edits have a t most $s$ children, ensuring $D$ is a set of compatible edits requires at most $O(s^2 \cdot |\mathcal{D}|)$ constraints.

Remark further from the definition of flattened histories in {{% reflink "sec:persistent-ds" %}}: that any two sets $D, D' \subseteq \mathcal{D}$ with identical sets of ancestors define the same flattened history $G'$. We can therefore restrict our considerations to boolean assignments that correspond to sets $A = D$ that contain all ancestors: if $\delta \in A$, then $parents(\delta) \subseteq A$. We impose for this up to $s \cdot |\mathcal{D}|$ implication constraints

$$x_\delta \lor (\neg x_{\delta'}),$$

for all $\delta,\delta' \in \mathcal{D}$ such that $\delta' \in children(\delta)$. For any set of edits $\mathcal{D}$, the conjuction of all edit compatibility and parent-child relation constraints defines a boolean satisfiability problem (SAT) with variables $x_\delta$. We have shown:

<!-- prettier-ignore -->
{{< proposition number="5.5" >}}

Consider a GTS with a constant upper bound $s$ on the number of rewrites that may overlap any previous rewrite.

The set of valid sequences of rewrites that can be extracted from a set of edits $\mathcal{D}$ in the GTS is given by the set of satisfying assignments of a SAT problem @Cook1971 @Moskewicz2001 with $|\mathcal{D}|$ variables of size $O(|\mathcal{D}|)$.

<!-- prettier-ignore -->
{{< /proposition >}}

#### Finding the optimal assignment

We now have to find the _optimal_ assignment among all satisfiable assignments for the SAT problem given above. In the most general case where the cost function $f$ to be minimised is given as a black box oracle on the graph $G'$, i.e. on the flattened history of the solution set $D \subseteq \mathcal{D}$, this optimisation problem is hard[^whynphard].

[^whynphard]: Hardness can be seen by considering the special case of the extraction problem in which all edits are compatible and no two edits have a parent-child relation: then there are no constraints on the solution space and the optimisation problem requires finding the minimum of an arbitrary oracle over $2^{|\mathcal{D}|}$ inputs.

However, if $f$ can be expressed as a function of $x_\delta$ instead of the flattened history $G'$, then the 'hardness' can be encapsulated within an instance of a SMT problem (satisfiability modulo theories @Nieuwenhuis2006 @Barrett2018), a well-studied generalisation of SAT problems for which highly optimised solvers exist @Moura2008 @Sebastiani2015. A class of cost functions for which the SMT encoding of the optimisation problem becomes particuarly simple are _local_ cost functions:

<!-- prettier-ignore -->
{{< definition number="5.6" title="Local cost function" >}}

A cost function $f$ on graphs is _local_ if for all rewrites $r$ there is a cost $\Delta f_r$ such that for all graphs $G$ that $r$ applies to

$$f(r(G)) = f(G) + \Delta f_r.$$

<!-- prettier-ignore -->
{{< /definition >}}

$\Delta f_r$ must be independent of the graph $G$ it applies to, and as such we can also associate a cost $\Delta f_\delta$ with each edit $\delta \in \mathcal{D}$, given by the cost of any of the rewrites that $\delta$ defines.

Abn instance of such a local cost function often used in the context of the optimisation of computation graphs are functions of the type

$$f(G) = \sum_{v \in V(G)} w(v)$$

for some vertex weight function $w$---i.e. cost functions that can be expressed as sums over the costs $w(\cdot)$ associated to individual vertices in $G$[^alsoedgesifyouwant]. Indeed, it is easy to see that in this case we can write

$$\begin{aligned}f(r(G)) &= \sum_{v \in r(V(G))} w(v)\\&= \sum_{v\in V(G)} w(v) - \underbrace{\sum_{v \in V^-} w(v) + \sum_{v \in V_R} w(v)}_{:= \Delta f_r}\\&= f(G) + \Delta f_r,\end{aligned}$$

where $V^-$ and $V_R$ are the vertex deletion set and replacement graph of $r$ respectively.

[^alsoedgesifyouwant]: A similar argument also applies to cost functions that sum over graph _edges_, as would be the case in minIR, where operations are modelled as hyperedges.

The vertex weight $w(v)$ can for example model the runtime of the operation that $v$ corresponds to, in cases where the total cost function is the runtime of all operations in the computation graph run sequentially. In quantum computing in particular, many of the most widely used cost functions are local, as the cost of a quantum computation is often estimated by the required number of instances of the most expensive gate type (such as CX gates on noisy devices, or T gates for hardware with built-in fault tolerance protocols).

In these cases, the cost function is integer valued and the extraction problem is indeed often _sparse_:

<!-- prettier-ignore -->
{{< definition number="5.7" title="Sparse cost function" >}}

The local cost function $f$ is said to be sparse on $\mathcal{D}$ if for most edits $\delta \in \mathcal{D}$, $\Delta f_\delta = 0$.

<!-- prettier-ignore -->
{{< /definition >}}

In case of sparse local cost functions, the SAT problem on $\mathcal{D}$ can be simplified to only include $$\mathcal{D}_{\neq 0} = \{\delta \in \mathcal{D} \mid \Delta f_\delta \neq 0\}$$

by repeatedly applying the following constraint simplification rules on any $\delta_0 \in \mathcal{D}$ such that $\Delta f_\delta_0 = 0$:

- for every parent $\delta_p \in parents(\delta_0)$ and child $\delta_c \in children(\delta_0)$, remove the parent-child constraints between $\delta_p$ and $\delta_0$ and between $\delta_0$ and $\delta_c$. Insert in their place a parent-child constraint between $\delta_p$ and $\delta_c$.
- for every non-compatible sibling edit $\delta_s \in \mathcal{D}, \delta_s \neq \delta_0$, remove the compatibility constraint between $\delta_0$ and $\delta_s$. Insert in its place a compatibility constraint between $\delta_s$ and $\delta_c$ for all $\delta_c \in children(\delta_s)$.

This reduces the SAT problem to a problem with $|D_{\neq 0}|$ variables and at most $O(min(|\mathcal{D}|, |\mathcal{D}_{\neq 0}|^2)$ constraints.
