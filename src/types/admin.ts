export interface ContentBase {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updated_at: string;
  created_at: string;
}

export interface BlogPost extends ContentBase {
  category: string;
  author: string;
  date: string;
  read_time: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  publish_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
}

export interface CaseStudy extends ContentBase {
  industry: string;
  summary: string;
  image_url: string | null;
}

export interface Resource extends ContentBase {
  type: string;
  description: string;
  image_url: string | null;
}

export interface ContentAnalytics {
  content_id: string;
  content_type: string;
  title: string;
  view_count: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
  last_viewed_at: string;
}

export interface ContentInsight {
  content_id: string;
  content_type: string;
  title: string;
  performance_category: 'stellar' | 'improving' | 'underperforming';
  suggestion: string;
  metric_value: number;
}

export interface DailyView {
  view_date: string;
  view_count: string | number;
  unique_sessions: string | number;
}
