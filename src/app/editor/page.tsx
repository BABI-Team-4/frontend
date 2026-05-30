import { Suspense } from "react";
import EditorInner from "@/components/editor/EditorInner";

export default function EditorPage() {
  return (
    <Suspense>
      <EditorInner />
    </Suspense>
  );
}
