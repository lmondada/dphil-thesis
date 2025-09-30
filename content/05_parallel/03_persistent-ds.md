+++
title = "The data structure"
layout = "section"
weight = 3
slug = "sec:persistent-ds"
+++

We now present a data structure that is closely related to equality saturation
but supports arbitrary graph rewriting. It is modelled on the graph unfolding
construction as presented in @Baldan2008.

Rather than maintaining equivalence relations between terms, as done in term
graphs, we maintain equivalence relations between graph vertices. Our data
structure stores the set of all applied rewrites---the main subject of this
section is to show how all operations of interest on this data structure can be
implemented efficiently.

The persistent graph rewriting data structure is given by a set $\mathcal{D}$ of
_events_ $\delta = (G_R, V^-, \mu) \in \mathcal{D}$, with

- vertex deletion set $V^- \subseteq V(\mathcal{D} \smallsetminus \delta)$ and
- glueing relation $\mu: V^- \rightharpoonup V(G_R)$.

We have extended the $V(\cdot)$ notation to $\mathcal{D}$ by defining it as the
union of all vertex sets of replacement graphs in $\mathcal{D}$. We will
similarly use $V(\delta)$ to denote the set of vertices in the replacement graph
of a rewrite $\delta$.

Events resemble rewrites as defined in {{% refdefinition "def-rewrite" %}} but
differ in that they do not apply to a single graph $G$, i.e. there is no graph
such that $V^- \subseteq V(G)$. Instead,

{{% centered numbered="def-all-vertices" %}}
$$V^-\ \subseteq\ \bigsqcup_{\delta \in \mathcal{D}} V(\delta) = V(\mathcal{D}).$$
{{% /centered %}}

We will see below how a graph $G$ can be constructed such that an event
$\delta \in \mathcal{D}$ is indeed a valid rewrite on $G$.

Using the disjointness of the union in {{% refcentered "def-all-vertices" %}},
for all $v \in V(\mathcal{D})$, there is a unique $\delta \in \mathcal{D}$ such
that $v \in V(\delta)$ that we call the _owner_ of $v$. The _parents_ (or
directed _causes_) $P(\delta)$ of an event $\delta$ are then the owners of the
vertices in the deletion set $V^-$ of $\delta$:

$$P(\delta) = \left\{ \delta_p \in \mathcal{D} \mid V^- \cap V(\delta_p) \neq \varnothing \right\}.$$

Inversely, we define the _children_ of $\delta$ as the set of event whose
parents include $\delta$

$$P^{-1}(\delta) = \left\{\delta_c \in \mathcal{D} \mid \delta \in P(\delta_c)\right\}.$$

The following figure shows an example of a data structure $\mathcal{D}$ on
undirected graphs.

{{% figure src="/svg/fac-search-space.svg" width="60%"
           caption="Events on an undirected graph with their history. Coloured directed edges represent the parent-child relationship. The area that they rewrite in the parent event is represented by dashed regions of the same colour. The map between graphs is given by the vertex IDs." %}}

#### Merges, confluent persistence and event creation

A rewrite $r = (G_R, V^-, \mu)$ that applies to a replacement graph of an event
$\delta_p$, i.e. $V^- \subseteq V(\delta_p)$ immediately defines a valid event
$\delta_r := r$. In that case, $\delta_r$ has a unique parent
$$P(\delta_r) = \{ \,\delta_p\, \}.$$

Creating an event $\delta_r$ from a rewrite $r$ is the simplest type of data
mutation that can be recorded in $\mathcal{D}$. For $\mathcal{D}$ to be a
confluently persistent data structure, it must also be allowed to _merge_
mulitple data mutations together. Rather than handling merges of versions of the
data structure explicitly, an event $\delta \in \mathcal{D}$ can define graph
mutation operations that apply on collections of events
$P \subseteq \mathcal{D}$---the resulting mutation is equivalent to explicitly
creating a merged version of the versions in $P$, followed by the desired
rewrite. In this case, the parents of $\delta$ are precisely the set
$P = P(\delta)$.

