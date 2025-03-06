+++
title = "The data structure"
layout = "section"
weight = 3
slug = "sec:persistent-ds"
+++

We now present a data structure _inspired_ by equality saturation, but for arbitrary graph rewriting.
Rather than maintaining equivalence relations between terms, as done in term graphs,
we maintain equivalence relations between graph vertices.
Our data structure stores in fact the set of all applied rewrites---the main subject of this section
is to show how all operations of interest on this data structure can be implemented efficiently.


The persistent graph rewriting data structure is given by a set $\mathcal{D}$
of rewrites $\delta = (G_R, V^-, \sim) \in \mathcal{D}$.
We extend the $V(\cdot)$ and $E(\cdot)$ notation to $\mathcal{D}$ by defining
them by the union of all vertex resp. edge sets of replacement graphs in $\mathcal{D}$.
We will also write $G \in \mathcal{D}$ by abuse of notation to denote a replacement
graph of a rewrite $\delta$ contained in $\mathcal{D}$.

Importantly, we assume that all vertices $v \in V(\mathcal{D})$
are distinct, i.e. there is a unique $G \in \mathcal{D}$ such that $v \in V(G)$.
We write it as $origin(v) = G$.
It must further hold for all rewrites $\delta$
that $V^- \subseteq V(\mathcal{D} \smallsetminus \delta)$,
and $\sim$ is an equivalence relation on $V(\mathcal{D})$.
We interpret $\sim$ as a relation between vertices in $V(G_R)$ and vertices in the rest
$V(\mathcal{D} \smallsetminus \delta)$:
taking over functional notation, we call
$$\begin{aligned}Dom(\sim) &= \{ v \in V(G_R) \mid \exists\, w \in V(\mathcal{D} \smallsetminus \delta) : v \sim w \}\\Im(\sim) &= \{ v \in V(\mathcal{D} \smallsetminus \delta) \mid \exists\, w \in V(G_R) : v \sim w \}\end{aligned}$$
the domain resp. image of $\sim$.
Our last requirement is that $Im(\sim) \cap V^- = \varnothing$ for all rewrites, i.e. the set
of glued vertices must be disjoint from the set of deleted vertices.

The parents of a rewrite $\delta = (G_R, V^-, \sim)$
are $$parents(\delta) = \left\{ \delta_p \in \mathcal{D} \mid (V^- \cup Im(\sim)) \cap V(\delta_p) \neq \varnothing \right\},$$
i.e. the set of rewrites whose vertices appear in the deletion set $V^-$ and the gluing relation $\sim$
of $\delta$.
Conversely, we define the children of $\delta$ as the set of rewrites whose parents include $\delta$
$$children(\delta) = \left\{\delta_c \in \mathcal{D} \mid \delta \in parents(\delta_c)\right\}.$$

#### Merges, confluent persistence and rewrite creation

Remark that rewrites $\delta$ in $\mathcal{D}$ are not defined on a single graph $G$:
the vertex deletion set $V^-$ as well as the gluing relation $\sim$ act on $V(\mathcal{D})$,
hence different vertices might belong to different rewrites in $\mathcal{D}$.

This is how confluent persistence is achieved.
Rather than handling merges of versions of the data structure explicitly,
we allowing rewrites to be applied not only on previous
versions of the data, but also on collections of several versions---equivalent to
creating explicitly a merged version of the graph
followed by the desired rewrite.
The relation between rewrites in $\mathcal{D}$ given by the sets $parents(\delta)$
and $children(\delta)$ define the edit history of the confluently persistent data
structure---which is only well-defined if the parent-child relationships are acylic.

We can enforce acyclicity by restricting how $\mathcal{D}$ can be constructed and modified.
Specifically, we introduce the procedures
```python
def create_empty() -> D:
    return D({})

def add_rewrite(
    all_rewrites: D,
    replacement_graph: Graph
    deletion_set: Set[V],
    gluing_relation: EquivalenceRelation[V]
):
    new_rewrite = (
        replacement_graph,
        deletion_set,
        gluing_relation
    )
    parents = parents(new_rewrite)
    assert(issubset(parents, all_rewrites))
    assert(are_compatible(parents))

    all_rewrites.add(parents)
```
that respectively returns an empty $\mathcal{D} = \{\}$ and adds a rewrite $\delta$ to $\mathcal{D}$.
The `are_compatible` function is described and defined below.
All other functions (`issubset` and `parents`) have the obvious definition.

