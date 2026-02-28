import { api } from "./api";
import { Course, Instructor } from "../types/course";

export const courseService = {
  async getInstructors(): Promise<Instructor[]> {
    const res = await api.get<{ data: Instructor[] }>(
      "/public/randomusers?page=1&limit=10",
    );
    return res.data;
  },

  async getCourses(): Promise<Course[]> {
    const res = await api.get<{ data: Course[] }>(
      "/public/randomproducts?page=1&limit=10",
    );
    return res.data;
  },

  async getCatalog(): Promise<Course[]> {
    const [courses, instructors] = await Promise.all([
      this.getCourses(),
      this.getInstructors(),
    ]);


    return courses.map((course, index) => ({
      ...course,
      instructor: instructors[index % instructors.length],
    }));
  },
};
