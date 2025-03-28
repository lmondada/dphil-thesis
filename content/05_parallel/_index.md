+++
title = "Fully and Confluently Persistent Graph Rewriting"
sort_by = "weight"
weight = 5
layout = "chapter"
slug = "chap:parallel"
+++

This chapter proposes a new data structure for graph rewriting which
significantly speeds up compilation in certain use cases. Mutable data
structures are typically _ephemeral_: modifying the data structure overwrites
information and invalidates any references to the old data. In contrast, a
_persistent_ data structure applies changes to the data so that both the old and
new versions remain accessible---a famous example of this are
[version control systems such as git](https://martinfowler.com/bliki/VersionControlTools.html).

A data structure is _fully_ persistent if modifications can be applied not only
to the latest version but also to previous versions of the data structure. In
that case, a version of the data may be used to create several new versions.
Instead of a linear _edit history_ of all mutations, the result is an edit
history tree, with possibly many "most recent" versions---leaves in the edit
history.

Finally, a fully persistent data structure is also _confluently_ persistent if
different versions of the data in the edit history can be joined together. As a
result, the edit history forms a directed acyclic graph (DAG) of versions of the
data, linked by data mutation and joining operations. Adopting terminology from
git, we call a join of two or more versions a _merge_ of multiple versions.

In this chapter, we will consider all graphs to be hypergraphs $(V, E)$ with
vertex set $V$ and hyperedge set $E \subseteq V^\ast$. All results can easily be
adapted to accommodate graph attributes, weights, and types as required by
applications. This means the data structure and algorithms we present apply
directly to minIR graphs and, more broadly, to most instances of graph
rewriting.

The central object of study in this chapter is the _graph rewrite_. We restate a
simplified verion of {{% refdefinition "minirrewrite" %}} here. We opt for a
rewrite definition that omits the _edge deletion set_ $E^-$ of
{{% refdefinition "minirrewrite" %}}. Whilst it represents a restriction from
the more general definition, it will simplify notation. All constructions and
discussions presented in this chapter also apply to the more general definition.

As in previous chapters, $\sqcup$ denotes disjoint union,
$f: A \rightharpoonup B$ denotes a partial function and $dom$ denotes the domain
of definition of a (partial) function.

<!-- prettier-ignore -->
{{% definition id="def-rewrite" title="Graph rewrite" %}}

A rewrite $r$ on a graph $G = (V, E)$ is given by a tuple $r = (G_R, V^-, \mu)$,
with

- $G_R = (V_R, E_R)$ is a graph called the _replacement graph_,
- $V^- \subseteq V$ is the _vertex deletion set_, and
- $\mu: V^- \rightharpoonup V_R$ is the _glueing relation_, a partial function
  that maps a subset of the deleted vertices of $G$ to vertices in the
  replacement graph.

<!-- prettier-ignore -->
{{% /definition %}}

Define the subgraph $G_L = (V_L, E_L)$ of $G$ given by

$$\begin{aligned}V_L &= (V \smallsetminus V^-) \ \cup\ dom(\mu)\\E_L &= (E \smallsetminus E^-)\ \cap\ V_L^\ast.\end{aligned}$$

The rewritten graph resulting from applying $r$ to $G$ is the glueing

$$r(G) = (G_L \sqcup G_R) / \sim_\mu.$$

obtained from the union of $G_L$ and $G_R$ by merging all vertices within the
same class in the equivalence relation $\sim_\mu$ that is the closure of $\mu$.
We refer to {{% reflink "sec:graph-defs" %}} for more details and an
illustration of glueings and rewrites.

In this chapter, we will consider sequences of multiple rewrites. We will use
the notation $V(G)$ and $E(G)$ to designate the vertices, respectively the
edges, of a graph $G$. It is further assumed that the vertices $V(G)$ and
$V(G')$ for $G \neq G'$ are always disjoint, a fact that we underline by always
writing unions of graphs and vertices with $\sqcup$.

We make use of the fact that for every rewrite $r = (G_R, V^-, \mu)$, the
equivalence classes $\alpha$ of $\sim_\mu$ are of the form

$$\alpha = \{ m \} \sqcup \{ v \in V^- \mid \mu(v) = m \},$$

for some $m \in V(G_R)$. For every set of merged vertices
$\alpha \subseteq V(G)$ in $r(G)$, there is thus a unique vertex not in $V^-$:

$$\alpha \smallsetminus V^- = \{ m \}.$$

We choose to always identify the merged vertex in $r(G)$ with $m$. Using this
convention, the set of vertices of $r(G)$ is simply

$$V(r(G)) = (V(G) \smallsetminus V^-) \sqcup V(G_R).$$
