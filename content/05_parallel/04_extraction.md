+++
title = "Exploration and extraction"
layout = "section"
weight = 4
slug = "sec:extraction"
+++

In the previous section, we proposed a data structure $\mathcal{D}$ that is
confluently persistent and can be used to explore the space of all possible
transformations of a graph transformation system (GTS). We are now interested in
using $\mathcal{D}$ to solve optimisation problems over the space of reachable
graphs in the GTS. Following the blueprint of equality saturation (see
{{% reflink "sec:eqsat" %}}), we proceed in two phases:

1. **Exploration.**&emsp; Given an input graph $G$, populate $\mathcal{D}$ with
   events that correspond to rewrites applicable to graphs reachable from $G$,
2. **Extraction.**&emsp; Given a cost function $f$, extract the _optimal_ graph
   in $\mathcal{D}$, i.e. the graph that is a flattening of a set of compatible
   edits $D \subseteq \mathcal{D}$ and minimises $f$.

Each phase comes with its respective challenges, which we discuss in this
section. We will first look at the exploration phase, which requires a way to
find and construct new events $\delta$ that can be added to $\mathcal{D}$. We
will consider the extraction phase in the second part of this section and see
that the problem of optimisation over the power set $\mathcal P(\mathcal D)$ can
be reduced to boolean satisfiability formula that admit simple cost functions in
the use cases of interest.

There is an additional open question that we do not cover in this section and
would merit a study of its own: the choice of heuristics that guide the
exploration phase to ensure the "most interesting parts" of the GTS rewrite
space are explored. We propose a very simple heuristic to this end in the
benchmarks of {{% reflink "sec:factor-gts" %}}, but further investigations are
called for.

### Exploring the data structure with pattern matching

We established in the previous section that rewrites that apply on $G$ can
equivalently be added as events to $\mathcal{D}$. In other words, a graph $G'$
is reachable from $G$ using the rewrites of a GTS if and only if there is a set
of compatible events $D \subseteq \mathcal{D}$ such that $G'$ is the graph
obtained from `FlattenHistory` on input $D$.

To expand $\mathcal{D}$ to a larger set $\mathcal{D}' \supseteq \mathcal{D}$, we
must find all applicable rewrites on all graphs within $\mathcal{D}$. A naive
solution would iterate over _all_ subsets of $D \subseteq \mathcal{D}$, check
whether they form a compatible set of events, compute `FlattenHistory` if they
do, and finally run pattern matching on the obtained graph to find the
applicable rewrites. We can do better.

The idea is to traverse the set of events in $\mathcal{D}$ using the glueing
relations $\mu$ that connect vertices between events. Define the function
$\bar{\mu}: V(\mathcal{D}) \to \mathcal{P}(V(\mathcal{D}))$ that is the union of
all glueing relations $\mu$ in events in $\mathcal{D}$:

$$\bar\mu(v) = \{\mu_c(v) \mid \delta_c = (V_c, V^-_c, \mu_c) \in P^{-1}(\delta_v)\}.$$

where we write $\delta_v$ for the owner of $v$, i.e. the (unique) event
$\delta_v \in \mathcal{D}$ such that $v \in V(\delta_v)$. We define the set
$\mathcal{E}_D(v)$ of equivalent vertices of $v$ that are compatible with $D$ by
applying $\bar\mu(v)$ recursively and filtering out vertices whose owner is not
compatible with $D$. It is easiest to formalise this definition using pseudocode
for the `EquivalentVertices` procedure. The set of vertices in
$\mathcal{E}_D(v)$ are vertices of descendant events of $\delta_v$.

```python
def EquivalentVertices(
    v: Vertex, events: Set[Event]
) -> Set[Vertex]:
    all_vertices = set({v})
    for w in mu_bar(v):
        new_events = union(events, {owner(w)})
        if AreCompatible(new_events):
            all_vertices = union(all_vertices,
                EquivalentVertices(w, new_events)
            )
    return all_vertices
```

