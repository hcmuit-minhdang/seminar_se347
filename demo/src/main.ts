// =====================================================
// Sổ điểm - demo TypeScript (SE347, Nhóm 3)
// =====================================================

// ---------- Kiểu dữ liệu: interface, union, ? (tùy chọn) ----------
type CotDiem = "qt" | "th" | "gk" | "ck"; // quá trình, thực hành, giữa kì, cuối kì

// Tỉ lệ phần trăm của từng cột; mỗi môn có tỉ lệ riêng, 0 = môn không có cột đó
type TiLe = Record<CotDiem, number>;

interface DiemMon {
  ma: string; // do người dùng nhập
  ten: string;
  tc: number; // số tín chỉ
  qt?: number; // dấu ? = chưa nhập điểm
  th?: number;
  gk?: number;
  ck?: number;
  readonly tiLe: Readonly<TiLe>; // chỉ đọc: muốn đổi tỉ lệ phải tạo object mới
}

// Template literal type: chỉ chấp nhận chuỗi dạng "HK1/2025-2026"
type HocKy = `HK${1 | 2 | 3}/${number}-${number}`;

interface KyHoc {
  ten: HocKy;
  mon: DiemMon[];
}

// ---------- Utility types: Pick, Partial, Omit ----------
type DuLieuTinh = Pick<DiemMon, CotDiem | "tiLe">; // chỉ lấy điểm và tỉ lệ để tính
type CapNhatDiem = Partial<Omit<DiemMon, "ma">>; // sửa một phần, không được sửa mã môn

// ---------- satisfies: bảng cấu hình các cột điểm ----------
// Sai tên cột hoặc sai kiểu giá trị là báo lỗi, mà vẫn dùng được cotDiem.qt.nhan
const cotDiem = {
  qt: { nhan: "QT", macDinh: 20 },
  th: { nhan: "TH", macDinh: 20 },
  gk: { nhan: "GK", macDinh: 20 },
  ck: { nhan: "CK", macDinh: 40 },
} satisfies Record<CotDiem, { nhan: string; macDinh: number }>;

const dsCot: readonly CotDiem[] = ["qt", "th", "gk", "ck"]; // readonly: không push thêm được

// Type guard: kiểm tra một giá trị chưa rõ kiểu có phải tên cột hợp lệ không (thay cho `as`)
function laCot(x: unknown): x is CotDiem {
  return typeof x === "string" && (dsCot as readonly string[]).includes(x);
}

// ---------- Xếp loại: union + Record + satisfies ----------
// Thiếu một loại trong bảng là báo lỗi ngay (Record phải đủ khóa)
type XepLoai = "xuatSac" | "gioi" | "kha" | "trungBinh" | "yeu";

const loaiCfg = {
  xuatSac: { nhan: "Xuất sắc", tu: 9, mau: "#7c3aed" },
  gioi: { nhan: "Giỏi", tu: 8, mau: "#16a34a" },
  kha: { nhan: "Khá", tu: 7, mau: "#2563eb" },
  trungBinh: { nhan: "Trung bình", tu: 5, mau: "#d97706" },
  yeu: { nhan: "Yếu", tu: 0, mau: "#dc2626" },
} satisfies Record<XepLoai, { nhan: string; tu: number; mau: string }>;

const thuTuLoai: readonly XepLoai[] =["xuatSac", "gioi", "kha", "trungBinh", "yeu"]; // từ cao xuống thấp

// Xếp loại theo số đang hiển thị (đã làm tròn), để nhãn khớp với con số trên màn hình
function xepLoai(diem: number, soLe: number): XepLoai {
  const lamTron = Number(diem.toFixed(soLe));
  return thuTuLoai.find((l) => lamTron >= loaiCfg[l].tu) ?? "yeu";
}

// Màu riêng của xếp loại; chưa có điểm thì dùng màu chữ mặc định
function mauLoai(diem: number | undefined, soLe: number): string {
  return diem === undefined ? "inherit" : loaiCfg[xepLoai(diem, soLe)].mau;
}

