+++ title = "Fully and Confluently Persistent Graph Rewriting" sort_by = "weight" weight = 5 layout = "chapter" slug = "chap:parallel" +++

{{% hint "danger" %}} TODOs.

- Proper numbering/referencing of definitions/propositions {{% /hint %}}


This chapter proposes a new data structure for graph rewriting that result in significant speed ups for certain use cases. Mutable data structures are typically _ephemeral_: modifying the data structure overwrites information and invalidates any references to the old data. In contrast, a _persistent_ data structure applies changes to the data in a way that both the old and new versions remain accessible---a famous example of this are [version control systems such as git](https://martinfowler.com/bliki/VersionControlTools.html).

A data structure is _fully_ persistent if past versions of the data structure remain mutable. Instead of a linear edit history of all mutations, the result is an edit history tree, with possibly many "most recent" versions---leaves in the edit history. Finally, a fully data structure is also _confluently_ persistent if different versions of the data in the edit history can be joined together. As a result, the edit history forms a directed acyclic graph (DAG) of versions of the data, linked by data mutation and merge operations. Adopting terminology from git, we call a join of two or more versions a _merge_ of multiple versions.

For the purposes of this chapter, we will consider all graphs to be hypergraphs $(V, E)$ with vertex set $V$ and hyperedge set $E \subseteq V^\ast$. All results can easily be adapted to accomodate for graph attributes, weights and types as applications require it. This means the data structure and algorithms we present applies directly to minIR graphs, but also more broadly to most instances of graph rewriting.

{{< definition number="5.1" >}} A rewrite $r$ on a graph $G = (V, E)$ is given by a tuple $r = (G_R, V^-, \mu)$, with - $G_R = (V_R, E_R)$ is a graph called the replacement graph, - $V^- \subseteq V$ is the vertex deletion set, and - $\mu: V^- \rightharpoonup V_R$ is the _gluing relation_, a partial function that maps a subset of the deleted vertices of $G$ to vertices in the replacement graph. {{< /definition >}} We will write $Dom(\mu)$ and $Im(\mu)$ for the domain and image of $\mu$, respectively.

Define the graph $G_L = (V_L, E_L)$ given by $V_L = V \setminus V^- \cup Dom(\mu)$ and $E_L = E \cap V_L^2$. The gluing relation $\mu$ defines an equivalence relation $$\sim \ \subseteq (V_L \cup V_R)^2$$ by taking the symmetric, transitive and reflexive closure of $\mu$, viewed as a relation $V_L \times V_R$. The rewritten graph resulting from applying $r$ to $G$ is $$r(G) = (G_L \cup G_R) / \sim,$$ obtained from the union of $G_L$ and $G_R$ by merging all vertices within the same class in $\sim$.

In this chapter, we will consider sequences of multiple rewrites. It is therefore convenient to adopt a convention on how to refer to vertices that are created as the result of gluings in rewrites. We make use of the fact that for every rewrite $r = (G_R, V^-, \mu)$, all sets $M$ of merged vertices resulting from the gluing relation $\mu$ are of the form $$M = \{ m \} \cup \{ v \in V^- \mid \mu(v) = m \},$$ for some $m \in V(G_R)$. There is thus a unique vertex in $M$ that is not in the deletion set of $r$: $M \smallsetminus V^- = \{ m \}$. We choose to always identify the merged vertex with $m$. Using this convention, the set of vertices of $r(G)$ is simply $V(G) \cup V(G_R) \setminus V^-$.

---

This definition of graph rewrite encompasses all valid minIR transformations defined in {{% reflink "sec:rewrite-def" %}} but may not cover the full breadth of DPO transformations in other GTSs, as this definition does not allow for "vertex splitting" (see the discussion on DPO in {{% reflink "sec:rewrite-def" %}}).

To distinguish between vertices and edges of multiple graphs, we will write $V(G)$ and $E(G)$ to designate the vertices, respectively edges, of a graph $G$. 