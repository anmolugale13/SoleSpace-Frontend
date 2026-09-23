import { useMemo, useState } from "react";
import { ANALYTICS_CONFIGURED, LOW_STOCK_THRESHOLD, buildDashboard, inventoryAlerts } from "../../data/mockAnalytics";

const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const compact = (n) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const RANGES = [{ d: 7, label: "7 days" }, { d: 30, label: "30 days" }, { d: 90, label: "90 days" }];
const PIE = ["#0B1B3D", "#FF6B1A", "#6B7280", "#16294F", "#FFB800"];

/* ---------- small building blocks ---------- */
function Card({ title, note, children, className = "" }) {
  return (
    <div className={`border border-ink/15 bg-white p-5 ${className}`}>
      {title && (
        <div className="mb-4">
          <p className="font-display text-lg">{title}</p>
          {note && <p className="text-xs text-graphite mt-0.5">{note}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function Delta({ value, unit = "%", invert = false }) {
  if (value === null || value === undefined || Number.isNaN(value)) return <span className="text-xs text-graphite">—</span>;
  const up = value >= 0;
  const good = invert ? !up : up;
  return (
    <span className={`text-xs font-mono ${good ? "text-emerald-600" : "text-sale"}`}>
      {up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}{unit}
    </span>
  );
}

function Kpi({ label, value, delta, invert, unit, accent, sub }) {
  return (
    <div className="border border-ink/15 bg-white p-5">
      <p className="label-eyebrow mb-2">{label}</p>
      <p className={`font-display text-3xl ${accent ? "text-cone" : ""}`}>{value}</p>
      <div className="mt-1.5 flex items-center gap-2 min-h-[16px]">
        {delta !== undefined && <Delta value={delta} invert={invert} unit={unit} />}
        {sub && <span className="text-xs text-graphite">{sub}</span>}
      </div>
    </div>
  );
}

function BarList({ rows, valueKey = "revenue", format = fmt }) {
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  if (!rows.length) return <p className="text-sm text-graphite">No data for this period.</p>;
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.key}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono uppercase truncate pr-2">{r.name}</span>
            <span className="font-mono text-graphite shrink-0">{format(r[valueKey])} · {r.units} units</span>
          </div>
          <div className="bg-haze h-2.5"><div className="h-2.5 bg-track" style={{ width: `${(r[valueKey] / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

/* ---------- charts (plain SVG, no extra dependency) ---------- */
function SalesChart({ series, metric }) {
  const [hover, setHover] = useState(null);
  const W = 800, H = 260, pad = { l: 48, r: 12, t: 12, b: 26 };
  const vals = series.map((d) => d[metric]);
  const max = Math.max(...vals, 1) * 1.1;
  const x = (i) => pad.l + (i / Math.max(series.length - 1, 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(vals.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = Math.ceil(series.length / 7);
  const isMoney = metric !== "orders" && metric !== "units";

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (series.length - 1));
    setHover(Math.min(Math.max(i, 0), series.length - 1));
  };
  const h = hover !== null ? series[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#131A2C" strokeOpacity="0.08" />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#6B7280" fontFamily="Space Mono, monospace">
              {isMoney ? `₹${compact(t)}` : Math.round(t)}
            </text>
          </g>
        ))}
        <path d={area} fill="#FF6B1A" fillOpacity="0.12" />
        <path d={line} fill="none" stroke="#FF6B1A" strokeWidth="2" strokeLinejoin="round" />
        {series.map((d, i) => i % labelEvery === 0 && (
          <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#6B7280" fontFamily="Space Mono, monospace">
            {d.date.slice(5)}
          </text>
        ))}
        {h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#0B1B3D" strokeOpacity="0.3" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h[metric])} r="4" fill="#0B1B3D" />
          </g>
        )}
      </svg>
      {h && (
        <div
          className="absolute top-0 pointer-events-none bg-track text-white text-xs font-mono px-2.5 py-1.5 rounded shadow-card"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > series.length / 2 ? "-105%" : "5%"})` }}
        >
          <div>{h.date}</div>
          <div>{isMoney ? fmt(h[metric]) : h[metric]}</div>
        </div>
      )}
    </div>
  );
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.orders, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <svg viewBox="0 0 140 140" className="w-36 h-36 shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#EEF0F6" strokeWidth="22" />
        {data.map((d, i) => {
          const len = (d.orders / total) * C;
          const el = <circle key={d.method} cx="70" cy="70" r={R} fill="none" stroke={PIE[i % PIE.length]} strokeWidth="22" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </svg>
      <ul className="text-sm space-y-1.5 w-full">
        {data.map((d, i) => (
          <li key={d.method} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 inline-block" style={{ background: PIE[i % PIE.length] }} />{d.method}</span>
            <span className="font-mono text-xs text-graphite">{((d.orders / total) * 100).toFixed(0)}% · {d.orders}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Funnel({ steps }) {
  const top = steps[0].value || 1;
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => (
        <div key={s.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-mono uppercase">{s.label}</span>
            <span className="font-mono text-graphite">{s.value.toLocaleString("en-IN")}{i > 0 && ` · ${((s.value / top) * 100).toFixed(1)}%`}</span>
          </div>
          <div className="bg-haze h-2.5"><div className="h-2.5 bg-traction" style={{ width: `${Math.max((s.value / top) * 100, 1.5)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

/* ---------- the dashboard ---------- */
export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState("net");
  const d = useMemo(() => buildDashboard(days), [days]);
  const inv = useMemo(() => inventoryAlerts(), []);
  const s = d.summary;
  const custTotal = s.newCustomers + s.returningCustomers || 1;

  return (
    <div className="space-y-8">
      {/* header + date range */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-xl">Overview</p>
          <p className="text-xs text-graphite font-mono">{d.range.from} → {d.range.to} · compared with previous {days} days</p>
        </div>
        <div className="flex border border-ink/15 bg-white">
          {RANGES.map((r) => (
            <button key={r.d} onClick={() => setDays(r.d)} className={`px-4 py-2 text-xs font-mono uppercase tracking-wider ${days === r.d ? "bg-track text-white" : "text-graphite hover:text-ink"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Gross sales" value={fmt(s.gross)} delta={d.deltas.gross} />
        <Kpi label="Net sales" value={fmt(s.net)} delta={d.deltas.net} sub="after discounts & refunds" />
        <Kpi label="Orders" value={s.orders.toLocaleString("en-IN")} delta={d.deltas.orders} />
        <Kpi label="Avg. order value" value={fmt(s.aov)} delta={d.deltas.aov} />
        <Kpi label="Units sold" value={s.units.toLocaleString("en-IN")} delta={d.deltas.units} />
        {ANALYTICS_CONFIGURED
          ? <Kpi label="Conversion rate" value={`${d.conversion.toFixed(2)}%`} delta={d.deltas.conversion} unit=" pts" sub="orders / sessions" />
          : <Kpi label="Conversion rate" value="—" sub="Connect analytics to enable" />}
        <Kpi label="Return / refund rate" value={`${s.returnRate.toFixed(1)}%`} delta={d.deltas.returnRate} unit=" pts" invert sub={`${s.returned} orders · ${fmt(s.refunds)}`} />
        <Kpi label="Out of stock SKUs" value={inv.out.length} accent sub={`${inv.low.length} low (≤${LOW_STOCK_THRESHOLD})`} />
      </div>

      {/* sales chart */}
      <Card
        title="Sales over time"
        note="Hover the chart for daily values"
      >
        <div className="flex gap-2 mb-3">
          {[["net", "Net sales"], ["gross", "Gross sales"], ["orders", "Orders"], ["units", "Units"]].map(([k, l]) => (
            <button key={k} onClick={() => setMetric(k)} className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider border ${metric === k ? "border-ink bg-ink text-white" : "border-ink/15 text-graphite"}`}>{l}</button>
          ))}
        </div>
        <SalesChart series={d.series} metric={metric} />
      </Card>

      {/* funnel / payment / customers */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Conversion funnel" note={ANALYTICS_CONFIGURED ? undefined : "Analytics not configured"}>
          {ANALYTICS_CONFIGURED
            ? <Funnel steps={d.funnel} />
            : <p className="text-sm text-graphite">Connect Google Analytics / your analytics provider to see sessions, cart and checkout conversion.</p>}
        </Card>
        <Card title="Payment method split" note="by orders">
          <Donut data={d.payment} />
        </Card>
        <Card title="New vs returning customers" note="by orders in period">
          <div className="flex h-4 mb-4 overflow-hidden bg-haze">
            <div className="bg-traction" style={{ width: `${(s.newCustomers / custTotal) * 100}%` }} />
            <div className="bg-track" style={{ width: `${(s.returningCustomers / custTotal) * 100}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="label-eyebrow flex items-center gap-1.5"><span className="h-2 w-2 bg-traction inline-block" />New</p><p className="font-display text-2xl">{s.newCustomers}</p><p className="text-xs text-graphite font-mono">{((s.newCustomers / custTotal) * 100).toFixed(0)}%</p></div>
            <div><p className="label-eyebrow flex items-center gap-1.5"><span className="h-2 w-2 bg-track inline-block" />Returning</p><p className="font-display text-2xl">{s.returningCustomers}</p><p className="text-xs text-graphite font-mono">{((s.returningCustomers / custTotal) * 100).toFixed(0)}%</p></div>
          </div>
        </Card>
      </div>

      {/* top products / categories / brands */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="Top products" note="by revenue"><BarList rows={d.topProducts} /></Card>
        <Card title="Top categories" note="by revenue"><BarList rows={d.topCategories} /></Card>
        <Card title="Top brands" note="by revenue"><BarList rows={d.topBrands} /></Card>
      </div>

      {/* inventory alerts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card title={`Out of stock (${inv.out.length})`} note={`of ${inv.totalSkus} SKUs (product × colour × size)`}>
          <StockTable rows={inv.out} />
        </Card>
        <Card title={`Low stock (${inv.low.length})`} note={`${LOW_STOCK_THRESHOLD} units or fewer`}>
          <StockTable rows={inv.low} />
        </Card>
      </div>

      {/* coupons */}
      <Card title="Coupon performance">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead><tr className="text-left label-eyebrow border-b border-ink/10"><th className="pb-2">Code</th><th className="pb-2 text-right">Uses</th><th className="pb-2 text-right">% of orders</th><th className="pb-2 text-right">Discount given</th><th className="pb-2 text-right">Revenue</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {d.coupons.map((c) => (
                <tr key={c.code}>
                  <td className="py-2.5 font-mono">{c.code}</td>
                  <td className="py-2.5 text-right font-mono">{c.uses}</td>
                  <td className="py-2.5 text-right font-mono">{c.share.toFixed(1)}%</td>
                  <td className="py-2.5 text-right font-mono">{fmt(c.discountGiven)}</td>
                  <td className="py-2.5 text-right font-mono">{fmt(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* recent orders */}
      <Card title="Recent orders">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr className="text-left label-eyebrow border-b border-ink/10"><th className="pb-2">Order</th><th className="pb-2">Date</th><th className="pb-2">Payment</th><th className="pb-2">Status</th><th className="pb-2 text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-ink/5">
              {d.recent.map((o) => (
                <tr key={o.id}>
                  <td className="py-2.5 font-mono">{o.id}</td>
                  <td className="py-2.5 text-graphite">{o.date}</td>
                  <td className="py-2.5 text-graphite">{o.payment}</td>
                  <td className="py-2.5"><span className="stamp">{o.status}</span></td>
                  <td className="py-2.5 text-right font-mono">{fmt(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* how numbers are computed — handy for teammates / backend */}
      <details className="text-xs text-graphite">
        <summary className="cursor-pointer font-mono uppercase tracking-wider">How these numbers are calculated</summary>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>Gross sales = sum of item price × qty (cancelled orders excluded).</li>
          <li>Net sales = gross − coupon discounts − refunds on returned orders.</li>
          <li>AOV = net sales ÷ orders. Return rate = returned orders ÷ orders.</li>
          <li>Conversion = orders ÷ sessions (sessions come from analytics).</li>
          <li>Low stock = 1–{LOW_STOCK_THRESHOLD} units in a SKU; out of stock = 0.</li>
        </ul>
      </details>
    </div>
  );
}

function StockTable({ rows }) {
  if (!rows.length) return <p className="text-sm text-graphite">All good — nothing here. 🎉</p>;
  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white"><tr className="text-left label-eyebrow border-b border-ink/10"><th className="pb-2">Product</th><th className="pb-2">Colour</th><th className="pb-2">Size</th><th className="pb-2 text-right">Stock</th></tr></thead>
        <tbody className="divide-y divide-ink/5">
          {rows.map((r) => (
            <tr key={r.sku}>
              <td className="py-2">{r.name} <span className="text-graphite text-xs">· {r.brand}</span></td>
              <td className="py-2 text-graphite">{r.color}</td>
              <td className="py-2 font-mono">{r.size}</td>
              <td className={`py-2 text-right font-mono ${r.stock === 0 ? "text-sale" : "text-cone"}`}>{r.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
