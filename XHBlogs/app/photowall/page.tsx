import { siteConfig } from "../../siteConfig";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import ContentLayout from "../../components/ContentLayout";
import PhotoWallClient from "./PhotoWallClient";

export const metadata = {
  title: "照片墙 | " + siteConfig.title,
};

export default function PhotoWallPage() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <PageTransition>
        <ContentLayout>
          <PhotoWallClient />
        </ContentLayout>
      </PageTransition>
    </div>
  );
}