function nhanLoai(diem: number | undefined, soLe: number): string {
  if (diem === undefined) return "";
  const cfg = loaiCfg[xepLoai(diem, soLe)];
  return `<span class="loai" style="background:${cfg.mau}">${cfg.nhan}</span>`;
}

function tiLeMacDinh(): TiLe {
  return { qt: cotDiem.qt.macDinh, th: cotDiem.th.macDinh, gk: cotDiem.gk.macDinh, ck: cotDiem.ck.macDinh };
}

// ---------- Dữ liệu: ban đầu để trống ----------
let hocKy: KyHoc[] = [];

// Sắp xếp học kỳ theo năm học rồi theo kỳ
function thuTuKy(k: HocKy): number {
  const [phanKy, nam] = k.slice(2).split("/");
  return Number(nam.slice(0, 4)) * 10 + Number(phanKy);
}

// ---------- Kiểm tra undefined (strict) ----------
// find() có thể không thấy, nên kiểu trả về là KyHoc | undefined
function timKyHoc(ten: HocKy): KyHoc | undefined {
  return hocKy.find((k) => k.ten === ten);
}

// ---------- Tính điểm ----------
function tongTiLe(tiLe: TiLe): number {
  return dsCot.reduce((tong, cot) => tong + tiLe[cot], 0);
}

// Điểm TB = tổng (điểm x tỉ lệ %). Chưa tính được (undefined) khi:
// tổng tỉ lệ khác 100, hoặc còn cột có tỉ lệ mà chưa nhập điểm
function tinhDiemTB(d: DuLieuTinh): number | undefined {
  if (tongTiLe(d.tiLe) !== 100) return undefined;
  let tong = 0;
  for (const cot of dsCot) {
    if (d.tiLe[cot] === 0) continue; // môn không có cột này
    const diem = d[cot];
    if (diem === undefined) return undefined;
    tong += (diem * d.tiLe[cot]) / 100;
  }
  return tong;
}

interface ThongKe {
  tcDaHoc: number; // tổng TC các môn đã có điểm
  tcTichLuy: number; // TC các môn đạt (từ 5 trở lên)
  gpa: number | undefined; // undefined khi chưa có môn nào có điểm
}

function thongKe(ds: DiemMon[]): ThongKe {
  let tcDaHoc = 0;
  let tcTichLuy = 0;
  let tongDiem = 0;
  for (const m of ds) {
    const tb = tinhDiemTB(m);
    if (tb === undefined) continue; // chưa tính được thì bỏ qua
    tcDaHoc += m.tc;
    if (tb >= 5) tcTichLuy += m.tc;
    tongDiem += tb * m.tc;
  }
  return { tcDaHoc, tcTichLuy, gpa: tcDaHoc === 0 ? undefined : tongDiem / tcDaHoc };
}

// ---------- Học lại ----------
// Cùng mã môn ở nhiều kỳ: lần học ở kỳ muộn nhất thay thế các lần trước.
// Lần cũ vẫn hiện (nền đỏ) nhưng không tính vào GPA tích lũy.
// Các kỳ đã được sắp theo thời gian nên lần gặp sau cùng là lần mới nhất.
interface LanHoc {
  mon: DiemMon;
  ky: HocKy;
}
type LanMoiNhat = Map<string, LanHoc>; // khóa là mã môn

function layLanMoiNhat(): LanMoiNhat {
  const moiNhat: LanMoiNhat = new Map();
  for (const ky of hocKy) {
    for (const mon of ky.mon) moiNhat.set(mon.ma, { mon, ky: ky.ten });
  }
  return moiNhat;
}

// ---------- keyof + generics ----------
// Lấy điểm của một cột; tên cột được kiểm tra theo chính object truyền vào
function layTruong<T, K extends keyof T>(obj: T, khoa: K): T[K] {
  return obj[khoa];
}

// ---------- Cập nhật ----------
function capNhatDiem(tenKy: HocKy, ma: string, patch: CapNhatDiem): void {
  const ky = timKyHoc(tenKy);
  if (!ky) return;
  const mon = ky.mon.find((m) => m.ma === ma);
  if (!mon) return;
  Object.assign(mon, patch);
  render();
}

