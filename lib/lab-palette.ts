import { useEffect, useState } from "react";

/**
 * Bảng màu cho các biểu đồ vẽ bằng `<canvas>` ở phòng lab.
 *
 * Vì sao không đọc thẳng biến CSS: canvas không kế thừa gì từ CSS — mọi nét vẽ
 * đều là một chuỗi màu tuyệt đối. Nếu để mã màu cứng như trước, bật chế độ tối
 * sẽ để lại sáu ô trắng chói giữa trang tối. Đọc `getComputedStyle` cho từng
 * nét thì vừa chậm vừa buộc mọi vai trò màu của biểu đồ phải tồn tại trong
 * `globals.css`; giữ bảng màu riêng ở đây rõ ràng hơn.
 */
export type LabPalette = {
  /** Nền khung vẽ. */
  surface: string;
  /** Lưới toạ độ và trục. */
  grid: string;
  /** Đường cong hàm mất mát. */
  curve: string;
  /** Điểm hiện tại của gradient descent. */
  pointActive: string;
  /** Ba kênh RGB của vệt điểm cũ; độ mờ được tính theo từng bước. */
  pointTrailRgb: string;
  /** Chữ chú thích trục. */
  axisText: string;
  /** Hai lớp dữ liệu của k-NN. */
  classA: string;
  classB: string;
  /** Nhãn nằm **trên** chấm dữ liệu. */
  onPoint: string;
  /** Điểm cần phân loại và nét nối tới hàng xóm. */
  query: string;
  link: string;
  /** Waveform và cột phổ DFT. */
  wave: string;
  bar: string;
  barHighlight: string;
  tick: string;
  /** Ô nhiệt của bản đồ attention: nền là RGB + độ mờ theo trọng số. */
  heatRgb: string;
  /** Chữ trên ô nhiệt. Ở chế độ tối hai vai trò đảo ngược: ô mờ nằm trên nền
   *  tối nên cần chữ sáng, còn ô đậm là mảng xanh tươi nên cần chữ tối. */
  heatTextHigh: string;
  heatTextLow: string;
  /** Ô kết quả convolution — cùng cơ chế nền mờ theo giá trị như ô nhiệt. */
  convRgb: string;
  convTextHigh: string;
  convTextLow: string;
};

const LIGHT: LabPalette = {
  surface: "#fffdf7",
  grid: "#d9ddd4",
  curve: "#183d36",
  pointActive: "#ff6e50",
  pointTrailRgb: "127, 200, 62",
  axisText: "#51655f",
  classA: "#4aa8d8",
  classB: "#ff795c",
  onPoint: "#ffffff",
  query: "#102a26",
  link: "rgba(16,42,38,.25)",
  wave: "#ff795c",
  bar: "#307b59",
  barHighlight: "#ff795c",
  tick: "#aeb9b1",
  heatRgb: "48, 123, 89",
  heatTextHigh: "#ffffff",
  heatTextLow: "#102a26",
  convRgb: "183, 243, 107",
  convTextHigh: "#10243a",
  convTextLow: "#10243a",
};

const DARK: LabPalette = {
  surface: "#0d1a26",
  grid: "#22344a",
  curve: "#4bd6c0",
  pointActive: "#ff8a6d",
  pointTrailRgb: "143, 214, 86",
  axisText: "#93a6bb",
  classA: "#6fb0ff",
  classB: "#ff8a6d",
  onPoint: "#08131f",
  query: "#e7eff8",
  link: "rgba(231,239,248,.28)",
  wave: "#ff8a6d",
  bar: "#45b985",
  barHighlight: "#ff8a6d",
  tick: "#405a74",
  heatRgb: "69, 185, 133",
  heatTextHigh: "#06201a",
  heatTextLow: "#e7eff8",
  convRgb: "150, 205, 80",
  convTextHigh: "#0c1a06",
  convTextLow: "#e7eff8",
};

/**
 * Theo dõi `data-theme` trên thẻ `<html>`.
 *
 * Quan sát thuộc tính thay vì nghe `prefers-color-scheme` là cố ý: thuộc tính
 * đó là kết quả **cuối cùng** của cả lựa chọn thủ công lẫn cài đặt hệ điều
 * hành, nên chỉ cần một nguồn tín hiệu là biểu đồ luôn vẽ đúng chế độ đang hiện.
 */
export function useLabPalette(): LabPalette {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const read = () => setDark(document.documentElement.dataset.theme === "dark");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  return dark ? DARK : LIGHT;
}
