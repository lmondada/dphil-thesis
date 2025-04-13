+++
title = "The data structure"
layout = "section"
weight = 3
slug = "sec:persistent-ds"
+++

We now present a data structure that is closely related to equality saturation
but supports arbitrary graph rewriting. Rather than maintaining equivalence
relations between terms, as done in term graphs, we maintain equivalence
relations between graph vertices. Our data structure stores the set of all
applied rewrites---the main subject of this section is to show how all
operations of interest on this data structure can be implemented efficiently.

The persistent graph rewriting data structure is given by a set $\mathcal{D}$ of
_edits_ $\delta = (G_R, V^-, \mu) \in \mathcal{D}$, with

- vertex deletion set $V^- \subseteq V(\mathcal{D} \smallsetminus \delta)$ and
- glueing relation $\mu: V^- \rightharpoonup V(G_R)$.

We have extended the $V(\cdot)$ notation to $\mathcal{D}$ by defining it as the
union of all vertex sets of replacement graphs in $\mathcal{D}$. We will
similarly use $V(\delta)$ to denote the set of vertices in the replacement graph
of a rewrite $\delta$.

Edits are very similar to rewrites as defined in
{{% refdefinition "def-rewrite" %}} but differ in that they do not apply to a
single graph $G$, i.e. there is no graph $G$ such that $V^- \subseteq V(G)$, but
instead

{{% centered numbered="def-all-vertices" %}}
$$V^-\ \subseteq\ \bigsqcup_{\delta \in \mathcal{D}} V(\delta) = V(\mathcal{D}).$$
{{% /centered %}}

We will see below how a graph $G$ can be constructed such that an edit
$\delta \in \mathcal{D}$ is indeed a valid rewrite on $G$.

Using the disjointness of the union in {{% refcentered "def-all-vertices" %}},
for all $v \in V(\mathcal{D})$, there is a unique $\delta \in \mathcal{D}$ such
that $v \in V(\delta)$ that we call the _owner_ of $v$. The _parents_
$P(\delta)$ of an edit $\delta$ are then the owners of the vertices in the
deletion set $V^-$ of $\delta$:

$$P(\delta) = \left\{ \delta_p \in \mathcal{D} \mid V^- \cap V(\delta_p) \neq \varnothing \right\}.$$

Inversely, we define the _children_ of $\delta$ as the set of edits whose
parents include $\delta$

$$P^{-1}(\delta) = \left\{\delta_c \in \mathcal{D} \mid \delta \in P(\delta_c)\right\}.$$

#### Merges, confluent persistence and edit creation

A rewrite $r = (G_R, V^-, \mu)$ that applies to a replacement graph of an edit
$\delta_p$, i.e. $V^- \subseteq V(\delta_p)$ immediately defines a valid edit
$\delta_r := r$. In that case, $\delta_r$ has a unique parent
$$P(\delta_r) = \{ \,\delta_p\, \}.$$

Creating an edit $\delta_r$ from a rewrite $r$ is the simplest type of data
mutation that can be recorded in $\mathcal{D}$. For $\mathcal{D}$ to be a
confluently persistent data structure, it must also be allowed to _merge_
mulitple data mutations together. Rather than handling merges of versions of the
data structure explicitly, an edit $\delta \in \mathcal{D}$ can define graph
mutation operations that apply on collections of edits
$P \subseteq \mathcal{D}$---the resulting mutation is equivalent to explicitly
creating a merged version of the versions in $P$, followed by the desired
rewrite. In this case, the parents of $\delta$ are precisely the set
$P = P(\delta)$.

In other words, the parent-child relationships of $\mathcal{D}$ is precisely the
_edit history_ of $\mathcal{D}$: a directed graph with vertex set $\mathcal{D}$
and edges $\delta_1 \to \delta_2$ if $\delta_1 \in P(\delta_2)$. For
$\mathcal{D}$ to define a valid confluently persistent data structure, we need
to

