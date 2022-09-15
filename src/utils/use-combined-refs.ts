import React from "react";

export const useCombinedRefs = <T extends HTMLElement>(
  ...refs: Array<React.ForwardedRef<T>>
) => {
  return (el: T | null) => {
    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];
      if (ref) {
        if ("current" in ref) {
          ref.current = el;
        } else {
          ref(el);
        }
      }
    }
  };
};