Crucially, only rewrites may be added to $\mathcal{D}$ if all vertices they refer to in the vertex
deletion set $V^-$ and the gluing relation $\sim$ are already present in $\mathcal{D}$.
It is thus impossible to create a cyclic parent-child relationship as child rewrites must always
be added to $\mathcal{D}$ after their parents.

#### Compatible rewrites
A further requirement when adding a rewrite to $\mathcal{D}$ using the `add_rewrite` procedure
is that all parents must be _compatible_.
Assuming the parent-child relationship is acylic, we can define recursively
$$ancestors(\delta) = \{\,\delta\,\}\ \cup\ \bigcup_{\delta_p \in parents(\delta)} ancestors(\delta_p).$$
A set of rewrites $D$ are compatible if all vertex deletion sets $V^-$ for all ancestors of $\delta \in D$
are disjoint.
That is, sriting $A = \{ a \in ancestors(d) \mid d \in D \}$ for the set of ancestors of rewrites in $D$, we require that
all sets
$$\{V^- \mid (G_R, V^-, \sim) \in A\}$$
are disjoint.
Furthermore, no rewrite can be glued to a deleted vertex, i.e.
$$\left(\bigcup_{(G_R, V^-, \sim) \in A} Im(\sim)\right) \cap \left(\bigcup_{(G_R, V^-, \sim) \in A} V^- \right)= \varnothing.$$


As pseudocode, this can be implemented straightforwardly as:
```python
def are_compatible(D: Set[D]) -> bool:
    all_ancestors = set({
        a for a in ancestors(d) for d in D
    })
    deleted_vertices = set()
    for d in all_ancestors:
        for v in deletion_set(d):
            if v in deleted_vertices:
                return False
            deleted_vertices.add(v)
    for d in all_ancestors:
        for v in image(gluing_relation(d)):
            if v in deleted_vertices:
                return False
    return True
```
TODO: $I_A$.
The runtime is $O(D_A \log D_A)$ where $D_A$ is the sum of the sizes of all vertex deletion sets of
the ancestors of the rewrites in $D$.
The $\log$ factor can typically be removed if the vertices $v$ span a contiguous integer range
or by using a hash function. Alternatively, the $\log$ factor can also be reduced by using separate
sets to track deleted vertices of each rewrite.

#### Flattening the rewrite history

We have so far explored how rewrites can be added to $\mathcal{D}$, as well as when they are compatible.
However, until we have established that applying rewrites to $\mathcal{D}$ is _in some sense_ equivalent
to applying them directly on a graph, it is hard to see how the data structure $\mathcal{D}$ would
be useable for graph rewriting.
This is precisely our next point.

Consider a set of rewrites $D \subseteq \mathcal{D}$ and let $A = \{ a \in ancestors(d) \mid d \in D \}$
be the set of ancestors of rewrites in $D$.
Consider a topological ordering $(\delta_1, \ldots, \delta_k)$ of the rewrites in $A$, i.e. if $\delta_i$
is a parent of $\delta_j$ then $i < j$.

{{< proposition >}}
The graph $G$ obtained by applying the rewrites in $A$ in order on the empty graph is independent of
the topological ordering chosen. Given the set of rewrites $D \subseteq \mathcal{D}$,
the procedure `flatten_history` returns $G$.
{{< /proposition >}}

Here is the definition of `flatten_history`:
```python
def flatten_history(D: Set[D]) -> Graph:
    all_ancestors = set({
        a for a in ancestors(d) for d in D
    })
    graph = Graph()
    for a in toposort(all_ancestors):
        for v in deletion_set(a):
            remove_vertex(graph, v)
        add_graph(graph, replacement_graph(a))
        for (v, w) in gluing_relation(a):
            merge_vertices(graph, v, w)
    return graph
```
Here, `toposort` is a function that returns a topological ordering of the rewrites in $A$
according to the parent-child rewrite relation, `add_graph` inserts the graph passed as second
argument into the graph passed as first argument, `remove_vertex` removes the vertex from the graph
and `merge_vertices` merges two vertices in a graph. Note that this last function requires
a union find data structure to be implemented, so that all vertex indices remain valid even after merge
operations.

{{% proof %}}
It is easy to see that if the graph $G$ that is obtained from applying the rewrites in order
is independent of the choice of the toplogical ordering, then `flatten_history` is a correct
implementation of the procedure, as it applies one rewrite at a time, in topological order.
{{% /proof %}}

can then be implemented by adding the replacement graph $G_R$
to the data structure,
storing the set of deleted vertices of the replaced pattern and
marking the new boundary vertices as equivalent to the boundary vertices.


#### Traversing the data structure for pattern matching
