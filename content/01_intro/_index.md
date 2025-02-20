+++
title = "Introduction"
sort_by = "weight"
weight = 1
layout = "chapter"
+++

This thesis is first and foremost a story about compilers.
It is interesting to note that whereas the term *quantum compilation* has been in use for the longest part
of the existence of quantum computing as a field,
it is only recently that our community has started to adopt tools, ideas and results from our classical counterparts
{% footnote(id="test") %}
We use the word *classical* as a derogatory term to refer to any form of computing that is not advanced enough to
be quantum.
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
quantum software stacks were developped within the Python ecosystem, with limited
concerns for performance on large-scale quantum programs (Ittah, 2021) and interoperability with other
toolchains, and in particular with the mature classical compiler ecosystem (LLVM, MLIR).

A new generation of quantum compilers is starting to address these concerns (QCOR, QIRO, Catalyst, CUDAQ, Guppy, HUGR).
We will see that this is opening up new ways to program quantum computers,
that enable quantum error correction as well as seamless integration
with heterogenous classical computing (CPUs, GPUs, etc) used in high-performance computing (HPC).

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
