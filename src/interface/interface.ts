export interface Course {
  title: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  students: string;
}
export interface UpdateCourse {
  title?: string;
  description?: string;
  image?: string;
  level?: string;
  duration?: string;
  students?: string;
}
