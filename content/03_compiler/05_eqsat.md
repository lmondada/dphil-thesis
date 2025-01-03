+++
title = "Selected techniques in modern classical compilation"
template = "section"
weight = 5
+++

We will not attempt to review classical compiler techniques.
As discussed, all techniques can apply as-is on classical fragments of
hybrid programs. On top of that, some passes can also be applied to
quantum data (dead code elimination, for instance)---but many others
assume that the data can be copied and thus cannot apply to quantum data
(common subexpression elimination, etc.) 

However, classical compilation is a mature field that has already experienced
(and solved!) many of the challenges that quantum compilers are facing, in
particular when based on peephole optimisation.
We might not be able to take over the optimisation passes _as-is_,
but at a higher level we can learn from how problems that we are encountering
too have been solved.

One of the hardest problems in classical compilation is the phase-ordering
problem: whenever a compiler can rewrite code in more than one way, it must
decide which transformations should be applied and in which order, to obtain
the most optimised result. 

Optimisations in compilers are typically built as passes.
Compiler authors then design sequences of these passes to create the default
optimisation pipelines that most end-users rely on.
This is not easy.
For a large project like LLVM, the end result looks something
[like this](https://github.com/llvm-mirror/llvm/blob/2c4ca6832fa6b306ee6a7010bfb80a3f2596f824/lib/Transforms/IPO/PassManagerBuilder.cpp)---a thousand lines of meticulously commented code,
carefully crafted and hand tuned to handle every optimisation
edge case and perform well on thousands of benchmarks.

Quantum compilers are not immune to this, either. 
The same pass ordering sorcery [can be found just as well in TKET](https://github.com/CQCL/tket/blob/5f7af8d97d81c620071e8b639a694b3a7135e2f8/tket/src/Transformations/OptimisationPass.cpp#L43), a
leading quantum compiler @Sivarajah2020.
It does not look quite as scary yet, but the code is growing and some passes
are already being called three times within the default sequence.
This is hard to maintain and any change and new feature comes at the risk
of degrading the compiler performance on established use cases.

We present two solutions to this problem from modern compiler research.
One is very smart and refined, the other is dumb AF but is a sledgehammer that
works everywhere.

### Equality saturation

#### Challenges for Quantum

### Superoptimisation
