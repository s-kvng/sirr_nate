// Loaded through <LazyMotion> so the feature bundle can stay out of the first
// load. domMax (not domAnimation) because the shadow flight uses layoutId.
//
// As of motion@14.8, `motion/react` reads `fm.motion` at module scope, so
// Turbopack keeps every feature in the initial chunk anyway (~38 KB gzipped).
// The split takes effect once that's fixed upstream, or by aliasing
// `motion/react` to `framer-motion`. `strict` still keeps the full `motion`
// component out of this codebase.
import { domMax } from "motion/react";

export default domMax;
