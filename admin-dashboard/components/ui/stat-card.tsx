import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** * Reusable Components for Cleanliness & Performance 
 */

const colorMap: Record<string, string> = {
    "text-green-600": "from-green-500 to-green-700",
    "text-blue-500": "from-blue-500 to-blue-700",
    "text-purple-500": "from-purple-500 to-purple-700",
    "text-foreground": "from-foreground to-foreground/70",
};


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
                <div
                    className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${colorMap[color] || colorMap["text-foreground"]
                        }`}
                >
                    {value ?? 0}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">{description}</p>
            </CardContent>
        </Card>
    );
}

export default StatCard
