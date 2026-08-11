import type { PhantomUiAttributes } from "@aejkatappaja/phantom-ui";
import type { HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUiAttributes & HTMLAttributes<HTMLElement>;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUiAttributes & HTMLAttributes<HTMLElement>;
    }
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "phantom-ui": PhantomUiAttributes & HTMLAttributes<HTMLElement>;
    }
  }
}
