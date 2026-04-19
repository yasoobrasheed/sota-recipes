# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Mobile-first UI

This app must look good on mobile. Any CSS you write must render cleanly at phone widths (target ~375px viewport minimum) before scaling up. Practical rules:

- Design for the narrow viewport first, then use Tailwind's `sm:` / `md:` / `lg:` breakpoints to enhance on larger screens — never the other way around.
- Constrain content with `max-w-*` and horizontal centering (`mx-auto`) so large screens don't stretch line lengths or tap targets.
- Keep interactive elements at least 44×44 px (`h-11 w-11` or larger) so they're comfortable to tap.
- Avoid fixed pixel widths that can overflow on small screens; prefer fluid units, flex, and grid.
- Do not assume hover states — they don't exist on touch. Hover is additive polish, not required affordance.
- Test any layout change mentally at ~375px before shipping.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
