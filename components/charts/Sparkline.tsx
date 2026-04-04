// components/charts/Sparkline.tsx
// Server Component puro — cero JS en cliente, cero hidratación
// Decorativo: barras CSS con height proporcional al valor máximo

interface SparklineProps {
  data: number[];
  color?: string;   // default: Meridian teal primary-fixed
  height?: number;  // px, default: 32
}

export function Sparkline({
  data,
  color = "#009944",
  height = 32,
}: SparklineProps) {
  if (!data.length) return null;

  const max = Math.max(...data, 1);

  return (
    <div
      className="flex items-end gap-px"
      style={{ height, width: data.length * 8 }}
      aria-hidden="true"
    >
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.5 + (v / max) * 0.5,
            minHeight: 2,
          }}
        />
      ))}
    </div>
  );
}
