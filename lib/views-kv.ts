'use server';

import { Redis } from '@upstash/redis';
import { projects } from './info';

export interface ViewData {
  [projectId: string]: number;
}

// Initialize Redis client with error handling
let redis: Redis | null = null;
let redisInitialized = false;

function initRedis(): boolean {
  if (redisInitialized) return redis !== null;

  try {
    // Check if required environment variables exist
    if (
      !process.env.UPSTASH_REDIS_REST_URL ||
      !process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      console.warn('Upstash Redis environment variables not found');
      redisInitialized = true;
      return false;
    }

    redis = Redis.fromEnv();
    redisInitialized = true;
    return true;
  } catch (error) {
    console.warn('Failed to initialize Redis client:', error);
    redis = null;
    redisInitialized = true;
    return false;
  }
}

const KV_KEY = 'project_views';
const MAIN_PAGE_VIEWS_KEY = 'main_page_views';
const SYNC_PAGE_VIEWS_KEY = 'sync_page_views';
const SYNC_FEEDBACK_KEY = 'sync_feedback';
const MAX_SYNC_FEEDBACK_LIST_SIZE = 1000;

// Check if Redis is available
async function isRedisAvailable(): Promise<boolean> {
  if (!initRedis() || !redis) return false;

  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.warn('Redis ping failed:', error);
    return false;
  }
}

// Get default data structure
function getDefaultData(): ViewData {
  const defaultData: ViewData = {};
  projects.forEach((project) => {
    defaultData[project.id] = 0;
  });
  return defaultData;
}

// Initialize/seed data in Redis
async function seedData(): Promise<void> {
  if (!redis) return;

  try {
    const defaultData = getDefaultData();
    await redis.set(KV_KEY, defaultData);
    console.log('Successfully seeded initial view data');
  } catch (error) {
    console.error('Failed to seed data:', error);
  }
}

// Get all view data from KV with fallback
export async function getViewData(): Promise<ViewData> {
  // If Redis is not available, return default data
  if (!(await isRedisAvailable())) {
    console.warn('Redis not available, returning default view data');
    return getDefaultData();
  }

  try {
    const data = await redis!.get<ViewData>(KV_KEY);

    // If no data exists, seed it and return default
    if (!data) {
      console.log('No view data found, seeding initial data...');
      await seedData();
      return getDefaultData();
    }

    // If data exists but is corrupted, return default
    if (typeof data !== 'object') {
      console.warn('Corrupted view data found, returning default');
      return getDefaultData();
    }

    return data;
  } catch (error) {
    console.error('Error reading views data from Redis:', error);
    return getDefaultData();
  }
}

// Get views for a specific project
export async function getProjectViews(projectId: string): Promise<number> {
  try {
    const viewData = await getViewData();
    return viewData[projectId] || 0;
  } catch (error) {
    console.error('Error getting project views:', error);
    return 0;
  }
}

// Increment views for a specific project
export async function incrementProjectViews(
  projectId: string
): Promise<number> {
  // If Redis is not available, return current views + 1
  if (!(await isRedisAvailable()) || !redis) {
    console.warn('Redis not available, cannot increment views');
    const viewData = await getViewData();
    return (viewData[projectId] || 0) + 1;
  }

  try {
    const viewData = await getViewData();
    const currentViews = viewData[projectId] || 0;
    const newViews = currentViews + 1;

    // Update the data
    viewData[projectId] = newViews;

    // Save back to Redis
    await redis.set(KV_KEY, viewData);

    return newViews;
  } catch (error) {
    console.error('Error incrementing views in Redis:', error);
    // Return current views + 1 as fallback
    const viewData = await getViewData();
    return (viewData[projectId] || 0) + 1;
  }
}

// Get all projects with their view counts
export async function getAllProjectsWithViews() {
  try {
    const viewData = await getViewData();

    return projects.map((project) => ({
      ...project,
      views: viewData[project.id] || 0,
    }));
  } catch (error) {
    console.error('Error getting all projects with views:', error);
    // Return projects with 0 views on error
    return projects.map((project) => ({
      ...project,
      views: 0,
    }));
  }
}

// Manual seed function for debugging
export async function manualSeed(): Promise<boolean> {
  if (!initRedis() || !redis) {
    console.error('Redis not initialized');
    return false;
  }

  try {
    await seedData();
    return true;
  } catch (error) {
    console.error('Manual seed failed:', error);
    return false;
  }
}

// --- Sync page views ---

export async function getSyncPageViews(): Promise<number> {
  if (!(await isRedisAvailable()) || !redis) {
    return 0;
  }
  try {
    const val = await redis.get<number>(SYNC_PAGE_VIEWS_KEY);
    return typeof val === 'number' ? val : 0;
  } catch (error) {
    console.error('Error getting sync page views:', error);
    return 0;
  }
}

export async function incrementSyncPageViews(): Promise<number> {
  if (!(await isRedisAvailable()) || !redis) {
    const current = await getSyncPageViews();
    return current + 1;
  }
  try {
    const current = await getSyncPageViews();
    const newViews = current + 1;
    await redis.set(SYNC_PAGE_VIEWS_KEY, newViews);
    return newViews;
  } catch (error) {
    console.error('Error incrementing sync page views:', error);
    const current = await getSyncPageViews();
    return current + 1;
  }
}

// --- Main page views ---

export async function getMainPageViews(): Promise<number> {
  if (!(await isRedisAvailable()) || !redis) {
    return 0;
  }
  try {
    const val = await redis.get<number>(MAIN_PAGE_VIEWS_KEY);
    return typeof val === 'number' ? val : 0;
  } catch (error) {
    console.error('Error getting main page views:', error);
    return 0;
  }
}

// --- Sync feedback ---

export async function pushSyncFeedback(message: string): Promise<boolean> {
  if (!(await isRedisAvailable()) || !redis) {
    return false;
  }
  try {
    const entry = {
      message,
      createdAt: new Date().toISOString(),
    };
    await redis.lpush(SYNC_FEEDBACK_KEY, JSON.stringify(entry));
    await redis.ltrim(SYNC_FEEDBACK_KEY, 0, MAX_SYNC_FEEDBACK_LIST_SIZE - 1);
    return true;
  } catch (error) {
    console.error('Failed to push sync feedback to Redis:', error);
    return false;
  }
}

// --- Main page views only ---

export async function incrementMainPageViews(): Promise<number> {
  if (!(await isRedisAvailable()) || !redis) {
    const current = await getMainPageViews();
    return current + 1;
  }
  try {
    const current = await getMainPageViews();
    const newViews = current + 1;
    await redis.set(MAIN_PAGE_VIEWS_KEY, newViews);
    return newViews;
  } catch (error) {
    console.error('Error incrementing main page views:', error);
    const current = await getMainPageViews();
    return current + 1;
  }
}
