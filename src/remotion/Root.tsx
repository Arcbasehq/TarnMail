import React from "react";
import { Composition } from "remotion";
import { HeroPreview } from "./HeroPreview";

const ACCENT = "#1a73e8";
const ACCENT_DARK = "#1664c8";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HeroPreview"
      component={HeroPreview}
      durationInFrames={290}
      fps={30}
      width={1280}
      height={800}
      defaultProps={{ accent: ACCENT, accentDark: ACCENT_DARK }}
    />
  );
};
