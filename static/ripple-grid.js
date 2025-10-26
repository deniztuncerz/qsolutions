// RippleGrid Component - Vanilla JavaScript Implementation
class RippleGrid {
  constructor(options = {}) {
    this.options = {
      enableRainbow: options.enableRainbow || false,
      gridColor: options.gridColor || '#ffffff',
      rippleIntensity: options.rippleIntensity || 0.05,
      gridSize: options.gridSize || 10.0,
      gridThickness: options.gridThickness || 15.0,
      fadeDistance: options.fadeDistance || 1.5,
      vignetteStrength: options.vignetteStrength || 2.0,
      glowIntensity: options.glowIntensity || 0.1,
      opacity: options.opacity || 1.0,
      gridRotation: options.gridRotation || 0,
      mouseInteraction: options.mouseInteraction !== false,
      mouseInteractionRadius: options.mouseInteractionRadius || 1.0
    };

    this.container = null;
    this.renderer = null;
    this.mesh = null;
    this.uniforms = null;
    this.mousePosition = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.mouseInfluence = 0;
    this.animationId = null;

    this.init();
  }

  init() {
    this.createContainer();
    this.setupWebGL();
    this.setupEventListeners();
    this.startAnimation();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'ripple-grid-container';
    
    // Apply options to CSS variables
    const gridSize = this.options.gridSize || 15;
    const gridColor = this.options.gridColor || '#ffffff';
    const opacity = this.options.opacity || 0.9;
    
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
      background-size: ${gridSize}px ${gridSize}px;
      background-image: 
        linear-gradient(90deg, ${gridColor} 1px, transparent 1px),
        linear-gradient(${gridColor} 1px, transparent 1px);
      opacity: ${opacity};
    `;
    
    // Add CSS animation
    if (!document.querySelector('#ripple-grid-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-grid-styles';
      style.textContent = `
        .ripple-grid-container {
          animation: rippleMove 4s ease-in-out infinite;
        }
        
        @keyframes rippleMove {
          0%, 100% { 
            background-position: 0 0, 0 0;
            transform: scale(1);
          }
          50% { 
            background-position: ${gridSize * 0.5}px ${gridSize * 0.5}px, ${gridSize * 0.3}px ${gridSize * 0.3}px;
            transform: scale(1.01);
          }
        }
        
        .ripple-grid-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.2) 0%, transparent 60%);
          pointer-events: none;
          transition: all 0.3s ease;
          opacity: var(--mouse-active, 0);
        }
        
        .ripple-grid-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 50%);
          pointer-events: none;
          animation: rippleGlow 6s ease-in-out infinite;
        }
        
        @keyframes rippleGlow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupWebGL() {
    // Skip WebGL for now, use CSS animations instead
    console.log('Using CSS-based RippleGrid instead of WebGL');
    return;

    // Shader sources
    const vertShader = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragShader = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform bool enableRainbow;
      uniform vec3 gridColor;
      uniform float rippleIntensity;
      uniform float gridSize;
      uniform float gridThickness;
      uniform float fadeDistance;
      uniform float vignetteStrength;
      uniform float glowIntensity;
      uniform float opacity;
      uniform float gridRotation;
      uniform bool mouseInteraction;
      uniform vec2 mousePosition;
      uniform float mouseInfluence;
      uniform float mouseInteractionRadius;
      varying vec2 vUv;

      float pi = 3.141592;

      mat2 rotate(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
      }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= iResolution.x / iResolution.y;

        if (gridRotation != 0.0) {
          uv = rotate(gridRotation * pi / 180.0) * uv;
        }

        float dist = length(uv);
        float func = sin(pi * (iTime - dist));
        vec2 rippleUv = uv + uv * func * rippleIntensity;

        if (mouseInteraction && mouseInfluence > 0.0) {
          vec2 mouseUv = (mousePosition * 2.0 - 1.0);
          mouseUv.x *= iResolution.x / iResolution.y;
          float mouseDist = length(uv - mouseUv);
          
          float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
          
          float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
          rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
        }

        vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
        vec2 b = abs(a);

        float aaWidth = 0.5;
        vec2 smoothB = vec2(
          smoothstep(0.0, aaWidth, b.x),
          smoothstep(0.0, aaWidth, b.y)
        );

        vec3 color = vec3(0.0);
        color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
        color += exp(-gridThickness * smoothB.y);
        color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
        color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

        if (glowIntensity > 0.0) {
          color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
          color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
        }

        float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
        
        vec2 vignetteCoords = vUv - 0.5;
        float vignetteDistance = length(vignetteCoords);
        float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
        vignette = clamp(vignette, 0.0, 1.0);
        
        vec3 t;
        if (enableRainbow) {
          t = vec3(
            uv.x * 0.5 + 0.5 * sin(iTime),
            uv.y * 0.5 + 0.5 * cos(iTime),
            pow(cos(iTime), 4.0)
          ) + 0.5;
        } else {
          t = gridColor;
        }

        float finalFade = ddd * vignette;
        float alpha = length(color) * finalFade * opacity;
        gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
      }
    `;

    // Create shaders
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertShader);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragShader);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Shader program failed to link');
      return;
    }

    // Create geometry (full screen triangle)
    const vertices = new Float32Array([
      -1, -1,
       3, -1,
      -1,  3
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'position');
    const timeLocation = gl.getUniformLocation(program, 'iTime');
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const enableRainbowLocation = gl.getUniformLocation(program, 'enableRainbow');
    const gridColorLocation = gl.getUniformLocation(program, 'gridColor');
    const rippleIntensityLocation = gl.getUniformLocation(program, 'rippleIntensity');
    const gridSizeLocation = gl.getUniformLocation(program, 'gridSize');
    const gridThicknessLocation = gl.getUniformLocation(program, 'gridThickness');
    const fadeDistanceLocation = gl.getUniformLocation(program, 'fadeDistance');
    const vignetteStrengthLocation = gl.getUniformLocation(program, 'vignetteStrength');
    const glowIntensityLocation = gl.getUniformLocation(program, 'glowIntensity');
    const opacityLocation = gl.getUniformLocation(program, 'opacity');
    const gridRotationLocation = gl.getUniformLocation(program, 'gridRotation');
    const mouseInteractionLocation = gl.getUniformLocation(program, 'mouseInteraction');
    const mousePositionLocation = gl.getUniformLocation(program, 'mousePosition');
    const mouseInfluenceLocation = gl.getUniformLocation(program, 'mouseInfluence');
    const mouseInteractionRadiusLocation = gl.getUniformLocation(program, 'mouseInteractionRadius');

    // Check for WebGL errors
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error('WebGL error after uniform location setup:', error);
    }

    this.gl = gl;
    this.program = program;
    this.vertexBuffer = vertexBuffer;
    this.positionLocation = positionLocation;
    this.uniforms = {
      time: timeLocation,
      resolution: resolutionLocation,
      enableRainbow: enableRainbowLocation,
      gridColor: gridColorLocation,
      rippleIntensity: rippleIntensityLocation,
      gridSize: gridSizeLocation,
      gridThickness: gridThicknessLocation,
      fadeDistance: fadeDistanceLocation,
      vignetteStrength: vignetteStrengthLocation,
      glowIntensity: glowIntensityLocation,
      opacity: opacityLocation,
      gridRotation: gridRotationLocation,
      mouseInteraction: mouseInteractionLocation,
      mousePosition: mousePositionLocation,
      mouseInfluence: mouseInfluenceLocation,
      mouseInteractionRadius: mouseInteractionRadiusLocation
    };
  }

  createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  setupEventListeners() {
    if (this.options.mouseInteraction) {
      this.container.addEventListener('mousemove', (e) => {
        const rect = this.container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        this.container.style.setProperty('--mouse-x', x + '%');
        this.container.style.setProperty('--mouse-y', y + '%');
      });
      
      this.container.addEventListener('mouseenter', () => {
        this.container.style.setProperty('--mouse-active', '1');
      });
      
      this.container.addEventListener('mouseleave', () => {
        this.container.style.setProperty('--mouse-active', '0');
      });
    }
  }

  startAnimation() {
    // CSS animations are handled automatically
    console.log('RippleGrid CSS animations started');
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
      : [1, 1, 1];
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  getElement() {
    return this.container;
  }
}

// Export for use
window.RippleGrid = RippleGrid;
