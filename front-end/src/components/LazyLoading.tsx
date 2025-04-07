import { Spin } from "antd";
import React, { Suspense } from "react";

const LazyLoading =
  <P extends object>(Component: React.ComponentType<P>) =>
  (props: P) => {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Spin />
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };

export default LazyLoading;
