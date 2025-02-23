+++
title = "Prefix trees"
layout = "section"
weight = 1
slug = "sec:prefixtrees"
+++
Our main result is achieved by reducing a tree inclusion problem to the following problem.
\paragraph{String prefix matching.}
Consider the following computational problem over strings.
Let $\Sigma$ be a finite alphabet and consider $\mathcal{W} = (\Sigma^*)^w$
the set of $w$-tuples of strings over $\Sigma$.
For a string tuple $(s_1, \dots, s_w) \in \mathcal{W}$ and a set of string tuples $\mathcal{D} \subseteq \mathcal{W}$,
the $w$-dimensional string prefix matching consists in finding the set
\[
    \{ (p_1, \dots, p_w) \in \mathcal{D} \ | \ \text{for all }1 \leq i \leq w: p_i\text{ is a prefix of }s_i \}.
\]
This string problem can be solved using a $w$-dimensional prefix tree.
We give a short introduction to prefix trees for the string case but refer
to standard literature for more details~\cite{taocpIII}.

\paragraph{One-dimensional prefix tree.}
Let $P_1, \dots, P_\ell \in \mathcal{A}^\ast$ be strings on some alphabet $\mathcal{A}$.
Given an input string $s\in\mathcal{A}^\ast$, we wish to find the set of
patterns $\{ P_{1 \leq i \leq \ell} | P_i \subseteq s\}$, i.e. $P_i$ is a prefix of $s$.

The prefix tree of $P_1, \dots, P_\ell$ is a tree with a tree node for each prefix of
a pattern. The children of an internal node are the strings that extend the prefix
by one character. The root of the tree is the empty string.
Each tree node also stores a list of matching patterns, with each pattern stored in the unique corresponding node.
Every prefix tree has an empty string node, which is the root of the tree.
For every inserted pattern of length at most $L$ nodes are inserted, one
for every non-empty prefix of the pattern. Thus a one-dimensional prefix tree
has at most $\ell \cdot L + 1$ nodes and can be constructed in time $O(\ell \cdot L)$.

Given an input $s \in \mathcal{A}^\ast$, we can find the set of matching patterns
by traversing the prefix tree of $P_1, \dots, P_\ell$ starting from the root.
We report the list of matching patterns at the current node
and move to the child node that is still a prefix of $s$, if it exists.
This procedure continues until no more such child exists.
In total the traversal takes time $O(|s|)$, as every character of $s$ is visited
at most once.

Note that in theory the number of reported pattern matches can dominate the runtime
of the algorithm. We can avoid this
by returning the list of matches as an iterator, stored as a list of pointers
to the tree nodes matching lists.
\paragraph{Multi-dimensional prefix tree.}
A $w$-dimensional prefix tree for $w > 1$ is defined recursively as a one-dimensional
prefix tree that at each node stores a $w-1$-dimensional prefix tree.
Given an input $w$-tuple $(s_1, \dots, s_w) \in (\mathcal{A}^\ast)^w$,
the traversal of the $w$-dimensional prefix tree is done by traversing the one-dimensional
prefix tree on the input $s_1$ until no child is a prefix of the input,
and then recursively traversing the $w-1$-dimensional prefix tree on $(s_2, \dots, s_w)$.
Similarly to the one-dimensional case, the list of matching patterns is stored at prefix tree nodes
and reported during traversal.
The traversal thus takes time $O(|s_1| + \cdots + |s_w|)$, as every character of $s$ is visited
at most once.

For $\ell$ tuples of size $w$ of words of maximum length $L$, we can bound the number of nodes
of the $w$-dimensional prefix tree by $1 + (\ell \cdot L)^w$.
The runtime and space complexity of the construction of the $w$-dimensional prefix tree
is thus in $O((\ell \cdot L)^w)$, summarised in the result:

\begin{prop}\label{prop:prefixmatch}
    Let $\mathcal{D} \subseteq \mathcal{W}$ be a set of string tuples
    and $L$ the maximum length of a string in a tuple of $\mathcal{D}$.
    There is a prefix tree with at most $(\ell \cdot L)^w + 1$ nodes
    that encodes $\mathcal{D}$ that can be used to solve
    the $w$-dimensional string prefix matching problem
    in time $O(|s_1| + \cdots + |s_w|)$.
\end{prop}
