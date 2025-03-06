+++
title = "Fully and Confluently Persistent Graph Rewriting"
sort_by = "weight"
weight = 5
layout = "chapter"
slug = "chap:parallel"
+++

This chapter proposes a new data structure for graph rewriting that result
in significant speed ups for certain use cases.
Mutable data structures are typically _ephemeral_: modifying the data structure
overwrites information and invalidates any references to the old data.
In contrast, a _persistent_ data structure applies changes to the data in a
way that both the old and new versions remain accessible---a famous example of this
are [version control systems such as git](https://martinfowler.com/bliki/VersionControlTools.html).

A data structure is _fully_ persistent if past versions of the data structure remain
mutable. Instead of a linear edit history of all mutations,
the result is an edit history tree,
with possibly many "most recent" versions---leaves in the edit history.
Finally, a fully data structure is also _confluently_ persistent if different versions
of the data in the edit history can be joined together.
As a result, the edit history forms a directed acyclic graph (DAG) of versions of the data,
linked by data mutation and merge operations.
Adopting terminology from git, we call a join of two or more versions a _merge_ of multiple versions.

For the purposes of this chapter, we will consider all graphs to be hypergraphs $(V, E)$
with vertex set $V$ and hyperedge set $E \subseteq V^\ast$.
All results can easily be adapted to accomodate for graph attributes, weights and types
as applications require it.
This means the data structure and algorithms we present applies directly to minIR graphs,
but also more broadly to most instances of graph rewriting.

{{< definition >}}
A rewrite $\delta$ on a graph $G = (V, E)$ is given by a tuple $\delta = (V_R, E_R, V^-, \sim)$,
with
- $G_R = (V_R, E_R)$ is a graph called the replacement graph,
- $V^- \subseteq V$ is the vertex deletion set, and
- $\sim\, \subseteq (V_L \cup V_R)^2$ is an equivalence relation called
the gluing relation,

where $V_L = (V \smallsetminus  V^-)$.
{{< /definition >}}
Define $G_L = (V_L, E_L)$ with $E_L = E \cap V_L^2$. Then the rewritten graph resulting from applying
$\delta$ to $G$ is $(G_L \cup G_R) / \sim$, obtained from the union of $G_L$ and $G_R$ by merging
all vertices within the same equivalence class in $\sim$.

This definition of graph rewrite encompasses all valid minIR transformations defined
in {{% reflink "sec:rewrite-def" %}} but may not cover the full breadth of DPO transformations
in other GTSs, as this definition does not allow for "vertex splitting" (see the discussion on DPO
in {{% reflink "sec:rewrite-def" %}}).

To distinguish between vertices and edges of multiple graphs, we will write $V(G)$ and $E(G)$
to designate the vertices, respectively edges, of a graph $G$.