1. Ensure that the edit history is acyclic, and
2. Define conditions that guarantee that edits correspond to valid _data
   mutations_.

We hit both birds with one stone by restricting how $\mathcal{D}$ can be
constructed and modified in such a way that acyclicity is guaranteed.
Specifically, we introduce two procedures:

- `CreateEmpty` constructs an empty $\mathcal{D} = \varnothing$, and
- `AddEdit`, adds an edit $\delta$ to $\mathcal{D}$.

The first is straightforward---and importantly, the only way to construct an
instance $\mathcal{D}$. `AddEdit`, on the other hand, enforces two conditions
that $\delta$ must satisfy to be added to a set $\mathcal{D}$:

- $P(\delta) \subseteq \mathcal{D}$, and
- all parents of $\delta$ must be _compatible_.

We defer the discussion on the second condition, enforced by the `AreCompatible`
procedure, to its dedicated section below. The restriction
$P(\delta) \subseteq \mathcal{D}$ defines a partial order on edits by
guaranteeing that an edit $\delta$ can only be defined and added to
$\mathcal{D}$ after all its parents $P(\delta)$ have been added.

We say that $\mathcal{D}$ is _valid_ if it can be constructed from a single call
to `CreateEmpty`, followed by a sequence of calls to `AddEdit`. This is
equivalent to requiring that

1. the parent-child relationship is acylic and
2. the parents of every edit satisfy `AreCompatible`.

For the remainder of this chapter, we will always assume that $\mathcal{D}$ is
valid, and thus the edit history of $\mathcal{D}$ is always well-defined and
acyclic.

```python
def CreateEmpty() -> Set[Edit]:
    return set()

def AddEdit(
    edits: Set[Edit],
    replacement_graph: Graph
    deletion_set: Set[V],
    glueing_relation: EquivalenceRelation[V]
) -> Set[Edit]:
    new_edit = (
        replacement_graph,
        deletion_set,
        glueing_relation
    )
    parents = parents(new_edit)
    assert(issubset(parents, edits))
    assert(AreCompatible(parents))

    edits = union(edits, {new_edit})
```

#### Compatible edits

Assuming the parent-child relationship is acylic, we can define the ancestors
$A(\delta)$ of an edit $\delta$ recursively

$$A(\delta) = \{\,\delta\,\}\ \cup\ \bigcup_{\delta_p \in P(\delta)} A(\delta_p).$$

Edits $D \subseteq \mathcal{D}$ are _compatible_ if all vertex deletion sets
$V^-$ for all ancestors of $\delta \in D$ are disjoint. That is, writing

$$A(D) = \bigcup_{\delta \in D} A(\delta),$$

we require that all sets $\{V^- \mid (G_R, V^-, \mu) \in A(D)\}$ are disjoint.
As pseudocode, this is implemented by the following procedure.

```python
def AreCompatible(edits: Set[Edit]) -> bool:
    all_ancestors = union([ancestors(d) for d in edits])
    deleted_vertices = set()
    for d in all_ancestors:
        for v in deletion_set(d):
            if v in deleted_vertices:
                return False
            deleted_vertices.add(v)
    return True
```

The runtime is $O(D_A \log D_A)$, where $D_A$ is the sum of the sizes of all
vertex deletion sets of edits in $A(D)$. The $\log$ factor can typically be
removed if the vertices $v$ span a contiguous integer range or by using a hash
function. Alternatively, the $\log$ factor can also be reduced by using separate
sets to track deleted vertices of each edit.

When talking about compatible sets of edits $D \subseteq \mathcal{D}$, it
simplifies considerations to always choose $D$ such that the ancestors of
$\delta \in D$ are also in $D$, i.e. $D = A(D)$. We introduce the notation

$$\Gamma(\mathcal{D}) = \{ A(D) \mid D \subseteq \mathcal{D} \text{ and } D \text{ is compatible}\} \subseteq \mathcal{P}(\mathcal{D})$$

for the set of all compatible sets of rewrites of the form $A(D)$.