In other words, the parent-child relationships of $\mathcal{D}$ is precisely the
_event history_ of $\mathcal{D}$: a directed graph with vertex set $\mathcal{D}$
and edges $\delta_1 \to \delta_2$ if $\delta_1 \in P(\delta_2)$. For
$\mathcal{D}$ to define a valid confluently persistent data structure, we need
to

1. Ensure that the event history is acyclic, and
2. Define conditions that guarantee that events correspond to valid _data
   mutations_.

We hit both birds with one stone by restricting how $\mathcal{D}$ can be
constructed and modified in such a way that acyclicity is guaranteed.
Specifically, we introduce two procedures:

- `CreateEmpty` constructs an empty $\mathcal{D} = \varnothing$, and
- `AddEvent`, adds an event $\delta$ to $\mathcal{D}$.

The first is straightforward---and importantly, the only way to construct an
instance $\mathcal{D}$. `AddEvent`, on the other hand, enforces two conditions
that $\delta$ must satisfy to be added to a set $\mathcal{D}$:

- $P(\delta) \subseteq \mathcal{D}$, and
- all parents of $\delta$ must be _compatible_.

We defer the discussion on the second condition, enforced by the `AreCompatible`
procedure, to its dedicated section below. The restriction
$P(\delta) \subseteq \mathcal{D}$ defines a partial order on events by
guaranteeing that an event $\delta$ can only be defined and added to
$\mathcal{D}$ after all its parents $P(\delta)$ have been added.

We say that $\mathcal{D}$ is _valid_ if it can be constructed from a single call
to `CreateEmpty`, followed by a sequence of calls to `AddEvent`. This is
equivalent to requiring that

1. the parent-child relationship is acylic and
2. the parents of every event satisfy `AreCompatible`.

For the remainder of this chapter, we will always assume that $\mathcal{D}$ is
valid, and thus the event history of $\mathcal{D}$ is always well-defined and
acyclic.

```python
def CreateEmpty() -> Set[Event]:
    return set()

def AddEvent(
    events: Set[Event],
    replacement_graph: Graph
    deletion_set: Set[V],
    glueing_relation: EquivalenceRelation[V]
) -> Set[Event]:
    new_event = (
        replacement_graph,
        deletion_set,
        glueing_relation
    )
    parents = parents(new_event)
    assert(issubset(parents, events))
    assert(AreCompatible(parents))

    events = union(events, {new_event})
```

#### Compatible events

Assuming the parent-child relationship is acylic, we can define the ancestors
(or _causes_) $\lfloor\delta\rfloor$ of an event $\delta$ recursively

$$\lfloor\delta\rfloor = \{\,\delta\,\}\ \cup\ \bigcup_{\delta_p \in P(\delta)} \lfloor\delta_p\rfloor.$$

Events $D \subseteq \mathcal{D}$ are _compatible_ (or a _configuration_) if all
vertex deletion sets $V^-$ for all ancestors of $\delta \in D$ are disjoint.
That is, writing

$$\lfloor D\rfloor = \bigcup_{\delta \in D} \lfloor \delta\rfloor,$$

we require that all sets $\{V^- \mid (G_R, V^-, \mu) \in \lfloor D \rfloor \}$
are disjoint. In the example above, events $\delta_5$ and $\delta_6$ are
compatible, wheresa $\delta_5$ and $\delta_4$ are not. As pseudocode, this is
implemented by the following procedure.

```python
def AreCompatible(events: Set[Event]) -> bool:
    all_ancestors = union([ancestors(d) for d in events])
    deleted_vertices = set()
    for d in all_ancestors:
        for v in deletion_set(d):
            if v in deleted_vertices:
                return False
            deleted_vertices.add(v)
    return True
```

{{% hint "info" %}}

Note that this definition of _event compatibility_ is a strictly stronger
version of parallel independence as is typically defined in DPO rewriting
@Corradini2018. It does not allow for events $\delta_1$ and $\delta_2$ such that
a vertex $v$ is both

