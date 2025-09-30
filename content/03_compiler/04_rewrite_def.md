+++
title = "Graph transformation in minIR"
weight = 4
layout = "section"
slug = "sec:rewrite-def"
+++

As discussed in {{% reflink "sec-compgraphs" %}}, computation graphs with linear
values, such as minIR, must adopt strict graph transformation semantics to
ensure that linear constraints are satisfied at all times. In this section, we
use the minIR graph category presented in the previous section to define
transformation semantics that lean on the double pushout (DPO) @Ehrig1976 and
sesqui-pushout (SqPO) @Corradini2006 semantics in adhesive categories @Lack2005.

#### Adhesivity of hypergraph categories

The natural place to start this section is by studying which of the categories
defined in {{% reflink "sec:graph-defs" %}} are adhesive. From adhesivity
follows that transforming graphs using DPO and SqPO constructions is
well-defined and unique, at least in the regimes of interest to us.

A category is said to be _adhesive_ if it has all pullbacks and pushouts along
monos, as well as some compatibility conditions between them, the so-called "Van
Kampen squares". We refer to the literature (e.g. @Lack2005) for a complete
definition. For our purposes, the following two results are sufficient:

- Every presheaf topos $[\mathbb C, \mathrm{Set}]$ is adhesive (Corollary 3.6 in
  @Lack2005);
- Every full subcategory $\mathbb D \subseteq \mathbb C$ of an adhesive category
  is adhesive if the pullbacks and pushouts in $\mathbb C$ of objects in
  $\mathbb D$ are again in $\mathbb D$ (a simple result; if the Van Kampen
  squares commute in $\mathbb C$, they must commute in $\mathbb D$).

A first result immediately follows from the first result:

{{% proposition title="Adhesivity of directed hypergraphs" id="prop-hyp-adhesive" %}}
The category $\mathbb H$ of directed hypergraphs is adhesive.
{{% /proposition %}}

{{% proof collapse="true" %}}

It is a presheaf.

{{% /proof %}}

This does not immediately generalise to $\textrm{lin-}\mathbb H$, as unlike
$\mathbb H$, {{% refdefinition "def-linearity" %}} imposes that $E$ be a
coproduct. However, the result still holds:

{{% proposition title="Adhesivity of hypergraphs with linearity constraints" id="prop-lin-hyp-adhesive" %}}
The categories $\textrm{lin-}\mathbb H$ and
$\textrm{lin-}\mathbb H_\textrm{type}$ are adhesive. {{% /proposition %}}

{{% proof %}}

$\textrm{lin-}\mathbb H$ is a full subcategory of the adhesive category
$[\textrm{lin-}\mathbb C, \mathrm{Set}]$. We must show the existence of
pullbacks and pushouts along monos in $\textrm{lin-}\mathbb H$.

**Pullbacks.** Consider a pullback $A \xleftarrow{p_a} P \xrightarrow{p_b}$ of
$A \xrightarrow{a} C \xleftarrow{b} B$ in
$[\textrm{lin-}\mathbb C, \mathrm{Set}]$, with
$A, B, C \in \textrm{lin-}\mathbb H$. We must show that $P$ is in
$\textrm{lin-}\mathbb H$. Colimits are computed pointwise in presheaves, so we
know that $P(E)$ is the pullback of $A(E) \to C(E) \leftarrow B(E)$ in
$\textrm{Set}$. If we can show that $P(E)$ is the coproduct of $P(E_{st})$ for
$s, t \in \mathbb{N}$, then we are done.