function themMon(tenKy: HocKy, mon: DiemMon): void {
  let ky = timKyHoc(tenKy);
  if (!ky) {
    ky = { ten: tenKy, mon: [] };
    hocKy.push(ky);
    hocKy.sort((a, b) => thuTuKy(a.ten) - thuTuKy(b.ten));
  }
  ky.mon.push(mon);
  render();
}

function xoaMon(tenKy: HocKy, ma: string): void {
  const ky = timKyHoc(tenKy);
  if (!ky) return;
  ky.mon = ky.mon.filter((m) => m.ma !== ma);
  hocKy = hocKy.filter((k) => k.mon.length > 0); // kỳ hết môn thì biến mất
  render();
}

// Đọc số từ ô nhập: giá trị từ ô nhập luôn là chuỗi, phải đổi sang số
type KetQuaNhap = { hopLe: true; so: number | undefined } | { hopLe: false };

function docSo(chuoi: string, toiDa: number): KetQuaNhap {
  const s = chuoi.trim().replace(",", ".");
  if (s === "") return { hopLe: true, so: undefined }; // để trống = chưa có
  const so = Number(s);
  if (Number.isNaN(so) || so < 0 || so > toiDa) return { hopLe: false };
  return { hopLe: true, so };
}

// ---------- unknown: kiểm tra dữ liệu chưa rõ kiểu ----------
function laHocKy(x: unknown): x is HocKy {
  return typeof x === "string" && /^HK[123]\/\d{4}-\d{4}$/.test(x);
}

function laDiemHopLe(x: unknown): boolean {
  return x === undefined || (typeof x === "number" && x >= 0 && x <= 10);
}

function laTiLe(x: unknown): x is TiLe {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return dsCot.every((cot) => typeof o[cot] === "number" && o[cot] >= 0 && o[cot] <= 100);
}

function laDiemMon(x: unknown): x is DiemMon {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.ma === "string" &&
    o.ma !== "" &&
    typeof o.ten === "string" &&
    typeof o.tc === "number" &&
    o.tc >= 0 &&
    laTiLe(o.tiLe) &&
    dsCot.every((cot) => laDiemHopLe(o[cot]))
  );
}

function laKyHoc(x: unknown): x is KyHoc {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return laHocKy(o.ten) && Array.isArray(o.mon) && o.mon.every(laDiemMon);
}

// ---------- Lưu và đọc dữ liệu (localStorage) ----------
// Dữ liệu đọc ra chỉ là chuỗi JSON, nên coi là unknown và kiểm tra rồi mới dùng
const KHOA_LUU = "so-diem-ts";

function luuDuLieu(): void {
  try {
    localStorage.setItem(KHOA_LUU, JSON.stringify(hocKy));
  } catch {
    // không lưu được (chế độ riêng tư...) thì bỏ qua, app vẫn chạy
  }
}

function docDuLieu(): KyHoc[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KHOA_LUU) ?? "[]");
    return Array.isArray(raw) ? raw.filter(laKyHoc) : [];
  } catch {
    return [];
  }
}

// ---------- Giao diện ----------
// Generic: người gọi nói rõ kiểu phần tử mong muốn; thiếu phần tử thì báo lỗi rõ ràng
function $<T extends HTMLElement>(id: string): T {
  const phanTu = document.getElementById(id);
  if (phanTu === null) throw new Error(`Không tìm thấy phần tử #${id}`);
  return phanTu as T;
}

function daCoMon(tenKy: HocKy, ma: string): boolean {
  return timKyHoc(tenKy)?.mon.some((m) => m.ma === ma) ?? false;
}

function thongBao(noiDung: string): void {
  const hop = $<HTMLDivElement>("thong-bao");
  hop.textContent = noiDung;
  hop.hidden = noiDung === "";
}

