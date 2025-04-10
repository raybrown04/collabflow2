import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>CollabFlow Dashboard</CardTitle>
          <CardDescription>Welcome to your unified workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add dashboard widgets here */}
          <p>Content will be placed here</p>
        </CardContent>
      </Card>
    </div>
  );
}
