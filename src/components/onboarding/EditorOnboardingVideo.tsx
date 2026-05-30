"use client";

import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const EDITOR_ONBOARDING_FPS = 30;
export const EDITOR_ONBOARDING_DURATION = 360;
export const EDITOR_ONBOARDING_WIDTH = 1120;
export const EDITOR_ONBOARDING_HEIGHT = 630;

const scenes = [
  {
    eyebrow: "01. 입력",
    title: "자소서를 그대로 넣으세요",
    body: "붙여넣거나 파일을 업로드하면 텍스트만 추출해서 다음 단계로 넘겨요.",
    accent: "#2563eb",
  },
  {
    eyebrow: "02. 정리",
    title: "문항별로 자동 분리해요",
    body: "여러 문항을 한 번에 넣어도 질문과 답변을 나눠서 확인할 수 있어요.",
    accent: "#0f766e",
  },
  {
    eyebrow: "03. 첨삭",
    title: "결과를 보고 바로 고치세요",
    body: "강점, 부족한 부분, 추천 수정 문장을 한 화면에서 확인합니다.",
    accent: "#111827",
  },
];

const sampleLines = [
  "Q. 지원 동기와 직무 역량을 설명해주세요.",
  "저는 문제를 구조화하고 끝까지 개선하는 과정에서 가장 큰 성취감을 느낍니다.",
  "교내 프로젝트에서 사용자 이탈 원인을 분석하고 입력 흐름을 단순화했습니다.",
  "지원 직무에서도 데이터를 기반으로 제품 경험을 개선하는 사람이 되고 싶습니다.",
];

function useSceneProgress(start: number) {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 640,
      borderRadius: 28,
      background: "white",
      border: "1px solid rgba(15,23,42,0.08)",
      boxShadow: "0 30px 90px rgba(15,23,42,0.18)",
      overflow: "hidden",
    }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", borderBottom: "1px solid #f0f0f0" }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: "#ef4444" }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: "#f59e0b" }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: "#22c55e" }} />
        <span style={{ marginLeft: 12, color: "#a3a3a3", fontSize: 13, fontWeight: 700 }}>A CV Editor</span>
      </div>
      {children}
    </div>
  );
}

function CursorCallout({ progress, accent, label }: { progress: number; accent: string; label: string }) {
  const opacity = interpolate(progress, [0.35, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(progress, [0.35, 0.7], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      position: "absolute",
      right: 22,
      bottom: 26,
      opacity,
      transform: `translateY(${y}px)`,
      borderRadius: 18,
      background: "#111827",
      color: "white",
      padding: "12px 15px",
      fontSize: 15,
      fontWeight: 900,
      boxShadow: "0 18px 42px rgba(15,23,42,0.25)",
    }}>
      <span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: accent, marginRight: 8 }} />
      {label}
    </div>
  );
}

function InputScreen({ progress, accent }: { progress: number; accent: string }) {
  const visible = Math.floor(interpolate(progress, [0.08, 0.74], [0, sampleLines.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <div style={{ position: "relative" }}>
      <BrowserFrame>
        <div style={{ padding: 34 }}>
          <div style={{ display: "inline-flex", borderRadius: 999, background: `${accent}14`, color: accent, padding: "7px 12px", fontSize: 14, fontWeight: 900, marginBottom: 18 }}>
            자소서 첨삭
          </div>
          <div style={{ fontSize: 30, fontWeight: 950, color: "#111827", letterSpacing: -1.4 }}>자소서를 붙여넣어 주세요</div>
          <div style={{ marginTop: 8, color: "#737373", fontSize: 15 }}>문항과 답변을 함께 넣으면 더 정확하게 분석해요.</div>
          <div style={{ marginTop: 26, minHeight: 205, border: "1px solid #e5e5e5", borderRadius: 22, background: "#fafafa", padding: 22 }}>
            {sampleLines.map((line, index) => (
              <div key={line} style={{
                opacity: index <= visible ? 1 : 0,
                fontSize: index === 0 ? 15 : 14,
                fontWeight: index === 0 ? 900 : 500,
                color: index === 0 ? "#111827" : "#525252",
                lineHeight: 1.6,
                marginBottom: 8,
              }}>
                {line}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ color: "#a3a3a3", fontSize: 13, fontWeight: 800 }}>1,248자 · docx/pdf 업로드 가능</div>
            <div style={{ borderRadius: 999, background: accent, color: "white", padding: "10px 18px", fontSize: 14, fontWeight: 900 }}>다음</div>
          </div>
        </div>
      </BrowserFrame>
      <CursorCallout progress={progress} accent={accent} label="파일도 바로 업로드" />
    </div>
  );
}

function SplitScreen({ progress, accent }: { progress: number; accent: string }) {
  const cards = [
    ["지원 동기와 직무 역량", "프로젝트 경험과 사용자 흐름 개선 사례가 핵심 답변으로 정리됐어요."],
    ["협업 경험", "갈등 상황보다 맡은 역할과 조율 방식이 더 드러나면 좋아요."],
    ["입사 후 목표", "회사 서비스와 연결된 구체적인 성장 방향을 추가해보세요."],
  ];

  return (
    <div style={{ position: "relative" }}>
      <BrowserFrame>
        <div style={{ padding: 30 }}>
          <div style={{ fontSize: 24, fontWeight: 950, color: "#111827", letterSpacing: -1, marginBottom: 18 }}>문항을 이렇게 나눴어요</div>
          {cards.map(([question, answer], index) => {
            const itemProgress = interpolate(progress, [index * 0.18, index * 0.18 + 0.22], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            });
            return (
              <div key={question} style={{
                opacity: itemProgress,
                transform: `translateX(${(1 - itemProgress) * 28}px)`,
                border: "1px solid #e5e5e5",
                borderRadius: 20,
                padding: 18,
                marginBottom: 13,
                background: index === 0 ? `${accent}08` : "white",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 11, background: index === 0 ? accent : "#f5f5f5", color: index === 0 ? "white" : "#737373", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 950 }}>
                    Q{index + 1}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 950, color: "#111827", letterSpacing: -0.5 }}>{question}</span>
                </div>
                <div style={{ color: "#737373", fontSize: 14, lineHeight: 1.5 }}>{answer}</div>
              </div>
            );
          })}
        </div>
      </BrowserFrame>
      <CursorCallout progress={progress} accent={accent} label="필요하면 문항 수정" />
    </div>
  );
}

