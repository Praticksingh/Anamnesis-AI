import { gsap } from 'gsap';

export function createTimeline(config?: gsap.TimelineVars) {
  return gsap.timeline(config);
}

export function animate(target: gsap.TweenTarget, vars: gsap.TweenVars) {
  return gsap.to(target, vars);
}
