import React from "react";

export const ConditionalRender = (props: {
  condition: boolean;
  children?: React.ReactNode;
  alt?: React.ReactNode;
}) => {
  if (props.condition) {
    return <>{props.children}</>;
  }

  return props.alt ? <>{props.alt}</> : null;
};
