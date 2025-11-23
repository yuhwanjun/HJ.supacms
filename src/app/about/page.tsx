import { supabase } from "@/lib/supabase";

// 리스트 아이템 타입 정의
interface ListItem {
  id: string;
  text: string;
}

// 데이터 타입 정의
interface AboutData {
  imageUrl: string;
  description: string;
  experience: ListItem[] | string; // 호환성 유지 (string일 경우도 처리)
  services: ListItem[] | string;
  clients: ListItem[] | string;
  address: string;
  contact: string;
  social: string;
}

// 기본값
const defaultData: AboutData = {
  imageUrl: "/images/dummy/studio.jpg",
  description: "No description available.",
  experience: [],
  services: [],
  clients: [],
  address: "",
  contact: "",
  social: "",
};

// 리스트 렌더링 헬퍼 컴포넌트
function RenderList({ items }: { items: ListItem[] | string }) {
  // 1. 문자열인 경우 (구버전 호환)
  if (typeof items === "string") {
    return (
      <div className="whitespace-pre-wrap leading-relaxed text-stone-800">
        {items}
      </div>
    );
  }

  // 2. 배열이지만 비어있는 경우
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  // 3. 리스트 아이템 렌더링
  return (
    <ul className="flex flex-col space-y-1">
      {items.map((item) => (
        <li key={item.id} className="leading-relaxed text-stone-800">
          {item.text}
        </li>
      ))}
    </ul>
  );
}

export default async function AboutPage() {
  // 1. config 테이블에서 'about' 내용 불러오기
  const { data: configData, error } = await supabase
    .from("config")
    .select("content")
    .eq("id", "about")
    .single();

  if (error) {
    console.error("About 페이지 로드 에러:", error.message);
    return <div>About 페이지를 불러오는 데 실패했습니다.</div>;
  }

  let data: AboutData = defaultData;

  if (configData?.content) {
    try {
      // jsonb 타입이므로 이미 객체로 반환됨 (또는 string일 수도 있음)
      const content = configData.content;
      const parsed =
        typeof content === "string" ? JSON.parse(content) : content;
      data = { ...defaultData, ...parsed };
    } catch (e) {
      // 파싱 실패 시 description으로 간주 (구버전 호환)
      if (typeof configData.content === "string") {
        data.description = configData.content;
      }
    }
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans">
      {/* 상단 패딩 및 컨테이너 */}
      <div className="p-5 md:h-screen md:overflow-hidden flex flex-col gap-5">
        <div className="flex flex-col md:flex-row h-full gap-5">
          {/* [좌측] 데스크탑 이미지 영역 (40%) */}
          <div className="relative hidden md:flex md:w-[40%] md:shrink-0 h-full overflow-hidden bg-stone-100">
            {data.imageUrl ? (
              <img
                className="h-full w-full object-cover object-top"
                src={data.imageUrl}
                alt="Studio"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400">
                No Image
              </div>
            )}
          </div>

          {/* [우측] 컨텐츠 영역 (60%) */}
          <div className="flex flex-col justify-between gap-8 md:w-[60%] md:h-full md:overflow-hidden">
            {/* 1. 메인 설명 (스크롤 가능 영역) */}
            <div className="md:overflow-y-auto custom-scroll pr-2">
              <h3 className="text-xl md:text-2xl font-medium leading-relaxed whitespace-pre-wrap">
                {data.description}
              </h3>
            </div>

            {/* [모바일 전용] 이미지 */}
            <div className="block md:hidden w-full aspect-4/3 overflow-hidden bg-stone-100">
              {data.imageUrl && (
                <img
                  className="w-full h-full object-cover"
                  src={data.imageUrl}
                  alt="Studio"
                  draggable={false}
                />
              )}
            </div>

            {/* 2. 하단 3열 그리드 정보 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 text-sm">
              {/* Experience */}
              <div className="flex flex-col gap-2">
                <h5 className="font-bold text-stone-500 uppercase tracking-wider">
                  Experience
                </h5>
                <RenderList items={data.experience} />
              </div>

              {/* Services */}
              <div className="flex flex-col gap-2">
                <h5 className="font-bold text-stone-500 uppercase tracking-wider">
                  Services
                </h5>
                <RenderList items={data.services} />
              </div>

              {/* Clients */}
              <div className="flex flex-col gap-2">
                <h5 className="font-bold text-stone-500 uppercase tracking-wider">
                  Clients
                </h5>
                <RenderList items={data.clients} />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-2">
                <h5 className="font-bold text-stone-500 uppercase tracking-wider">
                  Address
                </h5>
                <div className="whitespace-pre-wrap leading-relaxed text-stone-800">
                  {data.address}
                </div>
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-2">
                <h5 className="font-bold text-stone-500 uppercase tracking-wider">
                  Contact
                </h5>
                <div className="whitespace-pre-wrap leading-relaxed text-stone-800">
                  {data.contact}
                </div>
              </div>

              {/* Social */}
              <div className="flex flex-col gap-2">
                <h5 className="font-bold text-stone-500 uppercase tracking-wider">
                  Social
                </h5>
                <div className="whitespace-pre-wrap leading-relaxed text-stone-800">
                  {data.social}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