Whilst it looks as though `EquivalentVertices` does not depend on $\mathcal{D}$,
it does so through the use of the function calls to `mu_bar`.

We use `EquivalentVertices` to repeatedly extend a set of _pinned_ vertices
$\pi \subseteq V(\mathcal{D})$. A set of pinned vertices must satisfy two
properties:

- the set $D_\pi = \{\delta_v \mid v \in \pi \}$ is a set of compatible events,
- there is no vertex $v \in \pi$ and event $\delta \in D$ such that
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
$\mathcal{E}_D(v)$ are in events compatible with $D$ by definition, so to check
that $\pi'$ is a valid pinned vertex set, we only need to check the second
property of pinned vertices. Let $P$ be a pattern, let $S$ be the set of all
$\pi$ sets under consideration. Step 4 increments the sizes of all pinned vertex
sets $\pi \in S$ whilst maintaining the following invariant.

**Invariant for step 4.**&emsp; If there is a superset $D' \supseteq D_\pi$ of
compatible events such that $P$ embeds in $G' = flat(D')$, then there is a
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
either extend the partial pattern embedding to $v_P$ or conclude that an
embedding of $P$ is not possible.

<!-- prettier-ignore -->
{{% /hint %}}

[^realisethis]:
    To realise this, notice that all vertices equivalent to $v_G'$ are vertices
    that will be merged with $v_G'$. Hence, they will all be attached to the
    outgoing edge of $v_G$ at its $i$-th outgoing endvertex.

Using the approach just sketched, pattern matching can be performed on the
persistent data structure $\mathcal{D}$. The runtime of steps 2 and 3 depend on
the type of graphs and patterns that are matched on---these are, however,
typical problems that appear in most instances of pattern matching,
independently of the data structure $\mathcal{D}$ used here. A concrete approach
to pattern matching and results for the graph types of interest to quantum
compilation was presented in {{% reflink "chap:matching" %}}.

The runtime of step 4 and the number of overall iterations of steps 2--4
required for pattern matching will depend on the number of events in
$\mathcal{D}$ (`AreCompatible` runs in runtime linear in the number of
ancestors), the number of equivalent vertices that successive rounds of step 4
will return and the types of patterns and pattern matching strategies.

### Extraction using SAT

Moving on to the extraction phase, we are now interested in extracting the
_optimal_ graph from $\mathcal{D}$, according to some cost function of interest.
Unlike exploring the "naive" search space of all graphs reachable in the GTS,
the optimal solution within the persistent data structure $\mathcal{D}$ cannot
simply be _read out_.

We showed in {{% reflink "sec:persistent-ds" %}} that finding an optimal graph
$G'$ that is the result of a sequence of rewrites on an input graph $G$ is
equivalent to finding an optimal set of compatible events
$D \in \Gamma(\mathcal{D}) \subseteq \mathcal{P}(\mathcal{D})$---the optimal
graph $G'$ is then recoved by taking $G' = flat(D)$.

There are $2^{|\mathcal{D}|}$ elements in $\mathcal{P}(\mathcal{D})$, which we
encode as a boolean assignment problem by introducing a boolean variable
$x_\delta$ for all events $\delta \in \mathcal{D}$. The set of events $D$ is
then given by

$$D = \{\delta \in \mathcal{D} \mid x_\delta\} \in \mathcal{P}(\mathcal{D}).$$

We can constrain the boolean assignments to compatible sets $D$ by introducing a
boolean formula

