import { Suspense } from "react";
import KakaoCallback from "./KakaoCallback";

export default function Page() {
  return (
    <Suspense>
      <KakaoCallback />
    </Suspense>
  );
}
