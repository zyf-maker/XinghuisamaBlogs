import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import ContentLayout from '../../components/ContentLayout';
import FriendsBoard from './FriendsBoard';
import {siteConfig} from "@/siteConfig";

export const metadata = {
  title: "友链 | " + siteConfig.title,
  description: "博博空间里的有趣灵魂",
};

export default function FriendsPage() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <PageTransition>
        <ContentLayout>
          <FriendsBoard />
        </ContentLayout>
      </PageTransition>
    </div>
  );
}