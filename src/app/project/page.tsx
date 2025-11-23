// src/app/project/page.tsx (Server Component)

// 서버 컴포넌트이므로 utils/supabase/server.ts 사용
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 프로젝트 데이터 인터페이스
interface Project {
  id: number;
  title: string;
  description: string;
  created_at: string;
  slug: string; // Slug 포함
}

export default async function ProjectListPage() {
  // 서버 컴포넌트 전용 헬퍼 사용
  // 1. Supabase에서 모든 프로젝트 데이터 가져오기 (Slug 포함, 공개된 것만, 순서 정렬)
  const { data: projects, error } = await supabase
    .from("project")
    .select("id, title, description, created_at, slug, status, display_order")
    .eq("status", "published") // 👈 공개된 프로젝트만
    .order("display_order", { ascending: true }) // 👈 순서 정렬
    .order("created_at", { ascending: false });

  if (error) {
    console.error("프로젝트 목록 로드 에러:", error.message);
    return (
      <div className="container mx-auto max-w-4xl p-8 pt-16 text-center text-red-500">
        프로젝트 목록을 불러오는 데 실패했습니다. (RLS 정책 확인 필요)
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-8 pt-16">
      <h1 className="text-4xl font-bold mb-8 text-stone-800 border-b pb-2">
        나의 포트폴리오
      </h1>

      {projects && projects.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-stone-50 text-stone-500">
          아직 등록된 포트폴리오 프로젝트가 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {projects?.map((project) =>
            // Slug가 유효한 경우에만 링크를 생성합니다.
            project && project.slug ? (
              <Link
                key={project.id}
                href={`/project/${project.slug}`} // 👈 Slug 기반 링크
                passHref
              >
                <div className="block p-6 border rounded-lg bg-white shadow-md hover:shadow-lg hover:border-stone-400 transition duration-300 cursor-pointer">
                  <h2 className="text-2xl font-semibold mb-2 text-stone-800">
                    {project.title}
                  </h2>
                  <p className="text-stone-600 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <p className="text-sm text-stone-400">
                    등록일:{" "}
                    {new Date(project.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </Link>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
