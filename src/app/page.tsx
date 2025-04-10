'use server';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {aiQuickSearch} from '@/ai/flows/ai-quick-search';
import {aiProjectSummary} from '@/ai/flows/ai-project-assistant';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {Icons} from '@/components/icons';

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
      <Sidebar>
        <SidebarHeader>
          <h2>CollabFlow</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton href="#" >
                <Icons.home className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Icons.workflow className="mr-2 h-4 w-4" />
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Icons.calendar className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Icons.messageSquare className="mr-2 h-4 w-4" />
                <span>Tasks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton href="#">
                <Icons.file className="mr-2 h-4 w-4" />
                <span>Documents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div>Footer</div>
        </SidebarFooter>
      </Sidebar>
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
