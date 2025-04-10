import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-200 p-4">
        <ul>
          <li>
            <a href="#" className="block py-2">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block py-2">
              Projects
            </a>
          </li>
          <li>
            <a href="#" className="block py-2">
              Tasks
            </a>
          </li>
          {/* Add more navigation items here */}
        </ul>
      </aside>
      <main className="flex-1 p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Widget 1</CardTitle>
              <CardDescription>Description for Widget 1</CardDescription>
            </CardHeader>
            <CardContent>Content for Widget 1</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Widget 2</CardTitle>
              <CardDescription>Description for Widget 2</CardDescription>
            </CardHeader>
            <CardContent>Content for Widget 2</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Widget 3</CardTitle>
              <CardDescription>Description for Widget 3</CardDescription>
            </CardHeader>
            <CardContent>Content for Widget 3</CardContent>
          </Card>
          {/* Add more widgets here */}
        </div>
      </main>
    </div>
  );
}
