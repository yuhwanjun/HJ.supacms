// app/page.tsx
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 타입 정의
interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
}

async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("project")
    .select("id, title, slug, description, status, display_order")
    .eq("status", "published") // 👈 공개된 프로젝트만
    .order("display_order", { ascending: true }) // 👈 지정된 순서대로
    .order("created_at", { ascending: false }); // 순서 같으면 최신순

  if (error) {
    console.error("Error fetching projects:", error.message);
    return [];
  }
  return data || [];
}

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* 헤더 섹션 */}
        <header className="mb-12 border-b border-stone-300 pb-6">
          <h1 className="text-5xl font-extrabold text-stone-800 tracking-tight mb-4">
            HWANJUN ROOM
          </h1>
          <p className="text-xl text-stone-600 font-light">
            안녕하세요. 생각과 기록, 그리고 프로젝트를 모아둔 공간입니다.
          </p>
          <nav className="mt-6 flex gap-4 text-sm font-medium text-stone-500 uppercase tracking-wider">
            <Link
              href="/about"
              className="hover:text-stone-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/project"
              className="hover:text-stone-900 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/admin"
              className="hover:text-stone-900 transition-colors"
            >
              Admin
            </Link>
          </nav>
        </header>

        {/* 프로젝트 리스트 섹션 */}
        <section>
          <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-stone-800 block"></span>
            Recent Projects
          </h2>

          {projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.slug}`}
                  className="group block p-6 border-2 border-stone-200 bg-white hover:border-stone-800 transition-all duration-200"
                >
                  <h3 className="text-2xl font-bold text-stone-800 group-hover:text-stone-600 transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-stone-600 line-clamp-2 font-light">
                    {project.description}
                  </p>
                  <div className="mt-4 text-stone-400 text-sm font-medium flex items-center group-hover:text-stone-800 transition-colors">
                    자세히 보기 <span className="ml-2">→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-stone-300 text-center text-stone-500">
              아직 등록된 프로젝트가 없습니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
