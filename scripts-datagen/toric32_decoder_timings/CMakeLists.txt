cmake_minimum_required(VERSION 3.19)
project(toric_decoder_timings CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Set default build type to Release
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Release" CACHE STRING "Choose the type of build" FORCE)
endif()

# Define build types
set(CMAKE_CONFIGURATION_TYPES "Debug;Release")

# Set compiler flags for different build types
set(CMAKE_CXX_FLAGS_DEBUG "-g -O0 -fno-inline")

# Aggressive optimization flags for Release
set(CMAKE_CXX_FLAGS_RELEASE 
    "-O3 -DNDEBUG -march=native -mtune=native -flto -ffast-math \
     -fomit-frame-pointer -funroll-loops -fstrict-aliasing")

# Add dependencies
include(FetchContent)

cmake_policy(SET CMP0135 NEW)
# Add nlohmann_json
FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.3/json.tar.xz
)
FetchContent_MakeAvailable(json)

# Add MQT QECC
FetchContent_Declare(
    mqt-qecc
    GIT_REPOSITORY https://github.com/cda-tum/mqt-qecc.git
    GIT_TAG c67b8a8  # Latest commit at the time of writing
)
FetchContent_MakeAvailable(mqt-qecc)

# Add the executable
add_executable(toric32_decoder_timings toric32_decoder_timings.cpp)

# Link against MQT QECC
target_link_libraries(toric32_decoder_timings PRIVATE MQT::QECC)
