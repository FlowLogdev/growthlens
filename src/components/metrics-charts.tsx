"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendPoint = {
  date: string;
  views: number;
  reach: number;
  followers: number;
};

export type MixPoint = {
  name: string;
  value: number;
};

export type FormatPoint = {
  name: string;
  views: number;
  engagements: number;
};

const COLORS = ["#d9ff6b", "#67c7f2", "#ff8f78", "#b6a6ff"];

const tooltipStyle = {
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "12px",
  background: "rgba(13,18,15,0.96)",
  color: "#f2f4ef",
  boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
};

function shortDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function MetricsCharts({
  trend,
  mix,
  formats,
}: {
  trend: TrendPoint[];
  mix: MixPoint[];
  formats: FormatPoint[];
}) {
  const hasTrend = trend.some((point) => point.views || point.reach || point.followers);
  const hasMix = mix.some((point) => point.value > 0);
  const hasFormats = formats.some((point) => point.views || point.engagements);

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl lg:col-span-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Performance trend</h2>
            <p className="mt-1 text-xs text-white/40">Daily synced views, reach, and follower level</p>
          </div>
          <div className="flex gap-4 text-[11px] text-white/45">
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#d9ff6b]" />Views</span>
            <span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#67c7f2]" />Reach</span>
          </div>
        </div>
        {hasTrend ? (
          <div className="mt-5 h-72 w-full" aria-label="Performance trend chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9ff6b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#d9ff6b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "rgba(242,244,239,0.38)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={28} />
                <YAxis tick={{ fill: "rgba(242,244,239,0.38)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(value) => shortDate(String(value))} />
                <Area type="monotone" dataKey="views" stroke="#d9ff6b" strokeWidth={2} fill="url(#viewsFill)" />
                <Area type="monotone" dataKey="reach" stroke="#67c7f2" strokeWidth={1.5} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ChartEmptyState text="No daily trend is available yet. Sync a connected account to populate this chart." />
        )}
      </section>

      <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl lg:col-span-4">
        <h2 className="text-base font-semibold text-white">Engagement mix</h2>
        <p className="mt-1 text-xs text-white/40">How people react to your recent posts</p>
        {hasMix ? (
          <>
            <div className="mt-3 h-52 w-full" aria-label="Engagement mix pie chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mix} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3} stroke="none">
                    {mix.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mix.map((entry, index) => (
                <div key={entry.name} className="rounded-xl bg-white/[0.045] px-3 py-2">
                  <p className="text-[11px] text-white/38"><span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />{entry.name}</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-white">{entry.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <ChartEmptyState text="Post reactions will appear after your first successful content sync." />
        )}
      </section>

      <section className="rounded-2xl border border-white/11 bg-[#101513]/72 p-5 backdrop-blur-xl lg:col-span-12">
        <h2 className="text-base font-semibold text-white">Content format comparison</h2>
        <p className="mt-1 text-xs text-white/40">Views and total engagements grouped by synced post type</p>
        {hasFormats ? (
          <div className="mt-5 h-64 w-full" aria-label="Content format comparison chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formats} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "rgba(242,244,239,0.42)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(242,244,239,0.38)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="views" fill="#d9ff6b" radius={[7, 7, 0, 0]} />
                <Bar dataKey="engagements" fill="#67c7f2" radius={[7, 7, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ChartEmptyState text="Content format comparisons need at least one synced post." />
        )}
      </section>
    </div>
  );
}

function ChartEmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 grid min-h-52 place-items-center rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-6 text-center text-sm leading-6 text-white/42">
      {text}
    </div>
  );
}
