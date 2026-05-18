declare module 'gifenc' {
  export function GIFEncoder(): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: { palette?: Uint8Array; delay?: number; transparent?: boolean; repeat?: number }
    ): void
    finish(): void
    bytes(): Uint8Array
    reset(): void
  }
  export function quantize(data: Uint8ClampedArray, maxColors: number, options?: Record<string, unknown>): Uint8Array
  export function applyPalette(data: Uint8ClampedArray, palette: Uint8Array): Uint8Array
}
