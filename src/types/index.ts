import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export interface Category extends RecordModel {
  name: string
  slug: string
  description?: string
  icon?: string
}

export interface Course extends RecordModel {
  title: string
  slug: string
  description?: string
  long_description?: string
  category_id?: string
  instructor_id?: string
  level?: 'iniciante' | 'intermediario' | 'avancado'
  duration?: number
  language?: string
  price?: number
  cover_image?: string
  intro_video_url?: string
  published?: boolean
  featured?: boolean
  rating?: number
  enrollment_count?: number
  expand?: {
    category_id?: Category
    instructor_id?: {
      id: string
      name?: string
      avatar?: string
      email?: string
    }
  }
}

export interface Lesson extends RecordModel {
  course_id: string
  title: string
  description?: string
  video_url: string
  module?: string
  order?: number
  duration?: number
  transcript?: string
}

export interface Enrollment extends RecordModel {
  user_id: string
  course_id: string
  status: 'active' | 'completed'
  progress: number
  completed_lessons?: string[] // IDs of completed lessons
  completed_at?: string
  expand?: {
    course_id?: Course
  }
}

export interface Review extends RecordModel {
  course_id: string
  user_id: string
  rating: number
  comment?: string
  instructor_response?: string
  status: 'visible' | 'hidden'
  expand?: {
    user_id?: {
      id: string
      name?: string
      avatar?: string
    }
  }
}

export interface ForumTopic extends RecordModel {
  title: string
  content: string
  author_id: string
  category?: string
  reply_count?: number
  views?: number
  hidden?: boolean
  pinned?: boolean
  expand?: {
    author_id?: {
      id: string
      name?: string
      avatar?: string
      role?: string
    }
  }
}

export interface ForumComment extends RecordModel {
  topic_id: string
  author_id: string
  content: string
  hidden?: boolean
  expand?: {
    author_id?: {
      id: string
      name?: string
      avatar?: string
      role?: string
    }
  }
}

export interface Certificate extends RecordModel {
  user_id: string
  course_id: string
  code: string
  issued_at?: string
  expand?: {
    course_id?: Course
  }
}

export interface NotificationItem extends RecordModel {
  user_id: string
  type: 'message' | 'forum' | 'course' | 'certificate' | 'achievement' | 'system'
  title?: string
  content?: string
  read?: boolean
  link?: string
}

export interface AchievementItem extends RecordModel {
  user_id: string
  title: string
  description?: string
  icon?: string
  earned_at?: string
}

export const getCourseThumbnailUrl = (course: Course): string => {
  if (course.cover_image) {
    return pb.files.getURL(course, course.cover_image)
  }
  // Curled high-quality educational placeholder based on course title/category
  const encoded = encodeURIComponent(course.slug || 'education-health')
  return `https://img.usecurling.com/p/800/450?q=education%20study&seed=${encoded}`
}

export const transformGoogleDriveUrlToEmbed = (url?: string): string => {
  if (!url) return ''
  const cleanUrl = url.trim()

  // If already preview/embed format
  if (cleanUrl.includes('/preview') || cleanUrl.includes('embed')) {
    return cleanUrl
  }

  // Matches https://drive.google.com/file/d/FILE_ID/view or .../edit or /FILE_ID
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  const match = cleanUrl.match(driveRegex)
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`
  }

  // Matches open?id=FILE_ID or uc?id=FILE_ID
  const idParamRegex = /drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/
  const matchId = cleanUrl.match(idParamRegex)
  if (matchId && matchId[1]) {
    return `https://drive.google.com/file/d/${matchId[1]}/preview`
  }

  // Matches YouTube URLs if provided
  const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  const ytMatch = cleanUrl.match(ytRegex)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  return cleanUrl
}
