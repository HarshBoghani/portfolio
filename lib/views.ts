import fs from 'fs/promises';
import path from 'path';
import { projects } from './info';

export interface ViewData {
  [projectId: string]: number;
}

const VIEWS_FILE_PATH = path.join(process.cwd(), 'data', 'views.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize views file with all project IDs if it doesn't exist
async function initializeViewsFile() {
  await ensureDataDirectory();

  try {
    await fs.access(VIEWS_FILE_PATH);
  } catch {
    // File doesn't exist, create it
    const initialData: ViewData = {};
    projects.forEach((project) => {
      initialData[project.id] = 0;
    });
    await fs.writeFile(VIEWS_FILE_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Read view data from JSON file
export async function getViewData(): Promise<ViewData> {
  await initializeViewsFile();

  try {
    const data = await fs.readFile(VIEWS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading views data:', error);
    // Return default data if file is corrupted
    const defaultData: ViewData = {};
    projects.forEach((project) => {
      defaultData[project.id] = 0;
    });
    return defaultData;
  }
}

// Get views for a specific project
export async function getProjectViews(projectId: string): Promise<number> {
  const viewData = await getViewData();
  return viewData[projectId] || 0;
}

// Increment views for a specific project
export async function incrementProjectViews(
  projectId: string
): Promise<number> {
  await initializeViewsFile();

  const viewData = await getViewData();
  const currentViews = viewData[projectId] || 0;
  const newViews = currentViews + 1;

  viewData[projectId] = newViews;

  try {
    await fs.writeFile(VIEWS_FILE_PATH, JSON.stringify(viewData, null, 2));
    return newViews;
  } catch (error) {
    console.error('Error writing views data:', error);
    throw error;
  }
}

// Get all view data with project information
export async function getAllProjectsWithViews() {
  const viewData = await getViewData();

  return projects.map((project) => ({
    ...project,
    views: viewData[project.id] || 0,
  }));
}
