// app/projects/[slug]/page.tsx
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

// 타입 정의
interface ProjectContent {
  project: string;
  year: number;
  client: string;
  services: string;
  product: string;
  keyword: string[];
  challenge: string;
}

interface ProjectDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  contents?: ProjectContent; // 👈 jsonb 추가
}

// 1. 빌드 시 정적 생성할 경로(슬러그)를 결정합니다.
export async function generateStaticParams() {
  const { data: project } = await supabase.from("project").select("slug");

  // { slug: '프로젝트-슬러그-1' }, { slug: '프로젝트-슬러그-2' } 와 같은 배열을 반환
  return (
    project?.map((project) => ({
      slug: project.slug,
    })) || []
  );
}

// 2. 상세 데이터 가져오기 (특정 슬러그를 기반으로)
async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  // Next.js에서 params.slug는 이미 디코딩된 상태로 전달됩니다.

  const { data: project, error } = await supabase
    .from("project")
    .select("id, title, slug, description, contents") // 👈 contents 추가
    .eq("slug", slug)
    .limit(1);

  if (error) {
    console.error("Supabase Query Error:", error.message);
    return null; // DB 오류 시 null 반환
  }

  const projectData = project?.[0] || null;

  // 2. 프로젝트를 찾지 못한 경우 명시적 null 반환
  if (!projectData) {
    console.log(`Project with slug: ${slug} not found.`);
    return null;
  }

  return projectData as ProjectDetail;
}

// 3. 페이지 컴포넌트
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    // 프로젝트가 없으면 404 페이지를 표시
    notFound();
  }

  const { contents } = project;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-5xl font-extrabold mb-4 text-stone-900">
        {project.title}
      </h1>

      {/* 1. 상단 간단 설명 (Summary) */}
      <div className="mb-12 border-b border-stone-200 pb-8">
        <p className="text-xl font-light text-stone-600 leading-relaxed whitespace-pre-wrap">
          {project.description}
        </p>
      </div>

      {/* 2. 상세 정보 (Contents) */}
      {contents && (
        <div className="space-y-16">
          {/* 개요 정보 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
            <div className="space-y-1">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-xs">
                Project
              </span>
              <p className="text-stone-800 font-medium text-lg">
                {contents.project}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-xs">
                Year
              </span>
              <p className="text-stone-800 font-medium text-lg">
                {contents.year}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-xs">
                Client
              </span>
              <p className="text-stone-800 font-medium text-lg">
                {contents.client}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-xs">
                Services
              </span>
              <p className="text-stone-800 font-medium text-lg">
                {contents.services}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 font-bold uppercase tracking-wider text-xs">
                Product
              </span>
              <p className="text-stone-800 font-medium text-lg">
                {contents.product}
              </p>
            </div>
          </div>

          {/* 키워드 섹션 */}
          {contents.keyword && contents.keyword.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contents.keyword.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Challenge (Long Text) 섹션 */}
          {contents.challenge && (
            <div className="prose prose-stone lg:prose-lg max-w-none">
              <h3 className="text-2xl font-bold text-stone-900 mb-6">
                Challenge
              </h3>
              <div className="whitespace-pre-wrap leading-relaxed text-stone-700">
                {contents.challenge}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-20 pt-8 border-t border-stone-200">
        <Link
          href="/"
          className="inline-flex items-center text-stone-500 hover:text-stone-900 transition-colors font-medium"
        >
          <span className="mr-2">←</span> Back to List
        </Link>
      </div>
    </div>
  );
}