- in the _read only context_ of $\delta_1$, i.e. $v \in V_1^- \cap dom(\mu_1)$,
  and thus present both before and after the application of $\delta_1$,
- in the deletion set of $\delta_2$, i.e. $v \in V^-_2$.

This excludes _asymmetric conflicts_ as discussed in e.g. @Baldan2008, which
arise in the more generali definition. This restriction simplifies our
considerations as makes the event history of any event unique.

{{% /hint %}}

The runtime is $O(D_A \log D_A)$, where $D_A$ is the sum of the sizes of all
vertex deletion sets of events in $\lfloor D \rfloor$
$$\sum_{\delta \in \lfloor D \rfloor} |V^-_\delta|.$$

The $\log$ factor can typically be removed if the vertices $v$ span a contiguous
integer range or by using a hash function. Alternatively, the $\log$ factor can
also be reduced by using separate sets to track deleted vertices of each event.

When talking about compatible sets of events $D \subseteq \mathcal{D}$, it
simplifies considerations to always choose $D$ such that the ancestors of
$\delta \in D$ are also in $D$, i.e. $D = \lfloor D \rfloor.$ We introduce the
notation

$$\Gamma(\mathcal{D}) = \{ \lfloor D \rfloor \mid D \subseteq \mathcal{D} \text{ and } D \text{ is compatible}\} \subseteq \mathcal{P}(\mathcal{D})$$

for the set of all compatible sets of rewrites of the form $\lfloor D \rfloor$.

#### Events are rewrites on the flattened history

We have so far explored how events can be added to $\mathcal{D}$, as well as
when they are compatible. However, until we have established that adding events
to $\mathcal{D}$ is _in some sense_ equivalent to applying rewrites on a graph,
it is hard to see how the data structure $\mathcal{D}$ would be useable for
graph rewriting. This is precisely our next point.

<!-- prettier-ignore -->
{{% hint "info" %}}
In a valid non-empty $\mathcal{D}$, events $\delta \in \mathcal{D}$
form a directed acyclic graph and therefore there must always be (at least) one
"root" event $\delta_1 \in \mathcal{D}$ with no parents
$P(\delta_1) = \varnothing$. $\delta_1$ is thus a valid rewrite that can be applied to
any graph.

For the applications of $\mathcal{D}$ that we consider, it will always be
sufficient to have a unique root event $\delta_1$. Viewing $\delta_1$ as a
rewrite that applies to the empty graph $G_0 = \varnothing \to G_1$, we can
understand it as _injecting_ the input graph $G_1$ into $\mathcal{D}$.

Non-root events in $\mathcal{D}$ on the other hand typically correspond to valid
(semantics preserving) rewrites in the GTS under consideration.

{{% /hint %}}

Consider a set of compatible events $D \in \Gamma(\mathcal{D})$. Define a
topological ordering $\delta_1, \ldots, \delta_k$ of the events in $D$, i.e. if
$\delta_j \in P(\delta_i)$ then $i < j$.

<!-- prettier-ignore -->
{{< proposition title="Events as valid rewrites" id="events-as-valid-rewrites" >}}

There are graphs $G_0, \ldots, G_k$ such that for all
$1 \leqslant i \leqslant k$, the event $\delta_i$ defines a valid rewrite $r_i$
on $G_{i-1}$ and $G_i = r_i(G_{i-1})$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}

Define the empty graph $G_0 = \varnothing$. The event $\delta_1$ has no parent
and thus must have an empty vertex deletion set and glueing relation. It is thus
a valid rewrite $r_1$ on $G_0$. Define $G_1 = r_1(G_0)$.

We can similarly define $G_i = r_i(G_{i-1})$ inductively for graphs
$G_2, \ldots, G_k$ if we show for $2 \leqslant i \leqslant k$ that the $i$-th
event $\delta_i$ defines a valid rewrite $r_i$ on $G_{i-1}$. The set of vertices
in $G_{i-1}$ is the union of all vertices in the replacement graph of
$\delta_1, \ldots, \delta_{i-1}$ minus their vertex deletion sets