#### Edits are rewrites on the flattened history

We have so far explored how edits can be added to $\mathcal{D}$, as well as when
they are compatible. However, until we have established that adding edits to
$\mathcal{D}$ is _in some sense_ equivalent to applying rewrites on a graph, it
is hard to see how the data structure $\mathcal{D}$ would be useable for graph
rewriting. This is precisely our next point.

<!-- prettier-ignore -->
{{% hint "info" %}}
In a valid non-empty $\mathcal{D}$, edits $\delta \in \mathcal{D}$
form a directed acyclic graph and therefore there must always be (at least) one
"root" edit $\delta_1 \in \mathcal{D}$ with no parents
$P(\delta_1) = \varnothing$. $\delta_1$ is thus a valid rewrite that can be applied to
any graph.

For the applications of $\mathcal{D}$ that we consider, it will always be
sufficient to have a unique root edit $\delta_1$. Viewing $\delta_1$ as a
rewrite that applies to the empty graph $G_0 = \varnothing \to G_1$, we can
understand it as _injecting_ the input graph $G_1$ into $\mathcal{D}$.

Non-root edits in $\mathcal{D}$ on the other hand typically correspond to valid
(semantics preserving) rewrites in the GTS under consideration.

{{% /hint %}}

Consider a set of compatible edits $D \in \Gamma(\mathcal{D})$. Define a
topological ordering $\delta_1, \ldots, \delta_k$ of the edits in $D$, i.e. if
$\delta_j \in P(\delta_i)$ then $i < j$.

<!-- prettier-ignore -->
{{< proposition title="Edits as valid rewrites" id="edits-as-valid-rewrites" >}}

There are graphs $G_0, \ldots, G_k$ such that for all
$1 \leqslant i \leqslant k$, the edit $\delta_i$ defines a valid rewrite $r_i$
on $G_{i-1}$ and $G_i = r_i(G_{i-1})$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

Define the empty graph $G_0 = \varnothing$. The edit $\delta_1$ has no parent
and thus must have an empty vertex deletion set and glueing relation. It is thus
a valid rewrite $r_1$ on $G_0$. Define $G_1 = r_1(G_0)$.

We can similarly define $G_i = r_i(G_{i-1})$ inductively for graphs
$G_2, \ldots, G_k$ if we show for $2 \leqslant i \leqslant k$ that the $i$-th
edit $\delta_i$ defines a valid rewrite $r_i$ on $G_{i-1}$. The set of vertices
in $G_{i-1}$ is the union of all vertices in the replacement graph of
$\delta_1, \ldots, \delta_{i-1}$ minus their vertex deletion sets

$$V(G_{i-1}) = \left(\bigsqcup_{1 \leqslant j < i} V(\delta_j)\right) \setminus \left(\bigsqcup_{1 \leqslant j < i} V^-_j\right),$$

where $V^-_j$ is the vertex deletion set of $\delta_j$.

Now, by definition of the edit $\delta_i$,

$$V^-_i \subseteq \bigsqcup_{1 \leqslant j < i} V(\delta_j).$$

On the other hand, because of the compatibility of all edits in $D$, we know
that $V^-_i \cap V^-_j =\varnothing$ for all $1 \leqslant j < i$. It thus
follows $V^-_i \subseteq V(G_{i-1})$. Hence $\delta_i$ is indeed a valid rewrite
of $G_{i-1}$, and thus $r_i$ and $G_i$ are well-defined.

<!-- prettier-ignore -->
{{% /proof %}}

We now show that the graph $G_k$ is determined uniquely by
$D \in \Gamma(\mathcal{D})$ and provide an explicit procedure to construct it.

<!-- prettier-ignore -->
{{< proposition id="prop-flat-graph" title="Flat graph extraction" >}}

The graph $G_k$ obtained by applying the set of compatible rewrites
$D \in \Gamma(\mathcal{D})$ in topological order on the empty graph is
independent of the topological ordering chosen.