function dinhDang(so: number | undefined, soLe: number): string {
  return so === undefined ? "—" : so.toFixed(soLe).replace(".", ",");
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function hang(ky: KyHoc, d: DiemMon, moiNhat: LanMoiNhat): string {
  const tb = tinhDiemTB(d);
  const lanMoi = moiNhat.get(d.ma);
  const daHocLai = lanMoi !== undefined && lanMoi.mon !== d; // có lần học mới hơn thay thế
  const ghiChu = daHocLai
    ? `<span class="the-cu" title="Không tính vào GPA tích lũy">Đã học lại ở ${lanMoi.ky}</span>`
    : "";
  const o = dsCot
    .map((cot) => {
      const gt = layTruong(d, cot);
      const ti = d.tiLe[cot];
      return `<td class="o-diem"><input class="diem" data-ky="${ky.ten}" data-ma="${escapeHtml(d.ma)}" data-cot="${cot}"
        value="${gt ?? ""}" placeholder="—" inputmode="decimal" title="Điểm ${cotDiem[cot].nhan}">
        <input class="ti-le ${ti === 0 ? "khong" : ""}" data-ky="${ky.ten}" data-ma="${escapeHtml(d.ma)}" data-cot="${cot}"
        value="${ti}" inputmode="numeric" title="Tỉ lệ % của ${cotDiem[cot].nhan}"><i>%</i></td>`;
    })
    .join("");
  const tong = tongTiLe(d.tiLe);
  const hienTB =
    tong !== 100
      ? `<span class="canh-bao" title="Tổng tỉ lệ phải bằng 100%">Σ=${tong}%</span>`
      : dinhDang(tb, 1);
  return `<tr class="${daHocLai ? "cu" : ""}">
    <td>${escapeHtml(d.ma)}</td><td class="ten">${escapeHtml(d.ten)}${ghiChu}</td><td class="so">${d.tc}</td>
    ${o}
    <td class="so tb ${tb !== undefined && tb < 5 ? "truot" : ""}">${hienTB}</td>
    <td>${nhanLoai(tb, 1)}</td>
    <td><button class="xoa" data-ky="${ky.ten}" data-ma="${escapeHtml(d.ma)}">Xóa</button></td>
  </tr>`;
}

function render(): void {
  luuDuLieu();
  const vung = $<HTMLDivElement>("ky-hoc");
  const moiNhat = layLanMoiNhat();
  vung.innerHTML =
    hocKy.length === 0
      ? `<p class="trong">Chưa có môn nào. Chọn học kỳ, nhập mã môn, tên môn, số tín chỉ rồi bấm "Thêm môn".</p>`
      : hocKy
          .map((ky) => {
            const tk = thongKe(ky.mon);
            return `<section class="ky">
        <div class="ky-dau">
          <h2>Học kỳ ${ky.ten.slice(2)}</h2>
          <span>Tổng TC: <b>${tk.tcDaHoc}</b> &nbsp;|&nbsp; GPA HK: <b class="gpa-hk" style="color:${mauLoai(tk.gpa, 2)}">${dinhDang(tk.gpa, 2)}</b> ${nhanLoai(tk.gpa, 2)}</span>
        </div>
        <div class="bang"><table>
          <thead><tr>
            <th>Mã môn</th><th>Tên môn học</th><th>TC</th>
            ${dsCot.map((c) => `<th>${cotDiem[c].nhan}</th>`).join("")}
            <th>Điểm TB</th><th>Xếp loại</th><th></th>
          </tr></thead>
          <tbody>${ky.mon.map((d) => hang(ky, d, moiNhat)).join("")}</tbody>
        </table></div>
      </section>`;
          })
          .join("");

  // Tích lũy: chỉ tính lần học mới nhất của mỗi môn (GPA từng kỳ vẫn tính cả lần cũ)
  const tatCa = thongKe([...moiNhat.values()].map((x) => x.mon));
  $<HTMLSpanElement>("tc-da-hoc").textContent = String(tatCa.tcDaHoc);
  $<HTMLSpanElement>("tc-tich-luy").textContent = String(tatCa.tcTichLuy);
  $<HTMLSpanElement>("gpa-tich-luy").textContent = dinhDang(tatCa.gpa, 2);
  $<HTMLDivElement>("loai-tich-luy").innerHTML = nhanLoai(tatCa.gpa, 2);
}

// ---------- Sự kiện ----------
$<HTMLSelectElement>("chon-nam").innerHTML = ["2023-2024", "2024-2025", "2025-2026", "2026-2027"]
  .map((n) => `<option value="${n}" ${n === "2025-2026" ? "selected" : ""}>Năm học ${n}</option>`)
  .join("");

$<HTMLFormElement>("them-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const tenKy = `HK${$<HTMLSelectElement>("chon-ky").value}/${$<HTMLSelectElement>("chon-nam").value}`;
  const ma = $<HTMLInputElement>("nhap-ma").value.trim().toUpperCase();
  const ten = $<HTMLInputElement>("nhap-ten").value.trim();
  const tc = docSo($<HTMLInputElement>("nhap-tc").value, 20);

  if (!laHocKy(tenKy)) return;
  if (ma === "" || ten === "" || !tc.hopLe || tc.so === undefined) {
    thongBao("Hãy nhập đủ mã môn, tên môn và số tín chỉ (số từ 0 đến 20).");
    return;
  }
  if (daCoMon(tenKy, ma)) {
    thongBao(`Môn ${ma} đã có trong ${tenKy}.`);
    return;
  }
  const lanTruoc = hocKy.find((k) => k.mon.some((m) => m.ma === ma));
  thongBao(
    lanTruoc
      ? `Môn ${ma} đã học ở ${lanTruoc.ten}: lần học mới thay thế, điểm cũ chuyển sang nền đỏ.`
      : "",
  );
  themMon(tenKy, { ma, ten, tc: tc.so, tiLe: tiLeMacDinh() });
  $<HTMLInputElement>("nhap-ma").value = "";
  $<HTMLInputElement>("nhap-ten").value = "";
  $<HTMLInputElement>("nhap-tc").value = "";
  $<HTMLInputElement>("nhap-ma").focus();
});

