import { deepLearningTheoryA } from "./deep-learning-a";
import { deepLearningTheoryB } from "./deep-learning-b";
import { deepLearningTheoryC } from "./deep-learning-c";
import type { LessonTheoryMap } from "./types";

export const deepLearningTheory: LessonTheoryMap = {
  ...deepLearningTheoryA,
  ...deepLearningTheoryB,
  ...deepLearningTheoryC,
};