Let $v \in P(E)$. Because $A(E)$ and $B(E)$ are coproducts in Set, i.e. a
disjoint union, there must be $s, t, s', t' \in \mathbb{N}$ such that
$p_a(v) \in A(E_{st})$ and $p_b(v) \in B(E_{st'})$. By naturality of $a$ and
$b$, it follows that $a(p_a(v)) \in C(E_{st})$ and $b(p_b(v)) \in B(E_{s't'})$.
But by commutativity of the pullback diagram, $a(p_a(v)) = b(p_b(v))$, and thus
$s = s'$ and $t = t'$. We conclude by unicity of the pullback that
$v \in P(E_{st})$ and thus $P(E) = \bigsqcup_{st} P(E_{st})$.

**Pushouts.** The same argument as for pullbacks also applies to pushouts: given
a pushout $P$ of $A \xrightarrow{a} C \xleftarrow{b} B$ in
$[\textrm{lin-}\mathbb C, \mathrm{Set}]$ with
$A, B, C \in \textrm{lin-}\mathbb H$, an element $v \in P(E)$ that makes the
pushout square commute must have preimages in $A(E_{st}), B(E_{st})$ and
$C(E_{st})$ for some $s, t \in \mathbb{N}$. Thus the pushout distributes over
the coproduct, and we can conclude that $P(E)$ is the coproduct of pushouts.

The same argument also applies to
$\textrm{lin-}\mathbb H_\textrm{type}$[^simpleradhesive]. {{% /proof %}}

[^simpleradhesive]:
    In fact, a much simpler argument applies: the category
    $\textrm{lin-}\mathbb H_\textrm{type}$ is isomorphic to the presheaf
    category $[\textrm{lin-}\tilde{\mathbb C}_\textrm{type}, \mathrm{Set}]$,
    where $\textrm{lin-}\tilde{\mathbb C}_\textrm{type}$ is obtained from
    $\textrm{lin-}\mathbb C_\textrm{type}$ by removing the object $E$.
    Adhesivity follows.

Now to the spicy stuff:

{{% proposition title="Non-adhesivity of hierarchical hypergraphs" id="prop-hier-hyp-adhesive" %}}

Whilst $\textrm{hier-lin-}\mathbb H_\textrm{type}$ is adhesive, the category
$\textrm{hier-lin-}\mathbb H$ is NOT adhesive.

{{% /proposition %}}

{{% proof %}}

$\textrm{hier-lin-}\mathbb H_\textrm{type}$ is a presheaf---hence adhesive.

The following pushout square shows that $\textrm{hier-lin-}\mathbb H$ cannot be
adhesive: the pushout square is valid in
$[\textrm{hier-lin-}\mathbb C, \mathrm{Set}]$, but the pushout at the bottom
right is not in $\textrm{hier-lin-}\mathbb H$, because the child regions cannot
each be assigned a unique parent.

{{% figure src="/svg/pushout-nonadhesive.svg" width="60%" nobg="true" %}}

{{% /proof %}}

#### Double pushout semantics

From {{% refproposition "prop-hier-hyp-adhesive" %}}, it follows that minIR
graph transformations can be performed through the double pushout (DPO)
construction @Ehrig1976 in the $[\textrm{hier-lin-}\mathbb C, \mathrm{Set}]$
category.

{{% definition title="Double pushout (DPO) transformation" id="def-dpo" %}}

A transformation rule $p$ in an adhesive category $\mathbb A$ is a span
$L \leftarrow I \rightarrow R$. For objects $G, H \in \mathbb A$, we then write
$G \xRightarrow{(p,m)} H$ or $G \xRightarrow{p} H$ if there is a _matching_
morphism $m: L \to G$ and a _context_ object $C$ along with morphisms
$G \leftarrow C \to H$ and $I \to C$ such that the following diagram commutes
and both squares are pushouts:

{{% figure src="/svg/dpo-diagram.svg" nobg="true" width="50%" %}}

If the DPO transformation $G \xRightarrow{(p,m)} H$ exists for some rule $p$ and
match $m$, then we say $G \Rightarrow H$ is a valid DPO rewrite.

{{% /definition %}}

To ensure that a DPO rewrite is valid in minIR, we must impose certain
conditions. Let $G$ be an IO-free minIR graph, i.e.
$G \in \textrm{hier-lin-}\mathbb H$, there is a morphism $G \to \Sigma$ in
$\textrm{hier-lin-}\mathbb H_\textrm{type}$ for some type system $\Sigma$ and
$I = O = \varnothing$.

A DPO rewrite $G \Rightarrow H$ is a valid minIR DPO rewrite if there is a
transformation $G \xRightarrow{p} H$ in
$[\textrm{hier-lin-}\mathbb C, \mathrm{Set}]$ and

1. $p$ is left-mono, i.e. the morphism $I \to L$ is mono,[^avoidleftlinear]
1. the pushout complement $C$ and pushout $H$ also exist in the slice category
   $\textrm{hier-lin-}\mathbb H_\textrm{type} \searrow \Sigma$,
1. $H$ satisfies the hierarchy condition of
   {{% refdefinition "def-hier-hypergraph" %}},
1. $H$ is IO-free.

[^avoidleftlinear]:
    This is often called _left-linear_ in the literature. We avoid this term in
    this thesis to avoid confusion with the linearity property of values in
    minIR.

{{% proposition id="prop-dpo-valid" %}}

If $G$ is a minIR graph and $G \Rightarrow H$ is a valid minIR DPO rewrite, then
$H$ is a valid minIR graph.

{{% /proposition %}}

{{% proof %}}

We know by construction that
$H \in [\textrm{hier-lin-}\mathbb C, \mathrm{Set}]$. We must show that $H$
further satisfies the constraints to be an object in the full subcategory of
minIR graphs.

The first condition is standard in DPO and guarantees that $C$ and $D$ are
unique if they exist.

The third condition we impose on $H$ corresponds directly to the constraint that
defines hierarchical graphs in $\textrm{hier-lin-}\mathbb H$. The fourth
condition ensures that valid minIR DPO rewrites map IO-free graphs to IO-free
graphs.

Finally, the second condition is imposed to ensure well-typedness of $H$. The
functor
$\textrm{hier-lin-}\mathbb H \to \textrm{hier-lin-}\mathbb H_\textrm{type}$ that
forgets the $\textit{def}$ and $\textit{use}$ morphisms is a left adjoint (it
possesses a right Kan extension defined pointwise), and thus preserves colimits.
The images of $C$ and $H$ thus form pushout squares in
$\textrm{hier-lin-}\mathbb H_\textrm{type}$, and by unicity, must match the
pushout squares in $\textrm{hier-lin-}\mathbb H_\textrm{type} \searrow \Sigma$.
Hence $H$ is well-typed.

{{% /proof %}}

The restriction to rewrites of IO-free graphs is not a restriction of
generality: if we are interested in rewriting computations with inputs and
outputs, we can always express them as IO-free graphs by adding `input` and
`output` ops with the values in $I$ as outputs, respectively $O$ as inputs. We
assign them dedicated types distinct from all other operations; these operations
will never be matched by transformation rules and can be removed at the end of
rewriting.

#### Generalising to sesqui-pushouts

We restricted minIR rewrites to DPO transformations obtained form left-mono
rules, to ensure that the construction is unique. This excludes rules that may
identify two values in $G$ but split them into two different values in $H$. Such
rules allow for cloning values, which is a useful transformation in minIR for
non-linear values. An example of a transformation rule that we would like to
allow in minIR:

{{% figure src="/svg/non-left-mono.svg" width="95%" nobg="true" %}}

For this example we added a `2x` operation that multiplies an angle value passed
as input by two. The transformation rule replaces a rotation of angle $2\alpha$
by two rotations of angle $\alpha$ by cloning the input angle.

Such semantics are possible using the sesqui-pushout construction (SqPO) by
Corradini et al. @Corradini2006. We can reuse the same $\xRightarrow{(p,m)}$
notation: when DPO is restricted to left-mono rules as we have done, SqPO is a
generalisation of DPO (i.e. the construction coincides whenever the DPO exists).

{{% definition title="Sesqui-pushout (SqPO) transformation" id="def-sesqui-pushout" %}}

A transformation rule $p$ in an adhesive category $\mathbb A$ is a span
$L \leftarrow I \rightarrow R$. For objects $G, H \in \mathbb A$, we then write
$G \xRightarrow{(p,m)} H$ or $G \xRightarrow{p} H$ if there is a _matching_
morphism $m: L \to G$ and a _context_ object $C$ along with morphisms
$G \leftarrow C \to H$ and $I \to C$ such that $C$ is the final pullback
complement of $I \to L \xrightarrow{m} G$ and the right square is a pushout:

{{% figure src="/svg/sqpo-diagram.svg" nobg="true" width="50%" %}}

If the SqPO transformation $G \xRightarrow{(p,m)} H$ exists for some rule $p$
and match $m$, then we say $G \Rightarrow H$ is a valid (SqPO) rewrite.

{{% /definition %}}

The left square is redundant in the diagram above, as it follows from the
requirement that $C$ be the final pullback complement (FPC). It is kept to
highlight the similarities to DPO. As the commuting diagram indicates, the final
pullback complement (FPC) construction forms a pullback square. Furthermore,
unlike pushout complements, the FPC is defined by a universality property that
ensures uniqueness if it exists. We refer to @Corradini2006 for the exact FPC
construction.

With SqPO, we can define the set of valid minIR rewrites as given by the SqPO
transformations $G \xRightarrow{p} H$ in
$[\textrm{hier-lin-}\mathbb C, \mathrm{Set}]$ satisfying the relaxed set of
conditions

1. the pushout complement $C$ and pushout $H$ also exist in the slice category
   $\textrm{hier-lin-}\mathbb H_\textrm{type} \searrow \Sigma$,
1. $H$ satisfies the hierarchy condition of
   {{% refdefinition "def-hier-hypergraph" %}},
1. $H$ is IO-free.

We conclude this section with a discussion of some of the properties of minIR
transformations using SqPO (referring again to Corradini @Corradini2006 or
@Koenig2018 for a more detailed explanation of the concepts discussed):

**Deletion in unknown context.**&emsp; A key difference between DPO and SqPO
transformations is that SqPO transformations on graphs will delete edges
attached to a vertex $v_d$ that is deleted by the transformation rule (i.e.
$v_d \in L$ but $v_d \not\in R$ of the rule). The DPO transformation on the
other hand is only well-defined when all edges incident to $v_d$ are in the
image of $m$ and thus explicitly deleted (this is known as the _dangling
condition_).

As minIR rewrites follow SqPO semantics, transformation rules such as the
following are allowed:

{{% figure src="/svg/unknown-context.svg" nobg="true" width="70%" %}}

Here $\times$ denotes the multiplication of angles and $\textsf{const(0)}$ the
zero angle. Any operation that would be connected to the starred value on the
left would be deleted by this rule. However such an implicit operation deletion
only yields valid minIR graphs if all incident values are non-linear and none of
the target values of the deleted operation are used.

**Non-left-mono rules.**&emsp; As discussed in the introduction to SqPO, the
cloning of values is allowed in minIR rewrites. However, linear values may never
be cloned (the FPC or pushout will not exist in these cases). Thus any minIR
transformation rule will be left-mono on linear values. It must further be
left-linear on all (linear and non-linear) values in $I$ that are mapped to
outputs in $R$: if a value $w$ is produced by `op` applied to $v$, then cloning
$v$ and `'op` will result in two definitions of $w$.

**Non-right-mono rules.**&emsp; Non-right-mono rules are allowed in both DPO and
SqPO. They result in vertex merges. In minIR, the situation for right-mono is
symmetric to left-mono: the map must be mono on linear values (otherwise the
same value will have multiple uses or definitions) and it must be mono on all
values in $I$ that are mapped to inputs in $L$ (otherwise a value in the
rewritten minIR graph will have more than one value definition).