Given the set of rewrites $D \subseteq \mathcal{D}$, the procedure
`FlattenHistory` returns $G_k$ in time

$$O(m + n)$$

where $n$ and $m$ are the total number of vertices and edges across all
replacement graphs in $D$.

<!-- prettier-ignore -->
{{< /proposition >}}

Let us start with the definition of `FlattenHistory`:

```python {linenos=inline}
def FlattenHistory(edits: Set[Edit]) -> Graph:
    all_ancestors = union([ancestors(d) for d in edits])
    graph = Graph()
    for a in toposort(all_ancestors):
        add_graph(graph, replacement_graph(a))
        for (del_v, repl_v) in glueing_relation(a):
            move_edges(graph, repl_v, del_v)
        for v in deletion_set(a):
            remove_vertex(graph, v)
    return graph
```

`toposort` is a function that returns a topological ordering of the rewrites in
$D$ according to the parent-child rewrite relation, `add_graph` inserts the
graph passed as second argument into the graph passed as first argument,
`remove_vertex` removes the vertex along with all incident edges from the graph
and `move_edges` moves all edges of the second vertex to the first vertex.

<!-- prettier-ignore -->
{{% proof %}}

**Correctness of `FlattenHistory`.**&emsp; It is easy to see that if the graph
$G_k$ that is obtained from applying the rewrites in order is independent of the
choice of the toplogical ordering, then `FlattenHistory` is a correct
implementation of the procedure, as it applies one rewrite at a time, in
topological order.

**Rewrite order invariance.**&emsp; Consider two rewrites
$\delta_1, delta_2 \in D$ such that neither is an ancestor of the other. Let

$$D_{pre}  = A(\delta_1) \cup A(\delta_2) \subseteq D$$

and proceed by induction over $D_{pre}$: assume the graph $G_{pre}$ obtained by
applying the rewrites in $D_{pre}$ is invariant on the choice of the topological
ordering of $D_{pre}$. Clearly this is true for $D_{pre} = \varnothing$. All
that remains to be shown is that $G_{post}$ obtained by applying first
$\delta_1$ then $\delta_2$ on $G_{pre}$ is equal to $G_{post}'$, obtained by
applying the same rewrites in the reverse order on $G_{pre}$.

The vertex sets $V^-_1$ and $V^-_2$ of $\delta_1$ and $\delta_2$ must be
disjoint because $\delta_1, \delta_2 \in D$ and hence are compatible.
Furthermore, the replacement graphs (by definition of the rewrites) and the
glueing relations of $\delta_1$ and $\delta_2$ (by rewrite compatibility) cannot
contain vertices in $V^-_1 \sqcup V^-_2$. It follows that the order in which
vertices of $V^-_1 \sqcup V^-_2$ are removed from $G_{pre}$ does not affect the
graph $G_{post}$. Furthermore, vertex merging is a commutative operation, and so
is disjoint graph addition. It follows $G_{post} = G_{post}'$ and hence the
result.

**Runtime.**&emsp; In total $n$ vertices and $m$ edges will be added to `graph`
by `add_graph` on line 5. As a result, at most $n$ vertices can ever be deleted
by line 9. Finally, while a naive implementation of `move_edges` of line 7 might
result in the same edge being moved many times, all edge moves can be cached and
only executed once at the end: notice that every time edges are moved away from
a vertex, that vertex is subsequently removed from the graph. Instead of
removing the vertex, keep it "hidden", with a link to the vertex that the edges
should be moved to. Once all graph operations are completed, traverse all hidden
vertices and follow the links to the vertices that the edges should be moved to.
This can be done in $O(n)$ time. Then move all edges to the correct vertex, in
time $O(m)$, and delete the hidden vertices.

<!-- prettier-ignore -->
{{% /proof %}}

Now instead of exploring the space of all graphs $\mathcal{G}$ reachable by
repeatedly applying rewrites, we can explore the rewrite space by adding edits
to $\mathcal{D}$. Write $flat(D)$ for the graph returned by `FlattenHistory` on
set $D$. If $\mathcal{G}'$ is the set of all graphs returned by `FlattenHistory`
on compatible edits

