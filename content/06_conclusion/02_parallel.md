+++
title = "Massively parallel graph rewriting"
layout = "section"
weight = 2
slug = "sec:conclusion-parallel"
+++

Persistent data structures---and particularly fully and confluently persistent
ones---are well-suited for distributed applications. In persistent data
structures, data can always be added but never deleted, and is thus immutable.
This removes the need for locks and synchronisation primitives across processes.
Furthermore, using confluence, edits can be made concurrently in different
processes and then eventually merged asynchronously, as follows:

{{% figure src="/svg/distributed-confluence.svg" nobg="true" width="80%" %}}

The contributions presented in {{% reflink "chap:parallel" %}} thus translate
directly into a proposal for a massively parallel graph rewriting system. In
summary, we have shown that graph rewrites can be tracked in a persistent data
structure $\mathcal{D}$ in the form of edits $\delta$. New edits added to
$\mathcal{D}$ can refer to previous edits, and thus create an acyclic edit
history. Sets of edits $\mathcal{D}$ and $\mathcal{D}'$ can also be merged
(confluence) and as a result, new edits that build on top of edits from both
$\mathcal{D}$ and $\mathcal{D}'$ can be defined.

We describe in slightly more detail what a massively parallel graph rewriting
architecture might look like.

#### Inter-process communication

During the rewriting process, the set of processes that are involved must
reguarly broadcast the edits they have added to (their copy of) the data
$\mathcal{D}$. Such broadcasted edits must then be merged by the other processes
into their respective local copies. This is required so that progress that is
made by one process can be shared and expanded on top of by other processes.

Technologies such as message-passing interface (MPI) @Dongarra1993 would be
well-suited to such inter-process communications. To reduce the number of
messages that senders and receivers must process, edits should not be
broadcasted one-by-one, but rather grouped together. For this, we propose the
notion of a _salient edit_, reflecting that an edit is deemed of importance.

Non-salient edits are not broadcasted as they are added to $\mathcal{D}$. When,
on the other hand, an edit $\delta$ is deemed salient, it is broadcasted along
with all its ancestors $A(\delta)$ (i.e. all edits that $\delta$ depends on). As
the edit history deepens, it might become inefficient to broadcast all the
ancestry of an edit, in which case more advanced communication protocols would
have to be devised.

Finally, a procedure must be put in place to identify identical edits that may
be added and/or broadcasted by different processes to avoid deduplication.
Hashing techniques and hash tables are well-suited for this kind of problem.

#### Process types

At a minimum, the distributed graph rewriting system should distinguish between
two types of processes.

The vast majority of processes would be **rewrite factories**. Their purpose is
to create new edits, add them to $\mathcal{D}$ and broadcast them whenever they
are deemed salient. These processes will be responsible for driving forward the
search space exploration and, in the end, the optimisation. A good candidate for
a rewrite factory is the pattern matching automaton of
{{% reflink "chap:matching" %}} and its generalisation just described in
{{% reflink "sec:conclusion-pm" %}}. Different processes may specialise in
different transformation rule sets; others still could implement dedicated
optimisations such as ZX-based optimisations or optimal Clifford synthesis (see
discussion in {{% reflink "sec:quantum-sota" %}}).

The other type of process would be a **result extractor**; a read-only process
that runs the SAT-based optimisation and graph extraction algorithm of
{{% reflink "sec:extraction" %}}. Such a process would run the computation at
regular intervals to track the optimisation progress.

As the distributed architecture grows in complexity, more tasks and more process
types may be required. It might for instance be desirable to have a process that
identifies under-explored parts of the search space to direct rewrite factories
in that direction.

Using such an architecture, it might be possible for the first time to scale
quantum compilation workloads to large clusters of machines. This could
significantly advance compilation performance of quantum programs, a
particularly valuable contribution at a time where quantum computers are on the
edge of utility. Nevertheless, such distributed systems often prove difficult to
design and run successfully. Open questions include how to coordinate the search
across processes in such a way that the most promising parts of the search space
are explored whilst avoid work duplication; will communication become the
bottleneck in the computation; what are the most effective transformation rules
and cost functions to use; and what are the limits of modern SAT solvers on our
problem of interest.
