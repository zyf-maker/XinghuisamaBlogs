import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import ContentLayout from '../../components/ContentLayout';
import ProjectsBoard from './ProjectsBoard';
import {siteConfig} from "@/siteConfig";

export const metadata = {
  title: "项目矩阵 | " + siteConfig.title,
  description: "开源项目与代码仓库展示",
};

export default function ProjectsPage() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <PageTransition>
        <ContentLayout>
          <ProjectsBoard />
        </ContentLayout>
      </PageTransition>
    </div>
  );
}