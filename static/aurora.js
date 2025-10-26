/**
 * Aurora WebGL Background Effect
 * Based on OGL library - Optimized for Q Solutions
 */

class AuroraBackground {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            colorStops: options.colorStops || ['#005691', '#00A859', '#3A29FF'],
            amplitude: options.amplitude || 1.2,
            blend: options.blend || 0.6,
            speed: options.speed || 0.4
        };
        
        this.init();
    }
    
    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.container.appendChild(this.canvas);
        
        // Get WebGL context
        const gl = this.canvas.getContext('webgl2', {
            alpha: true,
            premultipliedAlpha: true,
            antialias: true
        });
        
        if (!gl) {
            console.error('WebGL2 not supported');
            return;
        }
        
        this.gl = gl;
        
        // Setup WebGL
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        
        // Shaders
        const vertexShaderSource = `#version 300 es
            in vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
        
        const fragmentShaderSource = `#version 300 es
            precision highp float;
            
            uniform float uTime;
            uniform float uAmplitude;
            uniform vec3 uColorStops[3];
            uniform vec2 uResolution;
            uniform float uBlend;
            
            out vec4 fragColor;
            
            vec3 permute(vec3 x) {
                return mod(((x * 34.0) + 1.0) * x, 289.0);
            }
            
            float snoise(vec2 v){
                const vec4 C = vec4(
                    0.211324865405187, 0.366025403784439,
                    -0.577350269189626, 0.024390243902439
                );
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                
                vec3 p = permute(
                    permute(i.y + vec3(0.0, i1.y, 1.0))
                    + i.x + vec3(0.0, i1.x, 1.0)
                );
                
                vec3 m = max(
                    0.5 - vec3(
                        dot(x0, x0),
                        dot(x12.xy, x12.xy),
                        dot(x12.zw, x12.zw)
                    ), 
                    0.0
                );
                m = m * m;
                m = m * m;
                
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / uResolution;
                
                // Color gradient based on position
                vec3 color1 = uColorStops[0];
                vec3 color2 = uColorStops[1];
                vec3 color3 = uColorStops[2];
                
                vec3 rampColor;
                if (uv.x < 0.5) {
                    rampColor = mix(color1, color2, uv.x * 2.0);
                } else {
                    rampColor = mix(color2, color3, (uv.x - 0.5) * 2.0);
                }
                
                // Aurora wave effect
                float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
                height = exp(height);
                height = (uv.y * 2.0 - height + 0.2);
                float intensity = 0.6 * height;
                
                float midPoint = 0.20;
                float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
                
                vec3 auroraColor = intensity * rampColor;
                
                fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        
        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Program linking failed:', gl.getProgramInfoLog(this.program));
            return;
        }
        
        // Setup geometry (fullscreen triangle)
        const positions = new Float32Array([
            -1, -1,
            3, -1,
            -1, 3
        ]);
        
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        const positionLocation = gl.getAttribLocation(this.program, 'position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        // Get uniform locations
        this.uniforms = {
            uTime: gl.getUniformLocation(this.program, 'uTime'),
            uAmplitude: gl.getUniformLocation(this.program, 'uAmplitude'),
            uColorStops: gl.getUniformLocation(this.program, 'uColorStops'),
            uResolution: gl.getUniformLocation(this.program, 'uResolution'),
            uBlend: gl.getUniformLocation(this.program, 'uBlend')
        };
        
        // Setup resize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Start animation
        this.startTime = Date.now();
        this.animate();
    }
    
    compileShader(gl, source, type) {
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
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : [0, 0, 0];
    }
    
    resize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.gl.viewport(0, 0, width, height);
    }
    
    animate() {
        if (!this.gl || !this.program) return;
        
        const gl = this.gl;
        const time = (Date.now() - this.startTime) * 0.001 * this.options.speed;
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        
        // Set uniforms
        gl.uniform1f(this.uniforms.uTime, time);
        gl.uniform1f(this.uniforms.uAmplitude, this.options.amplitude);
        gl.uniform1f(this.uniforms.uBlend, this.options.blend);
        gl.uniform2f(this.uniforms.uResolution, this.canvas.width, this.canvas.height);
        
        // Set color stops
        const colors = this.options.colorStops.map(c => this.hexToRgb(c)).flat();
        gl.uniform3fv(this.uniforms.uColorStops, colors);
        
        // Draw
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        
        requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        if (this.gl) {
            const ext = this.gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
        }
    }
}

// Initialize Aurora when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Tracking Section Aurora
    const trackingSection = document.getElementById('tracking');
    if (trackingSection) {
        new AuroraBackground(trackingSection, {
            colorStops: ['#005691', '#00A859', '#3A29FF'],
            amplitude: 1.2,
            blend: 0.6,
            speed: 0.4
        });
    }
    
    // Quote Section Aurora
    const quoteSection = document.getElementById('quote');
    if (quoteSection) {
        new AuroraBackground(quoteSection, {
            colorStops: ['#005691', '#00A859', '#3A29FF'],
            amplitude: 1.2,
            blend: 0.6,
            speed: 0.4
        });
    }
});

