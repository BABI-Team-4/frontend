"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import EditorOnboardingVideo, {
  EDITOR_ONBOARDING_DURATION,
  EDITOR_ONBOARDING_FPS,
  EDITOR_ONBOARDING_HEIGHT,
  EDITOR_ONBOARDING_WIDTH,
} from "./EditorOnboardingVideo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const STORAGE_KEY = "editor_onboarding_seen_v1";
const STEP_FRAMES = [0, 120, 240];
const STEP_DURATION = 120;
const stepLabels = ["입력", "정리", "첨삭"];
const stepDescriptions = [
  "자소서를 붙여넣거나 파일을 업로드하세요",
  "문항별로 자동 분리됩니다",
  "AI가 즉시 첨삭 결과를 보여드려요",
];

export default function EditorOnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") return;
    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;

    const player = playerRef.current;
    if (!player) return;

    const onFrameUpdate = ({ detail }: { detail: { frame: number } }) => {
      const currentStep = Math.min(stepLabels.length - 1, Math.floor(detail.frame / 120));
      setStep((prev) => prev === currentStep ? prev : currentStep);

      const stepEndFrame = STEP_FRAMES[currentStep] + STEP_DURATION - 1;
      if (detail.frame >= stepEndFrame) {
        player.pause();
        player.seekTo(stepEndFrame);
      }
    };

    player.addEventListener("frameupdate", onFrameUpdate);
    return () => player.removeEventListener("frameupdate", onFrameUpdate);
  }, [open]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const goToStep = (nextStep: number) => {
    const safeStep = Math.max(0, Math.min(stepLabels.length - 1, nextStep));
    setStep(safeStep);
    playerRef.current?.seekTo(STEP_FRAMES[safeStep]);
    playerRef.current?.play();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) close();
      else setOpen(true);
    }}>
      <DialogContent
        className="max-h-[calc(100dvh-2rem)] max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl p-0 sm:max-w-3xl"
        showCloseButton={false}
      >
        <div className="flex flex-col overflow-hidden">
          {/* Header */}
          <DialogHeader className="relative px-5 pt-5 pb-4 sm:px-6">
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="text-lg font-bold tracking-tight text-black sm:text-xl">
              자소서 첨삭은 이렇게 진행돼요
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              붙여넣기부터 결과 확인까지, 3단계로 끝나요.
            </DialogDescription>
          </DialogHeader>

          {/* Video */}
          <div className="mx-5 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 sm:mx-6">
            <Player
              ref={playerRef}
              component={EditorOnboardingVideo}
              durationInFrames={EDITOR_ONBOARDING_DURATION}
              compositionWidth={EDITOR_ONBOARDING_WIDTH}
              compositionHeight={EDITOR_ONBOARDING_HEIGHT}
              fps={EDITOR_ONBOARDING_FPS}
              initialFrame={STEP_FRAMES[step]}
              autoPlay={false}
              loop={false}
              controls={false}
              style={{ width: "100%", aspectRatio: `${EDITOR_ONBOARDING_WIDTH}/${EDITOR_ONBOARDING_HEIGHT}` }}
            />
          </div>

          {/* Step indicator + description */}
          <div className="px-5 pt-4 sm:px-6">
            <div className="flex items-center gap-2 mb-1.5">
              {stepLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    index === step
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                  }`}
                >
                  <span>{index + 1}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-neutral-500">{stepDescriptions[step]}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={close}
              className="text-xs text-neutral-400 transition-colors hover:text-neutral-600"
            >
              다시 보지 않기
            </button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => goToStep(step - 1)}
                disabled={step === 0}
                className="rounded-full h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {step < stepLabels.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => goToStep(step + 1)}
                  className="rounded-full px-4 h-8"
                >
                  다음
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={close}
                  className="rounded-full px-4 h-8"
                >
                  시작하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
