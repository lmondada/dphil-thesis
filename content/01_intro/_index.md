+++
title = "Introduction"
sort_by = "weight"
weight = 1
layout = "chapter"
+++

{{% hint "danger" %}}
Dear readers, welcome to my WIP thesis! Please skip this chapter,
there is nothing here at the moment, just a scrapyard of text removed from
elsewhere.

I suggest you move directly to {{% reflink "chap:basics" %}}.
{{% /hint %}}

<!-- 
This thesis is, first and foremost, a story about compilers.
It is interesting to note that whereas the term *quantum compilation* has been in use for the longest part
of the existence of quantum computing as a field,
it is only recently that our community has started to adopt tools, ideas and results from our classical counterparts
{% footnote(id="test") %}
We use *classical* as a derogatory term to refer to any form of computing not advanced enough to be quantum.
{% end %}.

Strengthening the bridge between classical and quantum compilation research is one of the main motivations for this thesis -- and arguably its most ambitious goal.

### Other similar text


The analogy between traditional and quantum compilers holds up to the extent that
both are concerned with abstracting away some of the low-level assembly-like details
of the underlying hardware
{% footnote(id="test3") %}
I am tempted to say these quantum compilers were more akin to assemblers of the 1960s (IBM FAP 1960),
but that might be pushing it too far.
{% end %}
 -- more on this below.
However, there are also important differences; the majority of the
quantum software stacks were developed within the Python ecosystem, with limited
concerns for performance on large-scale quantum programs (Ittah, 2021) and interoperability with other
toolchains, and in particular with the mature classical compiler ecosystem (LLVM, MLIR).

A new generation of quantum compilers is addressing these concerns (QCOR, QIRO, Catalyst, CUDAQ, Guppy, HUGR).
We will see that this is opening up new ways to program quantum computers
that enable quantum error correction and seamless integration
with heterogeneous classical computing (CPUs, GPUs, etc.) used in high-performance computing (HPC).

## At the beginning was the Quantum Circuit
s

## Qiskit & Co: Static compilation

## Dynamic compilation

This is a test of the footnote shortcode.
{% footnote(id="test2") %}
This is a test of the footnote shortcode.
{% end %}

### From paper
Optimisation of computation graphs is a long-standing problem in computer science
that is seeing renewed interest in the compiler~\cite{mlir},
machine learning (ML)~\cite{taso,computationgraph}
and quantum computing communities~\cite{quartz,qeso}.
In all of these domains, graphs encode computations that are either expensive to execute or that are
evaluated repeatedly over many iterations,
making graph optimisation a primary concern.

Domain-specific heuristics are the most common approach in compiler
optimisations~\cite{pytorch,TKET}---
a more flexible alternative are optimisation engines based on \emph{rewrite rules},
describing the allowable graph transformations~\cite{bonchiI,bonchiII}.
Given a computation graph as input,
we find a sequence of rewrite rules that transform the input
into a computation graph with minimal cost.
One successful approach in both ML and quantum computing has been to use automatically generated rules, scaling to using hundreds and even thousands of rules~\cite{quartz,taso,qeso}.

#### Contributions from pattern matching

Our first major contribution is a pattern matching algorithm for port graphs
with a runtime complexity bound independent of the number of patterns being matched, achieved
using a one-off pre-computation.
The main complexity result is expressed in terms of maximal pattern
\emph{width} $w$ and \emph{depth} $d$, two measures of pattern
size defined in \cref{subsec:pg}.
These are directly related to the tree representation illustrated in \cref{fig:intro}:
width is equal to the size of the anchor set (\cref{prop:cananchors})
and depth is at most twice the tree height (\cref{eq:ctsize}).
We assume bounded degree graphs (the complete list of assumptions is given in \cref{sec:assumptions})
and we use
the \emph{graph size} $|G|$ to refer to the number of vertices in $G$.

\begin{restatable}{thm}{mainthm}\label{thm:main}
    Let $P_1, \dots, P_\ell$ be patterns with at most width $w$
    and depth $d$.
    The pre-computation runs in time and space complexity
    \[
    O \left( (d\cdot \ell)^w \cdot \ell + \ell \cdot w^2 \cdot d \right).
    \]
    For any subject port graph $G$, the pre-computed prefix tree can be used
    to find all
    pattern embeddings $P_i \to G$ in time
    \begin{equation}\label{eq:mainruncompl}
    O \left( |G| \cdot \frac{c^w}{w^{\sfrac{1}{2}}} \cdot d \right)
    \end{equation}
    where $c = 6.75$ is a constant.
\end{restatable}

\noindent
The runtime complexity is dominated by an exponential scaling in maximal pattern width $w$.
Meanwhile, the advantage of our approach over matching one pattern at a time grows with the number of patterns $\ell$.
It is thus of particular interest for matching numerous small width patterns.

