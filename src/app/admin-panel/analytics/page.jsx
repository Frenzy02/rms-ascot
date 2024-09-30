import { Button } from '@/components/ui/button'
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardContent
} from '@/components/ui/card'
import { CalendarClockIcon, DownloadIcon } from '@/components/ui/icons'
import { ResponsiveLine } from '@nivo/line'

export default function Component() {
    return (
        <section className="bg-neutral-900 text-white p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                    Student Health Trends
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <CalendarClockIcon className="h-4 w-4 text-white" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Last 30 days
                        </span>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <DownloadIcon className="h-4 w-4 text-white" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Export
                        </span>
                    </Button>
                </div>
            </div>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Students with Illnesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">2,345</div>
                        <div className="text-xs text-muted-foreground">
                            Total students who got sick this month
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Health Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] md:h-[500px]">
                            {' '}
                            {/* Adjust height to fit screen */}
                            <LineChart />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

function LineChart() {
    return (
        <div className="h-full w-full">
            <ResponsiveLine
                data={[
                    {
                        id: 'Flu',
                        data: [
                            { x: 'Jan', y: 20 },
                            { x: 'Feb', y: 30 },
                            { x: 'Mar', y: 25 },
                            { x: 'Apr', y: 35 },
                            { x: 'May', y: 40 },
                            { x: 'Jun', y: 45 }
                        ]
                    },
                    {
                        id: 'Cold',
                        data: [
                            { x: 'Jan', y: 15 },
                            { x: 'Feb', y: 20 },
                            { x: 'Mar', y: 18 },
                            { x: 'Apr', y: 25 },
                            { x: 'May', y: 30 },
                            { x: 'Jun', y: 20 }
                        ]
                    },
                    {
                        id: 'Allergies',
                        data: [
                            { x: 'Jan', y: 10 },
                            { x: 'Feb', y: 12 },
                            { x: 'Mar', y: 15 },
                            { x: 'Apr', y: 20 },
                            { x: 'May', y: 25 },
                            { x: 'Jun', y: 30 }
                        ]
                    }
                ]}
                margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 'auto' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 0,
                    tickPadding: 16
                }}
                axisLeft={{
                    tickSize: 0,
                    tickValues: 5,
                    tickPadding: 16
                }}
                colors={['#2563eb', '#e11d48', '#34d399']}
                pointSize={6}
                useMesh={true}
                gridYValues={6}
                theme={{
                    tooltip: {
                        chip: {
                            borderRadius: '9999px'
                        },
                        container: {
                            fontSize: '12px',
                            textTransform: 'capitalize',
                            borderRadius: '6px'
                        }
                    },
                    grid: {
                        line: {
                            stroke: '#f3f4f6'
                        }
                    }
                }}
                role="application"
            />
        </div>
    )
}
