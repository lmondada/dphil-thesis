+++
title = "Benchmarks"
layout = "section"
weight = 6
slug = "sec:benchmarks"
+++

\begin{figure}[t]
    \centering
    \includegraphics[width=\textwidth]{imgs/eccs-plot.pdf}
    \caption{Runtime of pattern matching for $\ell = 0\dots 10^4$
    patterns on 2, 3 and 4 qubit quantum circuits from the Quartz ECC dataset, %
    for our implementation (Portmatching) and the Quartz project. %
    All $\ell = 1954$ two qubit circuits were used, whereas for 3 and 4 qubit circuits,
    $\ell = 10^4$ random samples were drawn.}
    % From left to right, the total number of patterns $\ell$ is $\ell = 1954$, $\ell = 12233$ and $\ell = 30699$ respectively.}
    \label{fig:benchmarks}
\end{figure}
\Cref{thm:main} shows that pattern independent matching can scale to large
datasets of patterns but imposes some restrictions on the patterns and embeddings
that can be matched.
In this section we discuss these limitations and
give empirical evidence that the pattern matching approach we have presented
can be used on a large scale, outperforming existing solutions.

\paragraph{Pattern limitations.}
In \cref{sec:assumptions}, we imposed conditions on the pattern embeddings
in order to obtain a complexity bound for pattern independent matching.
We argued how these restrictions are natural for applications in quantum computing and most
of the arguments will also hold for a much broader class of computation graphs.

In future work, it would nonetheless be of theoretical interest to explore the importance
of these assumptions and their impact on the complexity of the problem.
As a first step towards a generalisation, our implementation
and all our benchmarks in this section do not make any of these simplifying assumptions.
Our results below give empirical evidence that
a significant performance advantage can be obtained regardless.

\paragraph{Implementation.}
We provide an open source implementation in Rust of pattern independent matching
using the results of \cref{sec:toy}, described in more detail in \cref{app:portmatching}.
The implementation works for weighted or unweighted port graphs,
and makes none of the simplifying assumptions employed in the theoretical analysis.

\paragraph{Benchmarks.}
To assess practical use, we have benchmarked our implementation against a
leading C++ implementation of pattern matching for quantum circuits
from the Quartz superoptimiser project~\cite{quartz}.
Using a real world dataset of patterns obtained by the Quartz equivalence classes
of circuits (ECC) generator, we measured the pattern matching runtime on a
random subset of up to \num{10000} patterns.
We considered circuits on the $T, H, CX$ gate set with up to 6 gates and 2, 3 or 4 qubits.
Thus for our patterns we have the bound $d \leq 6$ for the maximum depth and width $w = 2,3,4$.
In all experiments the graph $G$ subject to pattern matching was \texttt{barenco\_tof\_10} input, i.e.
a 19 qubit circuit input with 674 gates obtained by decomposing a 10-qubit Toffoli gate using the
Barenco decomposition~\cite{barenco}.
The results are summarised in \cref{fig:benchmarks}.
For $\ell = 200$ patterns, our proposed algorithm is $3\times$ faster than Quartz,
scaling up to $20\times$ faster for $\ell=10^5$.

% The size of ECC pattern sets grow very quickly with qubit number and gate count,
% making analyses beyond $w=4$ qubits and 6 gates expensive to perform.
We also provide a more detailed scaling analysis of our implementation
by generating random sets of \num{10000} quantum circuits with 15 gates
for qubit numbers between $w=2$ and $w=10$, using the previous gate set;
the results are shown in \cref{fig:scaling}.
From \cref{thm:main}, we expect that the pattern matching runtime is
upper bounded by a $\ell$-independent constant.
% For every qubit count $w$, there will be a runtime ceiling
% that is not crossed for patterns with $w$ qubits.
%This is consistent with the plot of \cref{fig:scaling}.
Runtime seems indeed to saturate for $w=2$ and $w=3$ qubit patterns,
with an observable runtime plateau at large $\ell$.
From the exponential $c^w$ dependency in \cref{eq:mainruncompl}, it is however to be expected
that this upper bound increases rapidly for qubit counts $w \geq 4$.
A runtime ceiling is not directly observable at this experiment size but
the gradual decrease in the slope
of the curve is consistent with the existence of the $\ell$-independent upper bound predicted
in \cref{thm:main}.

\begin{figure}[t]
    \centering
    \includegraphics[width=0.55\textwidth]{imgs/random-plot.pdf}
    \caption{Runtime of our pattern matching for random quantum circuits with up to 10 qubits.}
    \label{fig:scaling}
\end{figure}