We illustrate this point by comparing our approach
to a standard algorithm that matches one pattern
at a time~\cite{Jiang2}, with
runtime complexity $O(\ell \cdot |P| \cdot |G|)$.
Using $|P| \leq w\cdot d$ (shown in \cref{subsec:pg}) and
comparing to eq. (1), we thus
have a speedup in the regime $\Theta(c^w / w^{\sfrac32}) < \ell$.
On the other hand, $\ell$ is upper bounded
by the maximum number $N_{w, d}$ of patterns of bounded width and depth.
Using a crude lower-bound for $N_{w,d}$ derived in \cref{app:proofellbound},
we obtain a computational advantage for our approach when
\begin{equation}\label{eq:regime}
    \Theta\left(\frac{c^w}{w^{\sfrac32}}\right) < \ell < \left(\frac{w}{2e}\right)^{\Theta(w d)} \leq N_{w, d}.
\end{equation}
Our second major contribution is an efficient Rust library for port graph pattern matching\footnote{portmatching: \url{https://github.com/lmondada/portmatching}}.
We present benchmarks on a real world dataset of \num{10000} quantum circuits in \cref{sec:impl}, showing
a 20$\times$ speedup over a leading C++ implementation of pattern matching for quantum circuits.

### Another blob of text
Optimisations in compilers are typically built as passes.
Compiler authors then design sequences of these passes to create the default
optimisation pipelines that most end-users rely on.
This is not easy.
For a large project like LLVM, the end result looks something
[like this](https://github.com/llvm-mirror/llvm/blob/2c4ca6832fa6b306ee6a7010bfb80a3f2596f824/lib/Transforms/IPO/PassManagerBuilder.cpp)---a thousand lines of meticulously commented code,
carefully crafted and hand tuned to handle every optimisation
edge case and perform well on thousands of benchmarks.
This is the phase-ordering problem @Click1995&#x200B;---one of the hardest problems in classical compilation.

Quantum compilers are not immune to this, either.
The same pass ordering sorcery [can be found just as well in TKET](https://github.com/CQCL/tket/blob/5f7af8d97d81c620071e8b639a694b3a7135e2f8/tket/src/Transformations/OptimisationPass.cpp#L43), a
leading quantum compiler @Sivarajah2020.
It does not look quite as scary yet, but the code is growing and some passes
are already being called three times within the default sequence.
This is hard to maintain and any change and new feature comes at the risk
of degrading the compiler performance on established use cases.

If we are serious about adopting classical compiler tooling for quantum computations,
we will need to find a more convincing solution to this problem.
Fortunately, classical compilation is a mature field that has already experienced
(and solved!) most of the challenges that quantum compilers have faced, and will ever face,
in peephole optimisation.
Our proposal, described in {{< reflink "chap:rewriting" >}}, combines two modern compilation techniques
that mitigate this and which we will review now: Superoptimisation and Equality saturation.

---

Large compiler projects support a multitude of program representations and
large sets of operations/instructions to be able to generate code for a wide
array of devices and architectures.
Designers of optimising compiler passes must thus necessarily put constraints
on the program input format that the pass will accept.
In all likelihood, the pass will furthermore only be applicable for certain
cost functions or for a limited set of hardware target.
This all leads to a proliferation of special purpose compiler passes that are
bug-prone and must be carefully ordered to perform well across all the use
cases of interest.
On top of this, new instruction sets, architectures or new cost functions
require new sets of compiler passes, in effect rebuilding the entire compilation
pipeline.

As early as 1979, Fraser suggested deriving peephole optimisations
automatically @Fraser1979,
an idea Massalin coined superoptimisation @Massalin1987.
Instead of hard-coding the peephole optimisations as passes to be ordered and
executed, useful valid program transformations are synthesised automatically.
Early work used probabilistic verification, which meant that program
transformations were generated ahead of time, and once verified manually,
added to the compiler for use in optimisation @Massalin1987 @Sands2011.
With advances in theorem proving techniques,
program transformation synthesis and verification was further automated,
resulting in end-to-end automatically generated and proven compiler
transformations @Bansal2006 @Sasnauskas2017.

A particularly simple superoptimising compiler design was proposed in @Jia2019,
specially for the purposes of computation graph optimisation @Fang2020
in deep learning.
The set of all small programs, up to a threshold, is generated ahead of time and
partitioned into disjoint classes of equivalent programs.
This concisely expresses every possible peephole optimisation up to the specified
size: for every small enough subset of instructions of an input program,
its equivalence class can be determined.
Any replacement of that set of instructions with another program in the same
equivalence class
is a valid transformation, and thus a potential peephole optimisation.


#### Intro to chapter 5

Our goal is to run pattern matching on GTSs to optimise stuff
in a way that applies to many different regimes, i.e. remaining agnotic
to the graph semantics. Thus not rely too much on rewrite strategies.
This means we will need heuristics -- heuristics whose performance will
necessarily be dependent on the overall size of the search space.

This chapter contributes to this goal by introducing a data structure for
the _concurrent_ exploration of the state space of GTSs.
As the name implies, this will allow for a parallelised exploration of the state
space; but more importantly, we will see that it significantly reduces the
size of the total search space, whilst keeping the solution space
unchanged. -->
