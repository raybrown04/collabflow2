// src/components/dashboard.tsx
"use client";

import React from 'react';
import { useProjects, Project, ProjectError } from '@/lib/projects'; // Assuming @ resolves to src/
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons"; // Assuming you have an icons component
import { motion } from 'framer-motion'; // For subtle animations - requires `npm install framer-motion`
import { useIsMobile } from '@/hooks/use-mobile'; // Corrected import based on error suggestion

// Placeholder components for other widgets
const PlaceholderWidget: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-primary dark:text-primary-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">...</div>
      <p className="text-xs text-muted-foreground dark:text-gray-400">Data pending integration</p>
    </CardContent>
  </Card>
);

// Project Card Component
const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    whileHover={{ scale: 1.03 }}
  >
    <Card className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 border-primary"> {/* Dark Blue #003366 as accent */}
      <CardHeader>
        <CardTitle className="text-lg text-primary dark:text-primary-foreground">{project.name}</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2">{project.description || "No description available."}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground dark:text-gray-500">Members: {project.members.length}</p>
        {/* TODO: Add link or button to view project details when available */}
      </CardContent>
      <CardFooter>
          {/* Example Action Button - Needs onClick logic */}
         <Button
            variant="outline"
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            onClick={() => console.log(`Navigate to project ${project.id}`)} // Placeholder action
          >
            View Project
          </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

// Main Dashboard Component
export const UnifiedWorkspaceDashboard: React.FC = () => {
  const { projects, loading, error, refetch } = useProjects();
  const isMobile = useIsMobile(); // Corrected usage based on error suggestion

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-roboto dark:bg-gray-900 dark:text-gray-100"> {/* Roboto Font, Light Grey #EEEEEE bg */}
      {/* Header - Potentially a separate component */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-900/95 dark:border-gray-700">
        <div className="container flex h-14 items-center">
          <h1 className="text-xl font-semibold text-primary dark:text-primary-foreground">CollabFlow Dashboard</h1>
          {/* TODO: Add User menu, Notifications etc. here */}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container py-6 space-y-6">
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
             {/* Use the custom error type's message */}
            <AlertTitle>Error Loading Projects ({error.code})</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
            <Button onClick={refetch} variant="destructive" size="sm" className="mt-2">Retry</Button>
          </Alert>
        )}

        {/* Grid Layout for Widgets */}
        <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${isMobile ? 'grid-cols-1' : ''}`}> {/* Responsive Grid */}
          {/* Placeholder Widgets - Assuming Icons component provides these */}
           <PlaceholderWidget title="Upcoming Calendar Events" icon={<Icons.calendar className="h-4 w-4 text-muted-foreground" />} />
           <PlaceholderWidget title="Pending Tasks" icon={<Icons.check className="h-4 w-4 text-muted-foreground" />} /> {/* Corrected to Icons.check */}
           <PlaceholderWidget title="Recent Documents (Dropbox)" icon={<Icons.file className="h-4 w-4 text-muted-foreground" />} />
          <PlaceholderWidget title="Recent Emails (Gmail/Outlook)" icon={<Icons.mail className="h-4 w-4 text-muted-foreground" />} />
        </div>

        {/* Project List Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-primary dark:text-primary-foreground">My Projects</h2>
          {loading ? (
            // Skeleton Loading State
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-1/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-8 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : projects.length > 0 ? (
            // Display Project Cards
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            // No Projects View
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-muted-foreground dark:text-gray-400">No projects found or assigned to you.</p>
              {/* TODO: Optional: Add a button for Admins to create a project */} 
            </div>
          )}
        </section>

         {/* Placeholder sections for other features if needed */}

      </main>

      {/* Footer - Optional */} 
       <footer className="py-4 border-t dark:border-gray-700">
         <div className="container text-center text-sm text-muted-foreground dark:text-gray-500">
           © {new Date().getFullYear()} CollabFlow
         </div>
       </footer>
    </div>
  );
};