function ResultScreen({ progress, accent }: { progress: number; accent: string }) {
  const score = Math.round(interpolate(progress, [0.12, 0.78], [0, 86], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  return (
    <div style={{ position: "relative" }}>
      <BrowserFrame>
        <div style={{ padding: 30 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div style={{ borderRadius: 22, background: accent, color: "white", padding: 20, height: 108 }}>
              <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.76, marginBottom: 12 }}>종합 적합도</div>
              <div style={{ fontSize: 34, fontWeight: 950, letterSpacing: -1.2 }}>{score}점</div>
            </div>
            <div style={{ borderRadius: 22, background: "#f5f5f5", padding: 20, height: 108 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#737373", marginBottom: 12 }}>보완 필요</div>
              <div style={{ fontSize: 30, fontWeight: 950, color: "#111827", letterSpacing: -1.2 }}>2곳</div>
            </div>
          </div>
          <div style={{ borderRadius: 22, border: "1px solid #e5e5e5", padding: 20 }}>
            <div style={{ fontSize: 19, fontWeight: 950, color: "#111827", marginBottom: 14 }}>AI 첨삭 요약</div>
            <div style={{ color: "#525252", fontSize: 14, lineHeight: 1.65, marginBottom: 8 }}>강점은 프로젝트 경험이 명확하다는 점입니다.</div>
            <div style={{ color: "#525252", fontSize: 14, lineHeight: 1.65, marginBottom: 8 }}>다만 회사 서비스와 연결되는 지원 동기가 더 필요합니다.</div>
            <div style={{ color: accent, fontSize: 14, fontWeight: 900, lineHeight: 1.65 }}>추천 수정: “지원 기업의 사용자 문제 해결 방식”을 한 문장 추가해보세요.</div>
          </div>
        </div>
      </BrowserFrame>
      <CursorCallout progress={progress} accent={accent} label="결과 보고 바로 수정" />
    </div>
  );
}

function Scene({
  index,
  children,
}: {
  index: number;
  children: (progress: number) => React.ReactNode;
}) {
  const start = index * 120;
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [start, start + 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(frame, [start + 98, start + 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const progress = useSceneProgress(start);
  const scene = scenes[index];

  return (
    <Sequence from={start} durationInFrames={120}>
      <AbsoluteFill style={{ opacity: exit, transform: `translateY(${(1 - enter) * 22}px)` }}>
        <div style={{ height: "100%", display: "grid", gridTemplateColumns: "360px 1fr", alignItems: "center", gap: 42, padding: "76px 72px 54px" }}>
          <div>
            <div style={{ display: "inline-flex", borderRadius: 999, background: `${scene.accent}14`, color: scene.accent, padding: "8px 12px", fontSize: 16, fontWeight: 950, marginBottom: 18 }}>
              {scene.eyebrow}
            </div>
            <h2 style={{ margin: 0, color: "#111827", fontSize: 48, lineHeight: 1.02, letterSpacing: -2.5 }}>
              {scene.title}
            </h2>
            <p style={{ margin: "18px 0 0", color: "#737373", fontSize: 21, lineHeight: 1.52 }}>
              {scene.body}
            </p>
          </div>
          {children(progress)}
        </div>
      </AbsoluteFill>
    </Sequence>
  );
}

export default function EditorOnboardingVideo() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const sweep = interpolate(frame, [0, durationInFrames], [-220, 1300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#fbfaf7", fontFamily: "Pretendard, sans-serif", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 14% 12%, rgba(37,99,235,0.13), transparent 34%), radial-gradient(circle at 92% 80%, rgba(15,118,110,0.13), transparent 36%)" }} />
      <div style={{ position: "absolute", left: sweep, top: -180, width: 280, height: 920, background: "rgba(255,255,255,0.48)", transform: "rotate(18deg)", filter: "blur(2px)" }} />
      <div style={{ position: "absolute", left: 40, top: 30, fontSize: 22, fontWeight: 950, letterSpacing: -0.7, color: "#111827" }}>A CV</div>
      <Scene index={0}>{(progress) => <InputScreen progress={progress} accent={scenes[0].accent} />}</Scene>
      <Scene index={1}>{(progress) => <SplitScreen progress={progress} accent={scenes[1].accent} />}</Scene>
      <Scene index={2}>{(progress) => <ResultScreen progress={progress} accent={scenes[2].accent} />}</Scene>
    </AbsoluteFill>
  );
}
