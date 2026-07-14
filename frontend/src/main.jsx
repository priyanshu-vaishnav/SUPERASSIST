import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

async function init() {
  if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');
  whyDidYouRender.default(React, { trackAllPureComponents: true });
  console.log("WDYR initialized!")  // ye print hota hai console mein?
}
  ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
  );
}

init();