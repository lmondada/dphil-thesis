# Compiler Optimizations on the 32-qubit Toric code decoder

This example demonstrates the performance impact of compiler optimizations using a quantum error correction decoder as a computationally intensive test case.

## Dependencies

- C++ compiler with C++17 support
- CMake (>= 3.19)

## Building and Running

### Debug Build (no optimizations)
```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build -j
./build/toric32_decoder_timings
```

Output on my machine (MacOS, Apple M3 Max):
```
Decoding statistics over 1000 iterations:
  Average: 0.733 ms
  Min: 0.648 ms
  Max: 1.233 ms
  Std Dev: 0.066 ms
```

### Release Build (aggressive optimizations)
```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j
./build/toric32_decoder_timings
```

Output on my machine (MacOS, Apple M3 Max):
```
Decoding statistics over 1000 iterations:
  Average: 0.078 ms
  Min: 0.070 ms
  Max: 0.151 ms
  Std Dev: 0.004 ms
```


Compare the execution times between Debug and Release builds to see the impact of compiler optimizations.
