#include "Codes.hpp"
#include "UFDecoder.hpp"
#include "UFHeuristic.hpp"

int main() {
    auto code = ToricCode32();
    // auto code = HGPcode();

    UFDecoder decoder;
    decoder.setCode(code);
    // std::cout << "Adj lists code:\n"
    //           << Utils::getStringFrom(*code.gethZ()->pcm) << '\n';
    
    const std::vector<bool> err = {0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0};
    // auto err  = gf2Vec(code.n);
    // err.at(0) = 1;
    // err.at(10) = 1;
    // err.at(100) = 1;
    // err.at(101) = 1;

    const auto syndr = code.getXSyndrome(err);

    const int N_ITER = 1000;
    std::vector<double> durations;
    durations.reserve(N_ITER);
    
    for (int i = 0; i < N_ITER; i++) {
        auto start = std::chrono::high_resolution_clock::now();
        decoder.decode(syndr);
        auto end = std::chrono::high_resolution_clock::now();
        auto duration = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
        durations.push_back(duration.count() / 1000.0); // Convert to milliseconds
        decoder.reset(); // Reset decoder state between runs
    }

    // Calculate statistics
    double sum = std::accumulate(durations.begin(), durations.end(), 0.0);
    double mean = sum / durations.size();
    
    double min = *std::min_element(durations.begin(), durations.end());
    double max = *std::max_element(durations.begin(), durations.end());
    
    double sq_sum = std::inner_product(durations.begin(), durations.end(), durations.begin(), 0.0);
    double stdev = std::sqrt(sq_sum / durations.size() - mean * mean);

    std::cout << std::fixed << std::setprecision(3)
              << "Decoding statistics over " << durations.size() << " iterations:\n"
              << "  Average: " << mean << " ms\n"
              << "  Min: " << min << " ms\n" 
              << "  Max: " << max << " ms\n"
              << "  Std Dev: " << stdev << " ms" << std::endl;
}