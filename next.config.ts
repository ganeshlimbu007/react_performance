import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler 1.0 in OPT-IN mode only: it compiles a function solely when
  // that function's body starts with the 'use memo' directive. Nothing in the
  // repo is compiled by default, so /render-lab (Part 1) behaves exactly as it
  // did before.
  //
  // panicThreshold is left at its default ('none'), so a function that cannot
  // be compiled fails silently and the build still succeeds — which is how it
  // behaves in production, and is the point of /compiler-lab/skips.
  reactCompiler: {
    compilationMode: "annotation",
  },
};

export default nextConfig;
