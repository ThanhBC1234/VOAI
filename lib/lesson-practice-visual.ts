export interface PracticalBarGeometry {
  left: number;
  width: number;
  zero: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Đổi một giá trị có dấu thành hình học phần trăm quanh đúng trục 0.
 * Thanh âm đi sang trái, thanh dương đi sang phải; 0 có width bằng 0 và vẫn
 * được nhận biết qua marker `zero` riêng của track.
 */
export function practicalBarGeometry(
  value: number,
  minimum: number,
  maximum: number,
): PracticalBarGeometry {
  const lower = Math.min(minimum, maximum);
  const upper = Math.max(minimum, maximum);
  const span = upper - lower;
  if (!Number.isFinite(span) || span === 0) return { left: 50, width: 0, zero: 50 };

  const position = (candidate: number) =>
    ((clamp(candidate, lower, upper) - lower) / span) * 100;
  const zero = position(0);
  const endpoint = position(value);
  return {
    left: Math.min(zero, endpoint),
    width: Math.abs(endpoint - zero),
    zero,
  };
}