$$\mathcal{G}' = \{\ flat(D) \mid D \in \Gamma(\mathcal{D})\},$$

then {{% refproposition "edits-as-valid-rewrites" %}} and
{{% refproposition "prop-flat-graph" %}} combined guarantee that
$\mathcal{G}' \subseteq \mathcal{G}$. To conclude, we show that indeed any graph
in $\mathcal{G}$ is in $\mathcal{G}'$, and hence $\mathcal{G} = \mathcal{G}'$.

<!-- prettier-ignore -->
{{< proposition id="rewrites-as-edits" title="Rewrites as valid edits" >}}

Let $D \in \Gamma(\mathcal{D})$ be a set of compatible edits and $G = flat(D)$.
Any rewrite $r$ that can be applied on $G$ defines an on $G$ defines an edit
$\delta = r$ that can be added to $\mathcal{D}$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}
We recall that a rewrite $r = (G_R, V^-, \mu)$ defines an edit
$\delta = (G_R, V^-, \mu)$ that can be added to $\mathcal{D}$ if

- $P(\delta) \subseteq \mathcal{D}$, and
- all rewrites in $P(\delta)$ are compatible.

By the rewrite definition, $V^- \subseteq V(G)$. It follows in particular that

$$V^- \subseteq \bigcup_{\delta' \in D} V(\delta'),$$

and thus $V^- \subseteq V(\mathcal{D})$, as well as
$P(\delta) \subseteq D \subseteq \mathcal{D}$. This proves both conditions.

<!-- prettier-ignore -->
{{% /proof %}}

Starting from the empty graph $\mathcal{D} = \varnothing$, we can create a root
edit $\delta_0 = (G, \varnothing, \varnothing)$ with an empty vertex deletion
set and glueing relation and add it to $\mathcal{D}$.

Clearly, $flat(\{\delta_0\}) =G$. We then apply
{{% refproposition "rewrites-as-edits" %}} repeatedly. If we have a sequence
$r_1, \ldots, r_k$ of valid rewrites that can be applied on $G$, then the
sequence of edits $\delta_1 = r_1, \ldots, \delta_k = r_k$ that it defines can
also be added to $\mathcal{D}$ in this order. As we have further seen in
{{% refproposition "edits-as-valid-rewrites" %}} and
{{% refproposition "prop-flat-graph" %}}, the graph $G_k$ that is obtained as a
result of the rewrites is the same graph returned by `FlattenHistory` called on
$D = \mathcal{D}$.

In other words, we conclude that exploring the rewrite space on $G$ is fully
equivalent to exploring the space of valid edits starting from
$\mathcal{D} = \{ \delta_0 \}$.

#### Traversing the data structure for pattern matching

Suppose you are given a GTS and would like to use $\mathcal{D}$ to rewrite some
input graph $G$. We already know from our results above that the rewrites we
would apply on $G$ can equivalently be added as edits to $\mathcal{D}$. We also
know that the graphs $G'$ resulting from rewrites can be recovered from
$\mathcal{D}$ using `FlattenHistory` on a set of compatible edits
$D \subseteq \mathcal{D}$.

We are only missing one piece: how do we traverse the search space? In other
words, how do we find all applicable rewrites on all graphs within
$\mathcal{D}$? A naive solution would iterate over _all_ subsets of
$D \subseteq \mathcal{D}$, check whether they form a compatible set of edits,
compute `FlattenHistory` if they do, and finally run pattern matching on the
obtained graph. We can do better.

The idea is to traverse the set of edits in $\mathcal{D}$ using the glueing
relations $\mu$ that connect vertices between edits. Define the function
$\bar{\mu}: V(\mathcal{D}) \to \mathcal{P}(V(\mathcal{D}))$ that is the union of
all glueing relations $\mu$ in edits in $\mathcal{D}$:

