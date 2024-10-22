// components/ui/chart.jsx

export function ChartContainer({ children, className }) {
    return <div className={`relative ${className}`}>{children}</div>
}

export function ChartTooltip({ content }) {
    return (
        <div className="text-xs bg-white border rounded-lg shadow-lg p-2">
            {content}
        </div>
    )
}

export function ChartTooltipContent({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="text-xs bg-white p-2 border rounded shadow-lg">
                <p className="font-semibold">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}
