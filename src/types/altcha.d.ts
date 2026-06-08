import "react";

// The ALTCHA web component (<altcha-widget>) registered by the `altcha` package.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "altcha-widget": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        challengeurl?: string;
        name?: string;
        auto?: "onload" | "onsubmit" | "off";
        hidefooter?: boolean;
        hidelogo?: boolean;
      };
    }
  }
}
