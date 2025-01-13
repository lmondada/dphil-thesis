+++
title = "Selected techniques in modern classical compilation"
template = "section"
weight = 5
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
Our proposal, described in {{< reflink "/04_rewriting" >}}, combines two modern compilation techniques
that mitigate this and which we will review now: Superoptimisation and Equality saturation.

### Superoptimisation

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
for deep learning.
The set of all small programs, up to a threshold, is generated and
partitioned into disjoint classes of equivalent programs ahead of time.
This concisely expresses every possible peephole optimisation up to the specified
size: for every small enough subset of instructions of an input program,
its equivalence class can be determined.
Any replacement of that set of instructions with another program in the same
equivalence class 
is a valid transformation, and thus a potential peephole optimisation.

This framework was also adapted for quantum circuit optimisation
in @Xu2022 and separately in @Xu2023.
On top of excellent performance, this approach is extremely flexible.
For any supplied cost function, the compiler can find all valid program transformations
to find the sequence of transforms that minimise cost.
This keeps the cost function-specific logic separate from the transformation
semantics of the program, making it straightforward to replace or update the
optimisation objective.

Furthermore, the set of supported primitives and architectures can easily be
extended at any time by supplementing the equivalence classes with new programs.
Any input using this extended set of primitives can thus be successfully compiled
and any output program format constraints can be enforced by restricting the
set of valid transformations.


### Equality saturation

