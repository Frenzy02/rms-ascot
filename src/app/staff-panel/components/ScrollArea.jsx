export function ScrollArea({ children, className }) {
    return (
        <div className={`overflow-auto max-h-full ${className}`}>
            {children}
        </div>
    )
}