$<HTMLDivElement>("ky-hoc").addEventListener("change", (e) => {
  const o = e.target;
  if (!(o instanceof HTMLInputElement)) return; // thu hẹp kiểu bằng instanceof
  const laDiem = o.classList.contains("diem");
  const laTiLeO = o.classList.contains("ti-le");
  if (!laDiem && !laTiLeO) return;

  // dataset luôn là string | undefined: dùng type guard để kiểm tra, không ép kiểu
  const { cot, ky: tenKy, ma } = o.dataset;
  if (!laCot(cot) || !laHocKy(tenKy) || ma === undefined) return;
  const ket = docSo(o.value, laDiem ? 10 : 100);
  if (!ket.hopLe) {
    thongBao(laDiem ? "Điểm phải là số từ 0 đến 10." : "Tỉ lệ phải là số từ 0 đến 100.");
    render();
    return;
  }
  thongBao("");

  if (laDiem) {
    capNhatDiem(tenKy, ma, { [cot]: ket.so });
  } else {
    const mon = timKyHoc(tenKy)?.mon.find((m) => m.ma === ma);
    if (mon) capNhatDiem(tenKy, ma, { tiLe: { ...mon.tiLe, [cot]: ket.so ?? 0 } });
  }
});

$<HTMLDivElement>("ky-hoc").addEventListener("click", (e) => {
  const nut = e.target instanceof HTMLElement ? e.target.closest("button.xoa") : null;
  if (!(nut instanceof HTMLButtonElement)) return;
  const { ky, ma } = nut.dataset;
  if (laHocKy(ky) && ma !== undefined) xoaMon(ky, ma);
});

$<HTMLButtonElement>("dat-lai").addEventListener("click", () => {
  if (hocKy.length > 0 && !confirm("Xóa toàn bộ môn học và điểm?")) return;
  hocKy = [];
  thongBao("");
  render();
});

hocKy = docDuLieu().sort((a, b) => thuTuKy(a.ten) - thuTuKy(b.ten));
render();
