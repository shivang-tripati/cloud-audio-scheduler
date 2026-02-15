import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** * Reusable Components for Cleanliness & Performance 
 */

function StatCard({ title, value, icon, description, color = "text-foreground" }: any) {
    return (
        <Card className="shadow-sm border-muted/60 transition-all hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="text-muted-foreground/70">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">{description}</p>
            </CardContent>
        </Card>
    );
}

export default StatCard
