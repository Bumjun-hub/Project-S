// 이 파일은 SequentialFlowGate needs 타입과, 안정적인 needs 배열 상수를 둡니다.
export type SequentialFlowRequirement = "intro" | "profile" | "myFit";

export const FLOW_GATE_INTRO_ONLY: SequentialFlowRequirement[] = ["intro"];

export const FLOW_GATE_UP_TO_PROFILE: SequentialFlowRequirement[] = ["intro", "profile"];

export const FLOW_GATE_FULL_SAVED: SequentialFlowRequirement[] = [
  "intro",
  "profile",
  "myFit",
];