{{% centered numbered="event-compatibility-constraint" %}}
$$\neg (x_\delta \land x_{\delta'})$$ {{% /centered %}}

for all $\delta,\delta' \in \mathcal{D}$ such that their vertex deletion sets
intersect $V^-(\delta) \cap V^-(\delta') \neq \varnothing$. Any assignment of
$\{x_\delta \mid \delta \in \mathcal{D}\}$ that satisfies all constraints of
this format defines a compatible set of events.

How many such pairs of events $(\delta,\delta'$) are there? By definition of
parents, two events $\delta$ and $\delta'$ can only have overlapping vertex
deletion sets if they share a parent. Assuming all events have at most $s$
children, ensuring $D$ is a set of compatible events requires at most
$O(s^2 \cdot |\mathcal{D}|)$ constraints.

To further restrict to $D \in \Gamma(\mathcal{D})$, i.e. to sets of compatible
events $D = \lfloor D \rfloor$ that contain all ancestors, we can add the
further constraints: $\delta \in D$ implies $P(\delta) \subseteq D$. This
introduces up to $s \cdot |\mathcal{D}|$ implication constraints

{{% centered numbered="parent-child-constraint" %}}
$$x_\delta \lor (\neg x_{\delta'}),$$ {{% /centered %}}

for all $\delta,\delta' \in \mathcal{D}$ such that
$\delta' \in children(\delta)$.

For any set of events $\mathcal{D}$, the conjunction of all constraints
presented above, i.e. the event compatibility constraints
{{% refcentered "event-compatibility-constraint" %}} and the parent-child
relation constraints {{% refcentered "parent-child-constraint" %}}, defines a
boolean satisfiability problem (SAT) with variables $x_\delta$. We have shown:

<!-- prettier-ignore -->
{{< proposition title="Extraction as SAT problem" id="prop:extraction-as-sat-problem" >}}

Consider a GTS with a constant upper bound $s$ on the number of rewrites that
may overlap any previous rewrite.

The set of valid sequences of rewrites that can be extracted from a set of
events $\mathcal{D}$ in the GTS is given by the set of satisfying assignments of
a SAT problem @Cook1971 @Moskewicz2001 with $|\mathcal{D}|$ variables of size
$O(|\mathcal{D}|)$.

<!-- prettier-ignore -->
{{< /proposition >}}

#### Finding the optimal assignment

We now have to find the _optimal_ assignment among all satisfiable assignments
for the SAT problem given above. In the most general case where the cost
function $f$ to be minimised is given as a black box oracle on the graph $G'$,
i.e. on the flattened history of the solution set $D \subseteq \mathcal{D}$,
this optimisation problem is hard[^whynphard].

[^whynphard]:
    Hardness can be seen by considering the special case of the extraction
    problem in which all events are compatible and no two events have a
    parent-child relation: then there are no constraints on the solution space
    and the optimisation problem requires finding the minimum of an arbitrary
    oracle over $2^{|\mathcal{D}|}$ inputs.

However, if $f$ can be expressed as a function of $x_\delta$ instead of the
flattened history $G' = flat(D)$, then the 'hardness' can be encapsulated within
an instance of a SMT problem (satisfiability modulo theories @Nieuwenhuis2006
@Barrett2018), a well-studied generalisation of SAT problems for which highly
optimised solvers exist @Moura2008 @Sebastiani2015. A class of cost functions
for which the SMT encoding of the optimisation problem becomes particularly
simple are _local_ cost functions:

<!-- prettier-ignore -->
{{% definition title="Local cost function" id="def:local-cost-function" %}}

A cost function $f$ on graphs is _local_ if for all rewrites $r$ there is a cost
$\Delta f_r$ such that for all graphs $G$ that $r$ applies to

$$f(r(G)) = f(G) + \Delta f_r.$$

<!-- prettier-ignore -->
{{% /definition %}}

The cost $\Delta f_r$ of a rewrite $r$ also immediately defines a cost to the
event that $r$ defines $\delta = r$. We can thus associate a cost
$\Delta f_\delta$ with each event $\delta \in \mathcal{D}$, given by the cost of
any of the rewrites that $\delta$ defines.

An instance of such a local cost function often used in the context of the
optimisation of computation graphs are functions of the type

$$f(G) = \sum_{v \in V(G)} w(v)$$

for some vertex weight function $w$---i.e. cost functions that can be expressed
as sums over the costs $w(\cdot)$ associated to individual vertices in
$G$[^alsoedgesifyouwant]. Indeed, it is easy to see that in this case we can
write

$$\begin{aligned}f(r(G)) &= \sum_{v \in r(V(G))} w(v)\\&= \sum_{v\in V(G)} w(v) - \underbrace{\sum_{v \in V^-} w(v) + \sum_{v \in V_R} w(v)}_{:= \Delta f_r}\\&= f(G) + \Delta f_r,\end{aligned}$$

where $V^-$ and $V_R$ are the vertex deletion set and replacement graph of $r$
respectively.

[^alsoedgesifyouwant]:
    A similar argument also applies to cost functions that sum over graph
    _edges_, as would be the case in minIR, where operations are modelled as
    hyperedges.

As discussed in {{% reflink "sec:quantum-sota" %}}, many of the most widely used
cost functions in quantum compilation are local, as the cost of a quantum
computation is often estimated by the required number of instances of the most
expensive gate type (such as \texttt{CX} gates on noisy devices, or \texttt{T}
gates for hardware with built-in fault tolerance protocols).

In these cases, the cost function is integer valued and the extraction problem
is indeed often _sparse_:

<!-- prettier-ignore -->
{{% definition title="Sparse cost function" id="def:sparse-cost-function" %}}

The local cost function $f$ is said to be $\varepsilon$-sparse on $\mathcal{D}$
if
$$\big|\{\delta \in \mathcal{D}\,|\,\Delta f_\delta = 0 \}\big| \geq (1 - \varepsilon) |\mathcal{D}|.$$

<!-- prettier-ignore -->
{{% /definition %}}

In case of $\varepsilon$-sparse local cost functions, the SAT problem on
$\mathcal{D}$ can be simplified to only include
$$\mathcal{D}_{\neq 0} = \{\delta \in \mathcal{D} \mid \Delta f_\delta \neq 0\}$$

by repeatedly applying the following constraint simplification rules on any
$\delta_0 \in \mathcal{D}$ such that $\Delta f_{\delta_0} = 0$:

- for every parent $\delta_p \in parents(\delta_0)$ and child
  $\delta_c \in children(\delta_0)$, remove the parent-child constraints between
  $\delta_p$ and $\delta_0$ and between $\delta_0$ and $\delta_c$. Insert in
  their place a parent-child constraint between $\delta_p$ and $\delta_c$.
- for every non-compatible sibling event
  $\delta_s \in \mathcal{D}, \delta_s \neq \delta_0$, remove the compatibility
  constraint between $\delta_0$ and $\delta_s$. Insert in its place a
  compatibility constraint between $\delta_s$ and $\delta_c$ for all
  $\delta_c \in children(\delta_s)$.

This reduces the SAT or SMT problem to a problem with
$|\mathcal D_{\neq 0}| = \varepsilon |\mathcal{D}|$ variables and at most
$O(min(|\mathcal{D}|, \varepsilon^2|\mathcal{D}|^2)$ constraints.

With the completion of this section, we have described an equivalent computation
on $\mathcal{D}$ for every step of a GTS-based optimisation problem:

1. a rewrite that can be applied on a graph $G$ can be added as an event to
   $\mathcal{D}$,
2. a graph $G'$ that results from a sequence of rewrites can be recovered from
   $\mathcal{D}$ using `FlattenHistory`,
3. the set of all graphs reachable from events in $\mathcal{D}$ can be expressed
   as a SAT problem; depending on the cost function, the optimisation over that
   space can then take the form of an SMT problem.

In essence, using the confluently persistent data structure $\mathcal{D}$ we
replace a naive, exhaustive search over the space $\mathcal{G}$ of all graphs
reachable in the GTS with a SAT (or SMT) problem---solvable using highly
optimised dedicated solvers that could in principle handle search spaces with up
to millions of possible rewrites @Zulkoski2018.
