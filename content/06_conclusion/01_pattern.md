+++
title = "More expressive pattern matching"
layout = "section"
weight = 1
slug = "sec:conclusion-pm"
+++

Pattern matching as defined in {{% reflink "chap:matching" %}} is the problem of
finding pattern embeddings $P \hookrightarrow G$ for patterns from a fixed set
of patterns $P \in \mathcal{P}$. We are interested in lifting two limitations of
this definition.

Firstly, it would be desirable to be able to define patterns that are not a
concrete graph instance, but instead a (potentially infinite) family of graphs.
Examples of such pattern families that could be useful in quantum computing are

- "a sequence of gates that commute with each other", or
- "a subgraph that only contains Clifford gates", or
- "all operations within the body of a loop".

To express these patterns as concrete graph instances would require an infinite
number of graphs. The study of pattern languages that allow the expression of
such higher-level graphs is a mature field of graph transformations, with tools
such as GrGen.NET @Geiss2006 offering many advanced capabilities. It would be of
great interest to establish what classes of pattern languages could be supported
by generalisations of the state automaton approach presented in
{{% reflink "chap:matching" %}}.

Secondly, our approach currently only supports linear values, and thus in its
current form is unsuitable for hybrid quantum-classical computations.
Coincidentally, supporting non-linear values is very similar to finding
embeddings $P \hookrightarrow \mathcal{D}$ of patterns into the confluently
persistent data structure $\mathcal{D}$ of {{% reflink "chap:parallel" %}}. The
case of a non-linear value that is used multiple times in a computation is
syntactically very similar to having to consider a value in $\mathcal{D}$ that
may be connected to operations in different ways, depending on the variant of
the "multiverse" of equivalent graphs that are stored simultaneously in
$\mathcal{D}$.

#### Pattern matching generalisation

The following generalisation of pattern matching might be able to achieve these
two goals whilst still being compatible with the state automaton approach that
we presented. We suggest defining patterns and how they match using three
concepts:

**Constraints.** A pattern is given by a set of constraints $C_1, \ldots, C_n$.
They encode the conditions under which a pattern matches. They would for
instance assert that two vertices are connected by an edge, or that a vertex is
of a certain type. A pattern that is a concrete graph $P$ would then at a
minimum have a constraint for each edge in $P$.

Constraints correspond to edges (transitions) in the state automaton. Pattern
matching proceeds by evaluating all outgoing constraints from the current state,
and proceeds to the states for which the respective constraint is satisfied.

**Indexing schemes.** An indexing scheme assigns each object (e.g. vertex) in
the patterns a unique key in $\mathcal{K}$, and each object (e.g. vertex) in the
input domain $G$ a unique value $\mathcal{V}$. Embeddings of patterns into $G$
are then given by key-value maps $\mathcal{K} \to \mathcal{V}$, mapping keyed
objects from patterns to objects in the input domain. Each constraint $C$ has a
set of keys associated with it; $C$ can then be evaluated by passing it all the
values in $\mathcal{V}$ bound to its keys.

Indexing schemes are designed to give overlapping patterns the same key on their
overlap, so that the overlap must only be matched once. This models how in
{{% reflink "chap:matching" %}}, patterns are clustered into patterns that share
the same contracted tree and are differentiated by their contracted string
tuples only.

**Key-value map expansion.** Indexing schemes abstract away the pattern and
input data in such a way that the pattern matcher only needs to keep track of
key-value maps $\mathcal{K} \to \mathcal{V}$. These maps can be created
recursively using an expansion function

$$\textrm{expand}(\varphi, D) = \{ \varphi_1', \ldots, \varphi_n' \}.$$

This provides all the ways in which the domain of definition $dom(\varphi)$ of
an index map $\varphi$ can be extended. The returned set of new index maps
should coincide with $\varphi$ on $dom(\varphi)$ but expand their domain of
definition to include new keys $\mathcal{K}$. By making it possible to extend
$\varphi$ in more than one way, we can model the existence of non-linear values
(i.e. the index map could be extended to any of the operations that uses a
certain value $v$), as well as the fact that a persistent data structure such as
$\mathcal{D}$ may be keeping track of multiple versions of the graph, and thus
expand a key in multiple ways.

#### Execution of the pattern matcher

Starting from an empty key-value map $\varphi_\varnothing$ at the root state of
the state automaton, the pattern matcher keeps track of a set of key-value maps,
along with for each map the state it is in. It then proceeds by repeatedly
performing the following two actions:

1. Expand the domain of definition of a key-value map $\varphi$ by calling
   $\textrm{expand}$;

2. Evaluate the constraints for a key-value map $\varphi$; if the constraint is
   satisfied, move $\varphi$ to the next state, otherwise try another
   constraint. If no constraint is satisfied, delete $\varphi$.

The performance of the pattern matcher will be highly dependent on choosing a
smart ordering of these two actions, as well as prioritising the right key-value
maps to be expanded and evaluated.

With this proposal, it would appear possible to combine the fast state
automaton-based approach of {{% reflink "chap:matching" %}} and its scaling to a
very large number of patterns, with a more expressive pattern language and
support for non-linear types as well as persistent graph rewriting. An
implementation of this is currently being worked on in the open source
portmatching project, available on
[GitHub](https://github.com/lmondada/portmatching).
