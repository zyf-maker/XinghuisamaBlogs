import { siteConfig } from "@/siteConfig";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import ContentLayout from "../../components/ContentLayout";
import MusicClient from "./MusicClient";

// 🌟 这里是服务端渲染，完美支持 metadata
export const metadata = {
  title: "音乐",
};

export default function MusicPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>
        <ContentLayout>
          <MusicClient />
        </ContentLayout>
      </PageTransition>
    </div>
  );
}
