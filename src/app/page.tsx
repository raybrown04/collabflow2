'use server';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {aiQuickSearch} from '@/ai/flows/ai-quick-search';
import {aiProjectSummary} from '@/ai/flows/ai-project-assistant';

async function getQuickSearchResults(userId: string, query: string) {
  try {
    const results = await aiQuickSearch({ userId: userId, query: query });
    return results?.results || [];
  } catch (error) {
    console.error("Error fetching quick search results:", error);
    return [];
  }
}

async function getProjectSummary(userId: string, projectId: string) {
  try {
    const summary = await aiProjectSummary({ userId: userId, projectId: projectId });
    return summary?.summary || 'No summary available.';
  } catch (error) {
    console.error("Error fetching project summary:", error);
    return 'Failed to load project summary.';
  }
}

export default async function Home() {
  const userId = 'user123'; // Replace with actual user ID
  const projectId = 'project456'; // Replace with actual project ID
  const searchQuery = 'urgent updates';

  const quickSearchResults = await getQuickSearchResults(userId, searchQuery);
  const projectSummary = await getProjectSummary(userId, projectId);

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-secondary border-r p-4">
        <ul>
          <li>
            <a href="#" className="block py-2 hover:bg-accent rounded-md p-2">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block py-2 hover:bg-accent rounded-md p-2">
              Projects
            </a>
          </li>
          <li>
            <a href="#" className="block py-2 hover:bg-accent rounded-md p-2">
              Tasks
            </a>
          </li>
          {/* Add more navigation items here */}
        </ul>
      </aside>
      <main className="flex-1 p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

          {/* AI Quick Search Results Widget */}
          <Card>
            <CardHeader>
              <CardTitle>AI Quick Search Results</CardTitle>
              <CardDescription>Results for: {searchQuery}</CardDescription>
            </CardHeader>
            <CardContent>
              {quickSearchResults.length > 0 ? (
                <ul>
                  {quickSearchResults.map((result, index) => (
                    <li key={index} className="mb-2">
                      <strong>{result.title}</strong> - {result.description} ({result.source})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No results found.</p>
              )}
            </CardContent>
          </Card>

          {/* AI Project Summary Widget */}
          <Card>
            <CardHeader>
              <CardTitle>AI Project Summary</CardTitle>
              <CardDescription>Summary for Project ID: {projectId}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{projectSummary}</p>
            </CardContent>
          </Card>

          {/* Placeholder Widgets - Example Data */}
          <Card>
            <CardHeader>
              <CardTitle>Tasks Overview</CardTitle>
              <CardDescription>Current tasks status</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Total Tasks: 20</p>
              <p>Completed: 15</p>
              <p>Pending: 5</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar Events</CardTitle>
              <CardDescription>Upcoming events</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Meeting with John - Today, 2:00 PM</p>
              <p>Team Lunch - Tomorrow, 12:00 PM</p>
            </CardContent>
          </Card>

          {/* Add more widgets here as needed */}
        </div>
      </main>
    </div>
  );
}