$$V(G_{i-1}) = \left(\bigsqcup_{1 \leqslant j < i} V(\delta_j)\right) \setminus \left(\bigsqcup_{1 \leqslant j < i} V^-_j\right),$$

where $V^-_j$ is the vertex deletion set of $\delta_j$.

Now, by definition of the event $\delta_i$,

$$V^-_i \subseteq \bigsqcup_{1 \leqslant j < i} V(\delta_j).$$

On the other hand, because of the compatibility of all events in $D$, we know
that $V^-_i \cap V^-_j =\varnothing$ for all $1 \leqslant j < i$. It thus
follows $V^-_i \subseteq V(G_{i-1})$. Hence $\delta_i$ is indeed a valid rewrite
of $G_{i-1}$, and thus $r_i$ and $G_i$ are well-defined.

<!-- prettier-ignore -->
{{% /proof %}}

This construction is illustrated in the following figure for the compatible set
$\lfloor \delta_5 \rfloor \cup \lfloor \delta_6 \rfloor$ of the previous
example.

{{% figure src="/svg/fac-sample-derivation.svg" width="95%"
           caption="Applying events as rewrites in topological order. The result is a sequence of valid graph rewrites that start from the graph of $\delta_1$." %}}

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
def FlattenHistory(events: Set[Event]) -> Graph:
    all_ancestors = union([ancestors(d) for d in events])
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
$\delta_1, \delta_2 \in D$ such that neither is an ancestor of the other. Let

$$D_{pre}  = \lfloor \delta_1 \rfloor \cup \lfloor \delta_2 \rfloor \subseteq D$$

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
repeatedly applying rewrites, we can explore the rewrite space by adding events
to $\mathcal{D}$. Write $flat(D)$ for the graph returned by `FlattenHistory` on
set $D$. If $\mathcal{G}'$ is the set of all graphs returned by `FlattenHistory`
on compatible events

$$\mathcal{G}' = \{\ flat(D) \mid D \in \Gamma(\mathcal{D})\},$$

then {{% refproposition "events-as-valid-rewrites" %}} and
{{% refproposition "prop-flat-graph" %}} combined guarantee that
$\mathcal{G}' \subseteq \mathcal{G}$. To conclude, we show that indeed any graph
in $\mathcal{G}$ is in $\mathcal{G}'$, and hence $\mathcal{G} = \mathcal{G}'$.

<!-- prettier-ignore -->
{{< proposition id="rewrites-as-events" title="Rewrites as valid events" >}}

Let $D \in \Gamma(\mathcal{D})$ be a set of compatible events and $G = flat(D)$.
Any rewrite $r$ that can be applied on $G$ defines an on $G$ defines an event
$\delta = r$ that can be added to $\mathcal{D}$.

<!-- prettier-ignore -->
{{< /proposition >}}

<!-- prettier-ignore -->
{{% proof %}}
We recall that a rewrite $r = (G_R, V^-, \mu)$ defines an event
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
event $\delta_0 = (G, \varnothing, \varnothing)$ with an empty vertex deletion
set and glueing relation and add it to $\mathcal{D}.$

Clearly, $flat(\{\delta_0\}) =G$. We then apply
{{% refproposition "rewrites-as-events" %}} repeatedly. If we have a sequence
$r_1, \ldots, r_k$ of valid rewrites that can be applied on $G$, then the
sequence of events $\delta_1 = r_1, \ldots, \delta_k = r_k$ that it defines can
also be added to $\mathcal{D}$ in this order. As we have further seen in
{{% refproposition "events-as-valid-rewrites" %}} and
{{% refproposition "prop-flat-graph" %}}, the graph $G_k$ that is obtained as a
result of the rewrites is the same graph returned by `FlattenHistory` called on
$D = \mathcal{D}$.

In other words, we conclude that exploring the rewrite space on $G$ is fully
equivalent to exploring the space of valid events starting from
$\mathcal{D} = \{ \delta_0 \}$.