$$\bar\mu(v) = \{\mu_c(v) \mid \delta_c = (V_c, V^-_c, \mu_c) \in P^{-1}(\delta_v)\}.$$

where we write $\delta_v$ for the owner of $v$, i.e. the (unique) edit
$\delta_v \in \mathcal{D}$ such that $v \in V(\delta_v)$. We define the set
$\mathcal{E}_D(v)$ of equivalent vertices of $v$ that are compatible with $D$ by
applying $\bar\mu(v)$ recursively and filtering out vertices whose owner is not
compatible with $D$. It is easiest to formalise this definition using pseudocode
for the `EquivalentVertices` procedure. The set of vertices in
$\mathcal{E}_D(v)$ are vertices of descendant edits of $\delta_v$.

```python
def EquivalentVertices(
    v: Vertex, edits: Set[Edit]
) -> Set[Vertex]:
    all_vertices = set({v})
    for w in mu_bar(v):
        new_edits = union(edits, {owner(w)})
        if AreCompatible(new_edits):
            all_vertices = union(all_vertices,
                EquivalentVertices(w, new_edits)
            )
    return all_vertices
```

Whilst it looks as though `EquivalentVertices` does not depend on $\mathcal{D}$,
it does so through the use of the function calls to `mu_bar`.

We use `EquivalentVertices` to repeatedly extend a set of _pinned_ vertices
$\pi \subseteq V(\mathcal{D})$. A set of pinned vertices must satisfy two
properties:

- the set $D_\pi = \{\delta_v \mid v \in \pi \}$ is a set of compatible edits,
- there is no vertex $v \in \pi$ and edit $\delta \in D$ such that
  $v \in V^-(\delta)$.

As a result, for the flattened graph $G = flat(D_\pi)$, it always holds that
$\pi \subseteq V(G)$. Furthermore, if $G(\pi) \subseteq G$ is the subgraph of
$G$ induced by $\pi$, then for any superset of pinned vertices
$\pi' \supseteq \pi$, we have $G(\pi) \subseteq G'(\pi')$ where
$G' = flat(D_{\pi'})$. In other words: extending a set of pinned vertices
results in an extension of the flattened graph---a very useful property when
pattern matching. This property follows from the second property above and the
definition of `FlattenHistory`.

This gives us the following simple procedure for pattern matching:

1. Start with a single pinned vertex $\pi = \{v\}$.
2. Construct partial embeddings $P \rightharpoonup G(\pi)$ for patterns $P$.
3. Pick a new vertex $v$ in $G = flat(D_\pi)$ but not in $G(\pi)$ (that we would
   like to extend the domain of definition of our pattern embeddings to).
4. For all vertices $v' \in \mathcal{E}_D(v)$, build new pinned vertex sets
   $\pi' = \pi \cup \{v'\}$, filter out the sets $\pi'$ that are not valid
   pinned vertex sets.
5. Repeat steps 2--4 until all pattern embeddings have been found.

Step 1 is straightforward---notice that pattern matching must be started at a
vertex in $V(\mathcal{D})$, so finding all patterns will require iterating over
all choices of $v$. The pattern embeddings are constructed over iterations of
step 2: each iteration can be seen as one step of the pattern matcher---for
instance, as presented in {{% reflink "chap:matching" %}}---extending the
pattern embeddings that can be extended and discarding those that cannot. If all
possible pattern embeddings have been discarded, then matching can be aborted
for that $\pi$ set.

How step 3 should be implemented depends on the types of graphs and patterns
that are matched on. It is straightforward in the case of computation graphs
with only linear values, i.e. hypergraphs with hyperedges that have directed,
ordered endpoints and vertices that are incident to exactly one incoming and one
outgoing edge. In that case, $v$ can always be chosen in such a way as to ensure
progress on the next iteration of step 2, i.e. the domain of definition of at
least one partial pattern embedding $P \hookrightarrow G(\pi)$ will be extended
by one vertex. The text in the blue box below explains this case in more detail.

