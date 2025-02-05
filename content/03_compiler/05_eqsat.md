+++
title = "Semantics of minIR"
layout = "section"
weight = 5
slug = "sec:semantics-minir"
+++

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

