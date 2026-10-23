export function describeWebGlContext(gl: WebGLRenderingContext) {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  return String(
    gl.getParameter(
      debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER,
    ),
  );
}

const pixel = new Uint8Array(4);

export function waitForWebGlContext(gl: WebGLRenderingContext) {
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
}
