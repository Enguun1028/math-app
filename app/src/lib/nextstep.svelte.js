// The next step (logic.js findNext), worked out once per change in progress instead of once per map node:
// topicState() asks for it for every node, which rescanned about 118 topics each time (2026-10-21).
import { findNext } from './logic.js';

const next = $derived.by(findNext);
export const nextTopic = () => next;
