"use client";

/**
 * Chart (shadcn/ui) — bọc Recharts: cấu hình nhãn + màu qua `config`, màu lấy từ biến CSS
 * `--color-<key>` nên tự đổi theo sáng / tối. Viết lại cho Recharts 3.
 */
import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    /** Màu CSS, vd. "var(--chart-1)" */
    color?: string;
  }
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

const useChart = () => {
  const ctx = React.useContext(ChartContext);
  if (!ctx) throw new Error("useChart must be used within <ChartContainer />");
  return ctx;
};

export const ChartContainer = ({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) => {
  const uid = React.useId();
  const chartId = `chart-${id ?? uid.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/60",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted/60",
          "[&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden [&_.recharts-sector]:outline-hidden",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
};

/** Sinh biến `--color-<key>` cho từng mục trong config */
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const entries = Object.entries(config).filter(([, c]) => c.color);
  if (!entries.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `[data-chart=${id}] {\n${entries.map(([k, c]) => `  --color-${k}: ${c.color};`).join("\n")}\n}`,
      }}
    />
  );
};

export const ChartTooltip = RechartsPrimitive.Tooltip;

interface TooltipItem {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown> & { fill?: string };
}

export const ChartTooltipContent = ({
  active,
  payload,
  label,
  hideLabel = false,
  nameKey,
  valueFormatter,
  className,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: React.ReactNode;
  hideLabel?: boolean;
  /** Lấy nhãn dòng theo trường này trong dữ liệu (vd. "status") thay vì dataKey */
  nameKey?: string;
  valueFormatter?: (value: number | string) => React.ReactNode;
  className?: string;
}) => {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div className={cn("min-w-32 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-xl", className)}>
      {!hideLabel && label != null && <p className="mb-1 font-semibold text-foreground">{label}</p>}
      <div className="space-y-1">
        {payload.map((item, i) => {
          const key = String((nameKey && item.payload?.[nameKey]) ?? item.dataKey ?? item.name ?? i);
          const cfg = config[key];
          const color = item.payload?.fill ?? item.color ?? cfg?.color;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: color }} />
              <span className="text-muted-foreground">{cfg?.label ?? item.name}</span>
              <span className="ml-auto pl-3 font-mono font-semibold tabular-nums text-foreground">
                {item.value != null ? (valueFormatter ? valueFormatter(item.value) : item.value) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
