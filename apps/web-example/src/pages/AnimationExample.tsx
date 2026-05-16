import React, { useState } from 'react';
import { useFadeIn, useSlideIn, useTypewriter } from '@content-renderer/react-and-native';

export default function AnimationExample() {
  const [visible, setVisible] = useState(true);
  const fadeIn = useFadeIn(800);
  const slideIn = useSlideIn('left', 20, 600);
  const typewriter = useTypewriter('Hello from ContentRenderer!', 50);

  return (
    <div style={{ padding: 24 }}>
      <h2>Animation Utilities</h2>
      <p>Built-in animation hooks for smooth content transitions and visual effects. All animations use CSS transforms for GPU-accelerated performance.</p>
      <h3>Available Hooks</h3>
      <ul>
        <li><strong>useFadeIn</strong> - Fade-in animation on mount</li>
        <li><strong>useSlideIn</strong> - Slide from any direction</li>
        <li><strong>useCollapseAnimation</strong> - Expand/collapse transitions</li>
        <li><strong>useThemeTransition</strong> - Smooth theme switching</li>
        <li><strong>useScrollAnimation</strong> - Trigger animations on scroll</li>
        <li><strong>useTypewriter</strong> - Typewriter text effect</li>
      </ul>
      <h3>Demos</h3>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setVisible(!visible)} style={{ padding: '8px 16px', marginRight: 8 }}>Toggle Fade</button>
        {visible && (
          <div ref={fadeIn.ref} style={{ ...fadeIn.style, padding: 16, background: '#e0f2fe', borderRadius: 8, display: 'inline-block' }}>
            This content fades in!
          </div>
        )}
      </div>
      <div ref={slideIn.ref} style={{ ...slideIn.style, padding: 16, background: '#fce7f3', borderRadius: 8, marginBottom: 16 }}>
        This content slides in from the left!
      </div>
      <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
        <strong>Typewriter:</strong> {typewriter.displayText}<span style={{ opacity: 0.5 }}>{typewriter.isComplete ? '' : '|'}</span>
      </div>
      <h3>Usage</h3>
      <pre>{`import { useFadeIn, useSlideIn, useTypewriter } from '@content-renderer/react-and-native';

function MyComponent() {
  const fadeIn = useFadeIn(500);
  const slideIn = useSlideIn('left', 20, 600);
  const tw = useTypewriter('Hello World', 40);

  return (
    <>
      <div ref={fadeIn.ref} style={fadeIn.style}>Fade in</div>
      <div ref={slideIn.ref} style={slideIn.style}>Slide in</div>
      <p>{tw.displayText}</p>
    </>
  );
}`}</pre>
    </div>
  );
}