Step 4 produces all possible extensions of $\pi$ to pinned vertex sets $\pi'$
that include a descendant $v'$ of $v$ (or $v$ itself). All vertices in
$\mathcal{E}_D(v)$ are in edits compatible with $D$ by definition, so to check
that $\pi'$ is a valid pinned vertex set, we only need to check the second
property of pinned vertices. Let $P$ be a pattern, let $S$ be the set of all
$\pi$ sets under consideration. Step 4 increments the sizes of all pinned vertex
sets $\pi \in S$ whilst maintaining the following invariant.

**Invariant for step 4.**&emsp; If there is a superset $D' \supseteq D_\pi$ of
compatible edits such that $P$ embeds in $G' = flat(D')$, then there is a
superset $\pi' \supseteq \pi$ of vertices such that $P$ embeds in
$flat(D_{\pi'})$.

Finally, step 5 ensures the process is repeated until, for all partial pattern
embeddings, either the domain of definition is complete, or the embedding of $P$
is not possible. Given that step 4 increments the size of $\pi$ sets at each
iteration, this will terminate as long as the vertex picking strategy of step 3
selects vertices that allow to extend (or refute) the partial pattern embeddings
constructed and extended in step 2. This is satisfied, for example, in the case
of linear minIR graphs, as explained in the box.

<!-- prettier-ignore -->
{{% hint "info" %}}

**Choosing the next vertex to pin in linear minIR (step 3).** &emsp; Assuming
patterns are connected, for any partial pattern embedding
$P \hookrightarrow G(\pi)$ there is an edge $e_P \in E(P)$ with no image in
$G(\pi)$ but such that at least one of the endvertex $v_P$ of $e_P$ has an image
$v_G$ in $\pi$---say, $e_P$ is the outgoing edge of $v_P$. Let $v'_P$ be an
endvertex of $e_P$ in $P$ that has no image in $G(\pi)$---and say, it is the
$i$-th outgoing endvertex of $e_P$ in $P$.

Then $v_P$ uniquely identifies an edge $e_G$ in $G = flat(D_\pi)$---the unique
outgoing edge of $v_G$---which, in turn, uniquely identifies a vertex
$v'_G \in V(G)$---the $i$-th outgoing endvertex of $e_G$. By choosing $v'_G$ in
step 3, step 4 will create pinned vertex sets that include all possible vertices
equivalent to $v_G'$, which are all vertices that $v_G$ might be connected to
through its outgoing edge[^realisethis]. The next iteration of step 2 will then
be able to either extend the partial pattern embedding to $v_P$ or conclude that
an embedding of $P$ is not possible.

<!-- prettier-ignore -->
{{% /hint %}}

[^realisethis]:
    To realise this, notice that all vertices equivalent to $v_G'$ are vertices
    that will be merged with $v_G'$. Hence, they will all be attached to the
    outgoing edge of $v_G$ at its $i$-th outgoing endvertex.

Using the approach we have just sketched pattern matching can thus be performed
on the persistent data structure $\mathcal{D}$. The runtime of steps 2 and 3
depend on the type of graphs and patterns that are matched on---these are,
however, typical problems that appear in most instances of pattern matching,
independently of the data structure $\mathcal{D}$ used here. A concrete approach
to pattern matching and results for the graph types of interest to quantum
compilation was presented in {{% reflink "chap:matching" %}}.

The runtime of step 4 and the number of overall iterations of steps 2--4
required for pattern matching will depend on the number of edits in
$\mathcal{D}$ (`AreCompatible` runs in runtime linear in the number of
ancestors), the number of equivalent vertices that successive rounds of step 4
will return and the types of patterns and pattern matching strategies.

Rather than providing very loose worst-case asymptotic bounds or making
stringent assumptions on properties of the GTS and of the pattern-matching
algorithm used, {{% reflink "sec:factor-gts" %}} proposes an analysis of the
complexity advantage of using the data structure $\mathcal{D}$ for persistent
rewriting by analysing the overall size of the search space that is explored.
