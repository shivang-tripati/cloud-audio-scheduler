import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** * Reusable Components for Cleanliness & Performance 
 */

function StatCard({ title, value, icon, description, color = "text-foreground" }: any) {
    return (
        <Card className="border bg-card/40 hover:bg-card/70 transition-all duration-300 backdrop-blur-md shadow-sm rounded-2xl hover:scale-[1.03]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${color === "text-foreground" ? "from-foreground to-foreground/70" : `from-${color.replace('text-', '')} to-${color.replace('text-', '')}/70`}`}>{value}</div>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">{description}</p>
            </CardContent>
        </Card>
    );
}

export default StatCard
