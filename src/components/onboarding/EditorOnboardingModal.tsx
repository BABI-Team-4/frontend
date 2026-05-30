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

const STORAGE_KEY = "editor_onboarding_seen_v1";
const STEP_FRAMES = [0, 120, 240];
const STEP_DURATION = 120;
const stepLabels = ["입력", "정리", "첨삭"];

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
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-[calc(100%-2rem)] overflow-y-auto rounded-3xl p-0 sm:max-w-5xl" showCloseButton={false}>
        <div className="bg-white">
          <DialogHeader className="px-6 pt-5 pb-3">
            <div className="mb-2 w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
              처음 오셨나요?
            </div>
            <DialogTitle className="text-2xl font-black tracking-[-0.04em] text-black">
              자소서 첨삭은 이렇게 진행돼요
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-500">
              붙여넣기부터 결과 확인까지 10초만에 흐름을 훑어보세요.
            </DialogDescription>
          </DialogHeader>

          <div className="mx-6 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-inner">
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
              style={{ width: "100%" }}
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4">
            <button
              type="button"
              onClick={close}
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-600"
            >
              다시 보지 않기
            </button>
            <div className="hidden items-center gap-1 sm:flex">
              {stepLabels.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goToStep(index)}
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: index === step ? 28 : 10,
                    background: index === step ? "#111827" : "#d4d4d4",
                  }}
                  aria-label={`${label} 단계로 이동`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep(step - 1)}
                disabled={step === 0}
                className="rounded-full px-5"
              >
                이전
              </Button>
              {step < stepLabels.length - 1 ? (
                <Button type="button" onClick={() => goToStep(step + 1)} className="rounded-full px-5">
                  다음
                </Button>
              ) : (
                <Button onClick={close} className="rounded-full px-5">
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
