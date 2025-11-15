import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function IntegrationCard({ app }) {
  const { name, category, description, icon: Icon, status } = app;
  
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
                <CardTitle>{name}</CardTitle>
                <Badge variant="secondary">{category}</Badge>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <Badge variant={status === 'Installed' ? 'default' : 'outline'}>{status}</Badge>
          <Button variant={status === 'Installed' ? 'secondary' : 'default'}>
            {status === 'Installed' ? 'Manage' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}