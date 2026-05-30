import { Composition } from "remotion";
import EditorOnboardingVideo, {
  EDITOR_ONBOARDING_DURATION,
  EDITOR_ONBOARDING_FPS,
  EDITOR_ONBOARDING_HEIGHT,
  EDITOR_ONBOARDING_WIDTH,
} from "../components/onboarding/EditorOnboardingVideo";

export default function RemotionRoot() {
  return (
    <Composition
      id="EditorOnboarding"
      component={EditorOnboardingVideo}
      durationInFrames={EDITOR_ONBOARDING_DURATION}
      fps={EDITOR_ONBOARDING_FPS}
      width={EDITOR_ONBOARDING_WIDTH}
      height={EDITOR_ONBOARDING_HEIGHT}
    />
  );
}
