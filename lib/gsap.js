'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger, SplitText, ScrollSmoother);

export { gsap, ScrollTrigger, SplitText, ScrollSmoother };
