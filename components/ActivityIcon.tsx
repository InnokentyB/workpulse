import {
  EyeCareIcon,
  NeckResetIcon,
  QuietResetIcon,
  ShoulderRollsIcon,
  WalkIcon,
  WallPushIcon,
} from "@/components/icons";
import type { Activity } from "@/lib/types";

export function ActivityIcon({ activity }: { activity: Activity }) {
  switch (activity.id) {
    case "shoulder-rolls":
      return <ShoulderRollsIcon />;
    case "eye-care-break":
      return <EyeCareIcon />;
    case "wall-push-ups":
      return <WallPushIcon />;
    case "purposeful-walk":
      return <WalkIcon />;
    case "quiet-reset":
      return <QuietResetIcon />;
    default:
      return <NeckResetIcon />;
  }
}
